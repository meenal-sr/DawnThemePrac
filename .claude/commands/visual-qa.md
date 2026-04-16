---
description: Save Figma reference screenshots to qa/, spawn visual-qa-agent to compare against live screenshots and typography/color values. Argument — $1 feature name.
---

# Visual QA: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name

Verify:
- `features/<feature-name>/ui.spec.js` exists
- `features/<feature-name>/qa/` contains `live-*.png` from test run
- `features/<feature-name>/qa/figma-*.png` exist (main should have saved them in `/plan-feature` Step 3 or `/build-ui` Step 3)

If Figma screenshots missing, re-fetch via `figma.get_screenshot` per brief node IDs.

## Step 2 — Skill + memory prefetch
Per Main Prefetch Contract → visual-qa-agent row:
- Skill: `web-design-guidelines` (a11y dimension)
- Memory subset: visual QA patterns, pixelmatch threshold conventions

## Step 3 — Capture test output
Re-read the output of `npx playwright test features/<feature-name>/ui.spec.js` from the previous run. If stale, re-run it.

## Step 4 — Re-fetch Figma design context
For each node in `brief.md`, re-fetch `figma.get_design_context(fileKey, nodeId)` to get the typography/color values in React+Tailwind format for exact comparison.

## Step 5 — Spawn visual-qa-agent
Call `Agent({ subagent_type: "visual-qa-agent", prompt: <embed> })`:

Embed:
- Workspace: `features/<feature-name>/`
- Test output from Step 3
- Figma design context from Step 4
- Paths of all `qa/figma-*.png` and `qa/live-*.png`
- Skill output + memory subset

Expected output: `features/<feature-name>/qa/visual-qa-report.md` with `Status: PASS` or `NEEDS_FIX`

## Step 6 — Fix loop if NEEDS_FIX (max 3 cycles)
If report is `NEEDS_FIX`:
1. Read mismatches
2. Re-invoke ui-agent via `/build-ui <feature-name>` with mismatches embedded
3. Re-run `/test-ui <feature-name>`
4. Re-run this command
5. Loop max 3 cycles. Escalate if still failing.

## Step 7 — Report
> "Visual QA: PASS. Ready for `/build-js <feature-name>` (or skip if no JS needed)."

Or:
> "Visual QA: NEEDS_FIX. See features/<feature-name>/qa/visual-qa-report.md for mismatches. Starting fix cycle 1 of 3."
