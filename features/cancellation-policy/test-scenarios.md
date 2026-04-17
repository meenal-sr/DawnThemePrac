# Cancellation Policy — Test Scenarios

## Visual States

### Policy Content Section
- [ ] Default render: breadcrumbs visible, page content renders with correct typography
- [ ] H1 heading: 48px bold DM Sans black on desktop, 28px on mobile
- [ ] Body text: 15px medium DM Sans #515151, line-height 24px
- [ ] Ordered lists: 22.5px left margin, correct numbering
- [ ] Links: underlined, same body color
- [ ] Background: #F4F6F8 (or merchant-configured color)
- [ ] Container: max-width 1340px, centered

### Cancellation Form Section
- [ ] Heading: 32px bold DM Sans, centered
- [ ] 6 fields visible with correct labels and red asterisks
- [ ] Input styling: #E6E6E6 bg, 20px border-radius, 41px height
- [ ] Placeholder text: #757575, 14px DM Sans
- [ ] Submit button: full-width, #027DB3, 20px border-radius, 48px height, white text
- [ ] Bottom note: "Please note:" bold, rest regular weight

### Form Interaction States
- [ ] Empty form: all fields empty, placeholders visible
- [ ] Focus state: field receives focus indicator (browser default or custom)
- [ ] Validation error: submit with empty required field triggers HTML5 native validation message
- [ ] Successful submission: Shopify contact form redirects/shows success
- [ ] Button hover: opacity 0.9 transition

---

## Responsive Breakpoints

### Desktop (>=1024px)
- [ ] Policy content: 50px side padding, max-width 1340px
- [ ] Form grid: 2 columns, 3 rows
- [ ] Form container: max-width 1000px

### Tablet (768–1023px)
- [ ] Policy content: 32px side padding
- [ ] Form grid: 2 columns maintained
- [ ] H1: 48px (same as desktop)

### Mobile (<768px)
- [ ] Policy content: 16px side padding
- [ ] H1: drops to 28px
- [ ] Form grid: single column stack
- [ ] All fields full-width
- [ ] Submit button full-width

---

## Data Edge Cases

- [ ] Empty page content: section renders but body area is blank (no broken layout)
- [ ] Very long page content: no overflow, text wraps normally
- [ ] Page title with special characters: breadcrumb escapes properly
- [ ] Missing bottom note setting: note div not rendered
- [ ] Long form input values: text doesn't overflow input bounds
- [ ] Email field: rejects non-email format (HTML5 type="email")
- [ ] Phone field: accepts various phone formats (type="tel")

---

## Breadcrumbs

- [ ] Renders "Home > Cancellation policy" (or page title)
- [ ] "Home" links to `/`
- [ ] Current page name is plain text, not linked
- [ ] Correct font size (14px) and color (#515151)

---

## Theme Customizer Settings

- [ ] Background color change reflects immediately in preview
- [ ] Max-width setting adjusts container width
- [ ] Padding top/bottom settings apply correctly
- [ ] Form heading text editable
- [ ] Button label editable
- [ ] Button color change reflects on button
- [ ] Input background color change reflects on all inputs
- [ ] Bottom note richtext editable with bold/links

---

## Cross-Browser

- [ ] Contact form submits correctly in Chrome, Firefox, Safari, Edge
- [ ] Border-radius 20px renders on all inputs and button
- [ ] Grid layout works in all supported browsers
