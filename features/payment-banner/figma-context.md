# figma-context.md — payment-banner

Canonical design reference. Downstream agents reference VALUES here — do not duplicate into brief/ui-plan/test-scenarios.

## Figma sources

| Breakpoint | Node ID | URL |
|---|---|---|
| Desktop | `5654:6312` | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-6312&m=dev |
| Mobile | `5654:53417` | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-53417&m=dev |

Reference PNGs: `qa/figma-desktop.png` (1440 wide), `qa/figma-mobile.png` (390 wide). File key: `g3gxO3mhrniJOYTHNmotAu`.

## Figma tokens

- `radius/2xl: 16` (card corners both breakpoints)
- `radius/lg: 8` (desktop card-2 inner logos panel bottom-left radius)

---

## Desktop (node 5654:6312)

### Section container
- Background: `#ffffff`
- Padding: top 60, bottom 40, horizontal 50
- Vertical stack, gap 24px

### Intro block
- Max-width 591, gap 12
- **H2**: `Easy Monthly Payments` — DM Sans Bold `48px` / lh `52.8px`, color `#0b1e3d`
- **Subhead** (two lines): `Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront.` — DM Sans Medium `16px` / lh `20px`, color `#666`

### Card row
- Fixed inner width `1340px`, horizontal flex, gap 30, items center

### Card 1 — "Pricing" (wide, left)
- Dimensions: `920 × 573`
- Background: `#f2f0f1`
- Radius: `16px` (radius/2xl), overflow clipped

**Content block** (absolute, left 40 / top 40, width 420, gap 32, inner gap 16)
- **Eyebrow**: `MEMBER PRICING UNLOCKED` — DM Sans Bold `13px` / lh `20px`, color `#000000`, all-caps
- **Title**: `Prices Too Low to Show Publicly` — DM Sans Bold `48px` / lh `52.3px`, color `#0b1e3d`, width 411
- **Body**: `Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price.` — DM Sans Regular `16px` / lh `20px`, color `#666`
- **Button**: `Learn More` — bg `#027db3`, 1px border `#f4f6f8`, height 48, px 33, rounded 100px, max-w 280. Label: DM Sans Bold `16px` / lh `28px`, color `#f4f6f8`, capitalize.

**Decorative imagery (merchant-uploadable via image_picker settings per project convention):**
- Product image: desktop 519×402, positioned right of content
- Callout image: 254×100, top-right of card
- Decorative SVG vector (437×216, upper-right): inline SVG, not merchant-editable

### Card 2 — "Financing" (narrow, right)
- Dimensions: `390 × 573`
- Outer bg `#ffffff`, inner bg `#6bc4e8` (cyan), radius `16px` (radius/2xl), overflow clipped

**Decorative vertical bars (inline, right edge)**
- Dark-blue `#0033a1` 21×400, top-left to bottom
- Orange `#f75200` 21×178, bottom-right

**Inner logos panel** (white, bottom-left of card)
- Size 369×173, `1px` border `#6bc4e8`, bottom-left radius `8px` (radius/lg)
- Contains partner-logos image (298×79, centered) — merchant-uploadable

