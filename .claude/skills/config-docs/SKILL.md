---
name: config-docs
description: 为 clouisle-docs（Fumadocs 文档站）编写配置文档时使用。覆盖 MDX 页面/目录结构、frontmatter 规范、选项表（TypeTable / Markdown 表格）、代码示例块与 Shiki 行标记、可用组件及其导入路径（按已装包 exports 核实）、国际化（i18n）写作规范、LLM 内容消费注意点与验证方式。当用户要求新增或修改「配置」「配置项」「config options」「环境变量」「settings」等参考文档页面时触发。
---

# 编写配置文档（clouisle-docs）

本仓库是基于 Fumadocs（fumadocs-mdx 15.x + fumadocs-ui/@fumadocs/base-ui 16.14.3）的 Next.js 文档站。配置文档以 MDX 文件编写，存放在 `content/docs/` 下，由 `lib/source.ts` 的 `defineDocs` + `loader()` 自动生成路由、侧边栏与 TOC。

## 项目事实（动笔前必读）

### 内容与路由

- 内容目录：`content/docs/`。每个 `.mdx` 文件 = 一个页面；文件夹下的 `index.mdx` = 该文件夹索引页。
- 路由映射：`content/docs/foo/bar.mdx` → `/foo/bar`；`content/docs/foo/index.mdx` → `/foo`；`content/docs/index.mdx` → `/`（首页）。
- frontmatter schema（默认 `pageSchema`/`metaSchema`）：
  - 页面：`title`（必填）、`description`、`icon`（lucide 图标名，PascalCase，如 `Settings`）、`full`、`toc`。
  - `meta.json`：`title`、`icon`、`description`、`root`、`defaultOpen`、`collapsible`、`pages`、`pagesIndex`。
- 图标：已启用 `lucideIconsPlugin`，frontmatter `icon: 'Settings'` 即可在侧边栏显示图标。
- `a` 链接支持相对文件路径（`createRelativeLink` 已启用）：`[示例配置](./examples.mdx)`。

### 默认启用的 MDX 能力（Fumadocs MDX 默认 preset + 全局配置）

- remark：图片处理、标题 TOC 提取、搜索索引（structuredData）。
- rehype：代码高亮（rehype-code，支持 `title`、`lineNumbers`、语言图标自动注入）、TOC 导出。
- **remark-npm 默认启用**：```` ```npm ```` 代码块自动生成 npm / pnpm / yarn / bun 四个 tab。
- **代码 tab 语法默认启用**：相邻代码块写 `tab="Tab 1"`（首个可加 `tab-group="my-group"` 持久化选中值）自动合并为 CodeBlockTabs；MDX-in-tab（`parseMdx`）默认关闭。
- **不启用**（用组件替代，勿用语法）：`[step]` 步骤标记（需 remark-steps）→ 用 `<Steps><Step>` 或 `fd-steps` CSS 类；```` ```files ```` 文件树语法（需 remark-mdx-files）→ 用 `<Files>` 组件。
- `includeProcessedMarkdown: true`：页面会被 stringify 后经 `/llms.txt`、`/llms-full.txt`、`/llms.mdx/*` 暴露给 LLM。

### MDX 组件注册（components/mdx.tsx）

只注册了 `defaultMdxComponents`（`fumadocs-ui/mdx`）：Callout、Cards/Card、CodeBlockTabs 全家、pre→CodeBlock、h1–h6→Heading、a→Link、img→Image、table→Table。**Tabs、Files、Accordion、Steps、TypeTable 未注册**，需在 MDX 顶部 `import`（路径见组件速查，已按 16.14.3 package exports 核实）。

## 页面骨架

````mdx
---
title: 配置参考
description: clouisle.config.ts 的全部可用配置项
icon: Settings
---

介绍段落：配置文件用途、加载方式、生效时机（如「启动时读取，修改后需重启」）。

## 必填配置

<TypeTable type={{ /* 见选项表 */ }} />

## 可选配置

<TypeTable type={{ /* 见选项表 */ }} />

