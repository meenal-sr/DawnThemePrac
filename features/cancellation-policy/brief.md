# Cancellation Policy Page — Brief

## What & Why

**Feature name:** cancellation-policy
**Purpose:** Static policy page with rich-text content and a cancellation request form. Merchants need a dedicated page customers can reference for cancellation terms and submit cancellation requests.
**Figma:** Desktop node `5514:195`, file `g3gxO3mhrniJOYTHNmotAu`

---

## Architecture Decisions

### Files to create

| File | Type | Purpose |
|------|------|---------|
| `templates/page.cancellation-policy.json` | Template | Wires sections together |
| `sections/cancellation-policy-content.liquid` | Section | Rich-text policy content wrapper |
| `sections/cancellation-form.liquid` | Section | 6-field cancellation request form |
| `snippets/breadcrumbs.liquid` | Snippet | Reusable breadcrumb component (none exists) |

### Why these boundaries

- **cancellation-policy-content** wraps `page.content` — merchant edits policy text via the page editor WYSIWYG. No need for section schema richtext settings; the page object already provides this. Section only adds styling (background, container, typography).
- **cancellation-form** is a standalone section because it has its own layout (2-col grid), configurable settings, and form submission logic. Uses Shopify's built-in contact form (`{% form 'contact' %}`) which sends to the store's notification email. Each field maps to `contact[field_name]` attributes.
- **breadcrumbs** is a snippet (not a section) so it can be included inside `cancellation-policy-content` at the top. Reusable across other pages later.

### Why `page.content` over richtext settings

The policy has two H2 headings, ordered lists, links, bold text — complex rich content that changes infrequently. The Shopify page editor WYSIWYG handles this natively. Duplicating it into section schema richtext settings would force merchants to edit in the theme customizer's limited richtext editor. `page.content` is the right tool.

---

## Data

| Data source | Used by | How accessed |
|-------------|---------|--------------|
| `page.content` | cancellation-policy-content | `{{ page.content }}` — rendered as HTML |
| `page.title` | cancellation-policy-content | `{{ page.title }}` — for breadcrumb label |
| Shopify contact form | cancellation-form | `{% form 'contact' %}` — built-in, no API needed |
| Section settings | cancellation-form | Heading, button label, button color, bottom note, field placeholders |

### Merchant-configurable values

**cancellation-policy-content section settings:**
- `background_color` (color, default `#F4F6F8`)
- `text_color` (color, default `#515151`)
- `heading_color` (color, default `#000000`)
- `max_width` (range, 800–1600, step 20, default 1340, unit px)
- `padding_top` (range, 0–160, step 4, default 30, unit px)
- `padding_bottom` (range, 0–160, step 4, default 0, unit px)

**cancellation-form section settings:**
- `heading` (text, default "Cancellation request form")
- `form_max_width` (range, 600–1400, step 20, default 1000, unit px)
- `input_bg_color` (color, default `#E6E6E6`)
- `button_label` (text, default "Submit")
- `button_color` (color, default `#027DB3`)
- `bottom_note` (richtext, default: the "Please note:" paragraph)
- `padding_top` (range, 0–160, step 4, default 0, unit px)
- `padding_bottom` (range, 0–160, step 4, default 80, unit px)

---

## Behaviour

### States

| State | Trigger | Visual |
|-------|---------|--------|
| Default | Page load | Form visible, empty fields |
| Validation error | Submit with empty required fields | HTML5 `required` attribute handles native validation |
| Submitted | Successful form post | Shopify redirects or shows success (default contact form behaviour) |

### JS requirements

**None.** This page is pure Liquid + CSS. Shopify's contact form handles submission. HTML5 `required` handles validation. No custom JS needed.

### Responsive strategy (CSS-only, no DOM duplication)

**Breadcrumbs:** Single row, no change across breakpoints.

**Policy content:**
- Desktop (>=1024px): `max-width: 1340px`, `padding: 30px 50px`
- Tablet (768–1023px): `padding: 30px 32px`
- Mobile (<768px): `padding: 24px 16px`, H1 font-size drops to 28px

**Form grid:**
- Desktop (>=1024px): 2-column grid (3 rows x 2 cols), `max-width: 1000px`
- Mobile (<768px): 1-column stack
- Tablet (768–1023px): 2-column grid maintained

**Bottom note:** Same container as policy content, responsive padding matches.

---

## Implementation Detail

### snippets/breadcrumbs.liquid

Renders a simple breadcrumb trail. Accepts no parameters — reads from `page.title` or `collection.title` contextually.

```
Home > {{ page.title }}
```

- Separator: `>` character
- "Home" links to `/`
- Current page is plain text (not linked)
- Font: 14px DM Sans, color #515151
- Scoped CSS via `{% style %}` block

### sections/cancellation-policy-content.liquid

