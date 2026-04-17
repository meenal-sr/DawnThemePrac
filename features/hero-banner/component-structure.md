# Component Structure — HeroBanner

## File Tree

```
sections/hero-banner.liquid          ← only output file (overwritten)
features/hero-banner/
  component-structure.md             ← this file
```

No JS. No SCSS. No snippets.

---

## DOM Shape

```html
<style> <!-- scoped @font-face + CSS custom properties --> </style>

<section.hero-banner
  data-section-type="hero-banner"
  aria-label="Hero banner"
>
  <div.hero-banner__bg>                    <!-- absolute inset-0 -->
    <!-- IF background_image set -->
    <img loading="eager" fetchpriority="high" ...>
    <!-- ELSE -->
    <div style="background-color: #f0efeb;">
  </div>

  <!-- IF foreground_image set -->
  <picture.hero-banner__foreground          <!-- tw-hidden md-small:tw-block, absolute right-0 top-[-74px] -->
    <source media="(min-width: 768px)" srcset="...">
    <img alt="" role="presentation" loading="lazy">
  </picture>

  <!-- IF overlay_opacity > 0 -->
  <div.hero-banner__overlay                 <!-- absolute inset-0, bg-gradient-to-r, inline opacity -->

  <!-- IF logo_image set -->
  <img.hero-banner__logo                    <!-- tw-hidden md-small:tw-block, absolute top-10 right-10 -->
    alt="" role="presentation" loading="lazy"
  >

  <div.hero-banner__content                 <!-- relative z-10, flex-col, responsive padding/min-height -->
    <div>                                   <!-- inner stack: gap-4, max-w-[938px] at md+ -->

      <!-- IF eyebrow_text set -->
      <p.hero-banner__eyebrow>

      <h1.hero-banner__heading>

      <!-- IF subheading_text set -->
      <div.hero-banner__subhead>            <!-- richtext output, opacity-70 -->

      <!-- IF cta_label AND cta_link set -->
      <div>
        <a.hero-banner__cta href="...">
      </div>

    </div>
  </div>
</section>
```

---

## Data-State Attributes

| Attribute | Values | Meaning |
|---|---|---|
| `data-section-type` | `"hero-banner"` | Section identifier for test selectors and JS targeting |

No runtime `data-state` mutations. All conditional rendering is Liquid-controlled at render time.

---

## Liquid Variables / Schema Settings

| Variable | Source | Usage |
|---|---|---|
| `bg_image` | `section.settings.background_image` | Background `<img>` srcset or fallback `<div>` |
| `fg_image` | `section.settings.foreground_image` | Foreground `<picture>` element |
| `logo_image` | `section.settings.logo_image` | Logo `<img>` |
| `eyebrow_text` | `section.settings.eyebrow_text` | `<p.hero-banner__eyebrow>` |
| `heading_text` | `section.settings.heading_text` | `<h1.hero-banner__heading>` |
| `subheading_text` | `section.settings.subheading_text` | `<div.hero-banner__subhead>` (raw richtext) |
| `cta_label` | `section.settings.cta_label` | CTA anchor text |
| `cta_link` | `section.settings.cta_link` | CTA `href` |
| `text_color` | `section.settings.text_color` | CSS var `--hero-text-color` |
| `cta_bg_color` | `section.settings.cta_bg_color` | CSS var `--hero-cta-bg` |
| `cta_text_color` | `section.settings.cta_text_color` | CSS var `--hero-cta-text` |
| `overlay_opacity` | `section.settings.overlay_opacity` | Inline `style="opacity: N"` on overlay div |
| `overlay_decimal` | derived `overlay_opacity / 100.0` | Actual opacity decimal for inline style |
| `heading_font` | `section.settings.heading_font` | `font_face` output + CSS var `--hero-heading-font` |
| `body_font` | `section.settings.body_font` | `font_face` output + CSS var `--hero-body-font` |
| `section.id` | Shopify built-in | CSS selector scoping `#shopify-section-{{ section.id }}` |

---

## Token Additions

