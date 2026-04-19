# Shopify Section-Build Pipeline — Test-Layer Speedup

Date: 2026-04-19
Branch: `feature/flow-fixes`
Status: Design approved — ready for implementation plan

---

## Context

The existing `/build-section` pipeline chains 7+ agent spawns across planner → architect → ui-agent (×2 phases) → test-agent (ui-only) → visual-qa-agent → js-agent → test-agent (full). Each agent + each playwright run adds wall-clock. User identifies the test layer as the worst offender.

Per-cycle slowness compounds from:

- **Playwright runs 4 breakpoint projects** (`mobile` 375 / `tablet` 768 / `tablet-lg` 1280 / `desktop` 1440) × Groups A/B/C/D/E tests per spec.
- **Triple coverage** on typography/color: computed-style assertions in spec.js (Group B) + pixelmatch diff + visual-qa-agent reading `figma-context.md`.
- **Content-completeness gated twice** — once as playwright test (A-1) + once in visual-qa Step 1b.
- **visual-qa-agent runs opus** for deterministic threshold grading.
- **ui-agent runs in 2 phases** with a human gate even when no Questions surface — a wasted round-trip on the happy path.

Goal: ~50% wall-clock reduction per build cycle with no architectural rewrite (no agent merges, no artifact loss).

---

## Scope

**In scope:**
- Playwright project config (drop intermediates)
- `test-agent` authoring rules (drop Groups A + B + C, add style-dump JSON)
- `visual-qa-agent` model + typography-comparison mechanism
- `ui-agent` phase model (single-pass default)
- Pre-flight content-gate script
- Commands: `build-ui.md`, `test-ui.md`, `build-section.md`
- Agents: `ui-agent.md`, `test-agent.md`, `visual-qa-agent.md`
- `.claude/rules/agents.md` Main Prefetch Contract

**Out of scope:**
- `planner`, `architect`, `js-agent`, `code-reviewer` (untouched)
- `test-agent` full mode (functional + integration specs — untouched)
- Agent merges (test-agent + visual-qa stay separate)
- Intermediate-artifact elimination (`test-scenarios.md`, `ui-plan.md`, `visual-qa-report.md` all kept)

---

## Design

### 1. Playwright config — drop tablet + tablet-lg

Keep only design-breakpoint projects.

**File:** `playwright.config.js`

- Remove `tablet` (768) and `tablet-lg` (1280) entries from the projects array.
- Retain `mobile` (375) and `desktop` (1440).

**Consequence:** layout integrity at intermediates no longer tested. Rationale — mobile-first Tailwind + pixelmatch at design breakpoints catches regressions; responsive correctness at intermediates is a CSS property, not a behavioral one.

---

### 2. Test-agent authoring rule changes

**File:** `.claude/agents/test-agent.md`

**Dropped groups:**
- **A — Content completeness.** Moves to pre-flight script (see §5).
- **B — Computed-style typography/color assertions.** Replaced by style-dump JSON consumed by visual-qa.
- **C — Layout integrity at intermediates.** Projects removed.

**Retained groups:**
- **D — Live screenshots** at mobile + desktop (fed to pixelmatch).
- **E — Content placement parity** (line counts, container max-width).
- **A11y scan** (only when `brief.md` declares `Accessibility: required`).

**New — D-0 style-dump JSON.** One non-asserting test per breakpoint writes computed styles for every selector in `ui-plan.md` → `BEM / selector catalogue` to `features/<name>/qa/styles-<bp>.json`:

```js
test('D-0: Dump computed styles', async ({ page }, testInfo) => {
  const bp = testInfo.project.name;
  const selectors = [/* from ui-plan.md BEM catalogue */];
  const dump = {};
  for (const sel of selectors) {
    dump[sel] = await page.$eval(sel, el => {
      const s = getComputedStyle(el);
      return {
        fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight,
        color: s.color, backgroundColor: s.backgroundColor, opacity: s.opacity,
        borderRadius: s.borderRadius, letterSpacing: s.letterSpacing,
      };
    });
  }
  fs.writeFileSync(`features/${SECTION}/qa/styles-${bp}.json`, JSON.stringify(dump, null, 2));
});
```

