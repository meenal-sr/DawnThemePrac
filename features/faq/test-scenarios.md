# FAQ — Test Scenarios

Relevant authoring rules:
- Four projects: mobile 390 / tablet 768 / tablet-lg 1280 / desktop 1440.
- Strict assertions only at mobile + desktop. tablet + tablet-lg assert layout integrity only.
- Pixelmatch screenshots saved at mobile + desktop only.
- No standalone presence group, no conditional-rendering tests, no console-error observer.
- No content-string assertions — never toHaveText().
- A11y: **required** — brief §A11y decision.
- yarn playwright:test ... --reporter=list.

## Section under test

- Type: `page`
- URL helper: `sectionTestUrl('page')` → `/pages/${process.env.TEST_PAGE_TEMPLATE}`
- Template: `templates/page.test.json`
- Section selector: `[data-section-type="faq"]`

## Required template content

All settings non-blank + all 4 blocks present + block_order length === 4:
- `heading` = "The AC Outlet Advantage"
- `heading_color` = "#0b1e3d"
- `heading_font_picker` = "dm_sans_n7"
- `body_font_picker` = "dm_sans_n4"
- `padding_top_desktop` = 60
- `padding_bottom_desktop` = 60
- `padding_top_mobile` = 30
- `padding_bottom_mobile` = 30
- Block 1: `question` = "Wholesale HVAC Equipment for All of Your Cooling & Heating Needs", `answer` = full richtext with 3 inline links, `default_open` = true
- Block 2: `question` = "Find What You Need at Our Online AC Supply Store", `default_open` = false
- Block 3: `question` = "We Offer a Wide Variety of HVAC Products", `default_open` = false
- Block 4: `question` = "A Combination of Convenience & Customer Support at Wholesale Prices", `default_open` = false
- `block_order` length = 4

## A — Content completeness

Single assertion: template has non-blank values for every key in "Required template content". Fails fast if fixture is broken — no point running D (screenshot) if A fails.

| Scenario | Selector | Assertion | Rationale |
|---|---|---|---|
| A-1: Section mounted | `[data-section-type="faq"]` | element exists | Confirm section root in DOM |
| A-2: Heading visible | `.faq-heading` | exists + text = "The AC Outlet Advantage" | Heading renders with exact copy |
| A-3: Accordion wrapper | `[data-accordion]` | exists | Accordion root mounted for JS binding |
| A-4: 4 toggle buttons | `[data-accordion-target]` | count = 4 | Block count matches preset |
| A-5: Button 0 text | `[data-accordion-target]:nth-child(1) .faq-question-text` | contains "Wholesale HVAC Equipment for All of Your Cooling & Heating Needs" | Q1 copy rendered |
| A-6: Button 1 text | `[data-accordion-target]:nth-child(2) .faq-question-text` | contains "Find What You Need at Our Online AC Supply Store" | Q2 copy rendered |
| A-7: Button 2 text | `[data-accordion-target]:nth-child(3) .faq-question-text` | contains "We Offer a Wide Variety of HVAC Products" | Q3 copy rendered |
| A-8: Button 3 text | `[data-accordion-target]:nth-child(4) .faq-question-text` | contains "A Combination of Convenience & Customer Support at Wholesale Prices" | Q4 copy rendered |
| A-9: Button 0 expanded | `[data-accordion-target]:nth-child(1)` | aria-expanded = "true" | Block 1 opens by default |
| A-10: Button 1-3 collapsed | `[data-accordion-target]:nth-child(2,3,4)` | aria-expanded = "false" | Blocks 2-4 closed by default |
| A-11: Panel 0 visible | `#faq-panel-faq-1` | NOT hidden (no `hidden` attribute) | Block 1 answer revealed on load |
| A-12: Panel 1-3 hidden | `#faq-panel-faq-2,#faq-panel-faq-3,#faq-panel-faq-4` | hidden attribute present | Blocks 2-4 panels closed |
| A-13: Button → Panel pairing | `[data-accordion-target]:nth-child(1)` | aria-controls = "faq-panel-faq-1" + panel#faq-panel-faq-1 exists | Button 0 points to its panel |
| A-14: 3 inline links in answer | `#faq-panel-faq-1 a` | count = 3, each has href + target="_blank" + rel contains "noopener" | Block 1 answer has 3 links |
| A-15: Link 1 | `#faq-panel-faq-1 a:nth-child(1)` | href = "https://www.theacoutlet.com/individual-ac-components.html" | Link 1 href correct |
| A-16: Link 2 | `#faq-panel-faq-1 a:nth-child(2)` | href = "https://www.theacoutlet.com/complete-ac-systems.html" | Link 2 href correct |
| A-17: Link 3 | `#faq-panel-faq-1 a:nth-child(3)` | href = "https://www.theacoutlet.com/extended-labor-warranty-plans.html" | Link 3 href correct |

