# Image Text with Badge — Test Scenarios

## Visual States

### Default state
- [ ] Two-column layout: image left, text right on desktop
- [ ] Eyebrow text visible above heading
- [ ] Heading renders at correct size (32px desktop)
- [ ] Body text with inline links (underlined, #515151)
- [ ] Badge visible, overlapping right edge of image column
- [ ] White circle badge with centered image and curved text
- [ ] Section background follows color scheme setting

### Without eyebrow
- [ ] Eyebrow setting left blank — no eyebrow element rendered, no extra gap above heading

### Without badge
- [ ] `show_badge` unchecked — badge element not in DOM
- [ ] Layout unaffected, no empty space where badge was

### Without image
- [ ] No image selected — placeholder SVG renders
- [ ] Badge still positioned correctly over placeholder

### Image position: right
- [ ] Image moves to right column, text to left
- [ ] Badge flips to LEFT edge of image (overlapping into gap)
- [ ] Text gets `padding-right: 100px` instead of `padding-left`

---

## Responsive Breakpoints

### Desktop (>=1024px)
- [ ] Two-column row layout, max-width 1340px centered
- [ ] Image flex:1, min-height 447px
- [ ] Text flex:1, max-width 670px, padding-left 100px
- [ ] Badge 79px, absolute positioned, vertically centered on image edge

### Tablet (768px-1024px)
- [ ] Stacked layout — image on top, text below
- [ ] Badge visible but scaled to ~65px
- [ ] Padding 40px 32px

### Mobile (<768px)
- [ ] Stacked layout — image on top (250px height), text below
- [ ] Badge hidden (`display: none`)
- [ ] Padding 24px 16px
- [ ] Heading 26px, eyebrow 14px

---

## Badge SVG

- [ ] Curved text readable and follows circular path
- [ ] Center image clipped to circle, 28px diameter
- [ ] White circle background, no border
- [ ] Text is uppercase, 10px bold DM Sans
- [ ] SVG uses section-scoped IDs (no conflicts with multiple instances on same page)

---

## Data Edge Cases

### Long heading text
- [ ] Heading wraps naturally, no overflow

### Long body text
- [ ] Body scrolls/expands within column, no truncation

### Long badge text (>25 chars)
- [ ] Text may overflow circular path — expected limitation, not a bug
- [ ] No layout breakage from overflow

### Long eyebrow text
- [ ] Wraps to second line if needed

### Missing badge image
- [ ] Badge renders with curved text only, empty center (no broken image icon)

### Rich text body with multiple links
- [ ] All links underlined, correct color (#515151)
- [ ] Links are clickable and navigate correctly

---

## Multiple Instances

- [ ] Two sections on same page render independently (scoped CSS via section.id)
- [ ] Badge SVG IDs don't conflict (textPath, clipPath use section.id)

---

## Theme Editor

- [ ] All settings appear in customizer: image, eyebrow, heading, heading_size, body, badge_image, badge_text, show_badge, image_position, color_scheme, padding_top, padding_bottom
- [ ] Live preview updates when settings change
- [ ] Section appears in "Add section" under preset name