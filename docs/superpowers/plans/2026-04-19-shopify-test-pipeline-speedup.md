# Shopify Test-Pipeline Speedup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut wall-clock of `/build-section` pipeline by ~50% via Playwright project reduction, test-group simplification, agent model downgrade, ui-agent phase collapse, and a pre-flight content-gate script.

**Architecture:** Edit 8 config/agent/command files and add 1 new node script. No agent merges, no artifact loss. Each task independently revertable. Tasks ordered so plumbing (script, config) lands before the agents that consume them; agent specs land before the commands that orchestrate them.

**Tech Stack:** Node (CommonJS), Playwright, Shopify theme CLI, Claude Code `.claude/agents/` + `.claude/commands/` + `.claude/rules/` markdown spec files.

**Reference spec:** `docs/superpowers/specs/2026-04-19-shopify-test-pipeline-speedup-design.md`

---

## Task 1: Create pre-flight template validator script

**Files:**
- Create: `scripts/validate-template.js`
- Test: `scripts/validate-template.test.js`

- [ ] **Step 1: Create the test file**

Create `scripts/validate-template.test.js`:

```js
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SCRIPT = path.resolve(__dirname, 'validate-template.js');

function runScript(args, cwd) {
  try {
    const stdout = execFileSync('node', [SCRIPT, ...args], { cwd, encoding: 'utf8' });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : '',
    };
  }
}

function makeTempRepo(template) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-'));
  fs.mkdirSync(path.join(dir, 'templates'));
  fs.writeFileSync(path.join(dir, 'templates', 'page.test.json'), template);
  return dir;
}

const validTemplate = `/*! Test template */
{
  "sections": {
    "hero-banner": {
      "type": "hero-banner",
      "settings": {
        "heading": "Welcome",
        "cta_link": "/collections/all",
        "background_image": "shopify://placeholder.png"
      }
    }
  },
  "order": ["hero-banner"]
}`;

const missingSettingTemplate = `/*! Test template */
{
  "sections": {
    "hero-banner": {
      "type": "hero-banner",
      "settings": {
        "heading": "Welcome",
        "cta_link": "",
        "background_image": null
      }
    }
  },
  "order": ["hero-banner"]
}`;

const tests = [
  {
    name: 'exits 0 when all required settings populated',
    run: () => {
      const dir = makeTempRepo(validTemplate);
      const res = runScript(['page', 'hero-banner', '["heading","cta_link","background_image"]'], dir);
      if (res.code !== 0) throw new Error(`expected 0, got ${res.code}. stderr: ${res.stderr}`);
      if (!res.stdout.includes('OK')) throw new Error(`expected OK, got: ${res.stdout}`);
    },
  },
  {
    name: 'exits 1 when section missing from template',
    run: () => {
      const dir = makeTempRepo(validTemplate);
      const res = runScript(['page', 'missing-section', '["heading"]'], dir);
      if (res.code !== 1) throw new Error(`expected 1, got ${res.code}`);
      if (!res.stderr.includes('section "missing-section" not found')) {
        throw new Error(`expected missing-section error, got: ${res.stderr}`);
      }
    },
  },
  {
    name: 'exits 1 when required settings are blank or null',
    run: () => {
      const dir = makeTempRepo(missingSettingTemplate);
      const res = runScript(['page', 'hero-banner', '["heading","cta_link","background_image"]'], dir);
      if (res.code !== 1) throw new Error(`expected 1, got ${res.code}`);
      if (!res.stderr.includes('cta_link')) throw new Error(`expected cta_link in error, got: ${res.stderr}`);
      if (!res.stderr.includes('background_image')) throw new Error(`expected background_image in error, got: ${res.stderr}`);
      if (res.stderr.includes('heading')) throw new Error(`heading should not be in error (it is populated), got: ${res.stderr}`);
    },
  },
  {
    name: 'handles template without the /* */ comment header',
    run: () => {
      const dir = makeTempRepo(validTemplate.replace(/^\/\*[\s\S]*?\*\/\n/, ''));
      const res = runScript(['page', 'hero-banner', '["heading"]'], dir);
      if (res.code !== 0) throw new Error(`expected 0, got ${res.code}. stderr: ${res.stderr}`);
    },
  },
];

let failed = 0;
for (const t of tests) {
  try {
    t.run();
    console.log(`PASS: ${t.name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL: ${t.name}\n  ${err.message}`);
  }
}

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log('\nAll tests passed');
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node scripts/validate-template.test.js
```

Expected: `FAIL` output — script does not exist yet, `execFileSync` throws.

- [ ] **Step 3: Write the validator script**

Create `scripts/validate-template.js`:

```js
#!/usr/bin/env node
const fs = require('fs');

const [, , type, sectionKey, requiredJson] = process.argv;

if (!type || !sectionKey || !requiredJson) {
  console.error('Usage: node scripts/validate-template.js <type> <section-key> <required-keys-json>');
  console.error('Example: node scripts/validate-template.js page hero-banner \'["heading","cta_link"]\'');
  process.exit(2);
}

const templatePath = `templates/${type}.test.json`;
let raw;
try {
  raw = fs.readFileSync(templatePath, 'utf8');
} catch (err) {
  console.error(`BLOCKED: could not read ${templatePath} — ${err.message}`);
  process.exit(1);
}

const stripped = raw.replace(/^\/\*[\s\S]*?\*\//, '');
let template;
try {
  template = JSON.parse(stripped);
} catch (err) {
  console.error(`BLOCKED: ${templatePath} is not valid JSON after stripping /* */ header — ${err.message}`);
  process.exit(1);
}

const section = template.sections && template.sections[sectionKey];
if (!section) {
  console.error(`BLOCKED: section "${sectionKey}" not found in ${templatePath}`);
  process.exit(1);
}

let required;
try {
  required = JSON.parse(requiredJson);
} catch (err) {
  console.error(`BLOCKED: required-keys argument is not valid JSON — ${err.message}`);
  process.exit(2);
}

if (!Array.isArray(required)) {
  console.error('BLOCKED: required-keys argument must be a JSON array of strings');
  process.exit(2);
}

const settings = section.settings || {};
const missing = required.filter(k => settings[k] == null || String(settings[k]).trim() === '');

if (missing.length) {
  console.error(`BLOCKED: missing template content — ${missing.join(', ')}`);
  console.error(`Fix: populate templates/${type}.test.json → sections.${sectionKey}.settings before running tests.`);
  process.exit(1);
}

console.log(`OK: template content-complete (section=${sectionKey}, type=${type})`);
process.exit(0);
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
node scripts/validate-template.test.js
```

Expected: `All tests passed` — four PASS lines.

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-template.js scripts/validate-template.test.js
git commit -m "feat: add pre-flight template validator script"
```

---

## Task 2: Drop tablet + tablet-lg Playwright projects

**Files:**
- Modify: `playwright.config.js:40-74`

- [ ] **Step 1: Edit playwright.config.js**

Replace the `projects` array (lines 40-74) with only the `desktop` and `mobile` entries. Keep order: `desktop` first, `mobile` second.

Final `projects` block:

```js
  projects: [
    {
      name: 'desktop',
      grepInvert: /\[mobile\]/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      grepInvert: /\[desktop\]/,
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      },
    },
  ],
