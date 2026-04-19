# Agent Orchestration

## Architecture
Main conversation = orchestrator + MCP/Skill/Memory bridge. Subagents cannot access MCP servers, cannot call the Skill tool, and should not load memory independently — only built-in tools (Read, Write, Edit, Glob, Grep, Bash, Agent).

**Role split (simplified flow, 2026-04-19):**
- **planner** — design intent, data sources, schema, variants, a11y decision, **file plan**, **reuse scan**, JS decision. Single upfront doc. Writes `features/<name>/brief.md`. Absorbs the file-plan + codebase-scan role that architect previously owned — no separate architecture.md.
- **ui-agent** — single-phase. Reads `brief.md` + `figma-context.md`. Writes `.liquid` files. Appends `## As-built DOM`, `## Selector catalogue`, `## Schema settings (final)`, `## DEVIATIONS`, `## JS handoff` (stub if JS=YES, full content if JS=NO) to the bottom of the same `brief.md`. No `ui-plan.md` — everything lives in brief.md.
- **js-agent** — conditional (only when brief says JS=YES). Reads brief.md (intent + as-built selectors + JS handoff stub). Writes JS file(s). Replaces `## JS handoff` stub in brief.md with full content.
- **test-agent** — owns `test-scenarios.md` authorship + APPENDs to shared `templates/<type>.test.json` + all spec files. Reads brief.md (intent + as-built + copy ground truth via figma-context.md).
- **visual-qa-agent** — reads brief.md tokens, compares figma/live PNGs, writes `qa/visual-qa-report.md`.
- **code-reviewer** — reviews source files only. Never passed the feature folder (planning docs are out of scope).

**Main prefetches everything → passes into agent prompts:**
1. **MCP data** — Figma design context, screenshots, Shopify API shapes, library docs
2. **Skill output** — main invokes skills relevant to the agent's task, embeds output in prompt
3. **Filtered memory** — main loads `MEMORY.md` once per session and embeds `type: reference` entries relevant to the agent
4. **Project reference rules** — main reads `.claude/memory/reference_*.md` at session start and embeds any file whose scope overlaps the agent's task. These files are committed to the repo and are BINDING canonical engineering conventions. Do NOT skip them. Planner specifically must receive all relevant reference files — e.g. `reference_image_stack.md` so the file plan reuses `snippets/image.liquid` / `snippets/shopify-responsive-image.liquid` correctly.

## Cache-friendly prompt structure (CRITICAL for token efficiency)

Anthropic's automatic prompt caching grants a 90% token discount on cached prefixes > 1024 tokens. EVERY agent prompt main builds MUST order content STABLE-FIRST → DYNAMIC-LAST:

**Section 1 — STABLE PREFIX (cacheable, identical across invocations of the same agent type within a session):**
- Role reminder / mode directive (e.g. "Mode: ui-only")
- Skill output (same per-agent-type per-session)
- Memory subset (same per-agent-type per-session)
- Hard rules applicable to this agent (e.g. "never write outside features/<name>/")

**Section 2 — SEMI-STABLE (changes per-feature, cacheable across fix cycles of the same feature):**
- Workspace path
- Full contents of `brief.md` (grows as agents append)
- Figma design context JSON (embedded from `figma.get_design_context`)

**Section 3 — DYNAMIC (task-specific, never cached):**
- Fix-cycle mismatches (for re-invocations after NEEDS_FIX)
- Test output from last run
- Pixelmatch results (for visual-qa-agent)
- Lint diagnostics (for js-agent retries)

Never interleave dynamic content into the stable prefix.

## Main Prefetch Contract (single source of truth)

Subagents cannot call MCPs or skills. Main prefetches and embeds everything in the agent's prompt.

| Agent | MCPs main calls first | Skills main invokes first | Memory subset embedded | Post-handoff checks (main) |
|---|---|---|---|---|
| planner | `figma.get_design_context`, `figma.get_variable_defs` | `plan` | Shopify section/snippet architecture, Tailwind organization, a11y patterns, schema conventions, shared-snippet conventions, image-stack rules | — (brief.md only) |
| ui-agent | — (Figma + brief.md already embedded) | `web-design-guidelines` | Liquid best practices, section/snippet architecture, Tailwind organization, responsive+a11y patterns | `shopify-dev-mcp.learn_shopify_api` + `validate_theme` (loop max 3) |
| js-agent | `shopify-dev-mcp.search_docs_chunks` (on demand), `context7` (libs) | `modern-javascript-patterns`, `vercel-react-best-practices` (only for `.jsx`) | JS class/component patterns, Shopify section architecture, DOM lifecycle | `ide.getDiagnostics` + `yarn lint` per file (loop max 3) |
| test-agent | — | — | Playwright structure for Shopify storefronts, test scenario patterns, Shopify template JSON shape (blocks = map + block_order) | `yarn playwright:test features/[name]/*.spec.js --reporter=list` |
| visual-qa-agent | `pixelmatch.compare` (diff each figma-*.png vs live-*.png per breakpoint, writes `qa/diff-*.png` + mismatch %) | `web-design-guidelines` | Visual QA patterns, pixelmatch threshold conventions | — |
| code-reviewer | `ide.getDiagnostics`, `github.get_pull_request*` (PR context) | `modern-javascript-patterns`, `vercel-react-best-practices` (gated), `web-design-guidelines` | JS patterns, Shopify architecture, Tailwind organization, Playwright structure | — |

