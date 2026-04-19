---
description: Full section build — runs plan-feature → build-ui → test-ui → visual-qa → build-js (if needed) → test-full. Arguments — $1 feature name, $2 desktop Figma URL, $3 mobile Figma URL (optional).
---

# Build Section: $ARGUMENTS

You are main conversation. This is the umbrella command — it chains the per-agent commands in the canonical section-build order.

## Pre-flight
Parse `$1` = feature name, `$2` = desktop Figma URL, `$3` = mobile Figma URL (optional). `$1` + `$2` required; `$3` strongly recommended — without it, responsive behavior is inferred from the desktop node alone.

**Build convention: mobile-first Tailwind.** Base utility classes target mobile; desktop styling applied via breakpoint-prefixed overrides (`md-small:`, `md:`, `lg:`, `2xl:`). When the two designs diverge too heavily for overrides (layout flips, element order swaps, structurally different content), author **two DOM branches** toggled via `hidden md:block` / `md:hidden`. Document the choice in `ui-plan.md` Phase 2 DEVIATIONS.

## Discipline rules (enforce at every step)
1. **playwright-mcp mandatory** for visual QA browser work. Any sub-command that runs browser interactions must route through `playwright-mcp` server.
2. **No skip:** every step below MUST produce its expected artifacts. Step 7 (Pre-completion gate) verifies the full artifact set on disk — do NOT report "complete" before that gate passes. Visual-QA in particular has been silently skipped in past runs — treat `qa/visual-qa-report.md` as a mandatory file.

## Execute sequence

Each step below is a hard dependency on the previous — never parallelize.

### Step 1 — Plan
Run `/plan-feature $1 $2 $3` (pass mobile URL through if provided)

Halt if planner returns a `BLOCKED:` state. Ask the human before proceeding.

### Step 2 — UI
Run `/build-ui $1`

The ui-agent may surface `## Questions` in `ui-plan.md`. If any are blocking, stop and ask the human to resolve before continuing to Step 3.

### Step 3 — UI tests
Run `/test-ui $1`

### Step 4 — Visual QA
Run `/visual-qa $1`

If `NEEDS_FIX`, the fix loop inside `/visual-qa` handles retries (max 3 cycles). If it escalates, stop and surface the report to the human.

### Step 5 — JS behavior (conditional)
Read `features/$1/brief.md`. If it says "No JavaScript needed":
> Report `SKIP: No JS behavior. Section build complete.` and go to Step 7.

Otherwise run `/build-js $1`.

### Step 6 — Full tests
Run `/test-full $1`

### Step 7 — Pre-completion artifact gate (discipline rule 3)
Before touching review/commit, verify EVERY expected artifact exists on disk. Run:

```bash
ls -la features/$1/
ls -la features/$1/qa/
```

Required (always):
- `features/$1/brief.md` (planner)
- `features/$1/architecture.md` (architect)
- `features/$1/ui-plan.md` — Phase 1 + Phase 2 sections populated (ui-agent). Phase 1 contains Intent + Layout strategy + Responsive + Token map + SCSS decision + Font loading + Variant mapping + Reuse refs + Questions. Phase 2 contains As-built DOM + BEM/selector catalogue + Data attributes + Schema settings + CSS custom properties + Variants implemented/not + DEVIATIONS + `## JS handoff` stub or full content.
- `features/$1/test-scenarios.md` (test-agent — ui-only mode)
- `features/$1/$1.spec.js` (test-agent — ui-only mode)
- `features/$1/qa/visual-qa-report.md` ← MANDATORY. Must contain `Status: PASS`.
- `features/$1/qa/figma-*.png` (at least one breakpoint)
- `features/$1/qa/live-*.png` (matching breakpoints)
- `features/$1/qa/diff-*.png` (matching breakpoints)

Required IF brief says JS needed:
- `features/$1/ui-plan.md` — `## JS handoff` section filled with real content (not the "see js-agent append" stub)
- `features/$1/$1.functional.spec.js`
- `features/$1/$1.integration.spec.js`

If ANY required artifact is missing → do NOT proceed. Spawn the owning agent (re-run the relevant sub-command) to produce the missing file, then re-run this gate. Do not skip to Step 8.

**Owner map for missing-artifact recovery:**
| Missing | Owner | Recovery command |
|---|---|---|
| brief.md | planner | `/plan-feature $1 <figma-url>` |
| architecture.md | architect | `/plan-feature $1 <figma-url>` (re-runs chain) |
| ui-plan.md Phase 1 sections | ui-agent Phase 1 | `/build-ui $1` |
| ui-plan.md Phase 2 sections (As-built + selectors + state contract + JS handoff stub) | ui-agent Phase 2 | `/build-ui $1` |
| test-scenarios.md / $1.spec.js / templates/*.test.json populate | test-agent ui-only | `/test-ui $1` |
| qa/*.png, qa/visual-qa-report.md | visual-qa-agent | `/visual-qa $1` |
| `ui-plan.md` → `## JS handoff` section (stub → filled) | js-agent | `/build-js $1` |
| $1.functional.spec.js, $1.integration.spec.js | test-agent full | `/test-full $1` |

### Step 8 — Review
Read `features/$1/ui-plan.md` and extract the SOURCE file paths from the Phase 2 "File targets" section + `## JS handoff` (section `.liquid`, optional `.js/.jsx`, optional `.scss`). Invoke `/review-files` with those explicit paths — NOT the feature folder itself.

Example: `/review-files sections/$1.liquid js/sections/$1.js scss/sections/$1.scss`

Never pass `features/$1/` to `/review-files` — that folder contains planning docs and test specs which are out of code-reviewer scope per `.claude/agents/code-reviewer.md` Scope rules.

### Step 9 — Checkpoint skills (main-invoked)
After all agents clear:
- `/simplify` on the newly written files
- `/refactor-clean` if any duplication was introduced

### Step 10 — Commit
Only after code-reviewer approves:
> Offer the human a commit message summarizing the section. Do not commit without explicit `yes`.

## Report
Final status to human — MUST enumerate the verified artifact paths from Step 7:
> "Section `$1` build complete. Verified artifacts: features/$1/{brief.md, architecture.md, ui-plan.md (Phase 1 + Phase 2 + `## JS handoff` if JS=YES), test-scenarios.md, $1.spec.js, qa/visual-qa-report.md (Status: PASS), qa/figma-*.png, qa/live-*.png, qa/diff-*.png}[, $1.functional.spec.js, $1.integration.spec.js]. Source files per architecture.md → Create list. Ready for review/merge."
