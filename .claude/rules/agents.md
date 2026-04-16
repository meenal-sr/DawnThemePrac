# Agent Orchestration

## Architecture
Main conversation = orchestrator + MCP/Skill/Memory bridge. Subagents cannot access MCP servers, cannot call the Skill tool, and should not load memory independently — only built-in tools (Read, Write, Edit, Glob, Grep, Bash, Agent).

**Main prefetches everything → passes into agent prompts:**
1. **MCP data** — Figma design context, screenshots, Shopify API shapes, library docs
2. **Skill output** — main invokes skills relevant to the agent's task, embeds output in prompt
3. **Filtered memory** — main loads `MEMORY.md` once per session and embeds the `type: reference` subset relevant to the agent (see Skill/Memory Routing below)

## Main Prefetch Contract (single source of truth)

Subagents cannot call MCPs, skills, or `load-memory`. Main prefetches and embeds everything in the agent's prompt. Each agent file references this table instead of repeating the contract per agent.

| Agent | MCPs main calls first | Skills main invokes first | Memory subset embedded | Post-handoff checks (main) |
|---|---|---|---|---|
| planner | `figma.get_design_context`, `figma.get_screenshot` | `plan` | Shopify section/snippet architecture, JS component patterns, Tailwind organization, a11y patterns | — |
| architect | `shopify-dev-mcp.search_docs_chunks` (on demand), `sequential-thinking` (complex deps) | `plan` | Shopify architecture, JS patterns, proven theme patterns | — |
| ui-agent | `figma.get_design_context`, `figma.get_screenshot` | `tailwind-design-system`, `web-design-guidelines` | Section/snippet architecture, Tailwind organization, Liquid best practices, responsive+a11y patterns | `shopify-dev-mcp.learn_shopify_api` + `validate_theme` (loop max 3) |
| js-agent | `shopify-dev-mcp.search_docs_chunks` (on demand), `context7` (libs) | `modern-javascript-patterns`, `vercel-react-best-practices` (only for `.jsx`/React islands) | JS class/component patterns, Shopify section architecture, DOM lifecycle | `ide.getDiagnostics` + `yarn lint` per file (loop max 3) |
| test-agent | — | `webapp-testing` | Playwright structure for Shopify storefronts, test scenario patterns | `npx playwright test features/[name]/*.spec.js` |
| visual-qa-agent | `figma.get_screenshot` (saved to `qa/figma-*.png`) | `web-design-guidelines` | Visual QA patterns, pixelmatch threshold conventions | — |
| page-integration-test | — | `webapp-testing` | Playwright structure, cross-section event testing, full-page integration | `npx playwright test pages/[name]/tests/*.spec.js` |
| code-reviewer | `ide.getDiagnostics`, `github.get_pull_request*` (PR context) | `code-review`, `modern-javascript-patterns`, `vercel-react-best-practices` (gated), `web-design-guidelines` | JS patterns, Shopify architecture, Tailwind organization, Playwright structure | — |

Workflow checkpoints (`simplify`, `refactor-clean`) are main-invoked **between agent runs**, not during. Never declared in agent skill lists.

## Available Agents
Located in `.claude/agents/`:

| Agent | Purpose | MCP needed? | When to Use |
|-------|---------|-------------|-------------|
| planner | Create brief.md + test-scenarios.md | Figma (main prefetches) | Start of any feature |
| architect | Technical design decisions | None | Architectural questions |
| ui-agent | Liquid + Tailwind from design (SCSS only as escape hatch) | Figma (main prefetches) | After planner |
| test-agent | Playwright spec files | None (writes specs, main runs them) | After UI agent (ui-only) AND after TS agent (full) |
| visual-qa-agent | Analyze test results + screenshots | None (main provides data) | After test run |
| js-agent | JavaScript behavior layer | None | After visual QA PASS |
| code-reviewer | Code quality review | None | After writing code |

## Execution Flow (single section)
See `section-build-checklist.md` for full details.
```
Main: Figma prefetch
  → planner agent (with Figma data) → brief.md + test-scenarios.md
  → ui-agent (with Figma data) → liquid + tailwind (optional scss escape hatch) + component-structure.md
  → test-agent ui-only → ui.spec.js
  → Main: run specs, save Figma screenshot
  → visual-qa-agent (with test results + screenshots) → qa report
  → js-agent (no MCP) → JavaScript + component-api.md
  → test-agent full → functional.spec.js + integration.spec.js
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
1. Complex feature requests → Use **planner** agent
2. Code just written/modified → Use **code-reviewer** agent
3. Architectural decision → Use **architect** agent

## Mandatory Liquid Validation (main conversation)
Subagents have no MCP access — validation is main's job.

After the UI agent finishes writing/updating any `.liquid` files, **main** MUST:
1. Call `shopify-dev-mcp.learn_shopify_api(api: "liquid")` to get a `conversationId`
2. Call `shopify-dev-mcp.validate_theme` with all created/updated `.liquid` files
3. If errors: feed them back to the UI agent with the exact file paths + error messages, re-run Step 2 on the updated files
4. Loop until clean (max 3 cycles → escalate to human)

Never skip this step for Liquid files.
