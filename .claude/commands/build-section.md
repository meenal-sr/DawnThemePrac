---
description: Full section build — runs plan-feature → build-ui → test-ui → visual-qa → build-js (if needed) → test-full. Arguments — $1 feature name, $2 Figma URL.
---

# Build Section: $ARGUMENTS

You are main conversation. This is the umbrella command — it chains the per-agent commands in the canonical section-build order.

## Pre-flight
Parse `$1` = feature name, `$2` = Figma URL. Both required.

## Discipline rules (enforce at every step)
1. **playwright-mcp mandatory** for visual QA browser work. Any sub-command that runs browser interactions must route through `playwright-mcp` server.
2. **No skip:** every step below MUST produce its expected artifacts. Step 7 (Pre-completion gate) verifies the full artifact set on disk — do NOT report "complete" before that gate passes. Visual-QA in particular has been silently skipped in past runs — treat `qa/visual-qa-report.md` as a mandatory file.

## Execute sequence

Each step below is a hard dependency on the previous — never parallelize.

### Step 1 — Plan
Run `/plan-feature $1 $2`

Halt if planner returns a `BLOCKED:` state. Ask the human before proceeding.

### Step 2 — UI
Run `/build-ui $1`

The ui-agent may surface `## Questions` in `component-structure.md`. If any are blocking, stop and ask the human to resolve before continuing to Step 3.

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
- `features/$1/brief.md`
- `features/$1/test-scenarios.md`
- `features/$1/component-structure.md`
- `features/$1/ui.spec.js`
- `features/$1/qa/visual-qa-report.md` ← MANDATORY. Must contain `Status: PASS`.
- `features/$1/qa/figma-*.png` (at least one breakpoint)
- `features/$1/qa/live-*.png` (matching breakpoints)
- `features/$1/qa/diff-*.png` (matching breakpoints)

Required IF brief says JS needed:
- `features/$1/component-api.md`
- `features/$1/functional.spec.js`
- `features/$1/integration.spec.js`

If ANY required artifact is missing → do NOT proceed. Spawn the owning agent (re-run the relevant sub-command) to produce the missing file, then re-run this gate. Do not skip to Step 8.

### Step 8 — Review
Run `/review-files features/$1/`

Plus review the source files the ui-agent and js-agent wrote (`sections/<name>.liquid`, `js/sections/<name>.js`, etc. — determine from `component-structure.md` + `component-api.md`).

### Step 9 — Checkpoint skills (main-invoked)
After all agents clear:
- `/simplify` on the newly written files
- `/refactor-clean` if any duplication was introduced

### Step 10 — Commit
Only after code-reviewer approves:
> Offer the human a commit message summarizing the section. Do not commit without explicit `yes`.

## Report
Final status to human — MUST enumerate the verified artifact paths from Step 7:
> "Section `$1` build complete. Verified artifacts: features/$1/{brief.md, test-scenarios.md, component-structure.md, ui.spec.js, qa/visual-qa-report.md (Status: PASS), qa/figma-*.png, qa/live-*.png, qa/diff-*.png}[, component-api.md, functional.spec.js, integration.spec.js]. Source: sections/<name>.liquid, js/sections/<name>.js (if applicable). Ready for review/merge."
