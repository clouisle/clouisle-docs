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

This repository is the official documentation site for [Clouisle](https://github.com/clouisle/Clouisle) — a multi-agent collaboration platform and workflow engine for building and orchestrating production-ready AI agent teams with sandboxed execution, hybrid RAG, and enterprise-grade security.

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
| `npm run build` | Production build (`next build`) — Node/server output only |
| `npm run build:cf` | Cloudflare Workers build (`opennextjs-cloudflare build` + cache population) |
| `npm run start` | Start the production build |
| `npm run deploy` | `build:cf` followed by `wrangler deploy --minify` |
| `npm run types:check` | Next.js typegen + TypeScript type checking |
| `npm run lint` | ESLint |

## Deploy (Cloudflare Workers)

`wrangler.jsonc` points the Worker entry point at `.open-next/worker.js`, which is produced by OpenNext — **not** by `next build`. A plain `next build` followed by `npx wrangler versions upload` fails with:

```
✘ [ERROR] The entry-point file at ".open-next/worker.js" was not found.
```

Cloudflare Workers Build settings must therefore be:

| Setting | Value |
| --- | --- |
| Build command | `npm run build:cf` — or leave empty to use the repo's `wrangler.jsonc` `build.command` |
| Deploy command | `npx wrangler versions upload` (preview) / `npx wrangler deploy` (production) |

The build is also declared in `wrangler.jsonc`:

```jsonc
"build": {
  "command": "npm run build:cf",
}
```

`wrangler` runs that command itself before uploading, so a missing dashboard build command (or one that runs only `next build`) can no longer break the deploy:

```bash
rm -rf .open-next
npx wrangler versions upload --dry-run --outdir /tmp/cf-dry
# [custom build] Running: npm run build:cf
# [custom build] Worker saved in `.open-next/worker.js` 🚀
# [custom build] Successfully populated static assets cache
# Total Upload: 56324.74 KiB / gzip: 7845.52 KiB   → exit 0
```

`build:cf` runs two steps, and both are required:

1. `opennextjs-cloudflare build` — emits `.open-next/worker.js`, `.open-next/assets/**` and the prerendered pages under `.open-next/cache/**`.
2. `opennextjs-cloudflare populateCache remote` — copies the prerendered entries into `.open-next/assets/cdn-cgi/_next_cache/**`. The site uses `staticAssetsIncrementalCache` (see `open-next.config.ts`), so the ~236 pre-rendered pages and the `/llms*` exports are served straight from the ASSETS binding; without this step the upload succeeds but every page falls back to on-request rendering.

Both artifacts are gitignored (`.open-next/`), so the deploy must always run after a build in the same workspace — never upload from a clean checkout.

Local verification of the whole chain:

```bash
npm run build:cf
npx wrangler versions upload --dry-run --outdir /tmp/cf-dry   # validates entry point + assets without uploading
```

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
app/layout.tsx    # Root layout: RootProvider + DocsLayout
app/page.tsx      # Index page (/)
app/[[...slug]]/  # Doc pages
app/api/search/   # Site search
app/og/           # OG image generation
app/llms*.txt/    # LLM text export routes
```

Route mapping: `content/docs/foo/bar.mdx` → `/foo/bar`; `content/docs/foo/index.mdx` → `/foo`; `content/docs/index.mdx` → `/`. Ordering and grouping in the sidebar are controlled by `meta.json` in each folder.

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
