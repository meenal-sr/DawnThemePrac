# collection-grid — Test Scenarios

Relevant authoring rules:
- Four projects: mobile 390 / tablet 768 / tablet-lg 1280 / desktop 1440.
- Strict assertions only at mobile + desktop. tablet + tablet-lg assert layout integrity only.
- Pixelmatch screenshots saved at mobile + desktop only.
- No standalone presence group, no conditional-rendering tests, no console-error observer.
- No content-string assertions — never toHaveText().
- A11y: required — WCAG 2.1 AA applies (keyboard nav, alt text, focus visible, disabled-state announced). Emit one test per project.
- yarn playwright:test ... --reporter=list.

## Section under test
- Type: `page`
- URL helper: `sectionTestUrl('page')`
- Template: `page.test.json` with section entry `collection-grid-test`
- Section selector: `[data-section-type="collection-grid"]`

## Required template content
Every design-required setting must have a non-blank value:
- `heading_text`: "Shop By Category"
- `cta_label`: "View More"
- `cta_url`: "/collections/all"
- `show_cta`: true
- `show_arrows`: true
- `background_color`: "#f4f6f8"
- `section_font`: "dm_sans_n7"
- Block count ≥ 6 (minimum for design intent — all 6 tiles must render)
- Each block (×6):
  - `image`: merchant-uploaded or placeholder CDN URL (test template may leave blank; visual-qa will document)
  - `label`: non-blank (tile label text)
  - `link`: "/collections/all" or per-category handle

## A — Content completeness
Single assertion: template has non-blank values for every key in "Required template content".
- Heading text non-blank
- CTA label non-blank
- CTA URL non-blank
- show_cta boolean set
- show_arrows boolean set
- background_color non-blank
- section_font non-blank
- Block count ≥ 6
- Block 1–6 labels all non-blank
- Block 1–6 links all non-blank

## B — Typography + color parity (mobile 390 + desktop 1440)

### Mobile (390px)
- Heading:
  - Computed font-size: 32px
  - Computed line-height: 36px (1.125 ratio)
  - Computed font-weight: 700 (bold)
  - Computed color: rgb(11, 30, 61) ≈ #0b1e3d
  - Font-family: DM Sans (via `--cg-font`)
- View More CTA:
  - Computed font-size: 16px
  - Computed line-height: 20px (1.25 ratio)
  - Computed font-weight: 700 (bold)
  - Computed color: rgb(0, 0, 0) = #000
  - Text transform: uppercase (capitalize class applied)
  - Border-bottom: 1px solid black
  - Font-family: DM Sans (via `--cg-font`)
- Tile label (rendered by snippet — defer to snippet tests):
  - Font-size: 15px
  - Line-height: 24px (1.6 ratio)
  - Font-weight: 500 (medium)
  - Color: rgb(0, 0, 0) = #000
  - Font-family: DM Sans (via `--cg-font`)

### Desktop (1440px)
- Heading:
  - Computed font-size: 48px
  - Computed line-height: 52.8px (1.1 ratio)
  - Computed font-weight: 700 (bold)
  - Computed color: rgb(11, 30, 61) ≈ #0b1e3d
  - Font-family: DM Sans (via `--cg-font`)
- View More CTA:
  - Computed font-size: 16px
  - Computed line-height: 20px (1.25 ratio)
  - Computed font-weight: 700 (bold)
  - Computed color: rgb(0, 0, 0) = #000
  - Text transform: uppercase (capitalize class applied)
  - Border-bottom: 1px solid black
  - Font-family: DM Sans (via `--cg-font`)
- Tile label (defer to snippet):
  - Font-size: 15px
  - Line-height: 24px (1.6 ratio)
  - Font-weight: 500 (medium)
  - Color: rgb(0, 0, 0) = #000
  - Font-family: DM Sans (via `--cg-font`)

