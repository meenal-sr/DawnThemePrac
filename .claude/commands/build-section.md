---
description: Full section build — runs plan-feature → build-ui → test-ui → visual-qa → build-js (if needed) → test-full. Arguments — $1 feature name, $2 Figma URL.
---

# Build Section: $ARGUMENTS

You are main conversation. This is the umbrella command — it chains the per-agent commands in the canonical section-build order.

## Pre-flight
Parse `$1` = feature name, `$2` = Figma URL. Both required.

## Execute sequence

Follow `.claude/rules/section-build-checklist.md` exactly. Each step below is a hard dependency on the previous — never parallelize.

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

### Step 7 — Review
Run `/review-files features/$1/`

Plus review the source files the ui-agent and js-agent wrote (`sections/<name>.liquid`, `js/sections/<name>.js`, etc. — determine from `component-structure.md` + `component-api.md`).

### Step 8 — Checkpoint skills (main-invoked)
After all agents clear:
- `/simplify` on the newly written files
- `/refactor-clean` if any duplication was introduced

### Step 9 — Commit
Only after code-reviewer approves:
> Offer the human a commit message summarizing the section. Do not commit without explicit `yes`.

## Report
Final status to human:
> "Section `$1` build complete. Files: sections/<name>.liquid, js/sections/<name>.js (if applicable), features/$1/*. Ready for review/merge."
