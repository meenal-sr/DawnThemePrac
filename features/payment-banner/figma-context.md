# figma-context.md — payment-banner

Canonical design reference. Downstream agents reference VALUES here — do not duplicate.

## Figma sources

| Breakpoint | Node ID | URL |
|---|---|---|
| Desktop | `5654:6312` | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-6312&m=dev |
| Mobile | `5654:53417` | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-53417&m=dev |

Reference PNGs: `qa/figma-desktop.png` (1440 wide), `qa/figma-mobile.png` (390 wide). File key: `g3gxO3mhrniJOYTHNmotAu`.

## Figma tokens
- `radius/2xl: 16` (card corners)
- `radius/lg: 8` (desktop card-2 logos-panel bottom-left)

---

## Desktop (5654:6312)

### Section
- Bg `#ffffff`, padding 60/40/50, vertical stack gap 24

### Intro
- Max-width 591, gap 12
- **H2**: `Easy Monthly Payments` — DM Sans Bold `48`/`52.8`, `#0b1e3d`
- **Subhead** (2 lines): `Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront.` — DM Sans Medium `16`/`20`, `#666`

### Card row
Fixed inner 1340px, horizontal flex, gap 30.

### Card 1 — Pricing (920×573)
- Bg `#f2f0f1`, rounded 16
- Bg treatment: composite image with text overlay (product shot + callout + decorative SVG vector are baked into the merchant-uploaded composite — per convention, ONE image_picker with text overlay)

**Content overlay** (absolute, left 40 / top 40, width 420, gap 32; inner gap 16):
- Eyebrow: `MEMBER PRICING UNLOCKED` — DM Sans Bold `13`/`20`, `#000`, all-caps (desktop-only — never renders mobile)
- Title: `Prices Too Low to Show Publicly` — DM Sans Bold `48`/`52.3`, `#0b1e3d`, width 411
- Body: `Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price.` — DM Sans Regular `16`/`20`, `#666`
- Button: `Learn More` — bg `#027db3`, 1px border `#f4f6f8`, h 48, px 33, rounded 100, max-w 280. Label DM Sans Bold `16`/`28`, `#f4f6f8`, capitalize.

### Card 2 — Financing (390×573)
- Outer bg white, rounded 16
- Inner cyan layer `#6bc4e8`
- Two decorative vertical bars (right edge): `#0033a1` 21×400 (top-anchor), `#f75200` 21×178 (below, through bottom)
- White bottom-left logos panel 369×173, 1px border `#6bc4e8`, bottom-left radius 8; contains a `logos_image` (298×79 centered — merchant uploads)

**Content overlay** (absolute, left 40 / top 40.22, width 300, gap 32; inner gap 12):
- Title: `Flexible Payments, Made Easy` — DM Sans Bold `48`/`52.3`, `#f4f6f8`
- Body: `Get approved for lease-to-own financing with no credit needed.\nQuick application, instant decisions, and flexible payment options.` — DM Sans Regular `16`/`20`, `#f4f6f8`
- Button: `Learn More` — bg `#f4f6f8`, 1px border `#f4f6f8`, h **38** (smaller than card-1's 48), px 21, rounded 100. Label DM Sans Bold `16`/`28`, `#000`, capitalize.

---

## Mobile (5654:53417)

### Section
- Bg `#ffffff`, padding 30/16, items center, gap 24

### Intro
- Width 358, h 118, pb 24, gap 8
- **H2**: `Easy Monthly Payments` — DM Sans Bold `28`/`33.6`, `#000`
- **Subhead**: same copy as desktop — DM Sans Regular `15`/`24`, `#515151`

### Card stack (vertical, gap 20)

### Card 1 — Pricing (mobile, 358.4×408.89)
- Rounded 8, composite bg image (merchant-uploaded) with text overlay
- NO eyebrow on mobile

**Content** (padding 20h/30v, width 309, gap 12):
- Title: `Prices Too Low to Show Publicly` — DM Sans Bold `28`/`33.6`, `#000`
- Body: `Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price.` — DM Sans SemiBold `15`/`24`, `#515151`
- Button: `Learn More` — bg `#027db3`, h 48, px 31.8, rounded 100. Label DM Sans Bold `15`/`30`, `#fff`, capitalize.

### Card 2 — Financing (mobile, 370.4×408.89)
- Rounded 8, full-cover merchant-uploaded bg image (replaces desktop's cyan + bars + logos panel treatment)

**Content** (padding 20h/30v, width 316, gap 12):
- Title: `Flexible Payments, Made Easy` — DM Sans Bold `28`/`33.6`, `#fff`
- Body: `Get approved for lease-to-own financing with no credit needed. Quick application, instant decisions, and flexible payment options.` — DM Sans SemiBold `15`/`24`, `#fff`
- Button: `Learn More` — bg `#f4f6f8`, h **48** (full — desktop was 38), px 31.8, rounded 100. Label DM Sans Bold `15`/`30`, `#000`, capitalize.

---

## Cross-breakpoint deltas

| Concern | Desktop | Mobile |
|---|---|---|
| Layout | row, 920+390 (1340 inner) | vertical stack |
| Section padding | 60/40/50 | 30/16 |
| H2 | 48/52.8 `#0b1e3d` | 28/33.6 `#000` |
| Subhead | 16/20 Medium `#666` | 15/24 Regular `#515151` |
| Card 1 title | 48/52.3 `#0b1e3d` | 28/33.6 `#000` |
| Card 1 eyebrow | PRESENT | **ABSENT** |
| Card 1 body | 16/20 Regular `#666` | 15/24 SemiBold `#515151` |
| Card 1 button label | 16/28 | 15/30 |
| Card 2 bg | cyan `#6bc4e8` + decorative bars + logos panel | full-cover merchant image |
| Card 2 title color | `#f4f6f8` | `#fff` |
| Card 2 button height | **38** | **48** |

**Divergence: HIGH** — dual-DOM per card warranted at `md:` (1024).

---

## Copy table (test-agent ground truth)

| Field | Desktop | Mobile |
|---|---|---|
| heading | Easy Monthly Payments | (same) |
| subheading | Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront. | (same) |
| card_1_eyebrow | MEMBER PRICING UNLOCKED | (absent) |
| card_1_title | Prices Too Low to Show Publicly | (same) |
| card_1_body | Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price. | (same) |
| card_1_cta_label | Learn More | (same) |
| card_2_title | Flexible Payments, Made Easy | (same) |
| card_2_body | Get approved for lease-to-own financing with no credit needed.\nQuick application, instant decisions, and flexible payment options. | (same) |
| card_2_cta_label | Learn More | (same) |

---

## Fonts + colors

DM Sans (Bold/Medium/Regular/SemiBold), opsz 14. Global.
Colors: `#0b1e3d` `#666` `#515151` `#f4f6f8` `#000` `#fff` `#f2f0f1` `#6bc4e8` `#0033a1` `#f75200` `#027db3`