The dump never asserts, never fails. Grading happens in visual-qa.

**`test-scenarios.md` contract** — retained. "Required template content" list stays (feeds pre-flight script via CLI arg). Scenario groups shrink to D + E + D-0 + optional a11y.

**Per-run test-count reduction:**

| Before | After |
|---|---|
| 4 BPs × (A-1 + B × N elements + C × 3 + D + E × N) ≈ 20-40 tests | 2 BPs × (D-0 + D + E × N + a11y) ≈ 6-10 tests |

---

### 3. Visual-qa agent changes

**File:** `.claude/agents/visual-qa-agent.md`

**Model:** `opus` → `haiku`. All inputs deterministic — pixelmatch %, axe `impact` field, numeric JSON diff.

**Typography comparison mechanism:**

- **Before:** parse test pass/fail output from spec result.
- **After:** read `features/<name>/qa/styles-<bp>.json` → diff each selector's values against `figma-context.md` table → emit HIGH-severity mismatches.

**Removed Step 1b — content-completeness gate.** Pre-flight script (see §5) already gated.

**Pixelmatch loop:** 4 BPs → 2 BPs (mobile + desktop).

**A11y grading:** unchanged (axe `impact` → severity map unchanged).

**Step 4a diff-PNG inspection:** retained as a step, but its output is simplified. When pixelmatch > 2%, the report entry includes: breakpoint, diff %, paths to `figma-<bp>.png` + `live-<bp>.png` + `diff-<bp>.png`. Qualitative prose descriptions (ghosting / progressive drift / row overflow) are dropped from the agent spec — haiku cannot be relied on for that granularity. Ui-agent on re-invocation reads the diff PNG itself to decide the fix.

**Report shape (`qa/visual-qa-report.md`):** unchanged — same tables, same Mismatch entries, same Status field. No downstream contract break.

---

### 4. UI-agent phase collapse

**Files:** `.claude/agents/ui-agent.md`, `.claude/commands/build-ui.md`

**New behavior:** single-pass by default.

Workflow:
1. Read brief + architecture + figma-context.md
2. Write intent sections to `ui-plan.md` (Layout, Responsive, Token map, SCSS, Font loading, Variant mapping, Reuse refs)
3. Self-check for blockers. Emit `BLOCKED` + `## Questions` if any of:
   - `figma-context.md` missing/malformed for a referenced node
   - brief + architecture conflict on schema shape
   - variant mapping in brief conflicts with figma-context.md
   - reuse reference doesn't exist at stated path
4. If clean — continue in same pass. Write `.liquid` files + append `As-built DOM`, `BEM catalogue`, `Data attributes`, `Schema settings`, `CSS custom properties`, `Variants implemented/not`, `DEVIATIONS`, `JS handoff` stub.

**Agent-spec trim:** remove "Two phases" contract section (~40 lines). Drop "Phase 1 / Phase 2" labels from section headings. Sections themselves retained.

**`build-ui.md` command change:**

```
BEFORE                                     AFTER
1. Spawn ui-agent (Phase 1)                1. Spawn ui-agent (single)
2. Main reads ui-plan.md                   2. Check agent output for BLOCKED
3. Resolve Questions with human            3a. If BLOCKED — resolve + re-spawn
4. Spawn ui-agent (Phase 2)                3b. Else — run validate_theme loop
5. Main runs validate_theme loop
```

**Happy path:** 1 spawn instead of 2. BLOCKED path: same 2 spawns as today.

**Risk:** loses mandatory human-review-before-code gate. Mitigation: agent self-reports ambiguity via BLOCKED criteria above. Historical builds: most have zero Questions — current gate fires uselessly. Edge case (ambiguity surfaces mid-code-authoring): agent writes DEVIATION + BLOCKED with partial output. Same recovery flow as current DEVIATIONS handling.

---

### 5. Pre-flight content-gate script

**New file:** `scripts/validate-template.js` (~30 lines)

**Signature:**
```bash
node scripts/validate-template.js <type> <section-key> <required-keys-json>
```

