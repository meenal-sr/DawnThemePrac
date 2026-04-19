# brief.md — payment-banner

## 1. Intent

Decorative marketing section promoting two merchant finance programs side-by-side: **Member Pricing** (wholesale rates revealed post-cart-add) and **Lease-to-Own Financing** (no-credit-needed flexible payments). Targets page-template contexts where the merchant wants to surface both value props in a single screen slot. Non-interactive beyond the two CTA anchors — one per card, linking to the merchant's program landing pages. Desktop shows both cards horizontally (920+390 inner row); mobile stacks them vertically with a different bg treatment for card 2.

---

## 2. Design reference

Source of truth — do NOT duplicate values:

- `features/payment-banner/figma-context.md` — all typography, color hex, spacing px, copy strings, token names, per-breakpoint deltas
- `features/payment-banner/qa/figma-desktop.png` — 1440-wide desktop reference
- `features/payment-banner/qa/figma-mobile.png` — 390-wide mobile reference

Figma nodes: desktop `5654:6312`, mobile `5654:53417` (file `g3gxO3mhrniJOYTHNmotAu`).

**Divergence: HIGH.** The two breakpoints differ in:
- Overall layout (horizontal row ↔ vertical stack)
- Card 1 eyebrow: present on desktop, absent on mobile
- Card 1 title color: `#0b1e3d` desktop vs `#000000` mobile
- Card 2 background treatment: **solid cyan + decorative bars + white logos panel** on desktop vs **full-cover marketing image** on mobile (fundamentally different DOM content)
- Card 2 CTA height: 38 desktop vs 48 mobile

**Directive to ui-agent:** Use **dual-DOM** per card, toggled at `md:` (1024px) per project convention. Single-DOM + CSS-only responsive cannot cleanly swap card-2's bg from "cyan + inline SVG bars + nested logos panel" to "full-cover image" without structural branching.

---

## 3. Schema plan

Flat section settings, no blocks. The two cards are structurally distinct (different visual treatments, different content roles) and the template is fixed at 2 cards — not a repeatable pattern.

### 3.1 Intro
| Setting ID | Type | Purpose |
|---|---|---|
| `heading` | text | Section H2 |
| `subheading` | textarea | Two-line subhead under H2 |

### 3.2 Card 1 — Pricing (text)
| Setting ID | Type | Purpose |
|---|---|---|
| `card_1_eyebrow` | text | All-caps eyebrow above card-1 title. **Desktop-only** — blank string hides the element; also hidden on mobile regardless of value |
| `card_1_title` | text | Card-1 H3 |
| `card_1_body` | textarea | Card-1 body paragraph |
| `card_1_cta_label` | text | Pill CTA label |
| `card_1_cta_link` | url | Pill CTA href |

### 3.3 Card 1 — Pricing (imagery)
| Setting ID | Type | Purpose |
|---|---|---|
| `card_1_product_image` | image_picker | Product shot behind/beside content |
| `card_1_callout_image` | image_picker | Small callout graphic, top-right area (optional) |

### 3.4 Card 2 — Financing (text)
| Setting ID | Type | Purpose |
|---|---|---|
| `card_2_title` | text | Card-2 H3 |
| `card_2_body` | textarea | Card-2 body paragraph |
| `card_2_cta_label` | text | Pill CTA label |
| `card_2_cta_link` | url | Pill CTA href |

### 3.5 Card 2 — Financing (imagery, breakpoint-specific)
| Setting ID | Type | Purpose |
|---|---|---|
| `card_2_logos_image` | image_picker | Partner-logos image inside the white bottom-left panel. **Desktop-only** — not rendered in mobile DOM |
| `card_2_mobile_bg_image` | image_picker | Full-cover marketing image background. **Mobile-only** — desktop uses inline cyan bg + SVG bars instead |

### 3.6 Aspect ratio
No `aspect_ratio` settings. Each image_picker slot is naturally per-breakpoint-assigned (not the desktop/mobile/ratio triplet case described in `reference_image_stack.md`) — aspect is dictated by the fixed card geometry. ui-agent hardcodes container proportions.

### 3.7 Inline decorative elements (NO schema)
Built in code by ui-agent — merchant cannot edit:
- **Card 1 desktop:** decorative SVG vector (437×216, upper-right) — inline SVG
- **Card 2 desktop:** dark-blue vertical bar (`#0033a1` 21×400) + orange bar (`#f75200` 21×178) — Tailwind-utility divs or inline SVG

### 3.8 Preset
Single preset `Payment Banner`. Enabled on `page` templates. `presets` block in schema.

---

## 4. Variants and states

