# Component API — collection-grid

## No section-specific JS

The section contains no section-level JavaScript. All interactive behavior is delegated to the shared `<carousel-swiper>` Custom Element registered globally in `js/sections/global.js`.

No file written at `js/sections/collection-grid.js`. No webpack entry for this section.

## Mount / lifecycle

- Custom Element `<carousel-swiper>` self-mounts via `connectedCallback` whenever its shadow host enters the DOM (including theme-editor `shopify:section:load` reloads).
- `disconnectedCallback` disposes the Swiper instance and removes resize listeners.

## Interaction model (provided by Swiper)

| Interaction | Behavior | Owner |
|---|---|---|
| Prev click | `swiper.slidePrev()` — horizontal scroll toward start | swiper core |
| Next click | `swiper.slideNext()` | swiper core |
| Keyboard: Enter/Space on focused arrow button | Triggers click | native button |
| Keyboard: arrow keys | `keyboard: { enabled: true, onlyInViewport: true }` per `js/components/carousel-swiper.js` | swiper Keyboard module |
| Touch / drag | `grabCursor: true`, free-mode off | swiper core |
| Reduced motion | Swiper transitions auto-disable when the user has `prefers-reduced-motion: reduce` | swiper core |

## State transitions (managed by Swiper)

| State | Trigger | Effect |
|---|---|---|
| `swiper.isBeginning` (initial) | Mount with `scrollLeft === 0` | Prev button gets `disabled` attribute (Swiper) + `aria-disabled="true"` (MutationObserver in `carousel-swiper.js` mirrors `disabled` → `aria-disabled`) |
| Middle | After first `slideNext` | Both arrows enabled |
| `swiper.isEnd` | After last slide reaches viewport | Next button gets `disabled` |

Tailwind class `disabled:tw-opacity-40 disabled:tw-pointer-events-none` produces the 40% opacity Figma state when `disabled` attr present.

## Selectors (authoritative for tests)

- Section root: `[data-section-type="collection-grid"]`
- Heading: `.collection-grid__heading`
- CTA: `.collection-grid__cta`
- Carousel wrapper (data-swiper-parent): `.collection-grid__carousel`
- Prev button: `.carousel__nav-button--prev`
- Next button: `.carousel__nav-button--next`
- Tile anchor: `.homepage-collection-tiles__tile`
- Slide wrapper: `.swiper-slide`

## Configuration passed to carousel-wrapper

```liquid
{% render 'carousel-wrapper',
  section_id: section.id,
  slider_items: slider_items,
  navigation_enabled: show_arrows,
  mobile_slides_per_view: 2.2,
  tablet_slides_per_view: 4,
  desktop_slides_per_view: 6,
  mobile_space_between: 16,
  tablet_space_between: 20,
  desktop_space_between: 18,
  carousel_class: 'collection-grid__carousel-inner'
%}
```

## Events emitted / listened

None at the section boundary. Swiper's internal events (`slideChange`, `slideChangeTransitionEnd`, `autoplayTimeLeft`) are handled inside `js/components/carousel-swiper.js` only.

## DEVIATION from original plan

Original `component-api.md` documented a custom native-scroll controller at `js/sections/collection-grid.js` with `[data-track]`, `[data-arrow]`, and `data-state` attributes. Plan pivoted per user instruction to reuse the shared `<carousel-swiper>` component instead. Custom controller removed. Test selector contract updated accordingly.
