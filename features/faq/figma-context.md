# figma-context.md — faq

Canonical Figma design reference for the FAQ section ("The AC Outlet Advantage"). VALUES only — DOM structure decided by ui-agent.

## Source nodes

| Breakpoint | fileKey | nodeId | URL |
|---|---|---|---|
| Desktop (1440) | g3gxO3mhrniJOYTHNmotAu | 5654:6499 | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-6499 |
| Mobile (390) | g3gxO3mhrniJOYTHNmotAu | 5654:53659 | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-53659 |

Reference PNGs: `qa/figma-desktop.png`, `qa/figma-mobile.png`.

Figma `get_variable_defs` returned `{}` for both nodes — tokens are raw hex. Map to `tailwind.config.js` tokens where possible; fall back to arbitrary values where no token exists.

---

## Section layout

| Property | Desktop | Mobile |
|---|---|---|
| Background | `#ffffff` | `#ffffff` |
| Horizontal padding | `50px` | `16px` |
| Vertical padding | `60px` top + bottom | `30px` top + bottom |
| Container alignment | flex-col, items-center | flex-col, items-start |
| Header → list spacing (pb on header container) | `32px` | `24px` |
| Items gap (first-open variant only) | `12px` between rows | `0` (tight stack) |

---

## Heading ("The AC Outlet Advantage")

| Property | Desktop | Mobile |
|---|---|---|
| Font family | DM Sans | DM Sans |
| Weight | Bold (700) | Bold (700) |
| Size | `48px` | `28px` |
| Line-height | `52.8px` (1.1) | `33.6px` (1.2) |
| Color | `#0b1e3d` (navy; closest theme token: `ah-navy #092846` — NOTE hex mismatch, planner must flag) | `#000000` |
| Letter-spacing | 0 | 0 |
| `fontVariationSettings` | `'opsz' 14` | `'opsz' 14` |
| Copy | "The Ac Outlet Advantage" (sic — lowercase "c") | "The AC Outlet Advantage" |

Copy casing differs across breakpoints in Figma — ui-agent should treat as a single merchant-provided string ("The AC Outlet Advantage") and ignore the desktop typo.

---

## FAQ row — question/summary

| Property | Desktop (open state) | Desktop (closed state) | Mobile |
|---|---|---|---|
| Font family | DM Sans | DM Sans | DM Sans |
| Weight | Medium (500) | Medium (500) | Medium (500) |
| Size | `18px` | `18px` | `16px` |
| Line-height | `20px` | `20px` | `26px` |
| Letter-spacing | `-0.72px` (-4%) | `-0.72px` | 0 |
| Color | `#000000` | `#000000` | `#000000` |
| Padding-top (summary row) | `16px` | `12px` | `12px` |
| Padding-bottom (summary row) | `17px` | `17px` | `12.8px` |
| Border-bottom color | `#000000` solid | `rgba(0,0,0,0.2)` solid | `rgba(0,0,0,0.2)` solid |
| Border-bottom width | `1px` | `1px` | `0.8px` |
| `min-height` of row | — | — | `50px` |
| Icon size | `20×20px` | `20×20px` | ~`16×16px` (width 10.6–14.7px, height 16px — vector glyph bounds) |
| Icon style (expanded) | minus (horizontal bar) | — | — |
| Icon style (collapsed) | plus (cross) | plus | plus |
| Alignment | space-between, vertically centered | space-between | space-between |

Rule ui-agent/planner must encode: row with `aria-expanded="true"` uses solid-black 1px bottom border + minus icon + deeper padding-top; closed rows use rgba(0,0,0,0.2) border + plus icon.

---

## FAQ row — answer body

Only the first (default-open) row has an answer visible in Figma. Remaining rows present closed.

| Property | Desktop |
|---|---|
| Font family | DM Sans |
| Weight | Regular (400) |
| Size | `16px` |
| Line-height | `20px` |
| Letter-spacing | `-0.16px` (-1%) |
| Color | `#666666` |
| Padding-top (inside answer slot) | `16px` |
| Padding-right (inside answer slot) | `700px` — **do not reproduce as fixed value; constrains line-length.** Convert to `max-width ~640px` or fluid `pr-0` within container. Document conversion in brief §DEVIATIONS. |
| Link decoration | `underline` solid, skip-ink: none | 
| Link color | `#666666` (inherits) | 
| Link tracking | `-0.16px` |

### Copy (first answer — desktop only)

