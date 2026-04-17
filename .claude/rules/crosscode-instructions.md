# CrossCode Instructions — Shopify JavaScript Theme

Project-specific rules for this Shopify JavaScript theme build system. Generic rules (security, coding style, git, agents, performance) live in their own focused files.

---

## Available Skills (`/<skill>`)

See `.claude/rules/workflow-commands.md` for the full decision tree. Project skills:

| Skill | When to Use |
|-------|-------------|
| `/plan` | Restate requirements + step-by-step plan before code (non-Figma tasks) |
| `/simplify` | Review changed code for reuse + efficiency |
| `/refactor-clean` | Remove dead code and clean up |
| `modern-javascript-patterns` | ES6+ patterns — invoked by main for js-agent / code-reviewer |
| `vercel-react-best-practices` | React island patterns — invoked by main for js-agent / code-reviewer **only if `.jsx` files present** |
| `web-design-guidelines` | a11y + interface standards — invoked by main for ui-agent / visual-qa-agent / code-reviewer |
| `caveman` | Token-compression communication mode (trigger: "caveman mode") |

Workflow skills (`/plan`, `/simplify`, `/refactor-clean`) are invoked by the human or main directly. Domain skills (`modern-javascript-patterns`, `web-design-guidelines`, etc.) are invoked by **main** per the Main Prefetch Contract in `.claude/rules/agents.md` before spawning the relevant agent.

---

## MCP Servers

Configured in `.mcp.json`. Enabled list in `.claude/settings.local.json`.

| Server | Purpose | When to Use |
|--------|---------|-------------|
| `figma` | Read Figma design context + screenshots | Core: every section build (planner, ui-agent, visual-qa) |
| `shopify-dev-mcp` | Shopify Liquid validation + API docs | Core: UI agent validation loop, Shopify API shape lookup |
| `playwright-mcp` | Browser snapshot + screenshot | Visual QA + live DOM inspection |
| `pixelmatch` | Pixel-level screenshot diff | Visual QA — compare Figma reference (`qa/figma-*.png`) vs live screenshot (`qa/live-*.png`) per breakpoint; writes `qa/diff-*.png` + mismatch percentage |
| `context7` | Library documentation | Any `resolve-library-id` + `query-docs` for third-party libs |
| `github` | PR/issue/branch management | Code reviewer PR context, issue lookup |
| `sequential-thinking` | Multi-step reasoning | Architect for complex cross-section dependencies |
| `memory` | Persistent knowledge graph | Long-term cross-session recall |
| `ide` | Diagnostics + code execution | Lint / runtime errors, run code snippets |

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
3. /plan-feature  → If Figma work: planner agent writes brief.md + test-scenarios.md (spec-first)
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
