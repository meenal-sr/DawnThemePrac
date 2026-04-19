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
Call `Agent({ subagent_type: "test-agent", prompt: <embed> })`.

Embed in prompt (stable-first ordering per cache-friendly rule in `.claude/rules/agents.md`):

**STABLE PREFIX (cacheable):**
1. Mode directive: `Mode: full`
2. Memory subset (Playwright structure, test scenario patterns)

**SEMI-STABLE (per-feature):**
3. Workspace: `features/<feature-name>/`
4. Contents of `brief.md`
5. Contents of `component-structure.md`
6. Contents of `component-api.md`
7. Contents of `test-scenarios.md`
8. `mock-map.md` if it exists

**DYNAMIC (this invocation only):**
9. Test failures from prior cycle (if re-invoked)

Expected outputs:
- `features/<feature-name>/functional.spec.js`
- `features/<feature-name>/integration.spec.js`

## Step 4 — Run specs
```
yarn playwright:test features/<feature-name>/functional.spec.js features/<feature-name>/integration.spec.js --reporter=list
```

## Step 5 — Report
> "Full specs: X passed, Y failed. Ready for `/review-files features/<feature-name>/` or commit."
