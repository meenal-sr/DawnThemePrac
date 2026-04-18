# Agent Orchestration

## Architecture
Main conversation = orchestrator + MCP/Skill/Memory bridge. Subagents cannot access MCP servers, cannot call the Skill tool, and should not load memory independently — only built-in tools (Read, Write, Edit, Glob, Grep, Bash, Agent).

**Role split (2026-04 refactor, updated 2026-04-19):**
- **planner** — design intent, data sources, schema (section + blocks), variants, a11y decision, design content reference. Produces `brief.md` ONLY. No test authorship, no test-template populate, no file paths, no codebase scan.
- **architect** — codebase archaeology. Scans repo for reuse targets, produces `architecture.md` — explicit file plan (create vs reuse) + shared-snippet contract + cross-section event contracts. Mandatory on every build.
- **ui-agent** — two-phase. Phase 1: `ui-plan.md` — INTENT (DOM outline, Tailwind token map, responsive strategy, SCSS decision, font loading, questions). Phase 2: Liquid + (conditional) SCSS + as-built `component-structure.md` — AUTHORITATIVE selectors + data-attrs + state contract + schema setting IDs for downstream agents.
- **js-agent** — JS class + events + state machine + `component-api.md`. Consumes `component-structure.md` selectors + JS handoff notes.
- **test-agent** — owns `test-scenarios.md` authorship + `templates/*.test.json` populate + all spec files. Inputs: `brief.md` (intent + design content reference) + `component-structure.md` (as-built selectors + state contract).

**Main prefetches everything → passes into agent prompts:**
1. **MCP data** — Figma design context, screenshots, Shopify API shapes, library docs
2. **Skill output** — main invokes skills relevant to the agent's task, embeds output in prompt
3. **Filtered memory** — main loads `MEMORY.md` once per session and embeds the `type: reference` subset relevant to the agent (see Skill/Memory Routing below)

## Main Prefetch Contract (single source of truth)

Subagents cannot call MCPs or skills. Main prefetches and embeds everything in the agent's prompt. Each agent file references this table instead of repeating the contract per agent.

| Agent | MCPs main calls first | Skills main invokes first | Memory subset embedded | Post-handoff checks (main) |
|---|---|---|---|---|
| planner | `figma.get_design_context`, `figma.get_screenshot` | `plan` | Shopify section/snippet architecture, Tailwind organization, a11y patterns, schema conventions | — (brief.md only) |
| architect | `shopify-dev-mcp.search_docs_chunks` (on demand), `sequential-thinking` (cross-section deps) | `plan` | Shopify architecture, proven theme patterns, shared-snippet conventions | — |
| ui-agent Phase 1 (plan) | `figma.get_design_context`, `figma.get_screenshot` | `web-design-guidelines` | Tailwind organization, responsive+a11y patterns | Main gate — read `ui-plan.md`, resolve Questions with human |
| ui-agent Phase 2 (code) | — (Figma + architecture.md already embedded) | — | Liquid best practices, section/snippet architecture | `shopify-dev-mcp.learn_shopify_api` + `validate_theme` (loop max 3) |
| js-agent | `shopify-dev-mcp.search_docs_chunks` (on demand), `context7` (libs) | `modern-javascript-patterns`, `vercel-react-best-practices` (only for `.jsx`/React islands) | JS class/component patterns, Shopify section architecture, DOM lifecycle | `ide.getDiagnostics` + `yarn lint` per file (loop max 3) |
| test-agent | — | — | Playwright structure for Shopify storefronts, test scenario patterns, Shopify template JSON shape (blocks = map + block_order) | `yarn playwright:test features/[name]/*.spec.js --reporter=list` |
| visual-qa-agent | `figma.get_screenshot` (saved to `qa/figma-*.png`), `pixelmatch.compare` (diff each figma-*.png vs live-*.png per breakpoint, writes `qa/diff-*.png` + mismatch %) | `web-design-guidelines` | Visual QA patterns, pixelmatch threshold conventions | — |
| page-integration-test | — | — | Playwright structure, cross-section event testing, full-page integration | `npx playwright test pages/[name]/tests/*.spec.js` |
| code-reviewer | `ide.getDiagnostics`, `github.get_pull_request*` (PR context) | `modern-javascript-patterns`, `vercel-react-best-practices` (gated), `web-design-guidelines` | JS patterns, Shopify architecture, Tailwind organization, Playwright structure | — |

