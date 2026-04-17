# 10X Peptides Landing Page — Test Scenarios

## Visual Accuracy

### S1: Hero Banner
- [ ] Full-width background image displays edge-to-edge at 1440px
- [ ] Image uses `object-fit: cover`, no distortion at any viewport
- [ ] Image height ~1024px on desktop, ~500px on mobile
- [ ] `fetchpriority="high"` on hero image (LCP optimization)
- [ ] No visible layout shift during image load

### S2: Discover CTA + Image
- [ ] Two columns side-by-side at desktop (md and above)
- [ ] Left card has visible box shadow and border radius
- [ ] Heading, body text, and CTA button render inside card
- [ ] Right image is square, fills column height
- [ ] CTA button matches shared button style
- [ ] Card and image vertically centered

### S3: Video/Image Banner
- [ ] Media block centered within container
- [ ] Correct aspect ratio maintained (~1408x400 at desktop)
- [ ] If video: play button overlay visible, no autoplay
- [ ] If image: static display, no interactivity

### S4: Genetic Mutation Stats
- [ ] Large card with shadow centered on page
- [ ] "44%" displays prominently (large font, accent color)
- [ ] Stat headline reads naturally across line breaks
- [ ] Symptom grid: 4 columns on desktop, 2 on tablet, 1 on mobile
- [ ] Each symptom has checkmark icon to its left
- [ ] 3 body paragraphs render with proper spacing
- [ ] CTA button at bottom of card

### S5: Why Gene Test + Image
- [ ] Two-column layout matching Section 2 structure
- [ ] Left card with heading, body, CTA
- [ ] Right column shows video thumbnail with play button
- [ ] Play button centered on thumbnail

### S6: 3-Card Features
- [ ] Section heading centered above cards
- [ ] 3 cards side-by-side at desktop
- [ ] Each card: icon, title, separator line, description
- [ ] Cards have equal height (CSS Grid)
- [ ] Shadow and border-radius consistent with other cards

### S7: Don't Wait CTA + Image
- [ ] Two-column: left has colored background, right has image
- [ ] Left column text and CTA vertically centered
- [ ] Background color renders correctly (not white)
- [ ] Text color has sufficient contrast against background

### S8: Brand Section
- [ ] Heading renders above visual area
- [ ] Background image/SVG overlay display correctly
- [ ] Full-width at 1440px, proportional scaling on resize

---

## Responsive Breakpoints

Test at these widths: **375px, 390px, 768px, 1024px, 1280px, 1440px, 1550px**

### All Two-Column Sections (S2, S5, S7)
- [ ] Side-by-side at >= 768px (md-small)
- [ ] Stacked vertically at < 768px
- [ ] No horizontal overflow at any breakpoint
- [ ] Proper spacing/padding adjustments at each breakpoint

### Symptom Grid (S4)
- [ ] 4 columns at >= 1024px
- [ ] 2 columns at 768px-1023px
- [ ] 1 column at < 768px

### Feature Cards (S6)
- [ ] 3 columns at >= 1024px
- [ ] 2 columns at 768px-1023px (third card wraps)
- [ ] 1 column at < 768px

### General
- [ ] No horizontal scroll at any breakpoint
- [ ] Text remains readable (no truncation, no overflow)
- [ ] Images scale proportionally
- [ ] Touch targets >= 44x44px on mobile

---

## CTA Button Interactions

### All CTA Buttons
- [ ] Hover state visible (color change, opacity, or transform)
- [ ] Focus state visible (outline or ring) for keyboard nav
- [ ] Click navigates to configured URL
- [ ] Cursor changes to pointer on hover
- [ ] Button text is configurable via theme editor

### Specific CTAs
- [ ] "Order My Genetic Test" (S2) — links to correct URL
- [ ] "ORDER MY GENETIC TEST" (S4) — links to correct URL
- [ ] "ORDER MY GENETIC TEST" (S5) — links to correct URL
- [ ] "ORDER MY GENETIC TEST" (S7) — links to correct URL

---

## Video Interactions

### S3: Video Banner (if video media type selected)
- [ ] Play button visible over thumbnail
- [ ] Click replaces thumbnail with video iframe
- [ ] Video does not autoplay on page load
- [ ] Video iframe loads lazily (not in initial page load)

### S5: Why Gene Test Video
- [ ] Play button centered over 526x526 thumbnail
- [ ] Click triggers video playback (inline swap)
- [ ] After swap, video controls are accessible
- [ ] If no video URL configured, falls back to static image

---

## Image Loading

- [ ] Hero image: `fetchpriority="high"`, `loading="eager"`
- [ ] All below-fold images: `loading="lazy"`
- [ ] Images use Shopify's `image_url` filter with appropriate width parameters
- [ ] `srcset` or `<picture>` used for responsive images where beneficial
- [ ] No broken images when section has no image configured (placeholder or hidden)
- [ ] Square images (S2, S5) maintain aspect ratio at all breakpoints

---

## Accessibility

### Semantic HTML
- [ ] Each section uses `<section>` with descriptive `aria-label` or heading
- [ ] Headings follow logical hierarchy (h2 for section titles, h3 for card titles)
- [ ] No skipped heading levels within the page

### Images
- [ ] All `<img>` tags have meaningful `alt` text (configurable via schema)
- [ ] Decorative images use `alt=""`
- [ ] Icons in symptom list have `aria-hidden="true"` (text conveys meaning)

### Buttons and Links
- [ ] CTA links have descriptive text (not "Click here")
- [ ] Video play buttons have `aria-label="Play video"`
- [ ] All interactive elements reachable via keyboard (Tab)
- [ ] Focus order follows visual order

### Color Contrast
- [ ] Body text on white card: >= 4.5:1 contrast ratio
- [ ] Button text on button background: >= 4.5:1
- [ ] S7 heading/CTA text on colored background: >= 4.5:1
- [ ] Stat "44%" text meets contrast requirements

### Motion
- [ ] No essential content hidden behind animation
- [ ] `prefers-reduced-motion` respected if any transitions used

---

## Theme Editor

- [ ] All 8 sections appear in theme editor for `page.10x-peptides` template
- [ ] Each section's settings panel shows all configured schema fields
- [ ] Text fields accept and render merchant-entered content
- [ ] Image pickers work and preview correctly
- [ ] Block-based sections (S4 symptoms, S6 feature cards) allow add/remove/reorder
- [ ] Default values render sensibly when section first added
- [ ] Padding controls affect spacing in real-time preview

---

## Edge Cases

### Missing Content
- [ ] Section with no image configured: shows placeholder or hides image area gracefully
- [ ] Section with empty heading: no empty `<h2>` tag rendered
- [ ] Section with no CTA URL: button hidden or rendered as non-clickable
- [ ] S4 with 0 symptom blocks: symptom grid area hidden
- [ ] S6 with 1 card: single card centered, no broken grid

### Long Content
- [ ] Very long heading text wraps properly, no overflow
- [ ] Very long body text doesn't break card layout
- [ ] Long CTA button text wraps or truncates gracefully

### Performance
- [ ] Page loads with Lighthouse Performance score >= 80
- [ ] No CLS from lazy-loaded images (explicit width/height or aspect-ratio set)
- [ ] Total page weight reasonable (images optimized via Shopify CDN)
- [ ] CSS/JS files load only for sections present on the page