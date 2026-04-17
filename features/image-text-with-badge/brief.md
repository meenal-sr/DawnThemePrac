# Image Text with Badge — Brief

## What & Why

**Feature name:** `image-text-with-badge`
**Purpose:** Two-column content section (image + text) with eyebrow subtitle and a circular rotating-text badge overlapping the image edge. Used for marketing/informational content highlighting specific product features (e.g. refrigerant types).

**Figma:** Desktop node `4703:12`, file `g3gxO3mhrniJOYTHNmotAu`

**Why a new section (not extending text-with-image):**
- Circular SVG badge is a complex, self-contained element with its own schema (badge image, badge text)
- Eyebrow text adds another schema field
- Keeping `text-with-image` simple preserves its reusability
- No shared logic worth extracting — the overlap is only the general two-column pattern

---

## Architecture Decisions

### Liquid type: Section
Single file at `sections/image-text-with-badge.liquid`. Follows the `careers-hero.liquid` and `text-with-image.liquid` pattern — inline `{% style %}` block, no external SCSS, no JS.

### Component boundaries
One section file only. No snippets needed — the badge SVG is small enough to inline. No TypeScript entry — purely static content, no interactivity.

### Reused patterns
- Two-column flex layout from `sections/text-with-image.liquid` (same max-width 1340px, same flex approach, same responsive stack)
- Inline `{% style %}` with section-scoped classes using `{{ section.id }}`
- `image_url` / `image_tag` pattern from existing sections
- Padding range settings pattern from existing sections

---

## Data

All data comes from **section settings** (merchant-configurable in theme editor):

| Setting | Type | Purpose |
|---------|------|---------|
| `image` | `image_picker` | Main left-column image |
| `eyebrow` | `text` | Small subtitle above heading ("The Need for Change") |
| `heading` | `inline_richtext` | Main heading |
| `heading_size` | `select` (h2/h3) | Heading tag |
| `body` | `richtext` | Body copy with inline links |
| `badge_image` | `image_picker` | Small circular image in badge center (28px rendered) |
| `badge_text` | `text` | Curved text around badge ("R32 & R454 Refrigerant") |
| `show_badge` | `checkbox` | Toggle badge visibility, default true |
| `image_position` | `select` | Left (default) or Right |
| `color_scheme` | `color_scheme` | Theme color scheme |
| `padding_top` | `range` | Desktop top padding (default 60) |
| `padding_bottom` | `range` | Desktop bottom padding (default 60) |

No metafields, no fetches, no cart/product data.

---

## Behaviour

### Variants
- **With badge / without badge** — Liquid conditional on `show_badge` setting
- **Image left / image right** — CSS order swap via Liquid (same pattern as `text-with-image.liquid`)
- **With eyebrow / without eyebrow** — Liquid conditional on `eyebrow` being blank

### No JS
Zero JavaScript. Static section, no state machine, no events, no API calls.

### Responsive strategy (CSS-only, no DOM duplication)
- **Desktop (>=1024px):** Two-column row. Image left, text right (or reversed). Badge visible, absolute-positioned overlapping image right edge.
- **Tablet (768px-1024px):** Stacked. Image on top, text below. Badge visible but scaled down slightly.
- **Mobile (<768px):** Stacked. Badge hidden (`display: none`) to avoid layout issues at small widths.

Badge hide on mobile is CSS-only — single DOM element, `display: none` below 768px.

---

## Implementation Detail

### Markup structure
```
div.color-{scheme}
  div.image-text-badge-{id}
    div.image-text-badge__wrapper (flex row desktop, column mobile)
      div.image-text-badge__media (position: relative)
        img (image_url | image_tag)
        div.image-text-badge__badge (position: absolute, right: -39px, centered vertically)
          svg (79px x 79px viewBox)
            circle (white fill)
            image (badge_image, 28px centered)
            textPath (badge_text, curved along circle path, 10px bold uppercase DM Sans)
      div.image-text-badge__content
        p.image-text-badge__eyebrow (if eyebrow != blank)
        h2.image-text-badge__heading
        div.image-text-badge__body.rte
```

### Badge SVG approach
Use inline SVG with `<textPath>` for curved text. This is:
- Pure CSS/SVG, no JS
- Accessible (text is selectable/readable by screen readers)
- Merchant-configurable via `badge_text` setting

