---
description: Prefetch skills + memory, spawn js-agent to write JavaScript behavior layer + fill the `## JS handoff` section of ui-plan.md, then run lint loop. Argument — $1 feature name.
---

# Build JS: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name (kebab-case)

Verify:
- `features/<feature-name>/ui-plan.md` exists (ui-agent has run)
- `features/<feature-name>/qa/visual-qa-report.md` exists with `Status: PASS` (visual QA cleared)

If brief says "No JavaScript needed", report `SKIP: No JS behavior per brief` and stop.

If prerequisites missing: `BLOCKED: Run /build-ui and /visual-qa first.`

## Step 2 — Memory + skill prefetch
Per Main Prefetch Contract → js-agent row:
- Skills: `modern-javascript-patterns` — invoke via Skill tool
  - Only add `vercel-react-best-practices` if `ui-plan.md` mentions `.jsx`/React islands
- Memory subset: filter for JS class/component patterns, Shopify section architecture, DOM lifecycle

## Step 3 — Optional MCP lookups
If `brief.md` specifies Shopify Cart / Storefront / Section Rendering API calls, prefetch:
- `shopify-dev-mcp.search_docs_chunks` for the relevant API shapes

If brief specifies third-party libraries, prefetch:
- `context7.resolve-library-id` → `context7.query-docs`

## Step 4 — Spawn js-agent
Call `Agent({ subagent_type: "js-agent", prompt: <embed> })`.

Embed in prompt (stable-first ordering per cache-friendly rule in `.claude/rules/agents.md`):

**STABLE PREFIX (cacheable):**
1. Skill output (`modern-javascript-patterns`, + `vercel-react-best-practices` if .jsx)
2. Memory subset (JS class/component patterns, Shopify section architecture, DOM lifecycle)

**SEMI-STABLE (per-feature):**
3. Feature name + workspace path
4. Contents of `brief.md`
5. Contents of `ui-plan.md`
6. MCP docs from Step 3 (shopify-dev-mcp + context7, if fetched)

**DYNAMIC (this invocation only):**
7. Lint errors from prior cycle (if re-invoked after failing lint loop)

Expected outputs:
- `js/sections/<name>.js` (entry) and/or `js/components/<name>.js` (shared)
- Updated `features/<feature-name>/ui-plan.md` — `## JS handoff` section filled (replaces the ui-agent stub)

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
> "JS built at `js/sections/<name>.js`. JS handoff filled at `features/<feature-name>/ui-plan.md → ## JS handoff`. Ready for `/test-full <feature-name>`."
