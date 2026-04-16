# Page Build Checklist

Reference checklist for building a full Shopify page with multiple sections. Main conversation follows this.

---

## Prerequisites
- `pages/[page-name]/page-brief.md` exists
- `features/[section-name]/brief.md` exists for every section
- `features/[section-name]/test-scenarios.md` exists for every section

If any missing → run planner agent first.

---

## Step 1 — Prefetch all Figma data

Fetch design context + screenshots for ALL sections upfront:
```
For each section in page-brief.md:
  get_design_context(fileKey, nodeId)
  get_screenshot(fileKey, nodeId)
```

---

## Step 2 — Map dependencies

Read all section briefs. Identify:
- Cross-section events (who emits, who listens)
- Shared components (built in one section, used by others)
- Runtime dependencies (section B assumes section A exists)

Group into parallel groups:
- **Group 1:** No dependencies
- **Group 2+:** Depends on Group 1 outputs

Milestone rules:
- Depends on **markup** → wait for Visual QA PASS
- Depends on **JS events** → wait for TS Agent PASS (component-api.md exists)
- Depends on **runtime existence** → wait for Test Agent PASS

---

## Step 3 — Present plan to human

```
"Building [N] sections:
 - Group 1 (parallel): hero-banner, product-info
 - Group 2 (after product-info TS): recommendations
 - Reused (no build): reviews

Approve to start."
```

**Do not start until human approves.**

---

## Step 4 — Execute groups

For each group, follow section-build-checklist.md per section:

```
Group 1 (parallel):
  Spawn UI agents simultaneously (each with Figma data)
  → Wait for all UI agents
  Spawn test-agents (ui-only) simultaneously
  → Main runs all ui.spec.ts tests
  → Spawn visual-qa agents simultaneously (each with test results)
  → If any NEEDS_FIX, fix loop per section
  Spawn TS agents simultaneously (for sections that need TS)
  → Spawn test-agents (full) simultaneously
  → Main runs functional/integration specs

Group 2 (after dependencies met):
  Same pattern, sequential after Group 1 milestones.
```

---

## Step 5 — Shared component handling

If a component is used by multiple sections:
1. Build in assigned section (per planner brief)
2. Other sections import from `/snippets/[name].liquid`
3. If agent tries to rebuild → stop, redirect to import

---

## Step 6 — Cross-section integration tests

After ALL sections complete:
1. Ask human to write `pages/[page-name]/page-test-scenarios.md`
2. Main runs playwright for cross-section flows
3. Spawn page-integration-test agent with results

---

## Dynamic replanning

- **Section blocked:** Pause only dependent sections. Resolve from brief or ask human.
- **Shared component fails:** Flag immediately with blast radius.
- **Section slow:** Start Group 2 sections that don't depend on it.