## 完整示例

```ts title="clouisle.config.ts"
export default defineConfig({
  // ...
});
```

## 注意事项

<Callout type="warn">修改配置后需要重启服务才能生效。</Callout>
````

## Frontmatter

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 页面标题（渲染为 h1），也是侧边栏/面包屑名称 |
| `description` | | 页面描述，显示在标题下方，用于搜索与 OG 卡片 |
| `icon` | | lucide 图标名（`Settings`、`SlidersHorizontal`、`KeyRound` 等），显示在侧边栏 |
| `full` | | `true` 时页面全宽 |
| `toc` | | `false` 关闭本页目录；或 `toc: { enabled: false }` |

不要写 `# h1` 一级标题——`title` 已渲染为 h1，正文从 `##` 开始。

标题锚点控制：`## 标题 [!toc]`（隐藏于目录）、`[toc]`（仅目录可见）、`[#custom-id]`（自定义锚点，可用 `/page#custom-id` 链接）。

## 目录组织

- 文件夹内页面默认按文件名排序；需要控制顺序/分组时在文件夹下建 `meta.json`：

```json title="content/docs/configuration/meta.json"
{
  "title": "配置",
  "icon": "Settings",
  "defaultOpen": true,
  "pages": ["index", "overview", "---Reference---", "options", "env", "..."]
}
```

- `pages` 支持：页面路径、分隔符 `---Label---`、外链 `[Text](url)` 或 `external:[Text](url)`、`...`（收编其余页面，按字母序）、`!item`（从 `...` 中排除）。
- 规则：同一页面 URL 在整个页面树中不得重复（Fumadocs 强校验）。
- 大分类（如「配置」「部署」）可用 `root: true` 的 meta.json 变成根文件夹，侧边栏切换。
- 配置版本化（v1/v2 配置差异）按文件夹分组 `configuration/v1/...`，配合 Layout Tabs 展示。

## 选项表

### 推荐：TypeTable（需 import）

```mdx
import { TypeTable } from 'fumadocs-ui/components/type-table';

<TypeTable
  type={{
    port: {
      description: '服务监听端口',
      type: 'number',
      default: 3000,
    },
    region: {
      description: '部署区域',
      type: `'us-east' | 'eu-west'`,
      default: 'us-east',
    },
    apiKey: {
      description: 'API 密钥',
      type: 'string',
      required: true,
    },
  }}
/>
```

每项可用键：

| 键 | 说明 |
| --- | --- |
| `type` | 类型签名（短） |
| `typeDescription` | 类型签名（完整，渲染为代码） |
| `typeDescriptionLink` | 类型链接（可指向类型定义页面） |
| `description` | 说明文字（支持 Markdown 语法，如链接、代码） |
| `default` | 默认值 |
| `required` | 是否必填 |
| `deprecated` | 是否已废弃 |
| `parameters` / `returns` | 函数类型的参数/返回值 |

### 备选：Markdown 表格

适合简单场景，Fumadocs 自动包装为可横向滚动表格。

```mdx
| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `port` | `number` | `3000` | 服务监听端口 |
```

### 可选：AutoTypeTable（从 TS 类型自动生成，当前未安装）

`fumadocs-typescript` 包**尚未安装**。若需要从产品代码的 TS 类型自动生成选项表（`<AutoTypeTable path="./file.ts" name="MyInterface" />`），需先 `npm i fumadocs-typescript` 并在 `components/mdx.tsx` 注册 `AutoTypeTable`（含 `createGenerator` + 文件系统缓存），随后在 MDX 中使用。它只能在构建期（RSC）使用。

## 代码示例

````mdx
```ts title="clouisle.config.ts" lineNumbers
export default defineConfig({
  port: 3000, // [!code highlight]
  // [!code --:1]
  legacyField: true, // [!code --]
  // [!code ++:1]
  newField: true, // [!code ++]
});
```
````

