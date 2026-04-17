# 10X Peptides Landing Page — Implementation Brief

## Overview

**Feature name:** 10x-peptides
**Purpose:** Custom landing page for 10X Peptides genetic testing product. Drives conversions through education about MTHFR gene mutation, symptom awareness, and repeated CTAs to order a genetic test kit.
**Figma file:** `M2Ssx1IIYU7iwaNtwXft3n`
**Figma page node (desktop, 1440w):** `10015:2685`

---

## Architecture Decisions

### Page-Level Strategy
- **Template:** `templates/page.10x-peptides.json` — a custom page template that assembles sections via Shopify's JSON template system
- **Sections:** 8 new section files, each self-contained with its own schema, SCSS, and optional JS
- **Shared snippet:** `snippets/10x-cta-button.liquid` — reusable CTA button used across 5+ sections
- **Shared snippet:** `snippets/10x-card.liquid` — reusable shadowed card container (used in sections 2, 4, 5, 6, 7)

### Why Custom Sections (Not Reusing Existing)
The existing `image-with-text.liquid` and `multicolumn.liquid` are Dawn defaults with heavy conditional logic. The 10X Peptides design has a distinct visual language (specific shadows, card styles, typography hierarchy) that would require overriding most default styles. Custom sections = cleaner, more maintainable, no Dawn CSS conflicts.

### File Map

| Section | Liquid File | SCSS File | JS File |
|---------|-------------|-----------|---------|
| Hero Banner | `sections/10x-hero-banner.liquid` | `scss/sections/10x-hero-banner.scss` | None |
| Discover CTA | `sections/10x-discover-cta.liquid` | `scss/sections/10x-discover-cta.scss` | None |
| Video Banner | `sections/10x-video-banner.liquid` | `scss/sections/10x-video-banner.scss` | `js/sections/10x-video-banner.js` (if video) |
| Genetic Stats | `sections/10x-genetic-stats.liquid` | `scss/sections/10x-genetic-stats.scss` | None |
| Why Gene Test | `sections/10x-why-gene-test.liquid` | `scss/sections/10x-why-gene-test.scss` | `js/sections/10x-why-gene-test.js` (video play) |
| 3-Card Features | `sections/10x-features-cards.liquid` | `scss/sections/10x-features-cards.scss` | None |
| Don't Wait CTA | `sections/10x-dont-wait-cta.liquid` | `scss/sections/10x-dont-wait-cta.scss` | None |
| Brand Section | `sections/10x-brand-section.liquid` | `scss/sections/10x-brand-section.scss` | None |

| Snippet | File |
|---------|------|
| CTA Button | `snippets/10x-cta-button.liquid` |
| Shadow Card | `snippets/10x-shadow-card.liquid` |

---

## Section-by-Section Specification

### Section 1: Hero Banner
**Node:** `10015:2326`
**Layout:** Full-width background image, 1440x1024px at desktop
**Content:** Background image only — no text overlay
**Schema settings:**
- `image` (image_picker) — hero background image
- `image_mobile` (image_picker) — optional mobile-specific image
- `height_desktop` (range, default 1024px)
- `height_mobile` (range, default 500px)

**Markup:**
```
<section> full-width wrapper
  <picture> with <source> for mobile/desktop
    <img> with object-fit: cover, width: 100%, fetchpriority: high
  </picture>
</section>
```

**Responsive:**
- Desktop: 1440px wide, 1024px tall
- Mobile: 100vw, ~500px tall (adjust via schema)
- CSS-only — `object-fit: cover` handles both breakpoints

---

### Section 2: Discover CTA + Image
**Node:** `10015:2334`
**Layout:** Two-column, left text card + right square image
**Dimensions:** Card and image each ~526px wide at desktop, within page-width container

**Left column (shadow card):**
- Background: white
- Box shadow: 0 4px 20px rgba(0,0,0,0.08) (approximate — verify from Figma)
- Border radius: 8px (approximate)
- Padding: ~40px
- Heading: "Discover your body's deficiencies" — large, bold
- Body text: paragraph about genetic test
- CTA button: "Order My Genetic Test"

**Right column:**
- Square image 526x526, border-radius to match card or none
- `object-fit: cover`

**Schema settings:**
- `heading` (text)
- `body_text` (richtext)
- `cta_label` (text)
- `cta_url` (url)
- `image` (image_picker) — right column image
- `layout_direction` (select: "text_first" / "image_first") — controls column order
- `padding_top` / `padding_bottom` (range)

**Responsive:**
- Desktop: side-by-side columns, 50/50
- Tablet (md-small, 768px): stack vertically, image on top, card below
- Mobile: full-width stack, reduced padding

---

### Section 3: Video/Image Banner
**Node:** `10015:2346`
**Layout:** Single centered media block within container
**Dimensions:** ~1408x400 inner media, within ~1298px container with background

**Schema settings:**
- `media_type` (select: "image" / "video")
- `image` (image_picker)
- `video_url` (video_url) — YouTube/Vimeo
- `background_color` (color, optional)
- `border_radius` (range)
- `padding_top` / `padding_bottom` (range)