## B — Typography + color parity (mobile + desktop)

Authored but `.skip()` in pipeline — manual-debug only. Asserts computed font-size, line-height, font-weight, color, letter-spacing vs. `figma-context.md` ground truth at design breakpoints.

| Scenario | Element | Breakpoint | Property | Expected value |
|---|---|---|---|---|
| B-1 | `.faq-heading` | desktop (1440) | font-size | 48px |
| B-2 | `.faq-heading` | desktop | line-height | 52.8px |
| B-3 | `.faq-heading` | desktop | font-weight | 700 |
| B-4 | `.faq-heading` | desktop | color | #0b1e3d |
| B-5 | `.faq-heading` | mobile (390) | font-size | 28px |
| B-6 | `.faq-heading` | mobile | line-height | 33.6px |
| B-7 | `.faq-heading` | mobile | color | #000000 |
| B-8 | `.faq-question-text` | desktop | font-size | 18px |
| B-9 | `.faq-question-text` | desktop | line-height | 20px |
| B-10 | `.faq-question-text` | desktop | font-weight | 500 |
| B-11 | `.faq-question-text` | desktop | letter-spacing | -0.72px |
| B-12 | `.faq-question-text` | mobile | font-size | 16px |
| B-13 | `.faq-question-text` | mobile | line-height | 26px |
| B-14 | `.faq-answer` | desktop | font-size | 16px |
| B-15 | `.faq-answer` | desktop | line-height | 20px |
| B-16 | `.faq-answer` | desktop | font-weight | 400 |
| B-17 | `.faq-answer` | desktop | color | #666666 |
| B-18 | `.faq-answer` | desktop | letter-spacing | -0.16px |
| B-19 | `.faq-answer a` | desktop | text-decoration | underline |
| B-20 | `.faq-answer a` | desktop | color | #666666 |

## C — Layout integrity (tablet + tablet-lg)

Authored but `.skip()` — manual-debug only. Structural-only assertions at intermediates: no horizontal scroll, no sibling-stack overlap, content container fits viewport width.

| Scenario | Viewport | Assertion | Expected |
|---|---|---|---|
| C-1 | tablet (768) | No horizontal scroll | section width ≤ viewport width (768px) |
| C-2 | tablet | Row layout | buttons stack vertically, no overlap |
| C-3 | tablet | Content container max-width | ≤ 1340px (content container limit per brief) |
| C-4 | tablet | Button padding | pt=12px, pb=12.8px (mobile defaults, no `md:` override yet) |
| C-5 | tablet | Border width | 0.8px (mobile default) |
| C-6 | tablet-lg (1280) | No horizontal scroll | section width ≤ viewport width (1280px) |
| C-7 | tablet-lg | Content container max-width | ≤ 1340px |
| C-8 | tablet-lg | Button padding on open row | pt=16px when aria-expanded=true, pb=17px |
| C-9 | tablet-lg | Border width on open row | 1px solid black (desktop variant) |

