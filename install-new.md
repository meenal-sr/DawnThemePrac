# Installed from everything-claude-code

## Source: [https://github.com/affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)

and Itration from training the agent over project

## Contexts (`~/.claude/contexts/`)

Contexts set Claude's operating mode. Reference them at the start of a session.


| File          | Purpose                                                | How to invoke           |
| ------------- | ------------------------------------------------------ | ----------------------- |
| `dev.md`      | Active development mode (code first, ship fast)        | `use @dev context`      |
| `research.md` | Exploration mode (read before writing, findings first) | `use @research context` |
| `review.md`   | Code review mode (severity-ranked checklist)           | `use @review context`   |


---

## Rules (`~/.claude/rules/`)

Always-on guidelines loaded automatically into every conversation.


| File                        | What it enforces                                                              |
| --------------------------- | ----------------------------------------------------------------------------- |
| `coding-style.md`           | Immutability, file size limits (<800 lines), error handling, input validation |
| `git-workflow.md`           | Commit format: `feat/fix/refactor/docs/test/chore/perf/ci`                    |
| `security.md`               | No hardcoded secrets, XSS prevention, secret rotation protocol                |
| `performance.md`            | Model selection (Haiku/Sonnet/Opus), context window management                |
| `agents.md`                 | When and how to delegate to subagents                                         |
| `crosscode-instructions.md` | Master reference for this Shopify TS project — overrides all others           |


---

## Commands / Skills (`~/.claude/commands/`)

Slash commands invoke skills. Type `/<skill-name>` in the chat.


| Command                        | File                             | When to use                                                                            |
| ------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------- |
| `/plan`                        | `plan.md`                        | Restate requirements + step-by-step plan before touching code. Waits for confirmation. |
| `/code-review`                 | `code-review.md`                 | Security + quality review of current git diff                                          |
| `/tdd`                         | `tdd.md`                         | RED → GREEN → REFACTOR test-driven workflow                                            |
| `/refactor-clean`              | `refactor-clean.md`              | Safe dead code removal with test verification                                          |
| `/simplify`                    | *(built-in)*                     | Review changed code for reuse, quality, efficiency                                     |
| `/frontend-design`             | `frontend-design.md`             | Build production-grade UI components                                                   |
| `/webapp-testing`              | `webapp-testing.md`              | Test local dev server with Playwright                                                  |
| `/typescript-advanced-types`   | *(commands)*                     | Complex generics, conditional types, mapped types                                      |
| `/modern-javascript-patterns`  | `modern-javascript-patterns.md`  | ES6+ refactoring and patterns                                                          |
| `/tailwind-design-system`      | `tailwind-design-system.md`      | Design tokens and Tailwind component patterns                                          |
| `/vercel-react-best-practices` | `vercel-react-best-practices.md` | React/Next.js performance patterns                                                     |
| `/web-design-guidelines`       | `web-design-guidelines.md`       | Accessibility and UX audit                                                             |
| `/javascript-testing-patterns` | `javascript-testing-patterns.md` | Jest/Vitest/Testing Library setup                                                      |
| `/api-design-principles`       | `api-design-principles.md`       | REST/GraphQL API design review                                                         |
| `/web-artifacts-builder`       | `web-artifacts-builder.md`       | Multi-component HTML artifacts (React + Tailwind + shadcn/ui)                          |


**How to invoke:** Type the slash command directly in the Claude Code chat, e.g.:

```
/plan add a sticky header to the product page
/code-review
/tdd write tests for the cart drawer
```

---

## Agents (`~/.claude/agents/`)

Subagents Claude spawns automatically or on request for specialized tasks.


| Agent                   | File                       | Purpose                                                             | When Claude uses it                                |
| ----------------------- | -------------------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| `planner`               | `planner.md`               | Implementation planning — produces `brief.md` + `test-scenarios.md` | Complex features, new sections, start of any build |
| `architect`             | `architect.md`             | Technical design — component boundaries, data flow, Liquid type     | Architectural decisions before code is written     |
| `orchestrator`          | `orchestrator.md`          | Feature build coordination — reads brief and spawns agents in order | After planner finishes a feature brief             |
| `page-orchestrator`     | `page-orchestrator.md`     | Full-page build coordination — maps cross-section dependencies      | Multi-section page builds                          |
| `ui-agent`              | `ui-agent.md`              | Figma → Liquid/HTML/SCSS — writes section/snippet files             | Building sections from Figma designs               |
| `visual-qa-agent`       | `visual-qa-agent.md`       | Figma vs live render QA — reports PASS or NEEDS_FIX                 | After ui-agent finishes                            |
| `ts-agent`              | `ts-agent.md`              | TypeScript behavior layer — writes `.ts` files to `ts/sections/`    | After visual QA passes                             |
| `test-agent`            | `test-agent.md`            | Playwright component tests — drives live dev server                 | After ts-agent + `component-api.md` exists         |
| `page-integration-test` | `page-integration-test.md` | Cross-section Playwright tests                                      | After full page is assembled                       |
| `code-reviewer`         | `code-reviewer.md`         | Security + quality reviewer (CRITICAL/HIGH/MEDIUM/LOW)              | Automatically after writing/modifying code         |


**How to invoke manually:**

```
use the planner agent to plan a new announcement bar section
use the architect agent to design the cart drawer data flow
run the code-reviewer agent on the files I just changed
```

**Automatic invocation order for a full section build:**

```
planner → [ui-agent + architect in parallel] → visual-qa-agent → ts-agent → test-agent
```

---

## Build Commands (this project)

```bash
yarn start              # Type-check + webpack watch (development)
yarn lint               # ESLint on ts/ directory
yarn typecheck          # tsc --noEmit (type-check only)
yarn emit-declarations  # Generate .d.ts to dist/
yarn deploy             # webpack build + shopify theme push
yarn shopify:push       # Push theme to Shopify store
yarn shopify:pull       # Pull templates/*.json from Shopify
```

---

## Feature Implementation Workflow

```
1. /plan              → Align on approach before touching code
2. planner agent      → Produce brief.md + test-scenarios.md
3. /tdd               → Write tests first (RED)
4. Implement          → Minimal code to pass (GREEN)
5. /simplify          → Refactor and clean (REFACTOR)
6. code-reviewer      → Review for quality/security
7. Commit             → Conventional commit message
```

---

> Note: `planner.md` and `architect.md` agents were custom-built for this Shopify project and kept unchanged from their original implementations.

