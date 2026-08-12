# Clouisle Documentation Overhaul Design Document

## Background & Goals

- Replace the placeholder-only Fumadocs tree with documentation grounded in the shipped Clouisle codebase at `../Clouisle`.
- Organize content by reader goal: platform use, field/reference detail, integration APIs, and self-hosting.
- Treat implementation and executable deployment manifests as authoritative. Source-project guide pages are secondary because several contain fabricated or stale fields.
- Keep screenshot work explicit without committing fake images: every visual insertion point names the required UI state, crop, annotation, filename, alt text, and caption.
- Success criteria: all navigation entries resolve, key shipped workflows are documented, critical defaults and limits are in body text, MDX builds, and no image placeholder produces a broken image request.

## High-Level Design

The existing four root collections remain stable:

1. `usage`: first-run path, concepts, task-oriented product guides, and end-to-end tutorials.
2. `reference`: exact product fields, limits, statuses, node catalog, permissions, API-key behavior, and site settings.
3. `api`: stable integration contracts for agent chat, workflows, conversations, knowledge retrieval, SSE, errors, and admin boundaries.
4. `self-host`: architecture, installer/Compose/Kubernetes/source deployment, environment variables, storage, upgrades, backup, monitoring, and troubleshooting.

Screenshot placeholders use visible `Callout` blocks rather than missing `<img>` elements. This keeps the site build and browser console clean before screenshots exist. Each block contains the future `/images/*.png` path and capture specification. When the asset is supplied, replace the Callout with `<figure><img .../><figcaption>...</figcaption></figure>` while preserving identical alt/caption text.

## Implementation Plan

### Stage 1: Information Architecture

- **Files modified**: `content/docs/**/meta.json`, collection index pages, new guide/reference/API/self-host pages.
- **Specific logic**: preserve existing URLs where the topic remains valid; add missing authentication, dashboard, packages, skills, sandbox, retrieval lab, profile, observability, backup, architecture, and API authentication pages. Split configuration detail from task guides.
- **Validation**: inspect the generated sidebar and page tree; confirm no duplicate or orphan URL.

### Stage 2: Platform and Concept Content

- **Files modified**: `content/docs/usage/**/*.mdx`.
- **Specific logic**: document the implemented platform flow: register/login, select a team, configure authorized models, create knowledge, create Agent/workflow, test, publish, observe. Use exact labels from `frontend/i18n/zh/*.json` and constraints from backend Pydantic schemas.
- **Validation**: manually trace each instruction against route/component files and ensure destructive operations include consequences.

### Stage 3: Reference and API Content

- **Files modified**: `content/docs/reference/*.mdx`, `content/docs/api/*.mdx`.
- **Specific logic**: record exact current defaults/limits. Document API key Bearer authentication and allowlists, response envelope, principal public endpoint groups, SSE event semantics, error-code families, and admin API caveat. Avoid claiming every internal CRUD route is a stable public API.
- **Validation**: compare endpoint paths with FastAPI router decorators and request/response schemas.

### Stage 4: Self-hosting Content

- **Files modified**: `content/docs/self-host/**/*.mdx`.
- **Specific logic**: document the guided installer, Docker Compose, Helm, generated/manual Kubernetes manifest, source development path, service topology, environment groups, storage behavior, scaling, upgrade/backup/monitoring/troubleshooting. Use deploy manifests and `.env.example` files as source of truth.
- **Validation**: verify every command and service name against `deploy/README.md`, `deploy/docker-compose.yml`, chart values, and backend settings.

### Stage 5: Visual Placeholders and Cross-links

- **Files modified**: task guides and tutorials with UI steps.
- **Specific logic**: insert annotated screenshot requirements immediately after the UI state they illustrate. Cross-link concepts, guides, reference, API, and deployment pages with relative MDX links.
- **Validation**: scan links and screenshot specifications; no placeholder references a nonexistent image in an `<img>` tag.

### Stage 6: Site Verification

- **Files modified**: only pages that fail MDX validation.
- **Specific logic**: run types check/build, fix invalid icons/imports/links/MDX syntax, and inspect representative `/llms.mdx/*/content.md` output.
- **Validation**: `npm run types:check`, `npm run build`, route/link scan, and rendered representative pages if the local application can be started within repo policy.

## Testing Strategy

- Happy path: the site builds and all meta-declared pages exist.
- Error path: MDX compilation catches malformed JSX, invalid imports, and duplicate routes; a custom link scan catches unresolved relative `.mdx` paths.
- Regression scope: home navigation, four root collection tabs, locale-aware route generation, LLM exports, existing branding/layout.

## Risks & Mitigation

- **Stale source docs**: use backend schemas, router decorators, frontend code/translations, and deploy manifests over prose guides.
- **Feature breadth**: concise complete pages over copied long source guides; every shipped domain receives an entry point and operative constraints.
- **Screenshots unavailable**: explicit non-broken placeholders with capture instructions; no fake assets.
- **English parity**: the site currently contains no `.en.mdx` content. Default-language Chinese pages are authoritative and Fumadocs falls back to them. Do not create low-quality machine-translated duplicates in this pass.
- **Rollback**: content-only changes can be reverted by path; no loader/routing architecture changes are required.
