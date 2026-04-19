# figma-context.md — promo-test

Canonical design reference. Downstream agents reference VALUES here — do not duplicate into brief/ui-plan/test-scenarios.

---

## Figma sources

| Breakpoint | Node ID | URL |
|---|---|---|
| Desktop | `5654:6240` | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-6240&m=dev |
| Mobile  | `5654:53324` | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-53324&m=dev |

Reference PNGs: `qa/figma-desktop.png`, `qa/figma-mobile.png`.

File key: `g3gxO3mhrniJOYTHNmotAu`.

---

## Figma variable tokens

From `get_variable_defs`:
- Desktop: `radius/xl: 12` (applied to card corners)
- Mobile: (empty — raw values only)

---

## Desktop (node 5654:6240)

### Section container
- Background: `#f4f6f8`
- Padding: top 60, right 50, bottom 10, left 50
- Inner wrapper: fixed width `1340px`, vertical stack, gap `24px`

### Header block (intro copy)
- Stack gap: `12px`, max-width `599px`
- **H2 title**
  - Text: `Not Sure What You Need?`
  - Font: DM Sans, Bold, `48px`, line-height `52.8px`
  - Color: `#0b1e3d`
- **Subhead** (two lines)
  - Text line 1: `Choose your system type and we'll guide you to the best options.`
  - Text line 2: `Quick, simple, and tailored to your space.`
  - Font: DM Sans, Medium, `16px`, line-height `20px`
  - Color: `#666`

### Card row
- Horizontal row of 3 cards, gap `40px`, items center
- Each card: width auto (420 intrinsic), height 420, background `#a1a1a1`, overflow-clip, rounded `12px` (radius/xl token)
- Layout technique: each card has a 420x420 image area with dark-to-transparent gradient overlay; text block absolutely positioned over image, bottom-half of card

#### Card image area (per card)
- Size: `420 × 420`
- Rendered image is scaled/cropped to fill the 420x420 region
- Gradient overlay (absolute, 420x420, centered): vertical gradient, from `rgba(255,255,255,0)` at 45.6%, through `rgba(8,8,8,0.4)` at 57.8%, to `rgba(0,0,0,0.8)` at 100%. Gives bottom-up darkening so text is legible.

#### Card content block (absolute over image)
- Position: `left: 45px, top: 240px`, width `331px`
- Stack, gap `12px`, items center

**Card title**
- Font: DM Sans, Bold, `24px`, line-height `28px`, uppercase via `capitalize` (first-letter cap)
- Color: `#f4f6f8`
- Centered

**Card description**
- Font: DM Sans, Medium, `16px`, line-height `20px`
- Color: `#eaeaea`
- Centered, multi-line

**Card CTA button**
- Label text: `Explore` (DM Sans, Bold, `16px`, line-height `28px`, capitalize, color `#f4f6f8`)
- Button: background `#027db3`, height `48px`, horizontal padding `32px`, rounded `100px` (pill), max-width `280px`

#### Three card copies (title + description)
1. **Split System** — `A traditional central air system with indoor and outdoor units. Ideal for whole-home or multi-room cooling using ductwork.`
2. **Mini-Split System** — `Flexible, energy-efficient cooling with wall-mounted indoor units. Perfect for single rooms, additions, or homes without ducts.`
3. **Packaged Unit** — `All-in-one heating and cooling system installed outside the home. Perfect for homes with limited indoor space.`

---

## Mobile (node 5654:53324)

### Section container
- Background: `#ffffff` (white) — differs from desktop `#f4f6f8`
- Padding: vertical `30px`, horizontal `16px`

### Header block
- Stack gap `8px`, padding-bottom `24px`
- **H2 title**
  - Text: `Not Sure What You Need?`
  - Font: DM Sans, Bold, `28px`, line-height `33.6px`
  - Color: `#000000` (black) — differs from desktop `#0b1e3d`
- **Subhead**
  - Text line 1: `Shop top HVAC systems with limited-time pricing applied at checkout.`
  - Text line 2: `Fresh discounts, seasonal savings, and our best offers of the year.`
  - ⚠ COPY DIFFERS from desktop — see Cross-breakpoint notes
  - Font: DM Sans, Medium, `16px`, line-height `20px`
  - Color: `#666`

### Card strip
- Full-width horizontal-scroll container, `overflow-x-auto`, inner padding `16px`
- Inside: horizontal flex of 3 cards, gap `12px`, intended card width `~265.46px` each (`flex: 1 0 0`, viewport-relative)
- Each card: background `white`, vertical stack, gap `24px`

#### Card image area
- Aspect: card-width × `265.46px`
- Image corners: rounded `10px`, mask applied

