# Agent Orchestration

## Architecture
Main conversation = orchestrator + MCP bridge. Subagents cannot access MCP servers (Figma, Playwright, etc.) — only built-in tools (Read, Write, Edit, Glob, Grep, Bash, Agent).

**Main prefetches MCP data → passes into agent prompts.**

## Available Agents
Located in `.claude/agents/`:

| Agent | Purpose | MCP needed? | When to Use |
|-------|---------|-------------|-------------|
| planner | Create brief.md + test-scenarios.md | Figma (main prefetches) | Start of any feature |
| architect | Technical design decisions | None | Architectural questions |
| ui-agent | Liquid + SCSS from design | Figma (main prefetches) | After planner |
| test-agent | Playwright spec files | None (writes specs, main runs them) | After UI agent (ui-only) AND after TS agent (full) |
| visual-qa-agent | Analyze test results + screenshots | None (main provides data) | After test run |
| ts-agent | TypeScript behavior layer | None | After visual QA PASS |
| code-reviewer | Code quality review | None | After writing code |

## Execution Flow (single section)
See `section-build-checklist.md` for full details.
```
Main: Figma prefetch
  → planner agent (with Figma data) → brief.md + test-scenarios.md
  → ui-agent (with Figma data) → liquid/scss/component-structure.md
  → test-agent ui-only → ui.spec.ts
  → Main: run specs, save Figma screenshot
  → visual-qa-agent (with test results + screenshots) → qa report
  → ts-agent (no MCP) → TypeScript + component-api.md
  → test-agent full → functional.spec.ts + integration.spec.ts
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

## UI Agent — Mandatory Liquid Validation
After writing or updating any `.liquid` files, the UI agent MUST:
1. Call `learn_shopify_api(api: "liquid")` to get a `conversationId`
2. Call `validate_theme` with all created/updated `.liquid` files
3. Fix any validation errors and re-validate until clean
Never skip this step for Liquid files.