```
Looking for reliable AC equipment at great prices? At The AC Outlet, we've got you covered! Whether you're a homeowner, business owner, real estate investor, property manager, or HVAC contractor, we make it easy to find the right [cooling and heating units] and pre-matched, [AHRI-rated systems] at affordable prices. We make sure your order gets to you fast, with distribution centers nationwide ready to deliver in as little as 2-5 business days for in-stock items. Plus, everything we sell is backed by manufacturer warranties, some lasting up to a lifetime. We even offer [extended labor warranty plans] to even further protect your purchase!
```

Inline links (underlined, same paragraph):
- `cooling and heating units` → https://www.theacoutlet.com/individual-ac-components.html
- `AHRI-rated systems` → https://www.theacoutlet.com/complete-ac-systems.html
- `extended labor warranty plans` → https://www.theacoutlet.com/extended-labor-warranty-plans.html

All three open in new tab (`target="_blank"`).

---

## Question strings (all 4, per breakpoint)

| # | Desktop | Mobile |
|---|---|---|
| 1 | Wholesale HVAC Equipment for All of Your Cooling & Heating Needs | Wholesale HVAC Equipment for All of Your Cooling & Heating Needs (wraps to 2 lines) |
| 2 | Find What You Need at Our Online AC Supply Store | Find What You Need at Our Online AC Supply Store |
| 3 | We Offer a Wide Variety of HVAC Products | We Offer a Wide Variety of HVAC Products |
| 4 | A Combination of Convenience & Customer Support at Wholesale Prices | A Combination of Convenience & Customer Support at Wholesale Prices (wraps to 2 lines) |

Question copy identical across breakpoints; mobile simply wraps.

---

## Cross-breakpoint deltas

- **Heading size:** 48px desktop → 28px mobile (≈58%)
- **Heading color:** `#0b1e3d` desktop → `#000000` mobile (design inconsistency — planner should flag, ui-agent should pick ONE per schema setting)
- **Question size:** 18px desktop → 16px mobile; line-height 20px → 26px (much taller on mobile for multi-line wrap)
- **Icon size:** 20px desktop → ~16px mobile
- **Border width:** 1px desktop → 0.8px mobile
- **Section padding:** `50px/60px` → `16px/30px`
- **Header → list gap:** 32px → 24px
- **First-row open state:** present on desktop, absent on mobile (all closed). ui-agent should treat default-open as a per-item schema setting (checkbox), not hardcoded to row 1.
- **Answer body:** only authored for row 1 on desktop. Mobile answer content not in Figma; merchant fills via settings (will render identical content underneath at mobile width).

---

## Token mapping (raw hex → tailwind.config.js)

| Raw Figma value | Proposed token | Notes |
|---|---|---|
| `#ffffff` bg | tailwind default `white` | — |
| `#0b1e3d` heading (desktop) | `ah-navy` (`#092846`) — **hex differs** | Planner must decide: ask merchant? adopt Figma `#0b1e3d` via arbitrary value `tw-text-[#0b1e3d]`? or align Figma to `ah-navy`? |
| `#000000` heading (mobile) / question / border | `tw-text-black` / `tw-border-black` | — |
| `#666666` answer body / link | arbitrary `tw-text-[#666]` — no existing token | Candidate for new `body-muted` token; out of scope this feature |
| `rgba(0,0,0,0.2)` closed-row border | arbitrary `tw-border-black/20` | — |
| `DM Sans` font | not in `tailwind.config.js` `fontFamily.sans` (currently Helvetica Neue) | Planner must confirm DM Sans is loaded at theme level OR add via theme `font_picker`; otherwise falls back to Helvetica Neue. Document in brief §DEVIATIONS. |

---

## Accessibility notes (ui-agent / js-agent decisions)

- Each row is a disclosure. Use `<button>` with `aria-expanded` + `aria-controls` pointing to the answer panel id.
- Answer panel should use `hidden` attribute (boolean) — existing `js/components/ui-components.js` `[data-accordion]`/`[data-accordion-target]` pattern already toggles `panel.hidden` and `aria-expanded`. Reuse verbatim.
- Section root should have `aria-labelledby` pointing to the heading id.
- Minus/plus icon rotation (or icon swap) must not be the only affordance — `aria-expanded` carries semantic state.
- Keyboard: space/enter toggles; no `Tab`/arrow navigation required beyond browser default (items are independent buttons).

---

## Figma vs. live DOM variance the planner should expect

- Figma width `370.4px` on the mobile list container is an artifact of layout-constraints inside the Figma frame — treat as `100%` in code.
- Figma `pr-[700px]` on desktop answer slot constrains measure to ~640px line length. Translate to `md:tw-max-w-[640px]` on answer text OR leave answer at natural flow — whichever the ui-agent judges cleaner.
- Figma uses raw absolute widths (`w-[333px]`, `w-[330px]`) on mobile question text — ignore, use natural wrapping.
