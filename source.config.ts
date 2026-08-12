import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'fumadocs-mdx/config';
import type { Root } from 'hast';

// 宏把配置转换到 .source/source.config.mjs 后加载，import.meta.url 指向 .source/，
// 项目根取其父目录；宏运行环境的 cwd 不保证是项目根，不能依赖 process.cwd()
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

interface Attr {
  type?: 'mdxJsxAttribute';
  name: string;
  value?: string | null;
}

interface JsxNode {
  type?: string;
  name?: string;
  attributes?: Attr[];
  children?: unknown[];
}

function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null; // PNG signature
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function svgSize(text: string): { width: number; height: number } | null {
  const width = text.match(/width="(\d+(?:\.\d+)?)"/);
  const height = text.match(/height="(\d+(?:\.\d+)?)"/);
  if (width && height) return { width: Math.round(+width[1]), height: Math.round(+height[1]) };
  const viewBox = text.match(/viewBox="\s*[-\d. ]+\s+[-\d. ]+\s+([\d.]+)\s+([\d.]+)"/);
  if (viewBox) return { width: Math.round(+viewBox[1]), height: Math.round(+viewBox[2]) };
  return null;
}

/**
 * MDX 中直接书写的 `<img>` 是 JSX intrinsic 标签，不会查询 MDX 组件表；
 * 只有 markdown 图片语法 `![]()` 生成的元素才走组件表。
 * 该插件把 JSX 形式图片节点改名为 `ImageZoom`，使其经组件表渲染为可缩放图片；
 * 并从 `public/images` 读取真实尺寸注入 `width`/`height`（Next Image 必填），
 * SVG 额外标记 `unoptimized` 以绕过图片优化器。
 */
function rehypeImageZoom() {
  return (tree: Root) => {
    const visit = (node: unknown): void => {
      if (!node || typeof node !== 'object') return;
      const n = node as JsxNode;
      if (
        (n.type === 'mdxJsxTextElement' || n.type === 'mdxJsxFlowElement') &&
        n.name === 'img'
      ) {
        n.name = 'ImageZoom';
        const src = n.attributes?.find((a) => a.name === 'src')?.value;
        if (typeof src === 'string' && src.startsWith('/')) {
          try {
            const buf = readFileSync(join(projectRoot, 'public', src));
            const size = src.endsWith('.svg')
              ? svgSize(buf.toString('utf8'))
              : pngSize(buf);
            if (size) {
              n.attributes ??= [];
              n.attributes.push(
                { type: 'mdxJsxAttribute', name: 'width', value: String(size.width) },
                { type: 'mdxJsxAttribute', name: 'height', value: String(size.height) },
              );
              if (src.endsWith('.svg')) {
                n.attributes.push({ type: 'mdxJsxAttribute', name: 'unoptimized', value: null });
              }
            }
          } catch {
            // 图片缺失或格式不支持时保持原样，不阻断构建
          }
        }
      }
      n.children?.forEach(visit);
    };
    visit(tree);
  };
}

export default defineConfig({
  mdxOptions: {
    rehypePlugins: [rehypeImageZoom],
  },
});
