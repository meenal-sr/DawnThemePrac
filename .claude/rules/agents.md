# Agent Orchestration

## Architecture
Main conversation = orchestrator + MCP/Skill/Memory bridge. Subagents cannot access MCP servers, cannot call the Skill tool, and should not load memory independently — only built-in tools (Read, Write, Edit, Glob, Grep, Bash, Agent).

**Role split (2026-04 refactor, updated 2026-04-19):**
- **planner** — design intent, data sources, schema (section + blocks), variants, a11y decision, design content reference. Produces `brief.md` ONLY. No test authorship, no test-template populate, no file paths, no codebase scan.
- **architect** — codebase archaeology. Scans repo for reuse targets, produces `architecture.md` — explicit file plan (create vs reuse) + shared-snippet contract + cross-section event contracts. Mandatory on every build.
- **ui-agent** — two-phase, writes to a single consolidated `ui-plan.md`. Phase 1: Intent sections (layout strategy, token map, responsive, SCSS decision, font loading, variant mapping, questions). Phase 2: appends As-built DOM + BEM/selector catalogue + data attributes + schema settings + CSS custom properties + variants implemented + DEVIATIONS + `## JS handoff` (stub or full content). No separate `component-structure.md` file.
- **js-agent** — JS class + events + state machine. Reads `ui-plan.md` Phase 2 sections; fills in `## JS handoff` section of that same file (replaces the ui-agent's stub). No separate `component-api.md` file.
- **test-agent** — owns `test-scenarios.md` authorship + `templates/*.test.json` populate + all spec files. Inputs: `brief.md` (intent + design content reference) + `ui-plan.md` (Phase 2 as-built selectors + state contract + `## JS handoff` in full mode).

**Main prefetches everything → passes into agent prompts:**
1. **MCP data** — Figma design context, screenshots, Shopify API shapes, library docs
2. **Skill output** — main invokes skills relevant to the agent's task, embeds output in prompt
3. **Filtered memory** — main loads `MEMORY.md` once per session and embeds the `type: reference` subset relevant to the agent (see Skill/Memory Routing below)

## Cache-friendly prompt structure (CRITICAL for token efficiency)

Anthropic's automatic prompt caching grants a 90% token discount on cached prefixes > 1024 tokens. To maximize cache hits across agent invocations within a session, EVERY agent prompt main builds MUST order content STABLE-FIRST → DYNAMIC-LAST:

**Section 1 — STABLE PREFIX (cacheable, identical across invocations of the same agent type within a session):**
- Role reminder / mode directive (e.g. "PHASE=2", "Mode: ui-only")
- Skill output (same per-agent-type per-session)
- Memory subset (same per-agent-type per-session)
- Hard rules applicable to this agent (e.g. "never write outside features/<name>/")

**Section 2 — SEMI-STABLE (changes per-feature, cacheable across fix cycles of the same feature):**
- Workspace path
- Contents of brief.md + architecture.md + ui-plan.md (as applicable)
- Figma design context JSON (embedded from `figma.get_design_context`)

**Section 3 — DYNAMIC (task-specific, never cached):**
- Fix-cycle mismatches (for re-invocations after NEEDS_FIX)
- Test output from last run
- Pixelmatch results (for visual-qa-agent)
- Lint diagnostics (for js-agent retries)

Never interleave dynamic content into the stable prefix. A single dynamic token in the first 1024 tokens invalidates the cache for the whole run. Put "Mode: ui-only" and memory subset FIRST; put "Previous cycle mismatches" LAST.

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
| visual-qa-agent | `pixelmatch.compare` (diff each figma-*.png vs live-*.png per breakpoint, writes `qa/diff-*.png` + mismatch %). `playwright-config/figma-export.sh` (REST) only if `qa/figma-*.png` missing. No Figma MCP — typography/color tokens come from brief.md. | `web-design-guidelines` | Visual QA patterns, pixelmatch threshold conventions | — |
| code-reviewer | `ide.getDiagnostics`, `github.get_pull_request*` (PR context) | `modern-javascript-patterns`, `vercel-react-best-practices` (gated), `web-design-guidelines` | JS patterns, Shopify architecture, Tailwind organization, Playwright structure | — |

Workflow checkpoints (`simplify`, `refactor-clean`) are main-invoked **between agent runs**, not during. Never declared in agent skill lists.

## Available Agents
Located in `.claude/agents/`:

| Agent | Purpose | Tools beyond defaults | MCP needed? | When to Use |
|-------|---------|-----------------------|-------------|-------------|
| planner | Design intent + data + schema → `brief.md` ONLY | — | Figma (main prefetches) | Start of any feature |
| architect | Codebase scan → `architecture.md` (file plan + reuse + cross-section contracts) | Read, Grep, Glob | None | Mandatory, after planner |
| ui-agent | Phase 1: Intent sections of `ui-plan.md`. Phase 2: Liquid + Tailwind (+ optional SCSS) + appends As-built + BEM/selector catalogue + data attributes + schema settings + `## JS handoff` stub to SAME `ui-plan.md` | — | Figma (main prefetches) | After architect |
| test-agent | Owns `test-scenarios.md` + `templates/*.test.json` populate + all Playwright spec files. Reads `ui-plan.md` Phase 2 sections | — | None (writes specs, main runs) | After UI agent (ui-only) AND after JS agent (full) |
| visual-qa-agent | Analyze test results + screenshots | — | None (main provides data) | After test run |
| js-agent | JavaScript behavior. Fills `## JS handoff` section in `ui-plan.md` (no separate component-api.md) | — | None | After visual QA PASS |
| code-reviewer | Code quality review | — | None | After writing code |

## Execution Flow (single section)
See `.claude/commands/build-section.md` for full details.
```
Main: Figma prefetch + human Q&A
  → planner (with Figma + answers) → brief.md
  → architect (codebase scan, reads brief) → architecture.md
  → ui-agent Phase 1 (with Figma + brief + architecture) → ui-plan.md
  → Main gate: read ui-plan.md, resolve Questions with human
  → ui-agent Phase 2 → liquid + tailwind (+ optional scss) + appends As-built + selectors + state contract + `## JS handoff` stub to ui-plan.md
  → Main: validate_theme loop
  → test-agent ui-only (with brief + ui-plan.md Phase 2 sections) → test-scenarios.md + templates/[type].test.json populated + ui.spec.js
  → Main: run specs, save Figma screenshots
  → visual-qa-agent → qa report
  → js-agent → JavaScript + fills `## JS handoff` section of ui-plan.md
  → test-agent full → test-scenarios.md updated + functional.spec.js + integration.spec.js
  → Main: run specs
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
