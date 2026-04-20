---
description: Spawn test-agent in full mode (functional + integration), run specs. Argument — $1 feature name.
---

# Test Full: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name

Verify:
- `features/<feature-name>/test-scenarios.md` exists AND contains `## Functional scenarios` + `## Integration scenarios` sections (js-agent has appended them)

If `test-scenarios.md` has no functional/integration sections because brief says "No JavaScript needed":
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
4. Full contents of `test-scenarios.md` — self-contained (ui-agent A/B/C/D/E + js-agent functional/integration + mock fixtures)
5. `mock-map.md` if it exists

test-agent does NOT read `brief.md` in full mode.

**DYNAMIC (this invocation only):**
6. Test failures from prior cycle (if re-invoked)

Expected outputs:
- `features/<feature-name>/<feature-name>.functional.spec.js`
- `features/<feature-name>/<feature-name>.integration.spec.js`

## Step 4 — Run specs
```
yarn playwright:test features/<feature-name>/<feature-name>.functional.spec.js features/<feature-name>/<feature-name>.integration.spec.js --reporter=list
```

## Step 5 — Report
> "Full specs: X passed, Y failed. Ready for `/review-files features/<feature-name>/` or commit."
