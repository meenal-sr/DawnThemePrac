---
description: Prefetch memory, spawn test-agent in ui-only mode, run the specs via playwright. Argument — $1 feature name.
---

# Test UI: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name

Verify:
- `features/<feature-name>/component-structure.md` exists
- `features/<feature-name>/test-scenarios.md` exists
- `features/<feature-name>/brief.md` exists

If missing: `BLOCKED: Run /build-ui first.`

## Step 2 — Memory prefetch
Per Main Prefetch Contract → test-agent row:
- Memory subset: Playwright structure for Shopify storefronts, test scenario patterns

## Step 3 — Spawn test-agent (ui-only)
Call `Agent({ subagent_type: "test-agent", prompt: <embed> })`:

Embed:
- Mode: `ui-only`
- Workspace: `features/<feature-name>/`
- Contents of `brief.md`, `component-structure.md`, `test-scenarios.md`
- Memory subset

Expected output: `features/<feature-name>/ui.spec.js`

## Step 4 — Run specs
Run via Bash:
```
npx playwright test features/<feature-name>/ui.spec.js --reporter=list
```

Screenshots auto-land in `features/<feature-name>/qa/`.

## Step 5 — Report
Capture:
- Test pass/fail counts
- Paths of screenshots saved in `features/<feature-name>/qa/`
- Full test output for visual-qa-agent

> "UI specs: X passed, Y failed. Screenshots in features/<feature-name>/qa/. Ready for `/visual-qa <feature-name>`."
