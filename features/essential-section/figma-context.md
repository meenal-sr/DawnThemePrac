# figma-context.md — essential-section

Canonical design data. Main prefetched from Figma. Do NOT prescribe DOM structure; ui-agent decides.

## Figma sources

| Breakpoint | URL | Node ID | Reference PNG |
|---|---|---|---|
| Desktop 1440w | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-6459 | `5654:6459` | `qa/figma-desktop.png` |
| Mobile 390w | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-53606 | `5654:53606` | `qa/figma-mobile.png` |

## Figma variables

| Token | Value | Used |
|---|---|---|
| `radius/xl` | `12px` | Desktop card border-radius |

Mobile card radius: `8px` (raw — no Figma variable).

## Colors

| Role | Hex | Used |
|---|---|---|
| Section background | `#f4f6f8` | Desktop wrapper (mobile uses white / `transparent` — base page bg) |
| Card background | `#ffffff` | Desktop + mobile |
| Heading | `#0b1e3d` (desktop) / `#000000` (mobile) | h2 heading |
| Description | `#666666` (desktop) / `#000000` (mobile) | Subheading under heading |
| Card title | `#000000` | Card headline |
| Card body | `#666666` (desktop) / `#515151` (card1 mobile) / `#666666` (cards 2,3 mobile) | Card description |
| Card link | `#000000` | "Learn More" underlined link |
| Button background | `#027db3` | Primary CTA button |
| Button label | `#f4f6f8` (desktop) / `#ffffff` (mobile) | Button text |

Mobile card body color is inconsistent between card 1 (`#515151`) and cards 2/3 (`#666666`) in Figma — treat this as design noise, use `#666666` uniformly to match desktop.

## Typography

Font family across all text: **DM Sans**, variable-font `opsz 14`.

### Desktop (1440w)

| Element | Size / Line-height | Weight | Color | Transform |
|---|---|---|---|---|
| Heading "HVAC Essentials" | 48 / 52.8 | Bold 700 | `#0b1e3d` | — |
| Description | 16 / 20 | Medium 500 | `#666` | — |
| Button "Learn More" | 16 / 28 | Bold 700 | `#f4f6f8` | capitalize |
| Card icon | — | — | — | SVG 50×50 |
| Card title | 20 / 28 | Bold 700 | `#000` | capitalize |
| Card body | 16 / 20 | Medium 500 | `#666` | — |
| Card "Learn More" | 16 / 20 | Medium 500 | `#000` | underline |

### Mobile (390w)

| Element | Size / Line-height | Weight | Color | Transform |
|---|---|---|---|---|
| Heading "HVAC Essentials" | 28 / 33.6 | Bold 700 | `#000` | — |
| Description | 15 / 24 | Regular 400 | `#000` | — |
| Button "Learn More" | 15 / 30 | Bold 700 | `#ffffff` | capitalize |
| Card icon | — | — | — | SVG 50×50 |
| Card title | 16 / 26 | Bold 700 | `#000` | capitalize |
| Card body | 15 / 24 | Regular 400 | `#666` | — |
| Card "Learn More" | 15 / 20 | Medium 500 | `#000` | underline |

## Spacing + layout

### Desktop (1440w)

| Region | Value |
|---|---|
| Section `px` / `py` | `pl/pr 50` / `pt 60 pb 40` |
| Section BG | `#f4f6f8` |
| Inner frame width | `1340px` fixed, `flex items-center justify-between` |
| Left column width | `305px` — flex-col gap-32 |
| Left inner (heading block) | flex-col gap-16 (heading → description) |
| Right column | `flex items-center gap-16` — 3 cards side-by-side |
| Card width | `306px` fixed |
| Card padding | `p-20` |
| Card border-radius | `12px` (Figma `radius/xl`) |
| Card inner | `flex-col gap-38 items-start w-[266px]` |
| Top block (icon + title + body) | flex-col gap-12 |
| Icon size | `50×50` |
| Button | `bg-[#027db3] h-48 rounded-[100px] px-32 max-w-280 items-center justify-center flex` |

