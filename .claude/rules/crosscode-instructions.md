# CrossCode Instructions — Shopify JavaScript Theme

Project-specific rules for this Shopify JavaScript theme build system. Generic rules (security, coding style, git, agents, performance) live in their own focused files.

---

## Available Skills (`/<skill>`)

| Skill | When to Use |
|-------|-------------|
| `/plan` | Restate requirements + create step-by-step plan before touching code |
| `/tdd` | Enforce RED → GREEN → REFACTOR workflow |
| `/code-review` | Review code changes for quality/security |
| `/simplify` | Review changed code for reuse and efficiency |
| `/refactor-clean` | Remove dead code and clean up |
| `/frontend-design` | Build production-grade UI components |
| `/webapp-testing` | Test local dev server with Playwright |
| `/typescript-advanced-types` | Complex type logic and generics |
| `/modern-javascript-patterns` | ES6+ refactoring and patterns |
| `/tailwind-design-system` | Design tokens and Tailwind component patterns |
| `/vercel-react-best-practices` | React/Next.js performance patterns |
| `/web-design-guidelines` | Accessibility and UX audit |
| `/javascript-testing-patterns` | Jest/Vitest/Testing Library setup |
| `/api-design-principles` | REST/GraphQL API design review |

---

## MCP Servers

| Server | Purpose | When to Use |
|--------|---------|-------------|
| `figma` | Read/write Figma designs | Any Figma URL or design-to-code task |
| `shopify-dev-mcp` | Shopify API docs + schema + theme validation | Shopify Liquid, GraphQL, theme work |
| `context7` | Up-to-date library documentation | Any `resolve-library-id` + `query-docs` |
| `github` | PR/issue/branch management | Git operations beyond local |
| `playwright` | Browser automation + UI testing | Testing live Shopify dev server |
| `playwright-mcp` | Snapshot + screenshot testing | Visual regression / QA |
| `filesystem` | File operations outside CWD | Reading assets, cross-project files |
| `firecrawl` | Web scraping + research | External docs, competitor research |
| `sequential-thinking` | Complex multi-step reasoning | Architectural planning |
| `ide` | Diagnostics + code execution | Lint / JS runtime errors, run code |

---

## Build System Reference

```bash
yarn start              # webpack watch (development)
yarn lint               # ESLint on js/ directory
yarn deploy             # webpack build + shopify theme push
yarn shopify:push       # Push theme to Shopify store
yarn shopify:pull       # Pull templates/*.json from Shopify
```

### Build Troubleshooting
1. Read error messages carefully
2. Run `yarn lint` for ESLint violations
3. Fix incrementally — verify after each fix
4. Run `yarn deploy` to confirm full build passes

### JavaScript Rules
- Babel compiles JS via `@babel/preset-env` + `@babel/preset-react` (preset kept for future React islands)
- ESLint: `no-unused-vars` enforced; prefix intentionally-unused with `_`
- Use JSDoc comments for type hints where editor inference helps
- Webpack entry: every file in `js/sections/*.js` is an entry point; shared code in `js/components/*.js` imported via `JsComponents/*` alias

---

## Feature Implementation Workflow

```
1. /plan          → Align on approach before touching code (main-invoked skill)
2. planner agent  → Create brief.md + test-scenarios.md
3. /tdd           → Write tests first (RED) (main-invoked skill)
4. Implement      → Minimal code to pass (GREEN) — UI → TS agents
5. /simplify      → Refactor and clean up (IMPROVE) (main-invoked checkpoint)
6. /refactor-clean → Remove dead code, dedupe (main-invoked checkpoint, optional)
7. code-reviewer  → Review for quality/security
8. Commit         → Conventional commit message
```

Skills at steps 1, 3, 5, 6 are invoked by **main conversation**, never declared as sub-steps inside the agents themselves. See `.claude/rules/agents.md` for the Skill/Memory Routing table.

---

## Shopify Theme Patterns

- All Tailwind classes prefixed `tw-` — never use unprefixed utilities
- Custom breakpoints: `small` (390px), `md-small` (768px), `md` (1024px), `lg` (1280px), `2xl` (1550px)
- Design tokens vary per project — always check `tailwind.config.js` for token names, never raw hex
- One section file = one output bundle — no shared logic in section files, put it in `js/components/` and import via the `JsComponents/*` alias
- Shared code used by ≥ 2 entries goes into `assets/shared.js` automatically via webpack
- `sideEffects: ["*.scss"]` — SCSS files have side effects; TS/JS files do not
