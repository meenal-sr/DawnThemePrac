# Founder Quote — Test Scenarios

## Visual QA (Playwright screenshot comparison)

### VQ-1: Desktop layout matches Figma
- Viewport: 1440x900
- Card visible with dark background, rounded corners (40px)
- Horizontal layout: portrait left, quote right
- 10X Health logo visible top area
- Screenshot saved to `tests/screenshots/founder-quote-desktop.png`

### VQ-2: Mobile layout stacks vertically
- Viewport: 390x844
- Portrait centered above quote text
- Logo centered
- Reduced padding and font sizes
- Screenshot saved to `tests/screenshots/founder-quote-mobile.png`

### VQ-3: Tablet intermediate layout
- Viewport: 768x1024
- Reduced padding/font vs desktop
- Still horizontal or gracefully transitioning
- Screenshot saved to `tests/screenshots/founder-quote-tablet.png`

## Functional Tests

### FN-1: All schema settings render
- Background image renders as CSS background
- Logo image displays
- Portrait displays in circle with white border
- Quote text renders
- Attribution name renders bold

### FN-2: Empty state handling
- No portrait: circle area hidden or placeholder
- No background image: solid dark fallback
- No logo: logo area collapses

### FN-3: Shadow card snippet integration
- Outer card uses `tenx-shadow-card` snippet
- Radius "lg" applied (40px border-radius)

## Accessibility

### A11Y-1: Semantic markup
- Section has `aria-label` or heading
- Images have alt text
- Quote uses `<blockquote>` with `<cite>` for attribution

### A11Y-2: Color contrast
- White text on dark background meets WCAG AA (4.5:1 minimum)
