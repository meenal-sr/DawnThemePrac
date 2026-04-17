# Founder Quote Section — Brief

## Overview
Testimonial card featuring a founder/celebrity quote with circular portrait, 10X Health logo, and dark textured background. Used as social proof on the 10X Peptides landing page.

## Figma Reference
- **File:** M2Ssx1IIYU7iwaNtwXft3n
- **Node:** 10015:2350
- **URL:** https://www.figma.com/design/M2Ssx1IIYU7iwaNtwXft3n/10X-HEALTH-SYSTEM?node-id=10015-2350&m=dev

## Visual Breakdown

### Layout
- Dark card with `border-radius: 40px` (uses `10x-shadow-card` snippet with radius="lg")
- Textured/patterned dark background image (carbon fiber style)
- Horizontal padding ~60px desktop
- Inner content: logo top-left, then quote area below

### Elements
1. **10X Health Logo** — white variant, top area, ~125px wide
2. **Portrait Image** — circular, ~195px diameter, white 1px border, left side of quote
3. **Quote Text** — Montserrat Medium, ~22px, white, multi-line paragraph in quotation marks
4. **Attribution** — "- **Grant Cardone**" (name is bold), below quote, ~27px gap

### Typography
- Quote: Montserrat Medium, 22px, white, normal line-height
- Attribution prefix: Montserrat Medium, 22px
- Attribution name: Montserrat Bold, 22px

### Colors
- Background: dark (near black) with texture image overlay
- Text: white (#FFFFFF)
- Portrait border: white 1px solid

## Responsive Behavior
- **Desktop (1024px+):** Horizontal layout — portrait left, quote right, 60px horizontal padding
- **Tablet (768px–1023px):** Reduce padding to ~30px, quote font ~18px, portrait ~150px
- **Mobile (<768px):** Stack vertically — logo centered, portrait centered above quote, quote centered, padding ~20px, font ~16px

## Schema Settings
| Setting | Type | Default | Notes |
|---------|------|---------|-------|
| `background_image` | image_picker | — | Dark textured background |
| `logo_image` | image_picker | — | 10X Health white logo |
| `portrait_image` | image_picker | — | Circular founder portrait |
| `quote_text` | richtext | — | The testimonial quote |
| `attribution_name` | text | "Grant Cardone" | Name below quote |
| `padding_top` | range (0–100) | 40 | Section top padding |
| `padding_bottom` | range (0–100) | 40 | Section bottom padding |

## Snippets
- Reuse `snippets/10x-shadow-card.liquid` with `radius="lg"` for the outer card container

## File Output
- `sections/10x-founder-quote.liquid` — section file with inline `{%- style -%}` block
- No JS needed — pure CSS/Liquid section

## Naming Convention
Follow existing `tenx-` prefix pattern (e.g., `tenx-founder-quote-{{ section.id }}`).
