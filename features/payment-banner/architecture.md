# Architecture — payment-banner

## File plan

| Action | Path | Purpose |
|---|---|---|
| CREATE | `sections/payment-banner.liquid` | Section wrapper + flat schema + intro block + dual-DOM per card (md: toggle). Hosts inline `<style>` scoped to `#shopify-section-{{ section.id }}` only if Tailwind cannot express a value (ui-agent decides Phase 1). |
| CREATE | `snippets/payment-banner-card-1-desktop.liquid` | Card 1 (Pricing) desktop DOM — eyebrow + title (`#0b1e3d`) + body + product image + callout image + inline decorative SVG vector (437x216, aria-hidden) + pill CTA |
| CREATE | `snippets/payment-banner-card-1-mobile.liquid` | Card 1 (Pricing) mobile DOM — title (`#000`) + body + product image + callout image + pill CTA. No eyebrow. No decorative SVG. |
| CREATE | `snippets/payment-banner-card-2-desktop.liquid` | Card 2 (Financing) desktop DOM — cyan bg + inline decorative bars (dark-blue `#0033a1` 21x400 + orange `#f75200` 21x178, aria-hidden) + title + body + white logos panel (`card_2_logos_image`) + pill CTA (height 38) |
| CREATE | `snippets/payment-banner-card-2-mobile.liquid` | Card 2 (Financing) mobile DOM — full-cover bg image (`card_2_mobile_bg_image`) with `#6bc4e8` solid fallback + title + body + pill CTA (height 48). No logos panel. No decorative bars. |
| APPEND | `templates/page.test.json` | Add `payment-banner` entry under `sections` (settings only, no blocks). Append to `order` array after `promo-test`. Preserve `collection-grid-test` + `promo-test`. |
| SKIP | `js/sections/payment-banner.js` | brief §6: JS=NO. Two native `<a>` CTAs; no state, no events, no fetch. |
| SKIP | `scss/sections/payment-banner.scss` | Default: no SCSS. Scoped inline `<style>` precedent (`hero-banner.liquid`, `promo-test.liquid`) covers any Tailwind escape case. ui-agent Phase 1 flags escalation ONLY if mask-image / complex layering blocks Tailwind. |

**Do not bundle imagery.** All photographic content is `image_picker`; decorative SVG + colored bars are inline code (no `/assets/payment-banner-*.png`).

## Reuse (existing)

| Need | File | Call-site signature |
|---|---|---|
| Responsive image rendering (all 4 image_picker slots) | `snippets/shopify-responsive-image.liquid` | `{% render 'shopify-responsive-image', image: <setting>, image_id: '<stable-id>', image_aspect_ratio: <decimal>, image_alt: <fallback>, image_class: 'tw-w-full tw-h-full tw-object-cover', wrapper_class: 'tw-w-full tw-h-full', crop: true %}` — same pattern used by `promo-test-card-desktop.liquid` and `promo-test-card-mobile.liquid`. Writes its own `<style>` block keyed on `image_id`, so each render needs a unique `image_id` per slot (`'card1-product'`, `'card1-callout'`, `'card2-logos'`, `'card2-mobilebg'`). |
| Dual-DOM per card at md: (1024px) | `sections/promo-test.liquid` (lines 82–90) | Pattern: outer `<div class="tw-hidden md:tw-block">{% render 'card-desktop' %}</div>` + `<div class="md:tw-hidden">{% render 'card-mobile' %}</div>` — lift this wrapping pattern into `sections/payment-banner.liquid` for each card. |
| Anchor-vs-div CTA wrapper (blank `cta_link` variant) | `snippets/promo-test-card-desktop.liquid` (lines 29–40, 87–91) + `snippets/promo-test-card-mobile.liquid` (lines 32–43, 85–89) | Pattern: `{% if cta_link != blank %}<a href=... class=...focus-visible:tw-outline... aria-label=...>{% else %}<div class=... role="presentation">{% endif %}` at wrapper open, mirrored close. Lift pattern; each payment-banner card has exactly one CTA so the whole card wraps in the `<a>`. |
| Pill CTA as inline `<span>` (no nested `<a>`) | `snippets/promo-test-card-desktop.liquid` (lines 79–83) | Pattern: `<span class="...tw-inline-flex tw-items-center tw-justify-center tw-h-[<height>] tw-px-[<pad>] tw-rounded-full ...">{{ cta_label | escape }}</span>` — ui-agent sizes per card/breakpoint (card 1: match figma; card 2 desktop: 38px height; card 2 mobile: 48px height). Reject `snippets/button.liquid` — it renders `<a>` and would nest inside the card's outer `<a>`. |
| Focus-visible ring utility | `snippets/promo-test-card-desktop.liquid` line 32 | Class string: `focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[<brand-focus-hex>]` — ui-agent picks the focus color from `figma-context.md` tokens. |
| Inline `<style>` scoped to section | `sections/hero-banner.liquid` (lines 19–47), `sections/promo-test.liquid` (lines 21–44) | Pattern: `<style>#shopify-section-{{ section.id }} .payment-banner__X { ... }</style>` at top of section file. Use only for values Tailwind cannot express. |

**Rejected reuse targets:**
- `snippets/button.liquid` — renders `<a>`; would nest anchors inside the outer card `<a>` wrapper. Inline `<span>` pill is the correct pattern (matches promo-test).
- `snippets/heading.liquid` / `snippets/subheading.liquid` — bespoke typography scales per card; utility-class inline is cleaner than overriding snippet defaults.
- `snippets/image.liquid` — has internal dual-image `tw-hidden md:tw-block` split. Payment-banner's 4 image slots are each natively per-breakpoint (card 1 pair rendered in both DOMs, card 2's slots are different images per breakpoint), so direct `shopify-responsive-image` calls from inside each per-breakpoint snippet are cleaner than routing through `image.liquid`'s dual-image wrapper.

## Cross-section contracts

None — self-contained. brief §10 explicitly states no cross-section dependencies.

## Open questions

None blocking. Decorative SVG vector (card 1 desktop, 437x216) and decorative bars (card 2 desktop, `#0033a1` 21x400 + `#f75200` 21x178) are Phase 2 detail — ui-agent either inlines the Figma vector path data or builds a geometric approximation from `figma-context.md` at implementation time.
