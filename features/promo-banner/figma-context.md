# Figma Design Context — promo-banner

Source file: `g3gxO3mhrniJOYTHNmotAu` (The AC Outlet)

## Desktop — node `5654:6240`

URL: https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-6240&m=dev

### Layout
- Section bg: `#f4f6f8`
- Padding: `pt-[60px] pb-[10px] px-[50px]`
- Inner max-width: `1340px`
- Gap between heading block and cards: `24px`
- Heading block width: `599px`
  - Title 48px DM Sans Bold, line-height 52.8px, color `#0b1e3d`
  - Subtitle 16px DM Sans Medium, line-height 20px, color `#666`, 2 lines (`<br>` between)
- Cards row: `flex gap-[40px] items-center`
- Card: 420x420px, bg `#a1a1a1` (fallback), rounded `12px` (radius/xl), overflow hidden
  - Image layer absolute, sized to cover 420px square (custom crop per image)
  - Gradient overlay: bottom-to-top black-to-transparent (`from-[45.595%] from-rgba(255,255,255,0) via-[57.777%] via-rgba(8,8,8,0.4) to-rgba(0,0,0,0.8)`)
  - Text block: absolute top 240px, left 45px, width 331px
    - Card title 24px DM Sans Bold, leading 28px, `#f4f6f8`, capitalize, centered
    - Card desc 16px DM Sans Medium, leading 20px, `#eaeaea`, centered
    - Button `h-48 px-[32px] rounded-[100px] bg-[#027db3]`, label 16px DM Sans Bold, `#f4f6f8`, capitalize, leading 28px
  - Gap between title/desc/button: 12px

### Variants on cards
1. Split System
2. Mini-Split System
3. Packaged Unit
(Exactly three in Figma; schema should support arbitrary count via blocks.)

### Tokens (Figma vars)
- `radius/xl = 12`

---

## Mobile — node `5654:53324`

URL: https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-53324&m=dev

### Layout
- Section bg: `white`
- Padding: `px-[16px] py-[30px]`
- Heading block: padding-bottom 24px, gap 8px
  - Title 28px DM Sans Bold, line-height 33.6px, color `#000`
  - Subtitle 16px DM Sans Medium, line-height 20px, color `#666`
- Cards strip: `flex flex-col gap-[16px]` wrapping the horizontal scroller
  - Scroller: `overflow-x-auto px-[16px] w-[390.4px]` (container = viewport width)
  - Inner row: `flex gap-[12px] h-[484.46px] w-[820.39px]`, three flex-1 cards
- Card (mobile layout — vertical):
  - Image top, height 265.46px, rounded `10px` (bigger radius on inside), object-cover
  - Gap 24px to content below (actually 24px gap on container, then internal 12px stacks)
  - Title 19.6px DM Sans Bold, leading 26.6px, black, centered, full width
  - Description 15px DM Sans SemiBold, leading 24px, `#515151`, centered, 4 lines in Figma
  - Button h-48, px-31.8, rounded 100px, bg `#027db3`, label 15px Bold white, leading 30px
- Below scroller: scroll progress bar — h-2, full width, bg `rgba(0,0,0,0.1)`, inner indicator `bg-black rounded-[30px]` (width driven by scroll position, snapshot at ~43.66%)

### Tokens (Figma vars)
- (none returned)

---

## Derived design tokens

Heading color: `#0b1e3d` (desktop), `#000` (mobile). Schema should expose as setting.
Subtitle color: `#666` (both).
Card title color: `#f4f6f8` (desktop, on image), `#000` (mobile, below image).
Card desc color: `#eaeaea` (desktop), `#515151` (mobile).
Button bg: `#027db3` (both).
Button label color: `#f4f6f8` / `#ffffff`.
Section bg: `#f4f6f8` (desktop), `#ffffff` (mobile).
Card fallback bg: `#a1a1a1`.
Card radius: `12px` desktop (radius/xl), `10px` mobile inner image.

## Font stack
- DM Sans (Bold / Medium / SemiBold) — load via Shopify `font_picker` + `font_face` (pattern used in hero-banner.liquid).

## User intent
- Slider with navigation shown ONLY when desktop content overflows (use carousel-swiper).
- Mobile layout = native horizontal scroll + progress bar (per Figma mobile frame).
- Shopify responsive image snippet for card images.
- Aspect ratio = width / height — for images, preserve design ratio (1:1 on desktop 420x420, varies on mobile 265.46 tall card).