```

Note the `grepInvert` regex updates — only two project tags remain, so the filter is simpler.

- [ ] **Step 2: Smoke-test with an existing spec**

Find any existing feature spec to confirm config parses:

```bash
yarn playwright:test --list | head -40
```

Expected: list output shows only `[desktop]` and `[mobile]` projects per test. No tablet entries.

- [ ] **Step 3: Commit**

```bash
git add playwright.config.js
git commit -m "refactor: drop tablet + tablet-lg playwright projects"
```

---

## Task 3: Update `.claude/agents/test-agent.md` authoring rules

**Files:**
- Modify: `.claude/agents/test-agent.md`

- [ ] **Step 1: Remove Group A (content-completeness) from authoring rules**

Open `.claude/agents/test-agent.md`. Find the section under `### Step 2 — Write test-scenarios.md` that begins `- **A — Content completeness.**` and ends at the end of that bullet.

Remove that entire bullet.

Also find the first-test block later in the file (starting with `**First test in every spec = content-completeness gate (Group A — Content).**` and continuing through the `A-1: Content completeness` code example + the sentence immediately after). Remove from the start of that paragraph through the end of the `});` code block.

Replace with this single sentence in the same location:

> Group A (content completeness) is handled by a pre-flight `scripts/validate-template.js` script invoked by `/test-ui` before playwright launches. Do NOT emit an A-1 test — the pre-flight gate already blocks partial-data runs.

- [ ] **Step 2: Remove Group B (typography + color parity)**

Find `- **B — Typography + color parity**` bullet and remove the entire bullet through to the next `- **C —` bullet.

- [ ] **Step 3: Remove Group C (layout integrity at intermediates)**

Find `- **C — Layout integrity**` bullet and remove the entire bullet through to the next `- **D —` bullet.

- [ ] **Step 4: Add Group D-0 (style dump) before Group D**

Insert this new bullet immediately above `- **D — Live screenshots**`:

```markdown
- **D-0 — Computed-style dump** at design breakpoints (`mobile` 375 + `desktop` 1440). One test per breakpoint. For every selector in `ui-plan.md` → `BEM / selector catalogue`, read computed styles (`fontSize`, `fontWeight`, `lineHeight`, `color`, `backgroundColor`, `opacity`, `borderRadius`, `letterSpacing`) and write the JSON map to `features/<name>/qa/styles-<bp>.json`. The test does NOT assert. It only dumps — visual-qa-agent diffs the JSON against `figma-context.md` values and grades severity.
```

- [ ] **Step 5: Update the "Four projects" authoring-rules line**

Find the line beginning `- Four projects: mobile 375 / tablet 768 / tablet-lg 1280 / desktop 1440.` (in the `test-scenarios.md` structure block).

Replace with:

```
- Two projects: mobile 375 / desktop 1440 (design breakpoints only).
```

Find the adjacent line `- Strict assertions only at mobile + desktop. tablet + tablet-lg assert layout integrity only.` — remove it entirely.

- [ ] **Step 6: Update "Do NOT emit" list**

Under the `**Do NOT emit:**` block at the end of Step 2, add a new bullet at the top:

```markdown
- A-1 content-completeness tests — moved to pre-flight script `scripts/validate-template.js` invoked by `/test-ui`.
- Computed-style typography/color assertions (`toHaveCSS('font-size', ...)` etc.) — visual-qa-agent diffs the D-0 dump JSON against `figma-context.md`.
- Layout-integrity tests at tablet + tablet-lg — those projects are gone.
```

- [ ] **Step 7: Update the "Test runner checklist" inside test-scenarios.md template**

Find the block under `## Test runner checklist` and replace with:

```markdown
## Test runner checklist
- node scripts/validate-template.js <type> <section-key> <required-keys-json> exits 0 (pre-flight gate)
- yarn playwright:test ... --reporter=list
- live-mobile.png + live-desktop.png produced
- styles-mobile.json + styles-desktop.json produced
- a11y-skipped.marker or a11y-<bp>.json produced
- maxFailures: 1 active
```

- [ ] **Step 8: Update "Typography/color assertions ONLY" authoring rule**

Find the line beginning `- Typography/color assertions ONLY at the design breakpoints`. Remove it entirely — typography/color assertions are removed from the spec.

Find the adjacent line `- Layout-integrity checks ONLY at the intermediates`. Remove it entirely.

- [ ] **Step 9: Verify no stale references**

```bash
grep -n 'Group A\|Group B\|Group C\|tablet-lg\|tablet 768\|A-1\|B-1\|C-1' .claude/agents/test-agent.md
```

Expected: no matches, OR matches only in the "Do NOT emit" block you just added (which references them explicitly to forbid).

Review every match. If any non-forbid reference remains, remove it.

- [ ] **Step 10: Commit**

```bash
git add .claude/agents/test-agent.md
git commit -m "refactor(test-agent): drop Groups A/B/C, add D-0 style dump"
```

---

## Task 4: Update `.claude/agents/visual-qa-agent.md`

**Files:**
- Modify: `.claude/agents/visual-qa-agent.md`

- [ ] **Step 1: Change agent model**

Change the frontmatter `model:` field from `opus` to `haiku`. Update line 5.

- [ ] **Step 2: Add styles-*.json to inputs**

Find the `## External Inputs` section's bullet list. Add a new bullet after the `Pixelmatch diff images` line:

```markdown
- Computed-style dumps in `features/[name]/qa/styles-<bp>.json` (one per design breakpoint — mobile + desktop) — emitted by test-agent's D-0 test; visual-qa-agent diffs these against `figma-context.md` to detect typography/color mismatches.
```

Also add the same entry to the `## Inputs (all in features/[section-name]/)` table:

| File | Source |
|---|---|
| `qa/styles-<bp>.json` | Playwright test run — one per design breakpoint, emitted by test-agent D-0 test |

- [ ] **Step 3: Remove Step 1b (content-completeness gate)**

Find `### Step 1b — Content completeness gate (HARD FAIL — bail before comparison)` heading and delete from that heading through the end of the last bullet under it (`Only proceed to Step 2 if the content-completeness gate passes.`).

Replace with a single line:

```markdown
### Step 1b — (Removed — content-completeness gate is now a pre-flight script run by `/test-ui` before playwright. When visual-qa runs, content-completeness is already guaranteed.)
```

- [ ] **Step 4: Rewrite Step 3 (Typography & Color check)**

Find `### Step 3 — Typography & Color check (against figma-context.md)` and replace its body through to just before `### Step 4 —` with:

```markdown
Read `features/<name>/figma-context.md` for the authoritative Figma values. For each design breakpoint (`mobile` + `desktop`), read `features/<name>/qa/styles-<bp>.json` — a JSON map keyed by selector.

For each selector present in BOTH the BEM catalogue (from `ui-plan.md`) and the styles JSON, diff the computed values against the figma-context.md target values:

| Property | Compare |
|---|---|
| font-size | `fontSize` vs figma-context.md typography value |
| font-weight | `fontWeight` vs figma-context.md |
| line-height | `lineHeight` vs figma-context.md |
| color | `color` vs figma-context.md (rgb normalized) |
| background-color | `backgroundColor` vs figma-context.md |
| opacity | `opacity` vs figma-context.md |
| border-radius | `borderRadius` vs figma-context.md |
| letter-spacing | `letterSpacing` vs figma-context.md |

For every property-level mismatch, emit a HIGH-severity entry in the Mismatches list:
- Breakpoint
- Selector
- Property
- Figma target (from figma-context.md)
- Actual (from styles-<bp>.json)

Normalize colors to rgb() before comparing — Figma may express as hex (`#027db3`) while computed style returns `rgb(2, 125, 179)`. Treat both as equal.

If `styles-<bp>.json` is missing for a breakpoint that is expected, emit HIGH: `Style dump missing for <bp> — re-run /test-ui`. Do NOT skip the run silently.
```

- [ ] **Step 5: Update Step 4 (Spacing & Layout check) breakpoint count**

Find the table in `### Step 4 — Spacing & Layout check (pixelmatch screenshot diff)`. Update the example table to show only mobile + desktop rows. Remove the example row for tablet-lg / intermediates.

Replacement table example:

```markdown
| Breakpoint | Diff % | Threshold | Result |
|---|---|---|---|
| Mobile 375px | 0.5% | ≤2% | Pass |
| Desktop 1440px | 3.2% | ≤2% | NEEDS_FIX |
```

- [ ] **Step 6: Simplify Step 4a (diff-PNG inspection)**

Find `#### Step 4a — Mandatory diff-PNG inspection (NO EXCEPTIONS if diff > 2%)` and replace the body (through just before `### Step 5 —`) with:

```markdown
When any `qa/diff-*.png` has diff > 2%, emit NEEDS_FIX and include in the mismatch entry:
- Breakpoint
- Diff percentage
- Paths to `qa/figma-<bp>.png`, `qa/live-<bp>.png`, `qa/diff-<bp>.png`

Do NOT attempt qualitative descriptions of the diff (ghosting, row overflow, progressive drift). Ui-agent reads the diff PNG itself on re-invocation and decides the fix. Your job is to surface the paths + the mismatch, not interpret pixel patterns.

You may ONLY mark `Status: PASS` if either (a) diff ≤ 2% for every in-scope breakpoint, or (b) every breakpoint with diff > 2% is explicitly marked OUT_OF_SCOPE in the report with a recorded justification (e.g. no mobile Figma supplied).
```

- [ ] **Step 7: Update example report table (Spacing & Layout) to remove intermediates**

Find the example `## Spacing & Layout Check (pixelmatch)` table in the report template. Update to show only mobile + desktop rows.

Replacement:

```markdown
## Spacing & Layout Check (pixelmatch)
| Breakpoint | Diff % | Result |
|---|---|---|
| Mobile 375px | 0.5% | Pass |
| Desktop 1440px | 3.2% | NEEDS_FIX |
```

- [ ] **Step 8: Verify no stale references**

```bash
grep -n 'opus\|tablet-lg\|tablet 768\|content-completeness gate\|Step 1b' .claude/agents/visual-qa-agent.md
```

Expected matches:
- `model: haiku` (confirms line 5 updated — if `opus` still matches, re-check Step 1)
- Step 1b stub referencing its removal (intentional)
- Any remaining matches for `tablet-lg` / `tablet 768` — remove them

- [ ] **Step 9: Commit**

```bash
git add .claude/agents/visual-qa-agent.md
git commit -m "refactor(visual-qa-agent): haiku model, consume styles-*.json, drop content gate + intermediate BPs"
```

---

## Task 5: Update `.claude/agents/ui-agent.md` — collapse phases

**Files:**
- Modify: `.claude/agents/ui-agent.md`

- [ ] **Step 1: Rewrite the role/contract block**

Replace lines 10-28 (from `## Role` through the end of the `**Rule:**` paragraph) with:

```markdown
## Role
You translate Figma designs into semantic Shopify markup — Liquid, HTML, CSS (Tailwind + conditional SCSS) only. You do not write JavaScript. You do not pick file paths or decide reuse (architect has already done that in `architecture.md`). You DO own the visual implementation plan: DOM structure, Tailwind token map, responsive strategy, SCSS decision.

You run in **single-pass mode by default**. All output — intent sections + Liquid files + as-built sections — is produced in one agent invocation. You self-report `BLOCKED:` with a `## Questions` section in `ui-plan.md` if and only if ambiguity prevents safe progress. Main resolves the blocker with the human and re-invokes you to resume.

### Intent sections (written first, before code)
`## Intent`, `## Layout strategy`, `## Responsive strategy`, `## Token map`, `## SCSS decision`, `## Font loading`, `## Variant → state mapping`, `## Reuse references followed`, `## Questions`.

### As-built sections (appended after Liquid is written)
`## As-built DOM`, `## BEM / selector catalogue`, `## Data attributes`, `## Schema settings & block fields`, `## CSS custom properties`, `## Figma variants implemented`, `## Figma variants NOT implemented`, `## DEVIATIONS`, `## JS handoff` (stub when section JS is needed; full content when no section JS is needed).

### BLOCKED criteria — emit BLOCKED + `## Questions` if any of:
- `figma-context.md` missing or malformed for a node referenced in `brief.md`
- `brief.md` + `architecture.md` conflict on schema shape or file plan
- variant mapping in `brief.md` conflicts with variants present in `figma-context.md`
- a reuse reference from `architecture.md` does not exist at the stated path
- schema/variant decision required that the brief does not specify

When NONE of these criteria apply, proceed end-to-end in one invocation.
```

- [ ] **Step 2: Rewrite the `ui-plan.md` contract table**

Find the table starting `| Phase | Section | Audience | Purpose |`. Replace with:

```markdown
### ui-plan.md — single-file contract

| Section | Audience | Purpose |
|---|---|---|
| `## Intent` / `## Layout strategy` / `## Responsive strategy` / `## Token map` / `## SCSS decision` / `## Font loading` / `## Variant → state mapping` / `## Reuse references followed` / `## Questions` | Human reviewer + main + ui-agent itself | **Intent** — what we intend to build + why |
| `## As-built DOM` / `## BEM / selector catalogue` / `## Data attributes` / `## Schema settings & block fields` / `## CSS custom properties` / `## Figma variants implemented` / `## Figma variants NOT implemented` / `## DEVIATIONS` | Test-agent + js-agent + code-reviewer | **As-built** — authoritative selectors, data-attrs, state contract |
| `## JS handoff` | Js-agent → test-agent → code-reviewer | Mount selector + state transitions + event contract. Stub when section JS is needed (js-agent fills later); full content when no section JS is needed (e.g. reusing `<carousel-swiper>`). |
```

- [ ] **Step 3: Rename Phase 1 workflow heading + delete its "Phase 1 Step 7 — Hand off" tail**

**Do NOT do broad deletions — the authoring rules inside Phase 2 must be preserved.** Follow these surgical edits:

Find the heading `## Workflow — Phase 1 (plan)` and rename it to `## Workflow`.

Find the first sub-paragraph under that heading (`Main invokes you in plan mode when architecture.md exists but ui-plan.md does not. Your only job in Phase 1 is to write ui-plan.md and stop.`). Replace with:

```
Main invokes you once per feature. Write intent sections first; if blockers surface, emit `BLOCKED:` and stop. Otherwise continue to code + as-built in the same pass.
```