### Color parity
- Section background: rgb(244, 246, 248) = #f4f6f8 (light gray)
- CTA border-bottom: 1px solid rgb(0, 0, 0) = #000
- Arrow button background: rgb(244, 246, 248) = #f4f6f8 (idle state)
- Arrow button border: rgba(0, 0, 0, 0.2) (light gray)
- Arrow disabled opacity: 0.4 (40% when `data-state="prev-disabled"` or `next-disabled"`)

## C — Layout integrity (tablet 768 + tablet-lg 1280)

### Tablet (768px)
- No horizontal scroll on `.collection-grid__track` — tiles should be scrollable within their container, not overflow section
- `.collection-grid__inner` fits within viewport width (100% - padding)
- Header row (heading + CTA) flexes left-aligned, CTA right-aligned, no wrapping unless section very narrow
- Tiles render without sibling-stack vertical overlap
- Arrow buttons (if shown) position correctly: left -24px / right -24px from track, vertically centered on tile card

### Tablet-lg (1280px)
- No horizontal scroll on section itself (tile row may scroll internally)
- `.collection-grid__inner` respects max-width constraint (1338px at lg breakpoint)
- Header row aligns correctly with inner max-width
- Carousel track scrolls smoothly within max-width
- Both arrows visible and positioned consistently with tablet breakpoint

## D — Live screenshots (mobile 390 + desktop 1440)

Save high-quality PNG at each breakpoint via `saveScreenshot(page, '[data-section-type="collection-grid"]', 'collection-grid', 'live-390')` and `live-1440` (or `live-mobile`, `live-desktop` per project convention).

- **Mobile (390px):** Heading + CTA flush-left/right, tiles scroll horizontally, prev arrow hidden or disabled (scrolled-start state), next arrow enabled.
- **Desktop (1440px):** Heading + CTA with full spacing, tiles visible across carousel width, both arrows positioned absolutely at ±24px, initial state shows prev-disabled and next-enabled.

## E — Content placement (mobile 390 + desktop 1440)

### Mobile (390px)
- Heading text wraps to ≤ 2 lines (measure via `Math.round(el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight))`)
- CTA label wraps to 1 line or less
- Tile labels wrap to ≤ 2 lines each
- Section content container width: .collection-grid__inner `offsetWidth` ≤ viewport width (no horizontal scroll past carousel overflow)

### Desktop (1440px)
- Heading text wraps to 1 line (design intent: single-line hero)
- CTA label wraps to 1 line
- Tile labels may wrap based on content length; measure line count
- Section content container width: .collection-grid__inner `offsetWidth` ≤ 1338px (max-width breakpoint) + centered

## Design content reference
Pulled from brief.md for test-template populate + visual QA reference.

**Header:**
- Heading text: `Shop By Category`
- CTA label: `View More`
- CTA URL: `/collections/all`

**Tiles (6 dummy seed):**
1. Label: `Indoor Air Quality`
2. Label: `Split Systems`
3. Label: `Packaged Terminal Systems`
4. Label: `Scratch and Dent`
5. Label: `Portable Ac System`
6. Label: `HVAC Parts - Accessories`

**Typography:**
- Heading: DM Sans Bold 48/52.8 @ desktop, 32/36 @ mobile; color #0b1e3d
- CTA: DM Sans Bold 16/20; color #000; capitalize, 1px underline
- Tile label: DM Sans Medium 15/24; color #000

**Colors:**
- Section background: #f4f6f8
- Arrow idle: #f4f6f8, border rgba(0, 0, 0, 0.2)
- Arrow disabled opacity: 40%

**Spacing:**
- Section padding: 40px top / 30px bottom / 20px sides @ mobile; 60px top / 40px bottom / 50px sides @ desktop
- Inner max-width: 1338px @ lg+
- Gap between header & tiles: 32px (tw-gap-8)
- Arrow buttons: 48px circle @ tablet+; hidden @ mobile

## A11y scope
WCAG 2.1 AA applies (brief mandates a11y=required).

- Alt text on tile images (delegated to snippet)
- Semantic heading (h2 for section heading)
- Button keyboard nav: prev/next buttons keyboard-operable (Enter/Space), focus-visible outline
- Disabled state announced: `aria-disabled="true"` + `tabindex="-1"` on disabled arrow buttons
- Tile links accessible (no JS hijack)
- No role conflicts