- 语言标识决定高亮：`ts` / `js` / `json` / `yaml` / `bash` / `env` 等。
- 修饰：`title="文件名"`（标题栏）、`lineNumbers`（行号，可 `lineNumbers=4` 指定起始）、`noCopy`（隐藏复制按钮）。
- **Shiki 行标记**（默认支持，行尾注释）：`// [!code highlight]` 高亮、`// [!code word:xxx]` 高亮词、`// [!code --]` 删除样式、`// [!code ++]` 新增样式（diff）、`// [!code focus]` 聚焦。
- **多包管理器**（默认支持）：```` ```npm `` 块自动展开 npm/pnpm/yarn/bun 四个 tab。
- **相邻代码块合并**（默认支持）：`` ```ts tab="Tab 1" tab-group="lang" `` + `` ```ts tab="Tab 2" `` 自动变成 CodeBlockTabs，选中值跨页持久化（groupId）。
- 显式对比用 `<Tabs>`（需 import）；输入→输出对比用 `<CodeBlockTabs>`（默认可用）。

## 可用组件速查

**默认可用（无需 import）**：

- `Callout`（`type`: `info` 默认 / `warn` / `error` / `success` / `idea`；可用 `title`）
- `Cards` / `Card`（卡片链接，`href`、`title`、`icon` 可选）
- `CodeBlockTabs` / `CodeBlockTab` / `CodeBlockTabsList` / `CodeBlockTabsTrigger`
- 代码块（`pre` → CodeBlock）、表格、`h2`–`h6`（自动锚点 + TOC）

**需 import**（路径按已安装包 exports 核实）：

```mdx
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Files, Folder, File } from 'fumadocs-ui/components/files';
import { Steps, Step } from 'fumadocs-ui/components/steps';
import { TypeTable } from 'fumadocs-ui/components/type-table';
```

### 常用写法

````mdx
<Callout type="warn" title="注意">
  修改后需重启服务才能生效。
</Callout>

<Callout type="error" title="常见错误">
  不要把 `apiKey` 提交到公开仓库，会导致密钥泄露。
</Callout>

<Tabs items={['TypeScript', 'JSON']} groupId="format">
  <Tab value="TypeScript">```ts
  // TS 形式
  ```</Tab>
  <Tab value="JSON">```json
  { "port": 3000 }
  ```</Tab>
</Tabs>

<Accordions type="single">
  <Accordion title="port 与 CLOUISLE_PORT 的关系" id="port-env">
    环境变量优先级更高，会覆盖配置文件中的 `port`。
  </Accordion>
</Accordions>

<Files>
  <Folder name="config" defaultOpen>
    <File name="clouisle.config.ts" />
    <File name=".env.example" />
  </Folder>
</Files>

<Steps>
  <Step>
    ### 安装
    安装包。
  </Step>
  <Step>
    ### 配置
    写入配置项。
  </Step>
</Steps>
````

组件要点：

- `Tabs`：`groupId`（同 id 的 tabs 共享选中值，存 sessionStorage）、`persist`（存 localStorage）、`defaultIndex`（默认选中）、`updateAnchor`；`Tab` 加 `id="tab-x"` 后可用 URL `#tab-x` 直达。
- `Accordions`：`type="single"` 或 `"multiple"`；`Accordion title` 为面板标题，加 `id` 后 URL hash 命中自动展开——适合 FAQ。
- `Files`：`Folder` 支持 `defaultOpen`、`disabled`。
- `Steps`：编号步骤；也可不用 import 直接用 `fd-steps` / `fd-step` CSS 类。
- `ImageZoom`：需在 `components/mdx.tsx` 把 `img` 换成 `ImageZoom`（本项目未做）——普通 `![alt](url)` 即可，无缩放。
- `InlineTOC`：需要 `toc` 数据，属页面级组件（page.tsx），MDX 内不常用。

## 国际化（i18n）

**当前状态：已启用。** 配置：`lib/i18n.ts` 用 `defineI18nUI`（`fumadocs-ui/i18n`）——`defaultLanguage: 'zh'`、`languages: ['zh', 'en']`、`hideLocale: 'default-locale'`（中文 URL 无前缀，英文 `/en` 前缀），UI 文案翻译（zh 中文 / en English displayName）在同一文件。