**JS (only if video):**
- `js/sections/10x-video-banner.js`
- Lazy-load video iframe on play button click
- No autoplay — performance-conscious

**Responsive:**
- Desktop: fixed-height container, media fills width
- Mobile: aspect-ratio maintained, reduced height

---

### Section 4: Genetic Mutation Stats
**Node:** `10015:2362`
**Layout:** Single large shadow card (1356x900 at desktop), centered
**This is the most content-heavy section.**

**Card contents (top to bottom):**
1. **Headline:** "44% OF THE WORLD'S population has this genetic mutation"
   - "44%" — very large, bold, accent color
   - "OF THE WORLD'S" — uppercase, smaller
   - "population has this genetic mutation" — medium weight
2. **Subheading:** "Most common symptoms of a Nutrient Deficiency:" — medium
3. **Symptom grid:** 4 columns, each with checkmark icon + symptom name
   - Col 1: Anxiety, Depression, ADD/ADHD
   - Col 2: OCD, Gut Issues, Weight Management
   - Col 3: Brain Fog, Thyroid Problem, High Blood Pressure
   - Col 4: Bad Temper, And so much more...
4. **Body paragraphs:** 3 paragraphs about MTHFR gene mutation
5. **CTA button:** "ORDER MY GENETIC TEST"

**Schema settings:**
- `stat_number` (text, default "44%")
- `stat_prefix` (text, default "OF THE WORLD'S")
- `stat_suffix` (text, default "population has this genetic mutation")
- `subheading` (text)
- `symptoms` (blocks, type "symptom") — each block has `text` (text)
- `body_text` (richtext)
- `cta_label` (text)
- `cta_url` (url)
- `padding_top` / `padding_bottom` (range)

**Symptom grid responsive:**
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column

**Symptom block schema:**
```json
{
  "type": "symptom",
  "name": "Symptom",
  "settings": [
    { "type": "text", "id": "text", "label": "Symptom text" }
  ]
}
```

---

### Section 5: Why Gene Test + Image
**Node:** `10015:2433`
**Layout:** Two-column, same structure as Section 2 but with video on right

**Left column (shadow card):**
- Heading: "Why you need this gene test"
- Long body paragraph about nutrient conversion
- CTA: "ORDER MY GENETIC TEST"

**Right column:**
- Video player placeholder 526x526 with centered play button icon
- On click: play video (inline or modal)

**Schema settings:**
- Same as Section 2 but add `video_url` (video_url) for right column
- `media_type` (select: "image" / "video")

**JS:** `js/sections/10x-why-gene-test.js`
- Play button click handler
- Swap placeholder image with video iframe
- Or open modal with video player

**Responsive:** Same as Section 2 (stack on mobile)

---

### Section 6: 3-Card Features
**Node:** `10015:2448`
**Layout:** Heading + 3 cards in a row

**Section heading:** "Don't Wait to Prioritize Your Health" — centered

**Each card (436px wide at desktop):**
- Shadow card with padding
- Icon image at top (small, ~48-64px)
- Title: bold (e.g., "At Home Test", "Expert Insights", "Personalized Protocol")
- Horizontal separator line
- Description paragraph

**Schema:** Section uses blocks for cards:
```json
{
  "type": "feature_card",
  "name": "Feature Card",
  "settings": [
    { "type": "image_picker", "id": "icon", "label": "Icon" },
    { "type": "text", "id": "title", "label": "Title" },
    { "type": "richtext", "id": "description", "label": "Description" }
  ]
}
```

**Section settings:**
- `heading` (text)
- `cards_per_row_desktop` (range, 2-4, default 3)
- `padding_top` / `padding_bottom` (range)

**Responsive:**
- Desktop: 3 columns
- Tablet: 2 columns (third wraps)
- Mobile: 1 column stack

---

### Section 7: Don't Wait CTA + Image
**Node:** `10015:2476`
**Layout:** Two-column, left colored background with text + CTA, right image

**Left column:**
- Colored/branded background (not white — likely a brand color)
- Heading: "Don't Wait to Prioritize Your Health"
- CTA button: "ORDER MY GENETIC TEST"
- Vertically centered content

**Right column:**
- Full-height image, `object-fit: cover`

**Schema settings:**
- `heading` (text)
- `cta_label` (text)
- `cta_url` (url)
- `background_color` (color)
- `text_color` (color)
- `image` (image_picker)
- `layout_direction` (select: "text_first" / "image_first")
- `padding_top` / `padding_bottom` (range)

**Responsive:** Stack on mobile, colored block on top, image below

---

### Section 8: Brand/Testimonial Section
**Nodes:** `10015:2484` + `10015:2489`
**Layout:** Full-width branded visual section

**Contents:**
- "Talk about your brand" heading
- Large illustrated/branded visual area (1440x560)
- SVG artwork overlay

**Schema settings:**
- `heading` (text)
- `body_text` (richtext)
- `background_image` (image_picker)
- `overlay_image` (image_picker) — SVG artwork
- `background_color` (color)
- `padding_top` / `padding_bottom` (range)

**Responsive:**
- Desktop: full-width, 560px height
- Mobile: reduced height, SVG scales proportionally

