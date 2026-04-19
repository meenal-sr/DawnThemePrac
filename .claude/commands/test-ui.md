---
description: Prefetch memory, spawn test-agent in ui-only mode, run the specs via playwright. Argument — $1 feature name.
---

# Test UI: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name

Verify:
- `features/<feature-name>/brief.md` exists
- `features/<feature-name>/ui-plan.md` exists

Note: `test-scenarios.md` is produced by test-agent in THIS command (first step of its work). Do NOT require it as a prerequisite.

If either missing: `BLOCKED: Run /plan-feature + /build-ui first.`

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
4. Contents of `brief.md` (source of design content reference)
5. Contents of `ui-plan.md` (Phase 2 sections — authoritative selectors + schema setting IDs + block structure)

**DYNAMIC (this invocation only):**
6. Fix-cycle context from prior visual-qa-report (if re-invoked after a failure)

Expected outputs (in order, produced by test-agent):
1. `features/<feature-name>/test-scenarios.md` (A/B/C/D/E scenario contract)
2. `templates/<type>.test.json` section entry populated with every setting + blocks (map + block_order shape)
3. `features/<feature-name>/<feature-name>.spec.js`

## Step 5 — Run specs
Run via Bash:
```
yarn playwright:test features/<feature-name>/<feature-name>.spec.js --reporter=list
```

Screenshots auto-land in `features/<feature-name>/qa/`.

## Step 6 — Report
Capture:
- Test pass/fail counts
- Paths of screenshots saved in `features/<feature-name>/qa/`
- Full test output for visual-qa-agent

> "test-scenarios.md + <feature-name>.spec.js written. Specs: X passed, Y failed. Screenshots in features/<feature-name>/qa/. Ready for `/visual-qa <feature-name>`."
