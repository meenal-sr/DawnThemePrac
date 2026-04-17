# Text with Image — Test Scenarios

## Visual States

### Default state
- Two-column layout on desktop: text left, image right
- Background matches selected color scheme
- Heading renders as h2, 32px bold
- Body text renders with proper paragraph spacing, inline bold, and underlined links

### No image
- Right column shows placeholder SVG
- Layout does not collapse — placeholder fills the image column

### No heading
- Heading element not rendered (no empty `<h2>`)
- Body text starts at top of content column

### No body text
- Only heading visible in content column
- Layout remains balanced

### Empty section (no heading, no body, no image)
- Section renders with padding and background only
- No broken markup

---

## Image Position Variant

### Image right (default)
- Text column on left, image column on right
- Desktop: content has `padding-right: 100px`

### Image left
- Image column on left, text column on right
- Desktop: content has `padding-left: 100px` (mirrored)
- Mobile: image still stacks below text (or above — verify order preference)

---

## Responsive Breakpoints

### Mobile (<768px)
- Single column, stacked: text on top, image below
- Full-width columns
- Heading font size reduced (~26px)
- Padding reduced (~24px–40px)
- Image has reduced height, maintains border-radius

### Tablet (768px–1024px)
- Still stacked but with more padding
- Heading size intermediate
- Image taller than mobile

### Desktop (>=1024px)
- Two-column flex row, vertically centered
- Content max-width 670px, padding-right 100px
- Image min-height 410px, border-radius 10px
- Container max-width 1340px, centered

### Large desktop (>=1280px)
- No additional changes expected — verify layout doesn't stretch excessively

---

## Data Edge Cases

### Long heading text
- Heading wraps gracefully, does not overflow container
- Line-height maintains readability

### Very long body text (10+ paragraphs)
- Content column scrolls naturally (no overflow hidden)
- Image column maintains vertical centering or top-aligns gracefully

### Short body text (one sentence)
- Layout remains balanced
- Columns vertically centered, image does not stretch disproportionately

### Body with many links
- All links render underlined with correct color
- Links are clickable and accessible

### Body with no formatting
- Plain text paragraphs render with proper spacing

### Image with very different aspect ratios
- Portrait image: `object-fit: cover` crops appropriately
- Landscape image: fills container width, crops vertically
- Square image: renders without distortion

### Missing image alt text
- Falls back to heading text (stripped HTML)
- If heading also empty, alt is empty string (not undefined)

---

## Accessibility

### Keyboard navigation
- Links in body text are tabbable and focusable
- Focus styles visible on links

### Screen reader
- Heading hierarchy correct (h2 or configured level)
- Image alt text read correctly
- Rich text body content is semantically correct (paragraphs, links)

### Color contrast
- Body text #515151 on #F4F6F8 background meets WCAG AA (4.5:1 ratio for 15px)
- Heading #000000 on #F4F6F8 meets WCAG AAA

---

## Theme Editor

### Settings panel
- All settings appear with correct labels
- Color scheme picker works
- Padding sliders update preview in real-time
- Image picker opens media library
- Richtext editor supports bold, italic, links, paragraphs
- Image position select toggles layout correctly

### Preset
- Section appears in "Add section" panel as "Text with Image"
- Default preset renders with sample content