**Logic:**
```js
const fs = require('fs');
const [, , type, sectionKey, requiredJson] = process.argv;

const raw = fs.readFileSync(`templates/${type}.test.json`, 'utf8');
const stripped = raw.replace(/^\/\*[\s\S]*?\*\//, '');
const template = JSON.parse(stripped);

const section = template.sections?.[sectionKey];
if (!section) {
  console.error(`BLOCKED: section "${sectionKey}" not found in templates/${type}.test.json`);
  process.exit(1);
}

const required = JSON.parse(requiredJson);
const settings = section.settings || {};
const missing = required.filter(k => settings[k] == null || String(settings[k]).trim() === '');

if (missing.length) {
  console.error(`BLOCKED: missing template content — ${missing.join(', ')}`);
  console.error(`Fix: populate templates/${type}.test.json → sections.${sectionKey}.settings before running tests.`);
  process.exit(1);
}

console.log('OK: template content-complete');
```

**Integration:** `test-ui.md` new Step 4a (before playwright launch). Reads "Required template content" list from `test-scenarios.md` and passes it as the CLI arg. Exit 1 → halt + report BLOCKED. Exit 0 → proceed.

**Savings:** ~2-3s Playwright browser boot skipped. First-failure-abort (`maxFailures:1`) now targets real assertions, not a content-completeness JSON read.

---

### 6. Main Prefetch Contract updates

**File:** `.claude/rules/agents.md`

Update rows:

| Agent | Change |
|---|---|
| ui-agent Phase 1 (plan) + Phase 2 (code) | Collapsed to single `ui-agent` row. Post-handoff check: `validate_theme` loop (max 3), unchanged. |
| visual-qa-agent | Model changed from opus to haiku. Inputs table adds `qa/styles-<bp>.json`. Pixelmatch loop — 2 BPs instead of 4. |

---

### 7. Build-section artifact gate

**File:** `.claude/commands/build-section.md` Step 7

Update "Required (always)" list:
- Remove tablet + tablet-lg screenshot entries from `figma-*.png` / `live-*.png` / `diff-*.png` expectations.
- Add `features/$1/qa/styles-mobile.json` + `features/$1/qa/styles-desktop.json` to expected artifacts.
- Drop "Phase 1 + Phase 2 sections populated" wording for `ui-plan.md` — replace with "all intent + as-built sections populated".

---

## File change summary

| File | Action |
|---|---|
| `playwright.config.js` | Edit — remove 2 projects |
| `.claude/agents/test-agent.md` | Edit — drop Groups A/B/C authoring rules, add D-0 style-dump template, update `test-scenarios.md` contract |
| `.claude/agents/visual-qa-agent.md` | Edit — model haiku, new typography-diff mechanism, drop Step 1b |
| `.claude/agents/ui-agent.md` | Edit — remove phase contract, single-pass workflow, BLOCKED criteria |
| `.claude/commands/build-ui.md` | Edit — single spawn, conditional re-spawn on BLOCKED |
| `.claude/commands/test-ui.md` | Edit — add Step 4a pre-flight |
| `.claude/commands/build-section.md` | Edit — artifact gate update |
| `.claude/rules/agents.md` | Edit — Main Prefetch Contract rows for ui-agent + visual-qa-agent |
| `scripts/validate-template.js` | Create — new ~30-line node script |

**Net:** 8 files edited, 1 file created. No agent merge. No artifact loss downstream.

---

## Success criteria

1. End-to-end `/build-section <name> <figma-url>` on a reference section (e.g. hero-banner) completes ~50% faster than baseline.
2. No regression in defect-catching — any historical bug caught by Groups A/B/C or the current visual-qa opus inspection must still be caught by the new pipeline (pre-flight + style-dump diff + pixelmatch at design BPs).
3. Downstream artifacts retain their names + schemas so no re-training of code-reviewer or js-agent required.

## Rollback plan

Each section of changes is independently revertable:
- Playwright projects — restore 2 entries in config.
- Test-agent rules — restore Group A/B/C prose.
- visual-qa model — change model field back to opus.
- ui-agent phase — restore phase-split sections + build-ui command.
- Pre-flight — delete script + remove Step 4a.

No destructive file deletions — rollback is a single revert commit per section.