- 文件命名（默认 dot parser）：`page.mdx` = **中文**（默认语言，无后缀），`page.en.mdx` = 英文版；`meta.json` / `meta.en.json` 同规则。`page.$.md` / `meta.$.json` = 所有语言共享。
- 路由：`proxy.ts` `createI18nMiddleware`（无前缀 URL rewrite 到 `/zh`，`/zh/*` 重定向去前缀）→ `app/[lang]/`（`(docs)` 路由组放 DocsLayout + `[[...slug]]` 文档页，`[lang]/page.tsx` 首页）→ `loader({ i18n })` → `source.getPageTree(lang)` / `source.getPage(slug, lang)` / `source.getPages(lang)` / `generateParams('slug', 'lang')`。
- 页面内链接：跨语言用 `<DynamicLink href="/[lang]/another-page">`（`fumadocs-core/dynamic-link`），自动补 locale 前缀；同一语言内相对链接 `[示例](./examples.mdx)`（`createRelativeLink` 语言感知）。UI 导航等手动拼前缀（`locale === 'zh' ? '' : '/' + locale`）。
- 首页导航 links 按 locale 生成前缀（见 `app/[lang]/page.tsx` 的 `navLinks`）。
- og/llms.mdx 导出的 segments 含 locale 段（`lib/source.ts` 的 `getPageImageUrl`/`getPageMarkdownUrl`），路由解析时 `const [locale, ...rest] = slug`。

## LLM 内容消费（本项目已启用）

`includeProcessedMarkdown: true` + `/llms.txt`、`/llms-full.txt`、`/llms.mdx/*` 路由：页面正文会被 stringify 成纯 Markdown 供 LLM 读取。

- **关键信息写进正文**，不要只放在组件属性、折叠内容（Accordion）、`<Tab>` 或纯 JSX 中——stringify 后这些可能丢失或不可读。
- 选项表（TypeTable）在 stringify 时只保留 `description` 里的文本；必填/默认值若只写在组件 props 里，LLM 侧会缺失——正文段落里补一句关键默认值/必填说明。

## 写作规范

1. **每个配置项完整呈现**：名称、类型、默认值、是否必填、说明、示例。缺默认值或必填信息 = 缺陷。
2. 默认值/枚举值/单位写具体值（`3000`、`'us-east'`），不写「默认端口」这类模糊表述。
3. 行为差异、破坏性变更、迁移注意 → `Callout type="warn"`；常见错误/反例 → `Callout type="error"`。
4. 选项多时按分组拆成多个 TypeTable，组间用 `##` 分节，避免单个长表。
5. 每个重要选项配最小可用示例；复杂选项配完整配置示例。
6. env 变量与配置项的对应（如 `CLOUISLE_PORT` ↔ `port`）用表格列出，注明优先级（env 是否覆盖文件配置）。
7. 标题层级 ≤ 3 级（TOC 与可读性）；每个配置项用一个 `###`，不要为子选项逐层加标题。
8. 选项名/键名与代码完全一致（`camelCase` 原样），术语统一，避免「配置名/选项名」混用。
9. 中文文档正文用中文；代码、选项名、类型保持英文原样。
10. 多语言页面（i18n 启用后）：各语言版本内容同步，缺译页面会回退默认语言——未翻译前可只更新默认语言。

## 验证

- `npm run dev` 后访问 `http://localhost:3000/<路径>`：检查渲染、TOC、侧边栏图标与顺序、表格可读性、代码块标记效果（highlight/diff/tabs）。
- 新增页面/修改 meta.json 后确认路由正确、页面树无重复 URL、`index.mdx` 仍在 `pages` 里。
- 检查 `/llms.txt` 或 `/llms.mdx/<路径>/content.md` 中关键配置信息是否完整。
- 改动涉及 TS/import 时跑 `npm run types:check` 确认无类型错误。