#### Card text block (BELOW image, NOT overlaid)
- Stack gap `12px`, items center

**Card title**
- Font: DM Sans, Bold, `19.6px`, line-height `26.6px`
- Color: `#000000` — differs from desktop white
- Centered

**Card description**
- Font: DM Sans, SemiBold, `15px`, line-height `24px`
- Color: `#515151` — differs from desktop `#eaeaea`
- Centered, multi-line

**Card CTA button**
- Same visual as desktop: bg `#027db3`, height `48px`, px `~31.8px`, rounded `100px`
- Label: `Explore` — Font: DM Sans, Bold, `15px`, line-height `30px`, color white, capitalize (one card in design shows placeholder `Button label` — treat as design bug; real label = `Explore` per desktop source of truth)

### Scroll progress indicator
- Bar: height `2px`, width `100%`, background `rgba(0,0,0,0.1)`
- Fill: black, rounded `30px`, width tracks scroll position (Figma shows ~43.66% filled)

---

## Cross-breakpoint delta notes (visual changes only — ui-agent decides DOM)

| Concern | Desktop | Mobile |
|---|---|---|
| Section background | `#f4f6f8` | `#ffffff` |
| Section horizontal padding | `50px` | `16px` |
| Section vertical padding | `60px top / 10px bottom` | `30px top+bottom` |
| H2 title size | `48px / lh 52.8` | `28px / lh 33.6` |
| H2 title color | `#0b1e3d` | `#000000` |
| Subhead COPY | "Choose your system type and we'll guide you to the best options. Quick, simple, and tailored to your space." | "Shop top HVAC systems with limited-time pricing applied at checkout. Fresh discounts, seasonal savings, and our best offers of the year." |
| Card layout | Static 3-up row, 40px gap | Horizontal scroll carousel, 12px gap, progress bar |
| Card background | `#a1a1a1` with bg-image + gradient overlay | `white` with image on top, text below |
| Text on card | ABSOLUTELY POSITIONED over image, centered, WHITE text (#f4f6f8 / #eaeaea) | BELOW image, centered, BLACK text (#000 / #515151) |
| Card title size | `24px / lh 28` | `19.6px / lh 26.6` |
| Card description font | DM Sans Medium, 16px, #eaeaea | DM Sans SemiBold, 15px, #515151 |
| Card corner radius | `12px` (radius/xl) | `10px` (image only) |
| Button label size | `16px / lh 28` | `15px / lh 30` |
| Button label color | `#f4f6f8` | white (`#ffffff`) |

**Divergence assessment: HIGH.** Desktop uses content-over-image (absolute positioning, dark gradient, white text). Mobile inverts — image on top, content below on white bg. Copy for subhead also differs. Per `feedback_mobile_first.md` convention, this warrants **dual-DOM branches toggled via `hidden md:block` / `md:hidden`**. Single DOM with breakpoint overrides would require fighting absolute positioning + color inversion + copy swap.

Ui-agent: implement mobile-first, document the dual-DOM choice in `ui-plan.md` Phase 2 DEVIATIONS.

---

## Source-of-truth copy table (test-agent ground truth)

| Field | Desktop value | Mobile value |
|---|---|---|
| `heading` | Not Sure What You Need? | Not Sure What You Need? |
| `subheading_line_1` | Choose your system type and we'll guide you to the best options. | Shop top HVAC systems with limited-time pricing applied at checkout. |
| `subheading_line_2` | Quick, simple, and tailored to your space. | Fresh discounts, seasonal savings, and our best offers of the year. |
| `card_1_title` | Split System | Split System |
| `card_1_description` | A traditional central air system with indoor and outdoor units. Ideal for whole-home or multi-room cooling using ductwork. | (same) |
| `card_2_title` | Mini-Split System | Mini-Split System |
| `card_2_description` | Flexible, energy-efficient cooling with wall-mounted indoor units. Perfect for single rooms, additions, or homes without ducts. | (same) |
| `card_3_title` | Packaged Unit | (same) |
| `card_3_description` | All-in-one heating and cooling system installed outside the home. Perfect for homes with limited indoor space. | (same — mobile card 3 content not fully rendered in design, inherit desktop) |
| `card_cta_label` | Explore | Explore |

Where desktop and mobile copy differ (subhead only), schema should expose BOTH or a single `subheading` setting — planner decides.

---

## Fonts

- Font family: **DM Sans** (Bold, Medium, SemiBold weights)
- Font variation axis: `opsz: 14` applied to all weights (optical size for smaller-ish display)
- Web-font loading strategy: defer to project convention (likely Google Fonts or self-hosted) — ui-agent inherits theme-wide loading