Find the sub-heading `### Phase 1 Step 1 — Read context` and rename to `### Step 1 — Read context`.

Find `### Phase 1 Step 2 — Read figma-context.md` and rename to `### Step 2 — Read figma-context.md`.

Find `### Phase 1 Step 3 — Reconcile tokens with tailwind.config.js` and rename to `### Step 3 — Reconcile tokens with tailwind.config.js`.

Find `### Phase 1 Step 4 — Decide layout + responsive strategy` and rename to `### Step 4 — Decide layout + responsive strategy`.

Find `### Phase 1 Step 5 — Decide SCSS` and rename to `### Step 5 — Decide SCSS`.

Find `### Phase 1 Step 6 — Write Phase 1 sections into ui-plan.md` and rename to `### Step 6 — Write intent sections into ui-plan.md`. Inside this step, update any mention of "Phase 1 populates only the Intent-level sections" to "This step populates only the intent-level sections — as-built sections are appended after code is written". Change `Phase 2` placeholders in the template block to `(filled in Step 9 after code is written)`.

Find `### Phase 1 Step 7 — Hand off`. Replace the entire sub-section body (from the heading through the `Stop. Do NOT write any Liquid or SCSS in Phase 1.` line at the end) with:

```markdown
### Step 7 — Blocker check

If `## Questions` in ui-plan.md is non-empty OR you cannot safely proceed for any BLOCKED criterion listed in the Role section at the top of this doc, emit `BLOCKED: [concise reason]` and stop. Main resolves with the human and re-invokes you — when re-invoked, resume from Step 8.

If `## Questions` is empty, proceed to Step 8 in the same invocation.
```

- [ ] **Step 4: Rename Phase 2 workflow heading + renumber steps**

Find the heading `## Workflow — Phase 2 (code)`. **Delete the heading line entirely** (do NOT delete content under it — the detailed authoring rules must stay). The steps below it become continuations of the single `## Workflow`.

Find `Main invokes Phase 2 only after ui-plan.md exists and any Questions are resolved.` — delete this line.

Find `### Step 1 — Read context` (inside the former Phase 2 block). This is a duplicate of the earlier `### Step 1 — Read context` you renamed. **Delete the entire `### Step 1 — Read context` sub-section from the former Phase 2 block** (its content reads the same files — redundant).

Find `### Step 2 — Read figma-context.md (single source of truth)` (inside former Phase 2). **Delete this sub-section** — it duplicates Step 2 above.

Find `### Step 2b — Reconcile design tokens with project config (Tailwind-first)` (inside former Phase 2). **Delete this sub-section** — it duplicates Step 3 above.

Find `### Step 3 — Map variants to implementation` (inside former Phase 2). **Renumber this to `### Step 8 — Map variants to implementation`**.

Find `### Step 4 — Write markup (Tailwind-first)` (inside former Phase 2). **Renumber this to `### Step 9 — Write markup (Tailwind-first)`**. Preserve all content underneath unchanged — this includes Tailwind scale rules, layout structure rules, responsive rules, image rules, banner/text-over-image rules, image field schema discipline, reuse precedence.

Find `### Step 5 — SCSS escape hatch (conditional)` (inside former Phase 2). **Renumber this to `### Step 10 — SCSS escape hatch (conditional)`**. Preserve all content unchanged.

Find `### Step 6 — Append Phase 2 sections to ui-plan.md` (inside former Phase 2). **Renumber to `### Step 11 — Append as-built sections to ui-plan.md`**. Inside the step body, change any "Phase 2" references to "as-built". Preserve the H2 list (`## As-built DOM` through `## JS handoff`) unchanged.

After Step 11, insert a new `### Step 12 — Hand off` section:

```markdown
### Step 12 — Hand off
Tell main:
> "ui-plan.md complete — intent + as-built sections populated. Liquid at <paths>. [SCSS at <path> if applicable.] [`## JS handoff` stubbed / authored in full — see section for details.] Ready for Liquid validation + /test-ui."
```

- [ ] **Step 5: Update "Outputs" section**

Find `## Outputs` heading and the Phase 1 / Phase 2 tables underneath. Replace both tables with one:

```markdown
## Outputs

| What | Where | Condition |
|---|---|---|
| Liquid section | `/sections/[name].liquid` | Per architecture.md |
| Liquid snippets (blocks + variants) | `/snippets/[filename].liquid` | Per architecture.md |
| SCSS | `/scss/sections/[name].scss` | Conditional — only when SCSS decision is YES |
| `ui-plan.md` — intent sections + as-built sections + JS handoff stub-or-full | `[workspace]/ui-plan.md` | Always |

Never write to `/assets/` — webpack owns that folder.
Never write JavaScript — that is the js-agent's responsibility.
Never create files not listed in `architecture.md` — write a Question and stop.
```

- [ ] **Step 6: Update STOP CONDITIONS**

Find `## STOP CONDITIONS` heading. Replace the `### Phase 1` and `### Phase 2` subsections with a single ungrouped list:

```markdown
## STOP CONDITIONS
- Do not write any JavaScript — not even inline event handlers
- Do not create files outside the list declared in `architecture.md` + your `ui-plan.md`
- Do not deviate from your intent sections silently — record any deviation in `## DEVIATIONS`
- Do not resolve variant → state mapping conflicts yourself — emit BLOCKED
- Do not invent content or copy that isn't in Figma or the brief
- If a Figma node payload referenced in brief.md is missing, write `BLOCKED: Figma payload for node [id] not provided` and stop
- Do not add `width` or `height` HTML attributes to `<img>` tags
- Do not write raw `<img>` tags — use the snippet listed in `architecture.md` → Reuse
- Do not use `max-width` media queries or `max-*:` Tailwind variants — mobile-first (`min-width`) only
- Do not use fixed `px` dimensions for layout containers — use flex, grid, padding, margin, aspect-ratio
- Do not emit an SCSS file containing only utility-duplicable rules
- Do not add design tokens to SCSS token files — they live in `tailwind.config.js` only
- If `architecture.md` or `figma-context.md` is missing, emit `BLOCKED:` and stop
```

- [ ] **Step 7: Verify no Phase references remain**

```bash
grep -n 'Phase 1\|Phase 2\|PHASE=1\|PHASE=2\|two phases\|two-phase' .claude/agents/ui-agent.md
```

Expected: no matches. Any match → remove the line.

- [ ] **Step 8: Commit**

```bash
git add .claude/agents/ui-agent.md
git commit -m "refactor(ui-agent): collapse two-phase workflow into single-pass with BLOCKED criteria"
```

---

## Task 6: Update `.claude/commands/build-ui.md`

**Files:**
- Modify: `.claude/commands/build-ui.md`

- [ ] **Step 1: Replace the command frontmatter description**

Replace the `description:` line in frontmatter with:

```
description: Single-pass ui-agent run. Spawns ui-agent which writes intent sections + Liquid + as-built sections in one invocation; re-spawns only if agent emitted BLOCKED. Main validates Liquid. Argument — $1 feature name.
```

- [ ] **Step 2: Replace Step 5–7 with a single spawn step**

Find `## Step 5 — Spawn ui-agent Phase 1 (plan)` and delete through the end of `## Step 7 — Spawn ui-agent Phase 2 (code)` (just before `## Step 8 — Validate Liquid`).

Replace with:

```markdown
## Step 5 — Spawn ui-agent (single pass)

Call `Agent({ subagent_type: "ui-agent", prompt: <embed> })`.

Embed in prompt (stable-first ordering per cache-friendly rule in `.claude/rules/agents.md`):

**STABLE PREFIX (cacheable):**
1. Skill output (`web-design-guidelines`)
2. Memory subset (Tailwind organization, Liquid best practices, responsive + a11y patterns, section/snippet architecture)

**SEMI-STABLE (per-feature):**
3. Feature name + workspace path (`features/<feature-name>/`)
4. Full contents of `brief.md`
5. Full contents of `architecture.md`
6. Pointer: "Read `features/<feature-name>/figma-context.md` and `features/<feature-name>/qa/figma-*.png` directly — single source of truth for all Figma values."

**DYNAMIC (this invocation only):**
7. Fix-cycle mismatches from `qa/visual-qa-report.md` (only if re-invoked after NEEDS_FIX)
8. Resolved Questions from previous BLOCKED cycle (only if re-invoked after BLOCKED)

Expected outputs:
- `sections/<name>.liquid` and/or `snippets/<filename>.liquid` per `architecture.md`
- `scss/sections/<name>.scss` (only if ui-agent declared SCSS: YES)
- `features/<feature-name>/ui-plan.md` — intent sections + as-built sections + JS handoff stub

## Step 6 — BLOCKED gate

Read `features/<feature-name>/ui-plan.md`:
- If the agent wrote `BLOCKED:` anywhere in its return OR `## Questions` is non-empty → surface the questions to the human. Wait for answers. Re-invoke ui-agent (Step 5) with the answers embedded under DYNAMIC point 8.
- If `## Questions` is empty AND `.liquid` files exist per `architecture.md` → proceed to Step 7.

Loop Step 5–6 max 2 times. If still BLOCKED, escalate.
```

- [ ] **Step 3: Renumber remaining steps**

The current `## Step 8 — Validate Liquid` becomes `## Step 7 — Validate Liquid`. Current `## Step 9 — Report` becomes `## Step 8 — Report`.

Update the heading lines only.

- [ ] **Step 4: Update Step 8 (Report) wording**

Replace the report sentence with:

```markdown
> "UI built. Liquid at `sections/<name>.liquid` + snippets. ui-plan.md populated with intent + as-built sections. Ready for `/test-ui <feature-name>`."
```

- [ ] **Step 5: Verify no Phase references remain**

```bash
grep -n 'Phase 1\|Phase 2\|PHASE=1\|PHASE=2' .claude/commands/build-ui.md
```

Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add .claude/commands/build-ui.md
git commit -m "refactor(build-ui): single-pass ui-agent with BLOCKED-loop instead of two-phase gate"
```

---

## Task 7: Update `.claude/commands/test-ui.md` — add pre-flight gate

**Files:**
- Modify: `.claude/commands/test-ui.md`

- [ ] **Step 1: Insert new Step 4a (pre-flight) before spec run**

Find `## Step 4 — Spawn test-agent (ui-only)`. After that step (and its "Expected outputs" list), BEFORE `## Step 5 — Run specs`, insert a new section:

```markdown
## Step 4a — Pre-flight content gate (MANDATORY before playwright)

Read the "Required template content" list from `features/<feature-name>/test-scenarios.md`. This is the list of schema-setting IDs that must have non-blank values in `templates/<type>.test.json` → `sections.<feature-name>.settings` for the test run to be valid.

Extract `<type>` from `brief.md` → `Template type:` (one of `page`, `product`, `collection`).

Run the validator:

\`\`\`bash
node scripts/validate-template.js <type> <feature-name> '<required-keys-json>'
\`\`\`

Where `<required-keys-json>` is a JSON array of setting IDs from the "Required template content" list — e.g. `'["heading","cta_link","background_image"]'`.

If the script exits with code 0 → proceed to Step 5.

If the script exits with code 1 → HALT. Surface the BLOCKED message to the human:
> "Pre-flight gate BLOCKED: <stderr from script>. Fix template and re-run /test-ui <feature-name>."

Do NOT launch playwright when the gate is blocked. Partial-data runs produce misleading pixelmatch diffs.

If the script exits with code 2 (usage error) → the invocation is malformed; re-check arg construction.
```

- [ ] **Step 2: Update Step 6 (Report) to enumerate new artifacts**

Find `## Step 6 — Report`. In the "Capture" list, add:

```markdown
- styles-mobile.json + styles-desktop.json (consumed by visual-qa)
```

Update the sample report line to:

```markdown
> "test-scenarios.md + <feature-name>.spec.js written. Pre-flight gate: OK. Specs: X passed, Y failed. Screenshots + style dumps in features/<feature-name>/qa/. Ready for `/visual-qa <feature-name>`."
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/test-ui.md
git commit -m "refactor(test-ui): add pre-flight content gate via validate-template.js"
```

---

## Task 8: Update `.claude/commands/build-section.md` — artifact gate

**Files:**
- Modify: `.claude/commands/build-section.md`

- [ ] **Step 1: Update required-artifacts list in Step 7**

Find `## Step 7 — Pre-completion artifact gate (discipline rule 3)`. Update the "Required (always)" bulleted list.

Remove:
- `features/$1/ui-plan.md — Phase 1 + Phase 2 sections populated (ui-agent). Phase 1 contains Intent + Layout strategy + Responsive + Token map + SCSS decision + Font loading + Variant mapping + Reuse refs + Questions. Phase 2 contains As-built DOM + BEM/selector catalogue + Data attributes + Schema settings + CSS custom properties + Variants implemented/not + DEVIATIONS + ## JS handoff stub or full content.`

Replace with:

- `features/$1/ui-plan.md — intent sections (Intent + Layout strategy + Responsive + Token map + SCSS decision + Font loading + Variant mapping + Reuse refs + Questions) + as-built sections (As-built DOM + BEM/selector catalogue + Data attributes + Schema settings + CSS custom properties + Variants implemented/not + DEVIATIONS + ## JS handoff stub or full content) all populated.`

After the existing `qa/diff-*.png (matching breakpoints)` line, add:

- `features/$1/qa/styles-mobile.json` and `features/$1/qa/styles-desktop.json` (style dumps consumed by visual-qa)

- [ ] **Step 2: Update "Owner map" rows**

In the "Owner map for missing-artifact recovery" table, find the two rows:
- `ui-plan.md Phase 1 sections` → `ui-agent Phase 1` → `/build-ui $1`
- `ui-plan.md Phase 2 sections (As-built + selectors + state contract + JS handoff stub)` → `ui-agent Phase 2` → `/build-ui $1`

Replace with a single row:
- `ui-plan.md (intent or as-built sections)` → `ui-agent` → `/build-ui $1`

Also add a new row:
- `qa/styles-<bp>.json` → `test-agent ui-only` → `/test-ui $1`

- [ ] **Step 3: Update Step 10 (Report) enumeration**

Find the "Report" paragraph. Replace `ui-plan.md (Phase 1 + Phase 2 + ## JS handoff if JS=YES)` with `ui-plan.md (intent + as-built + ## JS handoff if JS=YES)`. Add `qa/styles-mobile.json, qa/styles-desktop.json` to the verified-artifacts enumeration.

- [ ] **Step 4: Verify no Phase references remain**

```bash
grep -n 'Phase 1\|Phase 2' .claude/commands/build-section.md
```

Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/build-section.md
git commit -m "refactor(build-section): update artifact gate for single-pass ui-agent + styles-*.json"
```

---

## Task 9: Update `.claude/rules/agents.md` — Main Prefetch Contract

**Files:**
- Modify: `.claude/rules/agents.md`

- [ ] **Step 1: Collapse ui-agent Phase 1/2 rows into one**

Find the Main Prefetch Contract table. Locate the two rows:
- `ui-agent Phase 1 (plan)` | ... | `web-design-guidelines` | ... | `Main gate — read ui-plan.md, resolve Questions with human`
- `ui-agent Phase 2 (code)` | `—` | `—` | `Liquid best practices, section/snippet architecture` | `shopify-dev-mcp.learn_shopify_api` + `validate_theme`

Replace both rows with one:

| Agent | MCPs main calls first | Skills main invokes first | Memory subset embedded | Post-handoff checks (main) |
|---|---|---|---|---|
| ui-agent | `figma.get_design_context`, `figma.get_screenshot` (only if figma-context.md missing — normally prefetched) | `web-design-guidelines` | Tailwind organization, Liquid best practices, responsive + a11y patterns, section/snippet architecture | BLOCKED gate (loop max 2) + `shopify-dev-mcp.learn_shopify_api` + `validate_theme` (loop max 3) |

- [ ] **Step 2: Update visual-qa-agent row**

Find the visual-qa-agent row. In the "MCPs main calls first" column, keep the pixelmatch line. No change there. In the "Memory subset embedded" column, append: `styles-<bp>.json parsing conventions`.

Replace the entire visual-qa-agent row with:

| visual-qa-agent | `pixelmatch.compare` (diff each figma-*.png vs live-*.png per design breakpoint — mobile + desktop — writes `qa/diff-*.png` + mismatch %). `node pixelmatch-config/figma-mcp-screenshot.js <nodeId> <path>` only if `qa/figma-*.png` missing. No Figma MCP tool call. | `web-design-guidelines` | Visual QA patterns, pixelmatch threshold conventions, styles-<bp>.json parsing conventions | — |

- [ ] **Step 3: Update Available Agents table**

Find the `## Available Agents` table. Update the ui-agent row:
- Change "Phase 1: Intent sections of `ui-plan.md`. Phase 2: Liquid + Tailwind..." description to: "Single-pass: writes intent sections + Liquid + Tailwind (+ optional SCSS) + as-built sections + JS handoff stub all in one invocation. Emits BLOCKED for ambiguity resolution."

