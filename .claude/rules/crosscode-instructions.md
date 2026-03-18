# Everything Claude Code — CrossCode Instructions

This document consolidates all rules and guidelines for Claude Code, refined for this Shopify TypeScript theme project.

---

## Security Guidelines (CRITICAL)

### Mandatory Checks Before ANY Commit
- [ ] No hardcoded secrets (API keys, Shopify tokens, `.env` values)
- [ ] All user inputs validated at system boundaries
- [ ] XSS prevention — sanitize any dynamic HTML injection in Liquid/JS
- [ ] Authentication/authorization verified (Shopify storefront vs admin)
- [ ] Error messages don't leak sensitive data

### Secret Management
```typescript
// NEVER: Hardcoded
const token = "shpat_xxxxx"

// ALWAYS: Environment variable
const token = process.env.SHOPIFY_ACCESS_TOKEN
if (!token) throw new Error('SHOPIFY_ACCESS_TOKEN not configured')
```

### Security Response Protocol
1. STOP immediately
2. Fix CRITICAL issues before continuing
3. Rotate any exposed secrets (Shopify API keys, `.env` tokens)
4. Review full codebase for similar patterns

---

## Coding Style

### Immutability (CRITICAL)
ALWAYS create new objects — NEVER mutate:
```typescript
// WRONG
function updateBlock(block, value) {
  block.settings.value = value
  return block
}

// CORRECT
function updateBlock(block: Block, value: string): Block {
  return { ...block, settings: { ...block.settings, value } }
}
```

### File Organization
- 200–400 lines typical, 800 max
- One section file = one asset (`ts/sections/my-section.ts` → `assets/my-section.js`)
- Extract shared utilities into `ts/components/` (aliased as `TsComponents`)
- Extract shared styles into `scss/components/` (aliased as `StyleComponents`)

### Error Handling
```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('[SectionName] operation failed:', error)
  throw new Error('Descriptive message for debugging')
}
```

### Input Validation
Validate at boundaries (user input, Shopify section settings, external APIs):
```typescript
const price = Number(dataset.price)
if (isNaN(price) || price < 0) throw new Error('Invalid price value')
```

### Code Quality Checklist
- [ ] Functions < 50 lines
- [ ] Files < 800 lines
- [ ] No deep nesting (> 4 levels)
- [ ] No hardcoded values
- [ ] No `console.log` left in committed code
- [ ] Immutable patterns used throughout

---

## Agent Orchestration

### Available Agents (`~/.claude/agents/`)

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `planner` | Implementation planning + briefs | Complex features, new sections |
| `architect` | System/data design | Component boundaries, data flow |
| `code-reviewer` | Code quality review | After writing/modifying any code |
| `orchestrator` | Feature build coordination | After planner produces brief.md |
| `page-orchestrator` | Full-page build coordination | Multi-section page builds |
| `ui-agent` | Figma → Liquid/HTML/SCSS | Building sections from designs |
| `ts-agent` | TypeScript behavior layer | After ui-agent + visual QA pass |
| `test-agent` | Playwright component tests | After ts-agent + component-api.md |
| `visual-qa-agent` | Figma vs live render QA | After ui-agent finishes |
| `page-integration-test` | Cross-section Playwright tests | After full page is assembled |

### Immediate Agent Usage (no user prompt needed)
1. New section/feature → **planner** agent first
2. Code just written/modified → **code-reviewer** agent
3. Architectural decision (data flow, Liquid type) → **architect** agent
4. Figma design to build → **ui-agent** → **visual-qa-agent** → **ts-agent** → **test-agent**

### Parallel Execution
Run independent agents in parallel. Never sequentialize what can run simultaneously:
```
planner (brief) → [ui-agent + architect] in parallel → visual-qa → ts-agent → test-agent
```

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
| `ide` | Diagnostics + code execution | TypeScript errors, run code |

---

## Build System Reference

```bash
yarn start              # Type-check + webpack watch (development)
yarn lint               # ESLint on ts/ directory
yarn typecheck          # tsc --noEmit (type-check only)
yarn emit-declarations  # Generate .d.ts to dist/
yarn deploy             # webpack build + shopify theme push
yarn shopify:push       # Push theme to Shopify store
yarn shopify:pull       # Pull templates/*.json from Shopify
```

### Build Troubleshooting
1. Read error messages carefully
2. Run `yarn typecheck` to isolate TS issues
3. Run `yarn lint` for ESLint violations
4. Fix incrementally — verify after each fix
5. Run `yarn deploy` to confirm full build passes

### TypeScript Rules
- Babel compiles TS — `tsc` is type-check only (`noEmit: true`)
- Strict mode: `noUnusedLocals` + `noUnusedParameters` enforced
- ESLint requires explicit type annotations (except `_`-prefixed vars)
- Never emit JS from `tsc` — webpack/Babel owns compilation

---

## Git Workflow

### Commit Message Format
```
<type>: <description>

<optional body>
```
Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

### Pull Request Workflow
1. `git diff main...HEAD` to see all changes
2. Analyze full commit history — not just the latest
3. Write PR title < 70 chars
4. Include test plan checklist in body
5. Push with `-u` flag on new branches

---

## Feature Implementation Workflow

```
1. /plan          → Align on approach before touching code
2. planner agent  → Create brief.md + test-scenarios.md
3. /tdd           → Write tests first (RED)
4. Implement      → Minimal code to pass (GREEN)
5. /simplify      → Refactor and clean up (IMPROVE)
6. code-reviewer  → Review for quality/security
7. Commit         → Conventional commit message
```

---

## Performance Optimization

### Model Selection
- **Haiku 4.5** — Lightweight/frequent agent invocations, simple codegen
- **Sonnet 4.6** — All main development work, orchestration (default)
- **Opus 4.6** — Deep architectural decisions, complex research

### Context Window
Avoid the last 20% of context for:
- Large-scale refactoring across many files
- Multi-section page builds
- Debugging complex Webpack/Babel interactions

---

## Shopify Theme Patterns

- All Tailwind classes prefixed `tw-` — never use unprefixed utilities
- Custom breakpoints: `small` (390px), `md-small` (768px), `md` (1024px), `lg` (1280px), `2xl` (1550px)
- Design tokens vary per project — always check `tailwind.config.js` for the project's token names and use those, never raw hex
- One section file = one output bundle (no shared logic in section files — put it in `ts/components/`)
- Shared code used by ≥ 2 entries goes into `assets/shared.js` automatically via webpack
- `sideEffects: ["*.scss"]` — SCSS files have side effects; TS/JS files do not
