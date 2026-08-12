# AGENTS.md — clouisle-docs

基于 Fumadocs 的 Next.js 文档站。本文档是 agent 在本仓库工作的总指引；写文档前**必须**先读 `.claude/skills/` 下对应的 skill。

## 项目概览

- **栈**：Next.js 16.3 + React 19 + TypeScript 6 + Tailwind CSS v4 + Fumadocs（fumadocs-mdx 15.2.3 / @fumadocs/base-ui 16.14.3）。
- **用途**：产品文档站。内容以 MDX 写在 `content/docs/`，构建期由 `lib/source.ts`（`defineDocs` + `loader()`）生成路由、侧边栏、TOC。
- **LLM 可读**：`includeProcessedMarkdown: true`，页面正文会 stringify 经 `/llms.txt`、`/llms-full.txt`、`/docs/*.md` 暴露给 LLM 消费——**关键信息必须写进正文**，不能只放在组件 props、折叠内容或纯 JSX 里。

## 目录速览

| 路径 | 作用 |
| --- | --- |
| `content/docs/` | 文档内容（`.mdx` 页面 + `meta.json` 目录元数据）。`foo/bar.mdx` → `/docs/foo/bar`；`foo/index.mdx` → `/docs/foo` |
| `lib/source.ts` | 内容加载：`defineDocs`、`loader()`、`lucideIconsPlugin`、LLM/OG 工具函数 |
| `lib/shared.ts` | `appName`、路由常量、`gitConfig`（占位，待填真实仓库信息） |
| `lib/layout.shared.tsx` | `baseOptions()`：导航标题、GitHub 链接 |
| `components/mdx.tsx` | MDX 组件注册（目前仅 `defaultMdxComponents`；新增组件在此注册） |
| `app/docs/[[...slug]]/page.tsx` | 文档页面渲染：标题、描述、Markdown 下载按钮、相对链接支持 |
| `app/api/search/`、`app/og/docs/`、`app/llms*.txt/` | 搜索、OG 图、LLM 文本导出路由 |
| `.claude/skills/` | 写作规范（见下） |

## 写作规范（先读 skill）

本仓库有两份互补的写作 skill，写文档前**必须先读对应 skill**：

1. **`.claude/skills/config-docs/SKILL.md`** — 配置类参考页：frontmatter 规范、TypeTable/Markdown 选项表、代码块与 Shiki 行标记、可用组件及其 import 路径、i18n（当前未启用）、LLM 内容消费、验证方式。
2. **`.claude/skills/docs-writing-style/SKILL.md`** — 通用写作规范与信息架构：页面类型骨架（索引/概念/参考/教程/FAQ）、菜单分栏模式、写作语言规范、**图片放置与 caption 规范**、表格用法、组件映射。

速览：

- **frontmatter**：`title`（必填，渲染为 h1）、`description`（副标题，必写一句「做什么」）、`icon`（lucide 名，PascalCase）、`full`、`toc`。正文不写 `# h1`。
- **页面类型**：先定类型（索引页用 `<Cards>` 网格；概念页 `###` 一概念一题；参考页按读者要完成的事分 `##` 节，文末给错误处理；教程页每步「为什么（Info）→ 操作 → 结果截图」；FAQ 问题即标题）。
- **组件**：默认可用 Callout/Cards/CodeBlockTabs/表格；Steps、Accordion、Tabs、TypeTable 需按 config-docs 中的路径 import。
- **图片**：图随文走、一图一事、caption 必写且 `alt` 与 `figcaption` 一致、文件放 `public/images/` 用 kebab-case 命名。base-ui 无 Figure 组件——要么在 `components/mdx.tsx` 注册自定义 Figure，要么用原生 `<figure>/<figcaption>`。
- **链接**：`createRelativeLink` 已启用，页间链接可用相对文件路径 `[示例](./examples.mdx)`；`a` 标签渲染为 Fumadocs Link。
- **i18n**：当前未启用。不要写 locale 后缀文件、不要用 DynamicLink。
- **LLM 消费**：默认值/必填/限制等关键值写进正文，`/docs/<路径>.md` 中应完整可读。

## 开发命令

```bash
npm run dev        # 开发服务器 http://localhost:3000
npm run build      # 生产构建
npm run start      # 启动生产构建
npm run types:check  # next typegen + tsc --noEmit
npm run lint       # eslint
```

验证文档改动：`npm run dev` 后逐页检查渲染/TOC/侧边栏顺序/组件交互/图片 caption；涉及 TS 或组件 import 时跑 `npm run types:check`。教程类页面按步骤实际跟做一遍。

## 变更约定

- **Surgical**：只改目标文件，不顺手重构无关代码。新增 MDX 组件时改 `components/mdx.tsx` 注册即可，不要动 `lib/source.ts` 的加载逻辑。
- **目录结构**：新栏目用文件夹 + `meta.json`（`pages` 控制顺序与分组，`---Label---` 分隔符）；同一页面 URL 不得重复。
- **站点身份**：`lib/shared.ts` 的 `appName`（Clouisle）与 `gitConfig`（clouisle/Clouisle, main）为文档站真实身份，改动前先确认。