None. All hero-specific colors (`#027db3` CTA blue, `#f0efeb` bg fallback, `#ffffff` text defaults) are one-off to this section. Applied as Tailwind arbitrary values or inline fallback style. Not promoted to `tailwind.config.js` — see Tradeoffs.

---

## SCSS Output

None — styling fully expressed in Tailwind utilities. The scoped `<style>` block handles only dynamic merchant-controlled values (font-face declarations and CSS custom properties) that cannot be expressed as static utility classes.

---

## CSS Custom Properties Used

| Property | Source | Figma token |
|---|---|---|
| `--hero-heading-font` | `heading_font.family` + `heading_font.fallback_families` | DM Sans Bold (dm_sans_n7) |
| `--hero-body-font` | `body_font.family` + `body_font.fallback_families` | DM Sans Medium (dm_sans_n5) |
| `--hero-text-color` | `section.settings.text_color` | `#ffffff` |
| `--hero-cta-bg` | `section.settings.cta_bg_color` | `#027db3` |
| `--hero-cta-text` | `section.settings.cta_text_color` | `#ffffff` |

---

## Figma Variants Implemented

| Figma element | Implementation |
|---|---|
| Background lifestyle image (5654:4200) | `<img>` with srcset 600/900/1340/1920w, eager + fetchpriority high |
| Solid fallback `#f0efeb` (5654:4200) | `<div style="background-color: #f0efeb">` when `background_image` blank |
| Foreground couch image (5654:4202) | `<picture>` with `<source media="(min-width:768px)">` — desktop-only, lazy loaded |
| Gradient overlay (5654:4204) | `tw-bg-gradient-to-r tw-from-black tw-to-transparent` + inline opacity |
| Logo (5654:4205) | `<img>` hidden mobile, shown `md-small:tw-block`, decorative `alt=""` |
| Eyebrow — 16px/25px lh, medium, uppercase | `tw-text-[16px] tw-leading-[25px] tw-font-medium tw-uppercase`, color via CSS var |
| Heading — 60px/66px, bold (desktop) | `md:tw-text-[60px] md:tw-leading-[66px] tw-font-bold`, scales to 32px mobile |
| Subhead — 15.9px/24.9px, medium, 70% opacity | `tw-text-[15.9px] tw-leading-[24.9px] tw-font-medium tw-opacity-70` |
| CTA — blue pill, bold, capitalize | `tw-rounded-full tw-px-8 tw-py-[10px] tw-font-bold tw-capitalize`, bg/text via CSS vars |
| Mobile responsive | Foreground + logo hidden `tw-hidden md-small:tw-block`, heading `tw-text-[32px]`, padding `tw-px-5` |

---

## Figma Variants NOT Implemented

| Element | Reason |
|---|---|
| Decorative vector (5654:4203) | Design flourish — not merchant-configurable, purely decorative overlay. Adding it would require SVG inline or a hardcoded asset URL (7-day expiry). Zero merchant value. Omitted per brief decision. |
| Mobile Figma node | No mobile Figma node was provided. Mobile reflow (32px heading, hidden foreground/logo, reduced padding) is inferred from the desktop design. Flag for design team review once a mobile frame exists. |
| CTA hover color | No Figma hover spec. Using `hover:tw-opacity-90` as conventional feedback. Update if design team supplies specific hover token. |

---

## TS Handoff Notes

No JavaScript required. This section has no interactive behavior — all state is Liquid-controlled at render time. No `data-state` transitions, no events, no component initialization needed.

If a future variant adds interactivity (e.g. animated text swap, video background), a JS entry `js/sections/hero-banner.js` would be needed at that point.

---

## Responsive Breakpoint Summary

| Breakpoint | Min-width | Changes |
|---|---|---|
| base (mobile) | — | 32px heading, `tw-px-5 tw-py-10`, foreground + logo hidden |
| `md-small` | 768px | 44px heading, `tw-px-10`, foreground + logo reappear |
| `md` | 1024px | 60px heading, `tw-leading-[66px]`, `tw-px-20 tw-py-20`, max-w-[938px] content |
| `lg` / `2xl` | 1280px / 1550px | Full Figma desktop composition |