## Test runner checklist
- yarn playwright:test features/collection-grid/ui.spec.js --reporter=list
- live-390.png + live-1440.png produced in qa/
- a11y-390.json, a11y-768.json, a11y-1280.json, a11y-1440.json produced (AxeBuilder scans)
- maxFailures: 1 active

## F — Functional (JS behavior & state transitions)

### F-1: Mount & initial state calculation
- Scroll at DOM load: `scrollLeft === 0` (at start)
- Expected: prev button has `data-state="prev-disabled"`, `aria-disabled="true"`, `tabindex="-1"`
- Expected: next button has `data-state="next-enabled"`, `aria-disabled="false"`, `tabindex="0"`
- Asset: 6 tiles render with images loaded

### F-2: Next click scroll & state transition
- Action: Click next arrow button
- Expected: track scrolls right by `clientWidth × 0.8`
- Expected: scroll behavior is `smooth` (when prefers-reduced-motion is NOT set)
- Expected after scroll settles: prev button transitions to `data-state="prev-enabled"`, `aria-disabled="false"`, `tabindex="0"`
- Expected after scroll settles: next button remains `data-state="next-enabled"` (not at terminus yet)

### F-3: Prev click scroll & state transition
- Setup: Scroll to middle (after F-2)
- Action: Click prev arrow button
- Expected: track scrolls left by `clientWidth × 0.8`
- Expected: scroll behavior is `smooth`
- Expected after scroll settles: next button remains enabled
- Expected after scroll settles: prev button recalculates (may stay enabled or transition to disabled depending on scroll position)

### F-4: Scroll to end — next button disabled
- Action: Click next repeatedly until at scroll terminus
- Expected: `scrollLeft + clientWidth >= scrollWidth` evaluates true
- Expected: next button transitions to `data-state="next-disabled"`, `aria-disabled="true"`, `tabindex="-1"`
- Expected: prev button remains enabled (not at start)

### F-5: Scroll back to start — prev button disabled
- Action: From terminus, click prev repeatedly until back at origin
- Expected: `scrollLeft === 0` evaluates true
- Expected: prev button transitions to `data-state="prev-disabled"`, `aria-disabled="true"`, `tabindex="-1"`
- Expected: next button remains enabled

### F-6: Keyboard navigation — Enter on next button
- Setup: Click next arrow to gain focus (or use Tab)
- Action: Focus next button, press Enter
- Expected: Track scrolls by scroll step (same as click)
- Expected: Arrow states recalculate after scroll

### F-7: Keyboard navigation — Space on prev button
- Setup: Focus prev button, then scroll to middle so it's enabled
- Action: Press Space
- Expected: Track scrolls left by scroll step
- Expected: Arrow states update

### F-8: Resize recalculation
- Setup: Scroll to middle state
- Action: Trigger resize event (e.g., window.resizeBy) — debounce 150ms applies
- Expected: `_calcState()` runs after 150ms (debounced)
- Expected: Arrow states recalculate based on new scroll position relative to potentially-changed clientWidth
- Expected: State remains consistent even if resize doesn't change the visual scroll position

### F-9: Disabled arrow button opacity (visual state)
- Setup: Scroll to start (prev disabled) or end (next disabled)
- Expected: Disabled arrow has `opacity: 0.4` (via `data-[state=*-disabled]:tw-opacity-40`)
- Expected: Disabled arrow has `pointer-events: none` (via `data-[state=*-disabled]:tw-pointer-events-none`)
- Expected: Disabled arrow has `cursor: default` (via `data-[state=*-disabled]:tw-cursor-default`)

### F-10: Reduced-motion preference respected
- Setup: Emulate `prefers-reduced-motion: reduce`
- Action: Click next arrow
- Expected: `scrollBehavior` argument to `scrollBy` is `'auto'` (not `'smooth'`)
- Expected: Scroll is instant (no animation)

