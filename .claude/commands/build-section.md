---
description: Full section build — runs plan-feature → build-ui → test-ui → visual-qa → build-js (if needed) → test-full. Arguments — $1 feature name, $2 desktop Figma URL, $3 mobile Figma URL (optional).
---

# Build Section: $ARGUMENTS

You are main conversation. This umbrella command chains the per-agent commands in the canonical section-build order.

## Pre-flight
Parse `$1` = feature name, `$2` = desktop Figma URL, `$3` = mobile Figma URL (optional). `$1` + `$2` required; `$3` strongly recommended.

**Build convention: mobile-first Tailwind.** Base utility classes target mobile; desktop via `md-small:` / `md:` / `lg:` / `2xl:` prefix overrides. When designs diverge heavily, author dual-DOM branches toggled via `hidden md:block` / `md:hidden`. ui-agent documents the choice in brief §DEVIATIONS.

## Discipline rules
1. **playwright-mcp mandatory** for visual QA browser work.
2. **No skip:** Step 6 (artifact gate) verifies the full set on disk — do NOT report "complete" before it passes. `qa/visual-qa-report.md` has been silently skipped in past runs — mandatory file.

## Execute sequence

Hard-dependency chain. Never parallelize.

### Step 1 — Plan
Run `/plan-feature $1 $2 $3`. Halt if planner returns `BLOCKED`.

### Step 2 — UI
Run `/build-ui $1`. ui-agent may surface blocking ambiguities in its return message — resolve with human before continuing.

### Step 3 — UI tests
Run `/test-ui $1`.

### Step 4 — Visual QA
Run `/visual-qa $1`. If `NEEDS_FIX`, `/visual-qa` handles the retry loop (max 3). Escalate to human if it exits unresolved.

### Step 5 — JS behavior (conditional)
Read `features/$1/brief.md` → §JavaScript decision. If NO:
> Report `SKIP: No JS behavior. Section build complete.` and go to Step 6.

If YES, run `/build-js $1`, then `/test-full $1`.

### Step 6 — Pre-completion artifact gate
Verify EVERY expected artifact exists on disk:

```bash
ls -la features/$1/
ls -la features/$1/qa/
```

Required (always):
- `features/$1/brief.md` (planner + ui-agent + js-agent appended — single authoritative doc)
- `features/$1/figma-context.md` (main wrote during prefetch)
- `features/$1/test-scenarios.md` (test-agent ui-only)
- `features/$1/$1.spec.js` (test-agent ui-only)
- `features/$1/qa/visual-qa-report.md` — MUST contain `Status: PASS`
- `features/$1/qa/figma-*.png` (at least one breakpoint)
- `features/$1/qa/live-*.png` (matching breakpoints)
- `features/$1/qa/diff-*.png` (matching breakpoints)

Required IF brief §JavaScript decision = YES:
- `features/$1/brief.md` → `## JS handoff` section filled with real content (js-agent replaced ui-agent's stub)
- `features/$1/$1.functional.spec.js`
- `features/$1/$1.integration.spec.js`

If ANY missing → re-run the owning sub-command, then re-run this gate.

**Owner map for missing-artifact recovery:**
| Missing | Owner | Recovery command |
|---|---|---|
| brief.md (planner sections missing) | planner | `/plan-feature $1 <figma-url>` |
| brief.md (ui-agent as-built sections missing) | ui-agent | `/build-ui $1` |
| test-scenarios.md / $1.spec.js / templates/*.test.json APPEND | test-agent ui-only | `/test-ui $1` |
| qa/*.png, qa/visual-qa-report.md | visual-qa-agent | `/visual-qa $1` |
| brief.md → `## JS handoff` section (stub → filled) | js-agent | `/build-js $1` |
| $1.functional.spec.js, $1.integration.spec.js | test-agent full | `/test-full $1` |

### Step 7 — Review
Read brief.md → §File plan to extract SOURCE file paths (section `.liquid`, snippet `.liquid`, optional `.js/.jsx`, optional `.scss`). Invoke `/review-files` with those explicit paths — NOT the feature folder.

Example: `/review-files sections/$1.liquid js/sections/$1.js scss/sections/$1.scss`

Never pass `features/$1/` to `/review-files` — planning docs + test specs are out of code-reviewer scope.

### Step 8 — Checkpoint skills
After all agents clear:
- `/simplify` on newly written files
- `/refactor-clean` if duplication introduced

### Step 9 — Commit
Only after code-reviewer approves:
> Offer commit message summarizing the section. Do not commit without explicit `yes`.

## Report
Final status — enumerate verified artifact paths:
> "Section `$1` build complete. Verified: features/$1/{brief.md, figma-context.md, test-scenarios.md, $1.spec.js, qa/visual-qa-report.md (Status: PASS), qa/figma-*.png, qa/live-*.png, qa/diff-*.png}[, $1.functional.spec.js, $1.integration.spec.js]. Source files per brief §File plan → CREATE list. Ready for review/merge."