Workflow checkpoints (`simplify`, `refactor-clean`) are main-invoked **between agent runs**, not during. Never declared in agent skill lists.

## Available Agents
Located in `.claude/agents/`:

| Agent | Purpose | Tools beyond defaults | MCP needed? | When to Use |
|-------|---------|-----------------------|-------------|-------------|
| planner | Design intent + data + schema + file plan + reuse scan + JS decision → `brief.md` ONLY | Read, Grep, Glob | Figma (main prefetches) | Start of any feature |
| ui-agent | Writes Liquid + Tailwind (+ optional SCSS) + appends As-built / Selectors / Schema / DEVIATIONS / JS handoff to `brief.md` | — | Figma (main prefetches) | After planner |
| js-agent | JavaScript behavior. Replaces `## JS handoff` stub in `brief.md` with full content | — | None | Conditional — only when brief §JS says YES |
| test-agent | `test-scenarios.md` + APPEND to `templates/<type>.test.json` + all Playwright spec files | — | None (writes specs, main runs) | After ui-agent (ui-only mode) AND after js-agent (full mode) |
| visual-qa-agent | Analyze test results + screenshots → `qa/visual-qa-report.md` | — | None (main provides pixelmatch + tokens) | After test run |
| code-reviewer | Code quality review on source files | — | None | After writing code |

## Execution Flow (single section)
See `.claude/commands/build-section.md` for full details.
```
Main: Figma prefetch + human Q&A + figma-context.md write + figma-*.png persist
  → planner (brief = intent + schema + file plan + reuse scan + JS decision)
  → ui-agent (reads brief) → Liquid files + appends as-built/selectors/schema/deviations/JS-handoff to brief.md
  → Main: validate_theme loop
  → test-agent ui-only (reads brief) → test-scenarios.md + APPEND page.test.json + [name].spec.js
  → Main: run specs
  → visual-qa-agent → qa report
  → [conditional] js-agent (only if brief §JS=YES) → JS file + replaces JS handoff stub in brief.md
  → [conditional] test-agent full mode → .functional.spec.js + .integration.spec.js
  → Main: run specs
```

## Parallel Execution
Spawn multiple agents in a SINGLE message for parallel work. Only parallelize independent work — never agents that depend on each other's output.

## Mandatory Liquid Validation (main conversation)
Subagents have no MCP access — validation is main's job.

After ui-agent finishes writing/updating any `.liquid` files, **main** MUST:
1. Call `shopify-dev-mcp.learn_shopify_api(api: "liquid")` to get a `conversationId`
2. Call `shopify-dev-mcp.validate_theme` with all created/updated `.liquid` files
3. If errors: feed them back to ui-agent with the exact file paths + error messages, re-run Step 2 on the updated files
4. Loop until clean (max 3 cycles → escalate to human)

Never skip this step for Liquid files.

## Document flow (single file — brief.md grows through the pipeline)

`features/<name>/brief.md` is the single authoritative doc. Each agent appends its section to the bottom in order:

| Section | Written by | When |
|---|---|---|
| `# brief.md — <name>` + `## Intent` + `## Design reference` + `## Schema plan` + `## File plan (Create + Reuse + APPEND)` + `## Reuse scan` + `## Variants` + `## A11y` + `## JavaScript decision` + `## Copy` + `## Success criteria` + `## Constraints` | planner | Step 1 (upfront) |
| `## As-built DOM` + `## Selector catalogue` + `## Data attributes` + `## Schema settings (final)` + `## CSS custom properties` + `## Figma variants implemented/not` + `## DEVIATIONS` + `## JS handoff` (stub OR full) | ui-agent | After Liquid written |
| `## JS handoff` (replaces stub with full content) | js-agent | Conditional — only if brief §JS decision = YES |

Companion files (NOT in brief.md):
- `features/<name>/figma-context.md` — canonical design values (typography, colors, spacing, copy strings, tokens, cross-breakpoint deltas). Written by main during `/plan-feature` prefetch.
- `features/<name>/qa/figma-*.png` — design reference screenshots. Written by main.
- `features/<name>/qa/live-*.png` — live screenshots. Written by test-agent specs.
- `features/<name>/qa/diff-*.png` — pixelmatch outputs. Written by main.
- `features/<name>/qa/visual-qa-report.md` — written by visual-qa-agent.
- `features/<name>/test-scenarios.md` — written by test-agent.
- `features/<name>/<name>.spec.js` — written by test-agent.
- `features/<name>/<name>.functional.spec.js` / `.integration.spec.js` — written by test-agent in full mode.