**Content block** (absolute, left 40 / top 40.22, width 300, gap 32, inner gap 12)
- **Title**: `Flexible Payments, Made Easy` — DM Sans Bold `48px` / lh `52.3px`, color `#f4f6f8`
- **Body**: `Get approved for lease-to-own financing with no credit needed.\nQuick application, instant decisions, and flexible payment options.` — DM Sans Regular `16px` / lh `20px`, color `#f4f6f8`
- **Button**: `Learn More` — bg `#f4f6f8`, 1px border `#f4f6f8`, height 38 (NOTE: smaller than card-1's 48), px 21, rounded 100px. Label: DM Sans Bold `16px` / lh `28px`, color `#000000`, capitalize.

---

## Mobile (node 5654:53417)

### Section container
- Background: `#ffffff`
- Padding: vertical 30, horizontal 16
- Vertical stack, items center, gap 24

### Intro block
- Height 118, pb 24, gap 8, width 358
- **H2**: `Easy Monthly Payments` — DM Sans Bold `28px` / lh `33.6px`, color `#000000`
- **Subhead**: `Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront.` — DM Sans Regular `15px` / lh `24px`, color `#515151`

### Card stack (vertical, gap 20)

### Card 1 — "Pricing" (mobile)
- Size: 358.4 × 408.89, rounded `8px`, overflow clipped
- Inner bg `#f2f0f1`
- Background imagery: product image (behind), decorative SVG (rotated -165°), small callout image — all merchant-uploadable or inline SVG per asset kind

**Content block** (over bg, padding 20h/30v, width 309, gap 12)
- **Title**: `Prices Too Low to Show Publicly` — DM Sans Bold `28px` / lh `33.6px`, color `#000000` (NOTE different from desktop `#0b1e3d`)
- **Body**: `Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price.` — DM Sans SemiBold `15px` / lh `24px`, color `#515151`
- **Button**: `Learn More` — bg `#027db3`, height 48, px 31.8, rounded 100, max-w 318.4. Label: DM Sans Bold `15px` / lh `30px`, color `#ffffff`, capitalize.

NOTE: Eyebrow ("MEMBER PRICING UNLOCKED") is ABSENT on mobile.

### Card 2 — "Financing" (mobile)
- Size: 370.4 × 408.89, rounded `8px`, mask-clipped
- Background: full-cover marketing image — merchant-uploadable (different from desktop's cyan+bars treatment)

**Content block** (over image, padding 20h/30v, width 316, gap 12)
- **Title**: `Flexible Payments, Made Easy` — DM Sans Bold `28px` / lh `33.6px`, color `#ffffff`
- **Body**: `Get approved for lease-to-own financing with no credit needed. Quick application, instant decisions, and flexible payment options.` — DM Sans SemiBold `15px` / lh `24px`, color `#ffffff`
- **Button**: `Learn More` — bg `#f4f6f8`, height 48 (NOTE: desktop was 38, mobile is full 48), px 31.8, rounded 100, max-w 318.4. Label: DM Sans Bold `15px` / lh `30px`, color `#000000`, capitalize.

---

## Cross-breakpoint delta notes (visual only — ui-agent decides DOM)

| Concern | Desktop | Mobile |
|---|---|---|
| Layout | 2 cards side-by-side (920 + 390) | 2 cards vertical stack |
| Section padding | 60/40/50 | 30/16 |
| Intro H2 size/color | 48/52.8 `#0b1e3d` | 28/33.6 `#000000` |
| Intro subhead | 16/20 Medium `#666` | 15/24 Regular `#515151` |
| Card 1 title | 48/52.3 `#0b1e3d` | 28/33.6 `#000000` |
| Card 1 eyebrow ("MEMBER PRICING UNLOCKED") | PRESENT | **ABSENT** |
| Card 1 body | 16/20 Regular `#666` | 15/24 SemiBold `#515151` |
| Card 1 button label size | 16/28 | 15/30 |
| Card 1 button border | 1px `#f4f6f8` | (none visible) |
| Card 2 background | solid `#6bc4e8` cyan + decorative bars + white logos panel | full-cover marketing image |
| Card 2 title color | `#f4f6f8` | `#ffffff` |
| Card 2 body size/weight | 16/20 Regular | 15/24 SemiBold |
| Card 2 button height | **38** | **48** |
| Card 2 logos panel + decorative bars | PRESENT | **ABSENT** (image bg takes the whole card) |

**Divergence: HIGH.** Layout flip + card-2 bg-treatment swap + card-1 eyebrow omission + CTA-height mismatch warrant dual-DOM per card toggled at `md:` (1024px) per project convention.

---

## Source-of-truth copy table

| Field | Desktop value | Mobile value |
|---|---|---|
| `heading` | Easy Monthly Payments | (same) |
| `subheading` | Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront. | (same) |
| `card_1_eyebrow` | MEMBER PRICING UNLOCKED | (absent) |
| `card_1_title` | Prices Too Low to Show Publicly | (same) |
| `card_1_body` | Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price. | (same) |
| `card_1_cta_label` | Learn More | (same) |
| `card_2_title` | Flexible Payments, Made Easy | (same) |
| `card_2_body` | Get approved for lease-to-own financing with no credit needed.\nQuick application, instant decisions, and flexible payment options. | (same) |
| `card_2_cta_label` | Learn More | (same) |

---

## Fonts

DM Sans (Bold / Medium / Regular / SemiBold), `opsz: 14`. Assumed globally loaded.

## Color tokens (for ui-agent Tailwind mapping)

`#0b1e3d` `#666` `#515151` `#f4f6f8` `#000000` `#ffffff` `#f2f0f1` `#6bc4e8` `#0033a1` `#f75200` `#027db3`
