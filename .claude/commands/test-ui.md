---
description: Prefetch memory, spawn test-agent in ui-only mode, run the specs via playwright. Argument — $1 feature name.
---

# Test UI: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name

Verify:
- `features/<feature-name>/test-scenarios.md` exists (ui-agent authored it after writing Liquid — `test-agent` reads this as its sole input)

If missing: `BLOCKED: Run /build-ui first — ui-agent authors test-scenarios.md.`

## Step 2 — Memory prefetch
Per Main Prefetch Contract → test-agent row:
- Memory subset: Playwright structure for Shopify storefronts, test scenario patterns, Shopify template JSON shape

## Step 3 — Selective wipe of qa/ volatile artifacts (MANDATORY — fresh-start discipline)

Before spawning test-agent, wipe ONLY the test-run-produced + QA-output files in `features/<feature-name>/qa/`. PRESERVE figma-*.png — it is the design reference and regenerating it burns Figma REST rate limits on every fix cycle.

Run via `bash -c` (zsh errors on unmatched globs; bash `rm -f` handles missing files silently):
```bash
bash -c 'mkdir -p features/<feature-name>/qa && rm -f features/<feature-name>/qa/live-*.png features/<feature-name>/qa/diff-*.png features/<feature-name>/qa/a11y-*.json features/<feature-name>/qa/a11y-skipped.marker features/<feature-name>/qa/visual-qa-report.md'
```

Keep: `figma-*.png` (design reference, sticky across cycles).
Wipe: `live-*.png` (test-generated), `diff-*.png` (pixelmatch-generated), `a11y-*.json` / `a11y-skipped.marker` (spec-generated), `visual-qa-report.md` (agent-generated).

Rationale: live + diff + a11y must be regenerated every test run to avoid pixelmatching new design against a stale live screenshot. figma-*.png is design-side and only changes when the designer updates Figma — regen is the responsibility of `/plan-feature` or a deliberate figma-refresh step, not the fix loop.

## Step 4 — Spawn test-agent (ui-only)
Call `Agent({ subagent_type: "test-agent", prompt: <embed> })`.

Embed in prompt (stable-first ordering per cache-friendly rule in `.claude/rules/agents.md`):

**STABLE PREFIX (cacheable):**
1. Mode directive: `Mode: ui-only`
2. Memory subset (Playwright structure for Shopify storefronts, test scenario patterns, Shopify template JSON shape)

**SEMI-STABLE (per-feature):**
3. Workspace: `features/<feature-name>/`
4. Full contents of `test-scenarios.md` — self-contained (ui-agent authored it; test-agent does NOT open brief.md)

**DYNAMIC (this invocation only):**
5. Fix-cycle context from prior visual-qa-report (if re-invoked after a failure)

Expected outputs (in order, produced by test-agent):
1. `templates/<type>.test.json` — APPEND section entry (preserve existing sections + update `order` array). NEVER overwrite, NEVER create per-feature filename.
2. `features/<feature-name>/<feature-name>.spec.js`

test-agent does NOT author `test-scenarios.md` — ui-agent wrote it.

## Step 5 — Run specs (D-group only — screenshot capture)
Run via Bash — filter to D-group tests only (screenshot captures). The full spec stays on disk as a manual-debug artifact; B (typography+color parity), C (layout integrity at intermediates), E (content placement), and any other groups are NOT executed in the pipeline. They exist for ad-hoc debugging via `yarn playwright:test features/<feature-name>/<feature-name>.spec.js --grep "^B-"` etc.

```
yarn playwright:test features/<feature-name>/<feature-name>.spec.js --grep "A-|D-" --reporter=list
```

(Note: Playwright's `--grep` is a substring/regex match against the concatenated describe+test title — start-anchor `^` does NOT match because describe titles come first. Use the non-anchored alternation `A-|D-`.)

`A-` = content-completeness gate (fails fast if test fixture is missing required values).
`D-` = screenshot capture. Produces `live-mobile.png` + `live-desktop.png` in `features/<feature-name>/qa/`.

**Rationale:** token parity (typography, color, width) lives in `brief.md` → `## Design tokens` (SOT); ui-agent writes utility classes mechanically from that SOT; visual-qa catches any gross drift via pixelmatch + multimodal PNG inspection. Running per-element computed-style assertions (B/C/E) on every pipeline run is redundant + slow. They're preserved for manual debugging when something DOES drift.

If the A-group gate fails, stop and re-run test-agent — fixture is incomplete.

## Step 6 — Report
Capture:
- A + D pass counts
- Paths of screenshots saved in `features/<feature-name>/qa/`
- Mention full spec path is available for manual debug: `features/<feature-name>/<feature-name>.spec.js` (B/C/E groups + optional a11y)

> "test-scenarios.md + <feature-name>.spec.js written (B/C/E groups authored but pipeline-skipped — manual-debug only). Pipeline run: X passed (A-gate + D-screenshots). Screenshots in features/<feature-name>/qa/. Ready for `/visual-qa <feature-name>`."