Update the visual-qa-agent row model column (if present in the table) or leave as-is — the Available Agents table does not track model per agent, so no edit needed there. Confirm by scanning.

- [ ] **Step 4: Update Execution Flow block**

Find the fenced `Execution Flow (single section)` block. Replace:

```
  → ui-agent Phase 1 (with Figma + brief + architecture) → ui-plan.md
  → Main gate: read ui-plan.md, resolve Questions with human
  → ui-agent Phase 2 → liquid + tailwind (+ optional scss) + appends As-built + selectors + state contract + `## JS handoff` stub to ui-plan.md
  → Main: validate_theme loop
```

With:

```
  → ui-agent (single pass, with Figma + brief + architecture) → ui-plan.md (intent + as-built + JS handoff stub) + liquid + tailwind (+ optional scss)
  → Main: BLOCKED gate (resolve + re-spawn only if agent emitted BLOCKED) + validate_theme loop
```

- [ ] **Step 5: Verify no Phase references remain**

```bash
grep -n 'Phase 1\|Phase 2\|PHASE=1\|PHASE=2' .claude/rules/agents.md
```

Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add .claude/rules/agents.md
git commit -m "refactor(agents-rules): collapse ui-agent prefetch rows, add styles-*.json to visual-qa inputs"
```

---

## Task 10: End-to-end verification on a real feature

**Files:**
- Read-only: any `features/<name>/` with an existing build

- [ ] **Step 1: Pick a reference feature**

Scan `features/` for a feature with `brief.md` + `ui-plan.md` + `test-scenarios.md` + source `.liquid` file already built. Use the first match.

```bash
ls -d features/*/ | head -5
```

If `features/payment-banner/` exists and has these files, use it. Otherwise pick any complete feature.

- [ ] **Step 2: Dry-run the pre-flight gate**

Extract the template type from the feature's `brief.md` (look for `Template type:`). Extract the schema settings from the feature's `ui-plan.md` → `### Schema settings the test template must populate` table.

Build the required-keys JSON array from those setting IDs. Run:

```bash
node scripts/validate-template.js <type> <feature-name> '<required-keys-json>'
```

Expected: exit 0 if template is content-complete (feature has been tested before), exit 1 with a clear "missing content" message otherwise.

- [ ] **Step 3: Smoke-run an existing feature spec with new playwright config**

```bash
yarn playwright:test features/<feature-name>/<feature-name>.spec.js --reporter=list
```

Expected: tests run only at `[desktop]` and `[mobile]` — no `[tablet]` / `[tablet-lg]` output.

If any tests reference tablet/tablet-lg (they would be from a pre-refactor spec), they'll be skipped silently by the project filter. Expected state: pass.

- [ ] **Step 4: Verify no orphaned Phase-1/Phase-2 prose**

```bash
grep -rn 'Phase 1\|Phase 2\|PHASE=1\|PHASE=2' .claude/ | grep -v 'CHANGELOG\|node_modules'
```

Expected: zero matches. Any match → open the file and remove the reference.

- [ ] **Step 5: Verify no stale tablet/tablet-lg references**

```bash
grep -rn 'tablet-lg\|tablet 768\|tablet 1280' .claude/ playwright.config.js scripts/ | grep -v 'node_modules'
```

Expected: zero matches. Any match → remove.

- [ ] **Step 6: Commit any cleanup from Steps 4-5**

If cleanup was needed:

```bash
git add -u
git commit -m "chore: sweep residual Phase 1/2 + tablet-lg references"
```

If no cleanup, skip.

- [ ] **Step 7: Final verification — run the test-agent self-test**

```bash
node scripts/validate-template.test.js
```

Expected: `All tests passed`.

---

## Notes for the implementer

- **Do not auto-deploy.** `yarn start` (webpack watcher) handles theme sync; never run `yarn deploy`, `yarn shopify:push`, or `shopify theme push`.
- **Commit per task.** Each task is independently revertable — one task = one commit.
- **No test framework.** `scripts/validate-template.test.js` uses plain node `assert`-style throws via `execFileSync`. No jest, no mocha. Run via `node` directly.
- **Agent specs are markdown.** Edits to `.claude/agents/*.md` are text edits; there's no compile step. Changes are picked up on next agent spawn.
- **Reference spec:** `docs/superpowers/specs/2026-04-19-shopify-test-pipeline-speedup-design.md` is the authoritative design doc. If a task step conflicts with the spec, the spec wins — halt and surface the conflict.
