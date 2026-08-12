# clouisle-docs

<p align="center"><b>Official Documentation Site for Clouisle</b></p>

<p align="center">
The Clouisle documentation website, built with <a href="https://fumadocs.dev">Fumadocs</a> — hosting user guides, feature references, tutorials, and API docs.
</p>

<p align="center">
<img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/Fumadocs-16.14-blue?logo=fumadocs&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-6-blue?logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg" />
</p>

<p align="center">
<a href="https://github.com/clouisle/Clouisle">Clouisle Repository</a> ·
<a href="https://clouisle.asia">Official Website</a> ·
<a href="https://github.com/clouisle/Clouisle/blob/main/README.md">Project Overview</a>
</p>

---

## About

This repository is the official documentation site for [Clouisle](https://github.com/clouisle/Clouisle) — an enterprise-grade knowledge base and intelligent AI Agent platform.

Docs are written in MDX under `content/docs/`; Fumadocs generates routes, the sidebar, and the table of contents at build time. Page content is also exported for LLM consumption via `/llms.txt`, `/llms-full.txt`, and `/docs/*.md`.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the documentation site.

Available commands:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production build |
| `npm run types:check` | Next.js typegen + TypeScript type checking |
| `npm run lint` | ESLint |

## Writing Docs

Before adding or modifying docs, **read** the writing conventions in `.claude/skills/`:

- **`docs-writing-style`** — General writing conventions and information architecture: page types (index/concept/reference/tutorial/FAQ), menu structure, writing language, image placement & captions, table usage.
- **`config-docs`** — Configuration reference pages: frontmatter conventions, option tables (TypeTable), code examples & Shiki line markers, available components & import paths, LLM content consumption, verification.

### Project Layout

```
content/docs/     # Documentation content (.mdx pages + meta.json metadata)
lib/source.ts     # Content loading: defineDocs + loader() + lucide icon plugin
lib/shared.ts     # Site name, route constants, GitHub link config
components/mdx.tsx  # MDX component registration
app/docs/         # Docs page layout & rendering
app/api/search/   # Site search
app/og/docs/      # OG image generation
app/llms*.txt/    # LLM text export routes
```

Route mapping: `content/docs/foo/bar.mdx` → `/docs/foo/bar`; `content/docs/foo/index.mdx` → `/docs/foo`. Ordering and grouping in the sidebar are controlled by `meta.json` in each folder.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 6
- **Docs**: Fumadocs (fumadocs-mdx 15.x / @fumadocs/base-ui 16.14.3)
- **Styling**: Tailwind CSS v4
- **Rendering**: MDX + Shiki syntax highlighting

## Links

- [Clouisle repository](https://github.com/clouisle/Clouisle)
- [Clouisle README](https://github.com/clouisle/Clouisle/blob/main/README.md)
- [Official website](https://clouisle.asia)
- [Fumadocs documentation](https://fumadocs.dev)

## License

Documentation content is licensed under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). See [LICENSE](LICENSE) for the full legal text.
