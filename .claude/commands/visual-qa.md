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

If Figma screenshots missing, persist them via the REST-API helper (the MCP `get_screenshot` tool does NOT write files):
```bash
playwright-config/figma-export.sh <fileKey> <nodeId> features/<feature-name>/qa/figma-<breakpoint>.png 2
```
One invocation per breakpoint node listed in `brief.md`. Requires `FIGMA_TOKEN` in `.env`. See `reference_figma_export_script.md`.

## Step 2 — Skill + memory prefetch
Per Main Prefetch Contract → visual-qa-agent row:
- Skill: `web-design-guidelines` (a11y dimension)
- Memory subset: visual QA patterns, pixelmatch threshold conventions

## Step 3 — Capture test output
Re-read the output of `yarn playwright:test features/<feature-name>/ui.spec.js` from the previous run. If stale, re-run it.

If the re-run exits non-zero, halt with the failure report — do not proceed to Step 4.

## Step 4 — Re-fetch Figma design context
For each node in `brief.md`, re-fetch `figma.get_design_context(fileKey, nodeId)` to get the typography/color values in React+Tailwind format for exact comparison.

## Step 4b — Read axe-core accessibility results

Check `brief.md` for the `Accessibility:` field. Default is **`skip`** when the field is absent or set to `skip`.

**When skipped (default):** verify `features/<feature-name>/qa/a11y-skipped.marker` exists. If yes, record "a11y skipped by brief" and move on. If the marker is missing, test-agent ignored the default — stop and re-run `/test-ui <feature-name>`.

**When `Accessibility: required`:** read every file matching `features/<feature-name>/qa/a11y-*.json`, one per breakpoint. If no JSON files exist, the specs didn't include a11y tests. Stop and re-run `/test-ui <feature-name>` — the test-agent template must include axe scans per breakpoint when a11y is required.

Each JSON file is an array of axe `results.violations`. Keep the raw JSON to embed in the agent prompt; the agent parses and grades severity.

## Step 5 — Pixelmatch diff (spacing + layout)
For each breakpoint present in `features/<feature-name>/qa/`, match `figma-<breakpoint>.png` with `live-<breakpoint>.png` via:
```
pixelmatch.compare({
  reference: "features/<feature-name>/qa/figma-<breakpoint>.png",
  actual:    "features/<feature-name>/qa/live-<breakpoint>.png",
  output:    "features/<feature-name>/qa/diff-<breakpoint>.png",
  threshold: 0.1
})
```
Capture each breakpoint's mismatch percentage. Typical bindings: breakpoints are `mobile` (375), `tablet` (768), `desktop` (1280) — match whatever the test-agent emitted.

## Step 6 — Spawn visual-qa-agent (single, no parallel ui-agent)
Call `Agent({ subagent_type: "visual-qa-agent", prompt: <embed> })`:

Embed:
- Workspace: `features/<feature-name>/`
- Test output from Step 3
- Figma design context from Step 4
- Axe violations JSON per breakpoint from Step 4b
- Pixelmatch diff results from Step 5 (per-breakpoint mismatch %, paths to `diff-*.png`)
- Paths of all `qa/figma-*.png`, `qa/live-*.png`, `qa/diff-*.png`, `qa/a11y-*.json`
- Skill output + memory subset

Expected output: `features/<feature-name>/qa/visual-qa-report.md` with `Status: PASS` or `NEEDS_FIX`

**Sequencing guard (CRITICAL):**
- Do NOT spawn ui-agent (or run `/build-ui`) in parallel with visual-qa-agent.
- Wait for visual-qa-agent Agent call to return.
- Verify `features/<feature-name>/qa/visual-qa-report.md` exists on disk AND contains either `Status: PASS` or `Status: NEEDS_FIX`.
- Only then proceed to Step 7.

## Step 7 — Fix loop if NEEDS_FIX (max 3 cycles, strictly sequential)
Preconditions before entering loop:
- Step 6 has returned
- `qa/visual-qa-report.md` exists on disk
- Report contains `Status: NEEDS_FIX`

If those hold:
1. Read mismatches from the report
2. Re-invoke ui-agent via `/build-ui <feature-name>` with mismatches embedded — one ui-agent, wait for return
3. Re-run `/test-ui <feature-name>` — wait for completion
4. Re-run this command (`/visual-qa <feature-name>`) — wait for completion
5. Loop max 3 cycles. Escalate if still failing.

Never parallelize: visual-qa-agent must finish writing the report before any ui-agent is spawned; ui-agent must finish before the next test-ui; test-ui must finish before the next visual-qa.

## Step 8 — Pre-completion verification
Before reporting done, VERIFY on disk:
- `features/<feature-name>/qa/visual-qa-report.md` exists
- Report contains `Status: PASS` (exact match)
- All `qa/figma-*.png`, `qa/live-*.png`, `qa/diff-*.png` paths referenced by the report exist

If any missing → do NOT report PASS. Surface the gap and re-enter the fix loop.

## Step 9 — Report
> "Visual QA: PASS. Verified: qa/visual-qa-report.md, qa/figma-*.png, qa/live-*.png, qa/diff-*.png. Ready for `/build-js <feature-name>` (or skip if no JS needed)."

Or:
> "Visual QA: NEEDS_FIX. See features/<feature-name>/qa/visual-qa-report.md for mismatches. Starting fix cycle 1 of 3."