### Mobile (390w)

| Region | Value |
|---|---|
| Section `py` | `pt 30 pb 30` (no outer horizontal padding at section root) |
| Header container | `w-full px-16 flex-col gap-12 items-start pb-24` |
| Header inner | flex-col gap-12 (heading → description) |
| Button | `bg-[#027db3] px-31.8 py-8 rounded-[100px] max-w-[358.4]` (effectively full-width in viewport) |
| Cards slider | `w-full px-16` overflow-x horizontal scroll |
| Cards row | `flex gap-12 items-start justify-center` |
| Card width | `265.46px` (round to 265 or ~266) |
| Card padding | `px-16 py-24` |
| Card border-radius | `8px` (inner Background div) + `10px` on outer wrapper (visual match → use 8px) |
| Card top spacing | icon 50×50 → margin pb-16 → title → pt-8 → body → gap-8 → Learn More |

## Cross-breakpoint deltas

| Axis | Desktop | Mobile |
|---|---|---|
| Layout | Row — left column + 3 cards right | Stack — header block, then horizontal scroll of cards |
| Section BG | `#f4f6f8` | Transparent (inherits page) |
| Heading size | 48/52.8 | 28/33.6 |
| Heading color | `#0b1e3d` | `#000` |
| Description size/color | 16/20 `#666` medium | 15/24 `#000` regular |
| Button | 48px h, px-32 pill, max-w-280 | smaller padding, full-width-ish |
| Card count visible | 3 side-by-side | 2.x visible, slider scroll |
| Card radius | 12px | 8px |
| Card width | 306 | 265.46 |
| Card padding | p-20 | px-16 py-24 |
| Card title size | 20/28 | 16/26 |
| Card body color | `#666` | `#666` (use `#666` uniformly even though Figma card 1 uses `#515151`) |
| Card gap (image→title→body) | gap-12 + gap-38 (bottom link) | custom spacing (pb-16 icon, pt-8 title→body) |
| Cards gap | 16 | 12 |

## Copy (ground truth)

**Section:**
- Heading: `HVAC Essentials`
- Description: `Understand efficiency standards, incentives, and new refrigerant changes so you can make a confident, informed HVAC purchase.`
- Button label: `Learn More`

**Cards (3 in Figma):**
1. **What is SEER2?** — `Learn how SEER2 ratings affect energy efficiency, performance, and your long-term energy costs.` — `Learn More`
2. **HVAC Rebates** — `See what local incentives may be available when upgrading to high-efficiency systems.` — `Learn More`
3. **New Refrigerant Updates** — `Understand the transition to R32 and R454B refrigerants and what it means for your system.` — `Learn More`

Mobile Figma frame shows the 3rd card duplicated as "HVAC Rebates" — that's a Figma prototype glitch, not a distinct card. Use the 3 card copy above (SEER2 / Rebates / Refrigerant).

## Imagery

Icons (50×50 SVG):
- Per user memory binding (`feedback_never_export_figma_assets`): NEVER auto-export the Figma icon to `/assets/`. Use `image_picker` schema settings per-card — merchant uploads their own icon.
- Figma shows all 3 cards using the SAME icon placeholder (Frame241 SVG — possibly a "device" glyph). In production, merchant will set distinct icons per card.

## Interactions

- **Button** — primary CTA, links to section-settings `cta_link` URL.
- **Card "Learn More"** — secondary link, each card has independent `link_url`.
- **Swiper-carousel on mobile** — horizontal scroll through cards. User directive during intake: "use swiper-carousel". Consistent with project pattern (see `reference_new_theme.md` — carousel as reusable custom element).
- **Desktop:** fixed 3-card row with `justify-between` within 1340px frame. Swiper-carousel MAY still be used for desktop if merchant adds >3 cards, or kept static if ≤3.

## Dev annotations

Mobile Figma frame includes annotation data-name="`multicolumn-icon`" on the cards slider wrapper (`5654:53618`) — schema naming hint.