Structure:
```
{% style %} ... {% endstyle %}
<div class="cancellation-content-{{ section.id }}">
  {% render 'breadcrumbs' %}
  <div class="cancellation-content__body rte">
    {{ page.content }}
  </div>
</div>
```

CSS responsibilities:
- Background color from setting
- Container max-width from setting, centered with auto margins
- Side padding responsive (50px desktop, 32px tablet, 16px mobile)
- Typography overrides inside `.rte`: h1/h2 = 48px/28px bold DM Sans black, p = 15px/500 DM Sans #515151, ol margin-left 22.5px, a underlined
- All font sizes via `font-family: 'DM Sans', sans-serif` forced in section CSS

### sections/cancellation-form.liquid

Structure:
```
{% style %} ... {% endstyle %}
<div class="cancellation-form-{{ section.id }}">
  <h2>{{ section.settings.heading }}</h2>
  {% form 'contact' %}
    <div class="cancellation-form__grid">
      <!-- 6 fields: order_number, name, email, phone, reason, additional_info -->
      <!-- Each field: label + input, name="contact[field_name]" -->
    </div>
    <button type="submit">{{ section.settings.button_label }}</button>
  {% endform %}
  {% if section.settings.bottom_note != blank %}
    <div class="cancellation-form__note rte">{{ section.settings.bottom_note }}</div>
  {% endif %}
</div>
```

Form fields (all required):
1. `contact[order_number]` — text input, placeholder "Enter your order number"
2. `contact[name]` — text input, placeholder "Enter your name"
3. `contact[email]` — email input, placeholder "Enter your email" (uses `name="contact[email]"` which Shopify recognizes)
4. `contact[phone]` — tel input, placeholder "Enter your phone number"
5. `contact[reason]` — text input, placeholder "Enter your reason for cancellation"
6. `contact[body]` — textarea or text input, placeholder "Enter additional information" (mapped to `contact[body]` so it appears in notification email body)

CSS responsibilities:
- Form container max-width from setting, centered
- Heading: 32px bold DM Sans, centered, mobile 24px
- Grid: `display: grid; grid-template-columns: 1fr 1fr; gap: 16px` on desktop, 1fr on mobile
- Input: bg from setting, border-radius 20px, height 41px, padding 0 12px, font 14px DM Sans
- Label: 14px DM Sans, color #1C1C1C, red asterisk via `::after` pseudo-element
- Button: full-width, bg from setting, border-radius 20px, height 48px, 14px DM Sans white, hover opacity 0.9
- Bottom note: same max-width as policy content (1340px), centered, responsive padding

### templates/page.cancellation-policy.json

```json
{
  "sections": {
    "content": {
      "type": "cancellation-policy-content",
      "settings": {}
    },
    "form": {
      "type": "cancellation-form",
      "settings": {}
    }
  },
  "order": ["content", "form"]
}
```

---

## Technical Tradeoffs

### page.content vs section richtext settings
- **Chosen:** `page.content` for policy text
- **Alternative:** Multiple richtext settings in section schema
- **Why:** Policy has complex formatting (H2s, ordered lists, links, bold) that the page WYSIWYG handles well. Section schema richtext is limited (no H2, restricted formatting). Merchant edits content in Pages admin, not theme customizer.
- **Downside:** Content not visible/editable in theme customizer preview.

### Shopify contact form vs custom API endpoint
- **Chosen:** `{% form 'contact' %}` built-in
- **Alternative:** Custom API endpoint or third-party form service
- **Why:** Zero setup, sends to store notification email, no JS needed. Sufficient for cancellation requests.
- **Downside:** Limited — no database storage, no auto-response, no order validation. If the merchant needs order validation or CRM integration later, this would need replacement.

### Breadcrumbs as snippet vs section
- **Chosen:** Snippet rendered inside cancellation-policy-content
- **Alternative:** Standalone breadcrumbs section in the template
- **Why:** Breadcrumbs share the same background and container as the content section. Separate section would create a visual gap or require matching backgrounds. Snippet keeps it visually unified.
- **Downside:** Breadcrumbs can't be independently repositioned in theme customizer.

### CSS-only responsive vs DOM duplication
- **Chosen:** CSS-only (grid to stack via media query)
- **Alternative:** Duplicate form markup for mobile
- **Why:** Layout change is simple (2-col to 1-col). No elements appear/disappear. CSS handles it cleanly.
- **Downside:** None meaningful.

---

## Constraints and Assumptions

- **Assumption:** Theme uses DM Sans globally. Sections force `font-family: 'DM Sans', sans-serif` in their style blocks as a safety measure (matches careers-hero pattern).
- **Assumption:** Shopify contact form notifications are enabled in store settings. If disabled, form submissions go nowhere silently.
- **Assumption:** Header and footer are theme-level and already exist — not built here.
- **Constraint:** No custom JS — keeps the page lightweight and avoids webpack entry overhead for a static page.
- **Constraint:** `{% style %}` inline blocks per section (established pattern from careers-hero), not external SCSS files.