### F-11: No arrows present when show_arrows=false
- Setup: Template setting `show_arrows: false` (requires template variant)
- Expected: `[data-arrow="prev"]` and `[data-arrow="next"]` elements absent from DOM
- Expected: Section renders normally without carousel controls
- Expected: JS init completes without errors (detects missing arrows gracefully)

### F-12: Scroll event listener triggered by manual scroll
- Setup: Use `page.evaluate` to manually call `track.scrollLeft = value`
- Action: Programmatically scroll track to middle
- Expected: scroll event fires
- Expected: `_calcState()` runs
- Expected: Arrow states update to reflect new scroll position

## G — Integration (end-to-end user journeys)

### G-1: Full carousel cycle — start → end → start
- Setup: Page loads; prev disabled, next enabled
- Step 1: Click next repeatedly until next button disables
- Step 2: Verify next button disabled, prev button enabled
- Step 3: Click prev repeatedly until at start
- Step 4: Verify prev button disabled, next button enabled
- Assertion: Full scroll cycle completes without console errors, all state transitions occur

### G-2: Keyboard-only carousel navigation
- Setup: Focus track region via Tab
- Step 1: Tab to next button, press Enter
- Step 2: Tab/Shift+Tab to prev button, press Space
- Step 3: Alternate keyboard navigation multiple times
- Assertion: Track scrolls correctly, focus remains visible on buttons, all state transitions occur

### G-3: Mobile arrow visibility — arrows hidden on mobile, visible on tablet+
- Setup: Load page at mobile breakpoint (390px)
- Assertion: Arrows are `display: none` (via `tw-hidden md-small:tw-flex`)
- Step 1: Resize to tablet breakpoint (768px)
- Assertion: Arrows are visible, clickable, and functional
- Step 2: Resize back to mobile
- Assertion: Arrows hidden again, no JS errors

### G-4: Carousel with few tiles (no scroll needed)
- Setup: Load page variant with ≤ 4 tiles (tiles fit entirely in viewport without scroll)
- Assertion: `scrollLeft + clientWidth >= scrollWidth` is true (at "end" naturally)
- Expected: Next button renders disabled from mount
- Action: Click prev button (should exist; should be disabled if at start)
- Assertion: No unwanted scroll, states remain consistent

### G-5: Tile click navigates (tile link functional)
- Setup: Page loads with tiles
- Action: Click a tile card (via `[data-track] a` or similar tile wrapper)
- Expected: Navigation occurs to the tile's `link` URL
- Assertion: Carousel scroll controller does not prevent default link navigation

## Design content reference
Pulled from brief.md for test-template populate + visual QA reference.

**Header:**
- Heading text: `Shop By Category`
- CTA label: `View More`
- CTA URL: `/collections/all`

**Tiles (6 dummy seed):**
1. Label: `Indoor Air Quality`
2. Label: `Split Systems`
3. Label: `Packaged Terminal Systems`
4. Label: `Scratch and Dent`
5. Label: `Portable Ac System`
6. Label: `HVAC Parts - Accessories`

**Typography:**
- Heading: DM Sans Bold 48/52.8 @ desktop, 32/36 @ mobile; color #0b1e3d
- CTA: DM Sans Bold 16/20; color #000; capitalize, 1px underline
- Tile label: DM Sans Medium 15/24; color #000

**Colors:**
- Section background: #f4f6f8
- Arrow idle: #f4f6f8, border rgba(0, 0, 0, 0.2)
- Arrow disabled opacity: 40%

**Spacing:**
- Section padding: 40px top / 30px bottom / 20px sides @ mobile; 60px top / 40px bottom / 50px sides @ desktop
- Inner max-width: 1338px @ lg+
- Gap between header & tiles: 32px (tw-gap-8)
- Arrow buttons: 48px circle @ tablet+; hidden @ mobile

## Test runner checklist
- yarn playwright:test features/collection-grid/*.spec.js --reporter=list
- All functional tests pass (state transitions, scroll behavior)
- All integration tests pass (user journeys)
- a11y violations logged to qa/a11y-*.json
- maxFailures: 1 active

## Questions
None. Component API and JS implementation are complete.
