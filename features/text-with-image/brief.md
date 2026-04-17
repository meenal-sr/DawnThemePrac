# Text with Image — Section Brief

## What & Why

**Section name:** `text-with-image`
**Purpose:** Generic two-column section pairing rich text content with a featured image. Used for informational/article-style content blocks (about us, product stories, ingredient details).
**Figma:** Desktop node `5034:1758`, file `g3gxO3mhrniJOYTHNmotAu`

---

## Architecture

**Type:** Shopify section (standalone, added via theme editor)
**Files to create:**
- `sections/text-with-image.liquid` — section file with inline `{% style %}` block (matches existing pattern from `careers-hero`, `capsule-desc`)

**No snippets, no TS, no SCSS needed.** This is a static content section — no JS interactions.

**Pattern reference:** Follows `careers-hero.liquid` architecture exactly — inline styles with section-scoped selectors, mobile-first responsive, flex layout.

---

## Layout Strategy

**Desktop (>=1024px):** Flexbox row, vertically centered (`align-items: center`).
- Left column: text content, `flex: 1 1 0`, `max-width: 670px`, `padding-right: 100px`
- Right column: image, `flex: 1 1 0`, `border-radius: 10px`, `min-height: 410px`, `object-fit: cover`
- Container: `max-width: 1340px`, centered, `padding: 50px`

**Tablet (768px–1024px):** Stacked, more padding than mobile.

**Mobile (<768px):** Stacked column — text first, image below. Full width. Reduced padding.

**Responsive approach:** CSS-only via flex-direction change. No DOM duplication.

---

## Design Tokens & Typography

| Element | Size | Weight | Color | Line-height |
|---------|------|--------|-------|-------------|
| Heading (h2) | 32px desktop / 26px mobile | 700 | #000000 | 42px / 34px |
| Body text | 15px | 500 | #515151 | 24px |
| Bold subheadings (inline) | 15px | 700 | #515151 | 24px |
| Links (inline) | 15px | 500 | #515151 | 24px |

Font: DM Sans (already loaded in theme).
Background: configurable via color scheme setting, default `#F4F6F8`.

---

## Data & Schema

### Section Settings

| ID | Type | Label | Default | Notes |
|----|------|-------|---------|-------|
| `heading` | `inline_richtext` | Heading | "Our Story" | Allows bold/italic inline |
| `heading_size` | `select` | Heading size | `h2` | Options: h1, h2, h0 |
| `body` | `richtext` | Body text | (sample paragraph) | Supports bold, links, paragraphs — ideal for article-style content |
| `image` | `image_picker` | Image | blank | Falls back to placeholder SVG |
| `image_position` | `select` | Image position | `right` | Options: left, right — allows flipping layout |
| `color_scheme` | `color_scheme` | Color scheme | `background-1` | |
| `padding_top` | `range` | Top padding | 50 | 0–160, step 4 |
| `padding_bottom` | `range` | Bottom padding | 50 | 0–160, step 4 |

### Blocks

None. All content lives in section settings. The body `richtext` type handles multiple paragraphs, bold subheadings, and links natively.

---

## Behaviour

- **No JS required.** Pure Liquid + CSS section.
- **No events emitted or consumed.**
- **No API calls.**
- Image uses `loading: lazy` and responsive `widths`/`sizes` attributes.
- Image alt text falls back to heading text (stripped of HTML).

---

## Image Handling

```liquid
image | image_url: width: 1600
      | image_tag:
          loading: 'lazy',
          widths: '400, 600, 800, 1200, 1600',
          sizes: '(min-width: 1024px) 50vw, 100vw',
          alt: image_alt
```

Image container: `overflow: hidden`, `border-radius: 10px`, `object-fit: cover`.

---

## Accessibility

- Heading uses semantic `<h2>` (or configured level)
- Image has meaningful alt text (from image asset or heading fallback)
- Rich text body rendered with `.rte` class for proper link styling
- Color contrast: #515151 on #F4F6F8 passes WCAG AA for 15px text
- Section uses `<div>` tag — no landmark pollution

---

## Technical Tradeoffs

| Decision | Alternative | Reasoning |
|----------|-------------|-----------|
| `richtext` setting for body | Blocks with individual text fields | Body is article-style prose with inline formatting — richtext is the natural fit. Blocks add unnecessary complexity for this content shape. |
| `image_position` select setting | Separate section variants | One setting is simpler for merchants; CSS `order` property handles the flip with no markup change. |
| Inline `{% style %}` block | External SCSS file | Matches existing project pattern (careers-hero, capsule-desc). No build step needed. Section-scoped via `section.id`. |
| No blocks | Blocks for paragraphs | The Shopify richtext type already supports multiple paragraphs, bold, and links. Blocks would fragment content editing. |

---

## Build Validation

- No build command needed (no TS/SCSS)
- Add section to a template via theme editor customizer
- Test at breakpoints: 390px (small), 768px (md-small), 1024px (md), 1280px (lg)
- Verify image_position: left and right both render correctly
- Verify placeholder SVG appears when no image set