Workflow checkpoints (`simplify`, `refactor-clean`) are main-invoked **between agent runs**, not during. Never declared in agent skill lists.

## Available Agents
Located in `.claude/agents/`:

| Agent | Purpose | Tools beyond defaults | MCP needed? | When to Use |
|-------|---------|-----------------------|-------------|-------------|
| planner | Design intent + data + schema → `brief.md` ONLY | — | Figma (main prefetches) | Start of any feature |
| architect | Codebase scan → `architecture.md` (file plan + reuse + cross-section contracts) | Read, Grep, Glob | None | Mandatory, after planner |
| ui-agent | Phase 1 `ui-plan.md` (intent: DOM outline + tokens + responsive) then Phase 2 Liquid + Tailwind (+ optional SCSS) + `component-structure.md` (as-built: authoritative selectors + state contract) | — | Figma (main prefetches) | After architect |
| test-agent | Owns `test-scenarios.md` + `templates/*.test.json` populate + all Playwright spec files | — | None (writes specs, main runs) | After UI agent (ui-only) AND after JS agent (full) |
| visual-qa-agent | Analyze test results + screenshots | — | None (main provides data) | After test run |
| js-agent | JavaScript behavior + `component-api.md` | — | None | After visual QA PASS |
| code-reviewer | Code quality review | — | None | After writing code |

## Execution Flow (single section)
See `.claude/commands/build-section.md` for full details.
```
Main: Figma prefetch + human Q&A
  → planner (with Figma + answers) → brief.md
  → architect (codebase scan, reads brief) → architecture.md
  → ui-agent Phase 1 (with Figma + brief + architecture) → ui-plan.md
  → Main gate: read ui-plan.md, resolve Questions with human
  → ui-agent Phase 2 → liquid + tailwind (+ optional scss) + component-structure.md
  → Main: validate_theme loop
  → test-agent ui-only (with brief + component-structure) → test-scenarios.md + templates/[type].test.json populated + ui.spec.js
  → Main: run specs, save Figma screenshots
  → visual-qa-agent → qa report
  → js-agent → JavaScript + component-api.md
  → test-agent full → test-scenarios.md updated + functional.spec.js + integration.spec.js
  → Main: run specs
```

## Execution Flow (full page)
See `page-build-checklist.md` for full details.
```
Main: Figma prefetch ALL sections
  → Map dependencies → group into parallel batches
  → Present plan → get human approval
  → Execute groups (parallel within each group)
  → Cross-section integration tests
```

## Parallel Execution
Spawn multiple agents in a SINGLE message for parallel work:
```
Agent({ subagent_type: "ui-agent", prompt: "Build hero-banner..." })
Agent({ subagent_type: "ui-agent", prompt: "Build product-card..." })
```
Both run simultaneously. Only parallelize independent work — never agents that depend on each other's output.

## Immediate Agent Usage
No user prompt needed:
1. Complex feature requests → **planner** agent
2. Code just written/modified → **code-reviewer** agent
3. File plan / reuse question on an existing codebase → **architect** agent (standalone invocation)

## Mandatory Liquid Validation (main conversation)
Subagents have no MCP access — validation is main's job.

After the UI agent finishes writing/updating any `.liquid` files, **main** MUST:
1. Call `shopify-dev-mcp.learn_shopify_api(api: "liquid")` to get a `conversationId`
2. Call `shopify-dev-mcp.validate_theme` with all created/updated `.liquid` files
3. If errors: feed them back to the UI agent with the exact file paths + error messages, re-run Step 2 on the updated files
4. Loop until clean (max 3 cycles → escalate to human)

Never skip this step for Liquid files.
