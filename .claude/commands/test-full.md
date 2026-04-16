---
description: Spawn test-agent in full mode (functional + integration), run specs. Argument — $1 feature name.
---

# Test Full: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name

Verify:
- `features/<feature-name>/component-api.md` exists (js-agent has run)
- `features/<feature-name>/test-scenarios.md` exists

If component-api.md missing because brief says "No JavaScript needed":
> Report `SKIP: No JS behavior — functional/integration specs not applicable.` and stop.

Otherwise `BLOCKED: Run /build-js first.`

## Step 2 — Memory prefetch
Per Main Prefetch Contract → test-agent row:
- Memory subset: Playwright structure, test scenario patterns

## Step 3 — Spawn test-agent (full)
Call `Agent({ subagent_type: "test-agent", prompt: <embed> })`:

Embed:
- Mode: `full`
- Workspace: `features/<feature-name>/`
- Contents of `brief.md`, `component-structure.md`, `component-api.md`, `test-scenarios.md`
- `mock-map.md` if it exists
- Memory subset

Expected outputs:
- `features/<feature-name>/functional.spec.js`
- `features/<feature-name>/integration.spec.js`

## Step 4 — Run specs
```
npx playwright test features/<feature-name>/functional.spec.js features/<feature-name>/integration.spec.js --reporter=list
```

## Step 5 — Report
> "Full specs: X passed, Y failed. Ready for `/review-files features/<feature-name>/` or commit."