SVG structure:
```svg
<svg viewBox="0 0 79 79" width="79" height="79">
  <defs>
    <path id="badge-text-path-{{ section.id }}" d="M 39.5,39.5 m -30,0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0"/>
  </defs>
  <circle cx="39.5" cy="39.5" r="39.5" fill="#ffffff"/>
  <!-- Center image clipped to circle -->
  <clipPath id="badge-clip-{{ section.id }}">
    <circle cx="39.5" cy="39.5" r="14"/>
  </clipPath>
  <image href="{{ badge_image_url }}" x="25.5" y="25.5" width="28" height="28" clip-path="url(#badge-clip-{{ section.id }})"/>
  <!-- Curved text -->
  <text font-size="10" font-weight="700" font-family="'DM Sans', sans-serif" text-transform="uppercase" fill="#000">
    <textPath href="#badge-text-path-{{ section.id }}" startOffset="0%">{{ badge_text }}</textPath>
  </text>
</svg>
```

The `textPath` radius (30) positions text along a circle ~9px inside the outer edge — adjust if text overflows.

### CSS key specs

| Element | Mobile (<768) | Tablet (768-1024) | Desktop (>=1024) |
|---------|--------------|-------------------|------------------|
| Section padding | 24px 16px | 40px 32px | {top}px 50px {bottom}px |
| Layout | column | column | row |
| Max wrapper width | 100% | 100% | 1340px centered |
| Image height | 250px | 320px | auto, min-height 447px |
| Image border-radius | 10px | 10px | 10px |
| Text max-width | 100% | 100% | 670px |
| Text padding-left | 0 | 0 | 100px (when image is left) |
| Eyebrow | 14px bold | 15px bold | 15.9px bold, line-height 24.9px |
| Heading | 26px/34px | 30px/38px | 32px/42px bold |
| Body | 15px/24px #515151 | 15px/24px | 15px/24px medium |
| Badge | hidden | 65px, absolute | 79px, absolute right:-39px |

### Badge positioning
- `position: absolute` on `.image-text-badge__badge`
- `position: relative` on `.image-text-badge__media`
- Desktop: `right: -39.5px; top: 50%; transform: translateY(-50%);`
- This places the badge half-overlapping the image right edge into the text column gap
- When `image_position == 'right'`, badge goes on the LEFT edge: `left: -39.5px; right: auto;`
- Tablet: same logic but badge scaled to 65px via `width/height`
- Mobile: `display: none`

### Section-scoped class prefix
`image-text-badge-{{ section.id }}` — all CSS scoped under this, matching existing patterns.

### Output files
- `sections/image-text-with-badge.liquid` — single file, everything inline

---

## Technical Tradeoffs

### New section vs extending text-with-image
- **Chosen:** New section
- **Alternative:** Add badge/eyebrow settings to existing `text-with-image`
- **Why:** Badge is complex SVG markup. Adding it conditionally bloats a clean, reusable section. Separate section keeps both focused. Downside: slight duplication of the two-column layout CSS.

### SVG textPath vs CSS character rotation vs uploadable image
- **Chosen:** SVG `<textPath>` for curved text
- **Alternative 1:** CSS transforms rotating individual `<span>` characters — fragile, breaks with different text lengths
- **Alternative 2:** Make entire badge an uploadable image — loses editability, merchant must recreate badge in design tool for every text change
- **Why:** SVG textPath is native, no JS, merchant can change badge text in theme editor. Downside: text kerning on circular path can be imperfect; may need `letter-spacing` tuning.

### Badge hide on mobile vs scale down
- **Chosen:** Hide badge below 768px
- **Alternative:** Scale down to ~50px
- **Why:** At small sizes, 10px curved text becomes unreadable. Hiding is cleaner. Downside: mobile users don't see the badge at all — acceptable since it's decorative/supplementary.

---

## Constraints and Assumptions

- **No CLAUDE.md found** — followed patterns from existing sections (`text-with-image.liquid`, `careers-hero.liquid`)
- **Assumes DM Sans is loaded globally** — section CSS sets `font-family: 'DM Sans', sans-serif` as fallback
- **Assumes white background** — section uses `color-{{ color_scheme }}` wrapper but the Figma shows white; merchant controls via color scheme setting
- **Badge text length** — assumes short text (under ~25 characters). Longer text will overflow the circular path. No validation enforced; documented as a merchant guideline
- **No animation** — Figma shows static badge. "Rotating text" in the task name refers to the circular arrangement, not CSS animation. If rotation animation is desired later, a CSS `@keyframes rotate` on the SVG is trivial to add
- **Image aspect ratio** — not enforced; `object-fit: cover` handles any ratio. `min-height: 447px` on desktop matches Figma