| Variant | Trigger | Visual behavior |
|---|---|---|
| Default | All fields populated | Both cards render as per figma-context.md |
| Blank eyebrow | `card_1_eyebrow` empty | Desktop card-1 hides eyebrow line; vertical rhythm collapses to title-first. Mobile unaffected (already hidden). |
| Blank cta_link | `card_X_cta_link` empty | Render CTA pill as non-interactive element (no `<a>` wrapper, or `<span>`) — no dead link |
| Blank cta_label | `card_X_cta_label` empty | Suppress entire CTA pill — no empty pill shown |
| Blank `card_1_product_image` | image_picker empty | Hide product-image slot. Card-1 still readable (text-only layout degrades gracefully) |
| Blank `card_1_callout_image` | image_picker empty | Hide callout slot. Decorative SVG still renders (it's inline, not from schema) |
| Blank `card_2_logos_image` | image_picker empty | Hide partner-logos image inside the white panel (panel itself still renders desktop-side) |
| Blank `card_2_mobile_bg_image` | image_picker empty | **Fallback required** — this is the only bg on mobile for card 2. ui-agent uses fallback solid color `#6bc4e8` (card-2 desktop cyan token) so text stays readable. No broken-image placeholder. |

No JS-driven states. All variant logic is Liquid conditionals.

---

## 5. Accessibility

**Mode: skip** (not required). Planner still records baseline expectations for ui-agent / visual-qa:

- `<h2>` for intro heading, `<h3>` for each card title
- Eyebrow (`card_1_eyebrow`) is **not** a heading — render as `<p>` or `<span>` styled uppercase
- Single `<a>` per CTA wrapping a `<span>` pill (or `<button>`-less, anchor-only — no JS)
- Decorative SVG vector + colored bars: `aria-hidden="true"`, `role="presentation"`
- `card_1_product_image` / `card_1_callout_image`: descriptive alt from Shopify `alt` metadata (fallback empty for purely decorative)
- `card_2_logos_image`: descriptive alt (e.g. "Accepted financing partners") — meaningful content
- `card_2_mobile_bg_image`: `alt=""` if purely atmospheric, or descriptive alt if it carries info; ui-agent decides based on actual asset
- Focus-visible ring on CTAs using project's focus utility

---

## 6. JavaScript

**NO.** Section is static display. Two anchor CTAs are native HTML links. No state machine, no events, no fetch, no DOM manipulation. js-agent is not needed in the pipeline for this section.

---

## 7. Copy

Canonical strings live in `figma-context.md` § "Source-of-truth copy table". test-agent reads that table directly; ui-agent uses those strings as schema `default` values.

Per-breakpoint copy differences: none. All text fields are identical desktop ↔ mobile; only styling (size/color/weight) diverges. Card-1 eyebrow is the sole element that exists on one breakpoint and not the other.

---

## 8. Data sources

| Source | Usage |
|---|---|
| `section.settings` | All content — intro text, card text, CTA labels/links, image_picker slots |
| `section.settings.*_image` (via Shopify image object) | Src + alt for each image_picker slot, at responsive widths chosen by ui-agent |
| page context / metafields | None |
| fetch / API | None |

---

## 9. Success criteria

- Desktop renders side-by-side layout matching `qa/figma-desktop.png` within visual-qa pixelmatch threshold (project default)
- Mobile renders stacked layout matching `qa/figma-mobile.png` within threshold
- Dual-DOM swap happens cleanly at `md:` (1024px) — no flash of wrong-breakpoint content, no both-DOMs-visible window
- All schema settings editable in theme editor; preview updates without theme reload
- Blank-field variants (§4) degrade gracefully — no empty pills, no broken-image icons, no dead links
- HTML parses without Liquid validation errors (main runs `shopify-dev-mcp.validate_theme` loop)

---

## 10. Constraints and assumptions

- **Template:** `page` only. Section presets enabled on `page` template; not auto-included in `product` / `collection`.
- **Standalone.** No cross-section event contracts, no shared state, no inter-section dependencies. Architect does not need to build a cross-section contract table for this section.
- **Fonts:** DM Sans (Bold / Medium / Regular / SemiBold) assumed loaded globally by theme. ui-agent does not add `@font-face` — font loading is out of scope per project convention.
- **Tailwind-first:** All styling via `tw-` prefixed utilities using tokens in `tailwind.config.js`. SCSS escape hatch only if Tailwind cannot express a value — ui-agent's call.
- **No asset bundling:** All photographic imagery is `image_picker` — merchant-owned, not checked into `/assets/`. Inline decorative shapes (SVG vector, colored bars) are code, not assets.
- **No JS bundle:** js-agent skipped. No entry in `js/sections/`. No `assets/payment-banner.js`.
- **Reuse:** Architect scans for reusable pill-CTA snippet, image_picker-with-fallback helper, and intro-block pattern from prior sections. Planner flags `snippets/` and `js/components/` as likely homes for any extraction — architect owns that decision.