## D — Live screenshots (mobile + desktop)

Pipeline group — captures `live-mobile.png` + `live-desktop.png` for pixelmatch against `qa/figma-mobile.png` + `qa/figma-desktop.png`.

| Scenario | Viewport | Path | Section selector | Actions |
|---|---|---|---|---|
| D-1 | desktop (1440) | features/faq/qa/live-desktop.png | `[data-section-type="faq"]` | Disable animations, screenshot element (clipped), save to path |
| D-2 | mobile (390) | features/faq/qa/live-mobile.png | `[data-section-type="faq"]` | Disable animations, screenshot element (clipped), save to path |

## E — Content placement parity (mobile + desktop)

Authored but `.skip()` — manual-debug only. Line counts, content max-width checks. Skip group if nothing worth pinning.

| Scenario | Breakpoint | Element | Assertion | Expected |
|---|---|---|---|---|
| E-1 | desktop | `.faq-heading` | Line count | 1 (single line) |
| E-2 | desktop | `.faq-question-text` (row 1) | Line count | 2 (wraps) |
| E-3 | desktop | `.faq-answer` | max-width effective | ≤ 640px (answer constraint per figma-context) |
| E-4 | mobile | `.faq-heading` | Line count | 2 (wraps on mobile) |
| E-5 | mobile | `.faq-question-text` (row 1) | Line count | 2-3 (wraps) |
| E-6 | mobile | Button 0 | padding-top when aria-expanded=true | 16px |
| E-7 | mobile | Button 0 | padding-bottom | 12.8px |

## A11y

Scan required per brief. One test per Playwright project (mobile, desktop) — scope to section root. Tags: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`. Violations written to `features/faq/qa/a11y-<project>.json`. Fail on `critical` or `serious` impact; log `moderate`/`minor` without failing.

Specific manual checks:
- Section root has `aria-labelledby="faq-heading-<id>"` pointing to a real `<h2 id="...">` — resolves landmark label
- Each button has `aria-controls="faq-panel-<id>"` + matching panel `id` exists
- `hidden` attribute toggles in sync with `aria-expanded` (JS contract)
- Inline links have `target="_blank"` + `rel="noopener noreferrer"`
- Icons have `aria-hidden="true"` — not exposed to AT
- Focus ring visible on buttons (no `outline: none` without replacement)

## Design content reference

Pulled from `figma-context.md`:

### Heading
- Copy: "The AC Outlet Advantage"
- Desktop: 48px DM Sans Bold, #0b1e3d
- Mobile: 28px DM Sans Bold, #000000

### Questions (all 4, identical across breakpoints)
1. "Wholesale HVAC Equipment for All of Your Cooling & Heating Needs"
2. "Find What You Need at Our Online AC Supply Store"
3. "We Offer a Wide Variety of HVAC Products"
4. "A Combination of Convenience & Customer Support at Wholesale Prices"

### Answer (Block 1)
Full richtext with 3 inline underlined links, `target="_blank"`:
- Link 1: "cooling and heating units" → https://www.theacoutlet.com/individual-ac-components.html
- Link 2: "AHRI-rated systems" → https://www.theacoutlet.com/complete-ac-systems.html
- Link 3: "extended labor warranty plans" → https://www.theacoutlet.com/extended-labor-warranty-plans.html

Answer text: 16px DM Sans Regular #666, line-height 20px, letter-spacing -0.16px.

## Test runner checklist

- yarn playwright:test features/faq/faq.spec.js --reporter=list
- live-mobile.png + live-desktop.png produced in features/faq/qa/
- a11y-mobile.json + a11y-desktop.json produced in features/faq/qa/
- maxFailures: 1 active (first A failure aborts run)
- A + D groups run in pipeline; B/C/E skipped (author but don't execute)
- Pixelmatch compares live-*.png vs figma-*.png per breakpoint

## Questions

None — brief + figma-context fully specified. All scenarios actionable.
