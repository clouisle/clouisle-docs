import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // Phase 2：全静态导出。所有页面/OG/llms/搜索索引构建期落盘为 out/ 纯静态文件，
  // Cloudflare Worker 只做静态托管 + 极简路由（zh 前缀回退、/api/feedback），
  // 不再加载 Next/fumadocs/takumi 运行时，Worker CPU/内存占用趋近于零。
  output: 'export',
  serverExternalPackages: ['@takumi-rs/core'],
  reactStrictMode: true,
  images: {
    // output: export 不支持图片优化器；本站无真实位图（仅 SVG logo + 占位文本），直接直出原图
    unoptimized: true,
    // 文档图片为仓库内静态 SVG，无外部内容；配合 CSP sandbox 隔离脚本执行
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withMDX(config);
