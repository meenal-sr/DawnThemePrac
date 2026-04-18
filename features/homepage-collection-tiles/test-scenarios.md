# HomepageCollectionTiles — Test Scenarios

## Authoring rules
- Four projects: mobile 375 / tablet 768 / tablet-lg 1280 / desktop 1440.
- Strict typography + color assertions ONLY at mobile 375 + desktop 1440.
- Layout integrity assertions ONLY at tablet 768 + tablet-lg 1280.
- Pixelmatch screenshots saved at mobile + desktop only.
- No standalone presence tests, no conditional-rendering tests, no console-error observer.
- No content-string assertions — content comes from `templates/page.test.json`.
- **A11y:** skip — write `qa/a11y-skipped.marker` at module load.
- yarn playwright:test ... --reporter=list

---

## Section under test
- **Type:** page
- **URL helper:** `sectionTestUrl('page')`
- **Template:** `templates/page.test.json` → section `homepage-collection-tiles`
- **Section selector:** `[data-section-type="homepage-collection-tiles"]`

---

## Required template content

**Section settings:**
- `heading_text` — non-blank ("Shop By Category")
- `view_more_label` — non-blank ("View More")
- `view_more_link` — non-blank ("/collections/all")
- `background_color` — non-blank ("#f4f6f8")
- `section_font` — non-blank ("dm_sans_n7")

**Block structure:**
- Minimum 1 tile block (design shows 6)
- Each block has `label`, `link` populated

---

## A — Content completeness

**Single assertion:** Template has non-blank values for every required setting + minimum 1 block.

Test reads `loadTemplate('page')` → `sections.homepage-collection-tiles.settings` and `block_order`. Validates all five settings keys non-empty. Validates first tile has `label` + `link` populated. Fails with enumeration of missing keys.

---

## B — Typography + color parity (mobile 375 + desktop 1440)

### Mobile (375)
- **Heading (`.homepage-collection-tiles__heading`):**
  - font-size: 32px or less (mobile-responsive delta from desktop 48px)
  - font-weight: 700
  - color: rgb(11, 30, 61) = #0b1e3d

- **View More link (`.homepage-collection-tiles__view-more`):**
  - font-size: 16px
  - line-height: 20px
  - font-weight: 700
  - color: rgb(0, 0, 0) = #000000

- **Tile label (`.homepage-collection-tiles__label`, first tile):**
  - font-size: 15px
  - line-height: 24px
  - font-weight: 500
  - color: rgb(0, 0, 0) = #000000

### Desktop (1440)
- **Heading:**
  - font-size: 48px
  - line-height: 52.8px
  - font-weight: 700
  - color: rgb(11, 30, 61) = #0b1e3d

- **View More link:**
  - font-size: 16px (no change from mobile)
  - line-height: 20px
  - font-weight: 700
  - color: rgb(0, 0, 0) = #000000

- **Tile label (first tile):**
  - font-size: 15px (no change from mobile)
  - line-height: 24px
  - font-weight: 500
  - color: rgb(0, 0, 0) = #000000

- **Tile card background:**
  - background-color: rgb(255, 255, 255) = #ffffff
  - border-radius: contains "16px"

- **Section background:**
  - background-color: rgb(244, 246, 248) = #f4f6f8

---

## C — Layout integrity (tablet 768 + tablet-lg 1280)

### Tablet (768)
- No horizontal scroll on document element: `document.documentElement.scrollWidth <= document.documentElement.clientWidth` (±1px tolerance)
- Track does not overflow right edge of section: track's bounding box right ≤ section's right (±1px)
- At least 1 tile visible in viewport: `locator('.homepage-collection-tiles__card').count() >= 1`

### Tablet-lg (1280)
- No horizontal scroll on document element: `document.documentElement.scrollWidth <= document.documentElement.clientWidth` (±1px tolerance)
- Track does not overflow right edge of section: track's bounding box right ≤ section's right (±1px)
- At least 1 tile visible in viewport: `locator('.homepage-collection-tiles__card').count() >= 1`

---

## D — Live screenshots (mobile 375 + desktop 1440)

**Mobile (375):**
- `saveScreenshot(page, '[data-section-type="homepage-collection-tiles"]', 'homepage-collection-tiles', 'live-mobile')` → `features/homepage-collection-tiles/qa/live-mobile.png`

**Desktop (1440):**
- `saveScreenshot(page, '[data-section-type="homepage-collection-tiles"]', 'homepage-collection-tiles', 'live-desktop')` → `features/homepage-collection-tiles/qa/live-desktop.png`

Consumed by visual-qa-agent for pixelmatch diff vs Figma reference.

---

## E — Content placement parity (mobile 375 + desktop 1440)

### Mobile (375)
- **Heading single-line layout:** `Math.round(offsetHeight / lineHeight)` = 1 line

### Desktop (1440)
- **Heading single-line layout:** `Math.round(offsetHeight / lineHeight)` = 1 line
- **First tile label single-line layout:** `Math.round(offsetHeight / lineHeight)` = 1 line
- **Inner container max-width:** `offsetWidth <= 1440px`

---

## Design content reference

Pulled from brief — for test-template populate step + visual QA reference.

### Copy
- Section heading: `Shop By Category`
- View more label: `View More`
- View more link: `/collections/all`

### Tiles (in order)
1. `Indoor Air Quality` → `/collections/indoor-air-quality`
2. `Split Systems` → `/collections/split-systems`
3. `Packaged Terminal Systems` → `/collections/packaged-terminal-systems`
4. `Scratch and Dent` → `/collections/scratch-and-dent`
5. `Portable Ac System` → `/collections/portable-ac`
6. `HVAC Parts - Accessories` → `/collections/hvac-parts-accessories`

### Typography (from brief)
| Element | Font | Size | Line height | Weight | Color |
|---|---|---|---|---|---|
| Section heading | DM Sans | 48px desktop / 32px mobile | 52.8px desktop | 700 | #0b1e3d |
| View More link | DM Sans | 16px | 20px | 700 | #000000 |
| Tile label | DM Sans | 15px | 24px | 500 | #000000 |

### Colors
- Section background: `#f4f6f8`
- Tile card background: `#ffffff`

---

## Test runner checklist
- `yarn playwright:test features/homepage-collection-tiles/ui.spec.js --reporter=list`
- Expect outputs:
  - `features/homepage-collection-tiles/qa/live-mobile.png`
  - `features/homepage-collection-tiles/qa/live-desktop.png`
  - `features/homepage-collection-tiles/qa/a11y-skipped.marker`
- All tests pass (A-1 content gate, B-* typography, C-* layout, D-* screenshots, E-* placement).
- No console errors.

---

## Questions

None. Section is fully specified.
