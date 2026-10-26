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

This repository is the official documentation site for [Clouisle](https://github.com/clouisle/Clouisle) — a next-generation multi-agent collaboration platform and workflow engine for building and orchestrating production-ready AI agent teams with sandboxed execution, hybrid RAG, and enterprise-grade security.

Docs are written in MDX under `content/docs/`; Fumadocs generates routes, the sidebar, and the table of contents at build time. Page content is also exported for LLM consumption via `/llms.txt`, `/llms-full.txt`, and `/llms.mdx/*`.

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
| `npm run build` | Production static export (`next build`, output in `out/`) |
| `npm run start` | Start the Next.js production server locally |
| `npm run deploy` | `npm run build` followed by `wrangler deploy --minify` |
| `npm run types:check` | Next.js typegen + TypeScript type checking |
| `npm run lint` | ESLint |

## Deploy (Cloudflare Workers)

The site uses Next.js static export (`output: 'export'`). `next build` writes the complete site to `out/`; `wrangler.jsonc` serves those assets through Cloudflare Workers Static Assets and runs the small `worker/index.ts` router only for routes that need it (such as locale fallback and feedback). There is no OpenNext build or cache-population step.

```bash
bun install --frozen-lockfile
bun run build
bunx wrangler deploy --minify
```

Cloudflare Workers Build settings:

| Setting | Value |
| --- | --- |
| Build command | `bun run build` |
| Deploy command | `bunx wrangler deploy --minify` |

The Wrangler configuration also declares `npm run build` as its build command. When using a dashboard-managed build, make sure its build command produces the `out/` directory before deployment. Do not use `bun opennextjs-cloudflare build`; the OpenNext dependency and build script were removed when the site moved to static export.

Local verification:

```bash
bun run build
bunx wrangler deploy --dry-run --minify
```

The dry run validates the Worker entry point and static assets without uploading.

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
app/[lang]/layout.tsx  # Root layout: html/body + RootProvider + I18nProvider (zh/en)
app/[lang]/page.tsx    # Locale homepage (/zh, /en)
app/[lang]/(docs)/     # Doc pages with docs layout (sidebar, nav)
app/(home)/page.tsx    # `/` → `/zh` redirect
app/api/search.json/   # Site search index
app/og/                # OG image generation
app/llms*.txt/         # LLM text export routes
```

Route mapping: `content/docs/foo/bar.mdx` → `/zh/foo/bar` (and `/en/foo/bar`); `content/docs/foo/index.mdx` → `/zh/foo`; `content/docs/index.mdx` → `/zh`. Ordering and grouping in the sidebar are controlled by `meta.json` in each folder.

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
