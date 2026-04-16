---
description: Prefetch skills + memory, spawn js-agent to write JavaScript behavior layer + component-api.md, then run lint loop. Argument — $1 feature name.
---

# Build JS: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name (kebab-case)

Verify:
- `features/<feature-name>/component-structure.md` exists (ui-agent has run)
- `features/<feature-name>/qa/visual-qa-report.md` exists with `Status: PASS` (visual QA cleared)

If brief says "No JavaScript needed", report `SKIP: No JS behavior per brief` and stop.

If prerequisites missing: `BLOCKED: Run /build-ui and /visual-qa first.`

## Step 2 — Memory + skill prefetch
Per Main Prefetch Contract → js-agent row:
- Skills: `modern-javascript-patterns` — invoke via Skill tool
  - Only add `vercel-react-best-practices` if `component-structure.md` mentions `.jsx`/React islands
- Memory subset: filter for JS class/component patterns, Shopify section architecture, DOM lifecycle

## Step 3 — Optional MCP lookups
If `brief.md` specifies Shopify Cart / Storefront / Section Rendering API calls, prefetch:
- `shopify-dev-mcp.search_docs_chunks` for the relevant API shapes

If brief specifies third-party libraries, prefetch:
- `context7.resolve-library-id` → `context7.query-docs`

## Step 4 — Spawn js-agent
Call `Agent({ subagent_type: "js-agent", prompt: <embed everything> })`:

Embed in prompt:
- Feature name + workspace path
- Contents of `brief.md`
- Contents of `component-structure.md`
- Memory subset
- Skill outputs
- Any MCP docs from Step 3

Expected outputs:
- `js/sections/<name>.js` (entry) and/or `js/components/<name>.js` (shared)
- `features/<feature-name>/component-api.md`

## Step 5 — Lint loop (max 3 cycles)
After each file js-agent writes:
1. Run `ide.getDiagnostics` on the file
2. Run `yarn lint` via Bash
3. If errors:
   - Re-invoke js-agent with errors embedded
   - Re-run diagnostics
4. Loop until clean or 3 cycles.
5. Escalate if still failing.

## Step 6 — Report
> "JS built at `js/sections/<name>.js`. Component API at `features/<feature-name>/component-api.md`. Ready for `/test-full <feature-name>`."
