# Section Build Checklist

Reference checklist for building a single Shopify section. Main conversation follows this — main is the only context with MCP access.

---

## Prerequisites
- `features/[name]/brief.md` exists
- `features/[name]/test-scenarios.md` exists

If either missing → run planner first (Steps 0-1 below).

---

## Execution Sequence

```
Step 0: Ask Human      → Main asks before spawning any agent:
                         1. Template type: page | product | collection
                         2. Data sources (product, collection, metafields, settings only?)
                         3. Render context (section in editor, snippet, block?)
                         4. Purpose — why build this?
                         5. Reuse — existing components to reuse?
Step 1: Planner        → Main fetches Figma design context + screenshots
                         Main spawns planner with: Figma data + human answers
                         Planner writes brief.md + test-scenarios.md
                         Planner adds section to correct test template
Step 2: UI Agent       → Spawn with Figma data → writes liquid + tailwind (+ optional scss escape hatch) + component-structure.md
Step 3: Test Agent     → Spawn in ui-only mode → writes ui.spec.js
        (ui-only)        Based on component-structure.md + test-scenarios.md
Step 4: Run Tests      → Main runs: npx playwright test features/[name]/ui.spec.js
                         Screenshots/diffs land in features/[name]/qa/
Step 5: Visual QA      → Main saves Figma screenshot to features/[name]/qa/
                         Spawn visual-qa agent with test results → writes qa report
                         If NEEDS_FIX → send report to UI agent, re-run from Step 3
Step 6: JS Agent       → Spawn (no MCP needed) → writes js + component-api.md
                         SKIP if brief says "No JavaScript needed"
Step 7: Test Agent     → Spawn in full mode → writes functional.spec.js + integration.spec.js
        (full)           SKIP if no JS agent ran
Step 8: Run Tests      → Main runs full specs
Step 9: Done           → All files in features/[name]/ complete
```

### Hard dependencies (never parallelize):
```
UI Agent → Test Agent (ui-only) → Run Tests → Visual QA
Visual QA PASS → TS Agent → Test Agent (full) → Run Tests
```

### Parallel within a step:
- Multiple independent sections → multiple UI agents simultaneously
- Multiple JS agents for independent sections → simultaneously

---

## MCP Work (main conversation only)

### Figma prefetch (before UI agent)
```
get_design_context(fileKey, nodeId) → design data
get_screenshot(fileKey, nodeId)     → reference screenshot
```
Pass design data into UI agent prompt. Save screenshot for visual QA.

### Run tests (after test-agent writes specs)
```bash
npx playwright test features/[name]/ui.spec.js --reporter=list
```
Screenshots auto-saved to `features/[name]/qa/` by the spec.

### Figma screenshot for visual QA
Save Figma screenshot to `features/[name]/qa/figma-default.png`.
Pass test output + screenshot paths into visual-qa agent prompt.

---

## Fix Loops

### Visual QA NEEDS_FIX:
1. Read the qa report mismatches
2. Send mismatches to UI agent → fixes liquid/tailwind (or scss escape hatch)
3. Re-run test-agent (ui-only) to update specs if needed
4. Main re-runs tests
5. Re-run visual QA with new results
6. Max 3 cycles → escalate to human

### Test failure:
1. Route failure to JS agent → fixes JavaScript
2. Main re-runs tests
3. Max 3 cycles → escalate to human

---

## Output Files (all in features/[name]/)
```
brief.md                ← planner
test-scenarios.md       ← planner
component-structure.md  ← UI agent
ui.spec.js              ← test agent (ui-only)
component-api.md        ← JS agent (if applicable)
functional.spec.js      ← test agent (full, if applicable)
integration.spec.js     ← test agent (full, if applicable)
qa/
  visual-qa-report.md   ← visual-qa agent
  figma-*.png           ← main (figma screenshots)
  live-*.png            ← ui.spec.js (playwright screenshots)
  diff-*.png            ← visual-qa agent (pixelmatch)
```