---

## Shared Components

### `snippets/10x-cta-button.liquid`
Reused in sections 2, 4, 5, 6, 7.

**Parameters:**
- `label` (string) — button text
- `url` (string) — link target
- `style` (string: "primary" / "secondary") — visual variant

**Markup:** `<a>` tag with appropriate classes. Primary = filled, Secondary = outlined.

### `snippets/10x-shadow-card.liquid`
Reused in sections 2, 4, 5, 6.

**Parameters:**
- `class` (string) — additional CSS classes
- Content passed via `{% capture %}` or as block content

**Styles:** White background, box-shadow, border-radius, padding. Defined in one SCSS partial.

---

## Responsive Strategy

| Breakpoint | Tailwind class | Width | Notes |
|------------|----------------|-------|-------|
| Base (mobile) | default | <390px | Single column, reduced spacing |
| small | `small:` | 390px | Mobile baseline |
| md-small | `md-small:` | 768px | Tablet — 2-col grids appear |
| md | `md:` | 1024px | Desktop — full layout |
| lg | `lg:` | 1280px | Large desktop |
| 2xl | `2xl:` | 1550px | Max content width |

**Strategy:** CSS-only responsive. No DOM duplication. Use CSS Grid/Flexbox with breakpoint utilities. All two-column sections stack to single column below `md-small`.

---

## Data Sources

All content is **merchant-configurable via section schema settings**. No product data, no metafields, no API calls. This is a static marketing landing page where all text, images, and URLs are set in the theme editor.

---

## Asset Requirements

- Hero background image (high-res, 1440x1024 minimum)
- Discover section product/lifestyle image (square, 1050x1050 minimum for 2x)
- Video banner media (image or video URL)
- Why Gene Test video thumbnail + video URL
- 3 feature card icons (SVG or small PNG, ~128x128)
- Don't Wait section image
- Brand section background + SVG overlay artwork
- Checkmark icon for symptom list (SVG, inline or asset)

---

## Technical Tradeoffs

### Custom sections vs reusing Dawn defaults
- **Decision:** Custom sections for all 8
- **Alternative:** Extend `image-with-text.liquid`, `multicolumn.liquid`, `image-banner.liquid`
- **Why custom:** Design has specific shadow/card styles, typography hierarchy, and layout ratios that would require heavy CSS overrides on Dawn defaults. Clean custom sections are easier to maintain and won't break on Dawn theme updates.
- **Downside:** More files to maintain, no automatic Dawn updates

### Shared snippets vs inline markup
- **Decision:** Extract CTA button and shadow card into snippets
- **Alternative:** Inline the markup in each section
- **Why snippets:** CTA button appears 5+ times with identical styling. Shadow card appears 4+ times. DRY principle. Single place to update styles.
- **Downside:** Slight indirection when reading section code

### CSS Grid vs Flexbox for two-column layouts
- **Decision:** CSS Grid with `grid-template-columns`
- **Alternative:** Flexbox with percentage widths
- **Why grid:** Cleaner equal-height columns, simpler gap handling, better alignment control for the card+image pattern
- **Downside:** None meaningful — browser support is universal

### Symptom list as blocks vs hardcoded
- **Decision:** Theme blocks (merchant can add/remove symptoms)
- **Alternative:** Richtext field with bullet list
- **Why blocks:** Merchant flexibility, each symptom gets the checkmark icon automatically, easy reorder in theme editor
- **Downside:** More schema complexity

### Video handling — inline swap vs modal
- **Decision:** Inline swap (replace thumbnail with iframe on click)
- **Alternative:** Open video in a modal/lightbox
- **Why inline:** Simpler implementation, no z-index/overlay complexity, keeps user in page flow
- **Downside:** Video constrained to container size

---

## Constraints and Assumptions

1. **No TypeScript** — this project uses plain JS (verified: `js/sections/` contains `.js` files, webpack processes `.js` with babel-loader, no TS config found)
2. **Tailwind prefix `tw-`** — all utility classes must use this prefix
3. **No theme push** — user uses `shopify theme dev` with auto-sync; never run `shopify theme push`
4. **SCSS per section** — each section gets its own SCSS entry in `scss/sections/` which webpack compiles to `assets/[name].css`
5. **JS per section** — each section with interactivity gets its own JS entry in `js/sections/` which webpack compiles to `assets/[name].js`
6. **Page template** — assumes a `templates/page.10x-peptides.json` will be created to assemble sections
7. **No product/cart data** — purely informational landing page, CTAs link to external or internal URLs (no add-to-cart logic)
8. **Images uploaded via theme editor** — no hardcoded asset URLs
9. **Font** — appears to be sans-serif; exact font family needs verification from Figma detail nodes or will use theme's default font stack

---

## Build Validation

1. `yarn start` — confirms webpack compiles all new SCSS/JS entries without errors
2. Visual QA via Playwright screenshots at breakpoints: 390px, 768px, 1024px, 1280px, 1440px
3. Theme editor test — all schema settings render correctly, blocks can be added/removed/reordered
4. Lighthouse audit — check for image optimization, no layout shift from lazy-loaded video