const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { sectionTestUrl, saveScreenshot, requireElement, qaDir, loadTemplate } = require('../../playwright-config/helpers');

// A11y marker — brief declares Accessibility: skip
const QA_DIR = qaDir('hero-banner');
fs.writeFileSync(
  path.join(QA_DIR, 'a11y-skipped.marker'),
  'Brief says Accessibility: skip. No axe scans run.\n'
);

const SECTION = 'hero-banner';
const SECTION_SELECTOR = '[data-section-type="hero-banner"]';
const SECTION_TYPE = 'page';

// Inline helper: wait for images in section to load before screenshotting
async function waitForSectionImages(page, selector) {
  await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    if (!section) return Promise.resolve();
    const images = Array.from(section.querySelectorAll('img'));
    return Promise.all(
      images.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise(r => {
              img.addEventListener('load', r, { once: true });
              img.addEventListener('error', r, { once: true });
            })
      )
    );
  }, selector);
}

test.beforeEach(async ({ page }) => {
  await page.goto(sectionTestUrl(SECTION_TYPE), { waitUntil: 'domcontentloaded' });
  await page.locator(SECTION_SELECTOR).first().waitFor({ state: 'attached', timeout: 10_000 }).catch(() => {});
  await requireElement(page, SECTION_SELECTOR);
  await page.evaluate(() => document.fonts.ready);
});

test.describe(`${SECTION} — UI`, () => {
  // --- GROUP A: Content completeness (required template settings populated) ---

  test('A1: Content completeness — required template settings populated', () => {
    const template = loadTemplate(SECTION_TYPE);
    const settings = template.sections[SECTION].settings;
    const required = [
      'eyebrow_text',
      'heading_text',
      'subheading_text',
      'cta_label',
      'cta_link',
      'background_image',
      'foreground_image',
      'logo_image',
      'text_color',
      'cta_bg_color',
      'cta_text_color',
      'overlay_opacity',
      'heading_font',
      'body_font',
    ];
    const missing = required.filter(k => settings[k] == null || String(settings[k]).trim() === '');
    expect(
      missing,
      `Missing required content in templates/${SECTION_TYPE}.test.json → sections.${SECTION}.settings: ${missing.join(', ')}. Populate every design-required setting before running the spec.`
    ).toEqual([]);
  });

  // --- GROUP B: Typography + color parity (design breakpoints only) ---

  test('B1 [desktop]: Eyebrow font-size 16px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const fontSize = await eyebrow.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBe(16);
  });

  test('B2 [desktop]: Eyebrow line-height 25px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const lineHeight = await eyebrow.evaluate(el => parseFloat(getComputedStyle(el).lineHeight));
    expect(lineHeight).toBe(25);
  });

  test('B3 [desktop]: Eyebrow font-weight 500', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const fontWeight = await eyebrow.evaluate(el => parseInt(getComputedStyle(el).fontWeight, 10));
    expect(fontWeight).toBe(500);
  });

  test('B4 [desktop]: Eyebrow text-transform uppercase', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const textTransform = await eyebrow.evaluate(el => getComputedStyle(el).textTransform);
    expect(textTransform).toBe('uppercase');
  });

  test('B5 [desktop]: Eyebrow color white', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const color = await eyebrow.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('B6 [desktop]: Heading font-size 60px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const fontSize = await heading.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBe(60);
  });

  test('B7 [desktop]: Heading line-height 66px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const lineHeight = await heading.evaluate(el => parseFloat(getComputedStyle(el).lineHeight));
    expect(lineHeight).toBe(66);
  });

  test('B8 [desktop]: Heading font-weight 700', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const fontWeight = await heading.evaluate(el => parseInt(getComputedStyle(el).fontWeight, 10));
    expect(fontWeight).toBe(700);
  });

  test('B9 [desktop]: Heading color white', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const color = await heading.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('B10 [desktop]: Subhead font-size 15.4–16.4px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const fontSize = await subhead.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(15.4);
    expect(fontSize).toBeLessThanOrEqual(16.4);
  });

  test('B11 [desktop]: Subhead line-height 23.9–25.9px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const lineHeight = await subhead.evaluate(el => parseFloat(getComputedStyle(el).lineHeight));
    expect(lineHeight).toBeGreaterThanOrEqual(23.9);
    expect(lineHeight).toBeLessThanOrEqual(25.9);
  });

  test('B12 [desktop]: Subhead font-weight 500', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const fontWeight = await subhead.evaluate(el => parseInt(getComputedStyle(el).fontWeight, 10));
    expect(fontWeight).toBe(500);
  });

  test('B13 [desktop]: Subhead color white', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const color = await subhead.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('B14 [desktop]: Subhead opacity 0.65–0.75', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const opacity = await subhead.evaluate(el => parseFloat(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThanOrEqual(0.65);
    expect(opacity).toBeLessThanOrEqual(0.75);
  });

  test('B15 [desktop]: CTA font-size 16px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const fontSize = await cta.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBe(16);
  });

  test('B16 [desktop]: CTA line-height 28px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const lineHeight = await cta.evaluate(el => parseFloat(getComputedStyle(el).lineHeight));
    expect(lineHeight).toBe(28);
  });

  test('B17 [desktop]: CTA font-weight 700', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const fontWeight = await cta.evaluate(el => parseInt(getComputedStyle(el).fontWeight, 10));
    expect(fontWeight).toBe(700);
  });

  test('B18 [desktop]: CTA text-transform capitalize', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const textTransform = await cta.evaluate(el => getComputedStyle(el).textTransform);
    expect(textTransform).toBe('capitalize');
  });

  test('B19 [desktop]: CTA color white', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const color = await cta.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('B20 [desktop]: CTA background-color #027db3', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const backgroundColor = await cta.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toBe('rgb(2, 125, 179)');
  });

  test('B21 [desktop]: CTA border-radius pill (>= 100px)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const styles = await cta.evaluate(el => {
      const cs = getComputedStyle(el);
      return {
        topLeft: parseFloat(cs.borderTopLeftRadius),
        bottomLeft: parseFloat(cs.borderBottomLeftRadius),
      };
    });
    expect(styles.topLeft).toBeGreaterThanOrEqual(100);
    expect(styles.bottomLeft).toBeGreaterThanOrEqual(100);
  });

  // Mobile — inferred values
  test('B22 [mobile]: Heading font-size 31–33px (INFERRED)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const fontSize = await heading.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(31);
    expect(fontSize).toBeLessThanOrEqual(33);
  });

  test('B23 [mobile]: Heading font-weight 700', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const fontWeight = await heading.evaluate(el => parseInt(getComputedStyle(el).fontWeight, 10));
    expect(fontWeight).toBe(700);
  });

  test('B24 [mobile]: Heading color white', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const color = await heading.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('B25 [mobile]: Eyebrow font-size 16px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const fontSize = await eyebrow.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBe(16);
  });

  test('B26 [mobile]: Eyebrow text-transform uppercase', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const textTransform = await eyebrow.evaluate(el => getComputedStyle(el).textTransform);
    expect(textTransform).toBe('uppercase');
  });

  test('B27 [mobile]: Eyebrow color white', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const color = await eyebrow.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('B28 [mobile]: Subhead font-size 14–16px (INFERRED)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const fontSize = await subhead.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(14);
    expect(fontSize).toBeLessThanOrEqual(16);
  });

  test('B29 [mobile]: Subhead color white', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const color = await subhead.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('B30 [mobile]: Subhead opacity 0.65–0.75', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const opacity = await subhead.evaluate(el => parseFloat(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThanOrEqual(0.65);
    expect(opacity).toBeLessThanOrEqual(0.75);
  });

  test('B31 [mobile]: CTA font-size 16px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const fontSize = await cta.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBe(16);
  });

  test('B32 [mobile]: CTA background-color #027db3', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const backgroundColor = await cta.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(backgroundColor).toBe('rgb(2, 125, 179)');
  });

  test('B33 [mobile]: CTA color white', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const color = await cta.evaluate(el => getComputedStyle(el).color);
    expect(color).toBe('rgb(255, 255, 255)');
  });

  // --- GROUP C: Layout integrity (intermediates only) ---

  test('C1 [tablet]: No horizontal scroll on document', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Runs only in tablet project');
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth <= clientWidth + 1).toBe(true);
  });

  test('C2 [tablet]: No horizontal scroll on section', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Runs only in tablet project');
    const section = await requireElement(page, SECTION_SELECTOR);
    const { scrollWidth, clientWidth } = await section.evaluate(el => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth <= clientWidth + 1).toBe(true);
  });

  test('C3 [tablet]: Content container fits viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Runs only in tablet project');
    const content = await requireElement(page, '.hero-banner__content');
    const { x, width } = await content.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, width: rect.width };
    });
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(x >= 0 && x + width <= viewportWidth).toBe(true);
  });

  test('C4 [tablet]: Eyebrow and heading do not vertically overlap', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Runs only in tablet project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const heading = await requireElement(page, '.hero-banner__heading');
    const eyebrowBox = await eyebrow.boundingBox();
    const headingBox = await heading.boundingBox();
    expect(eyebrowBox && headingBox).toBeTruthy();
    expect(eyebrowBox.y + eyebrowBox.height <= headingBox.y).toBe(true);
  });

  test('C5 [tablet]: Heading and subhead do not vertically overlap', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Runs only in tablet project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const headingBox = await heading.boundingBox();
    const subheadBox = await subhead.boundingBox();
    expect(headingBox && subheadBox).toBeTruthy();
    expect(headingBox.y + headingBox.height <= subheadBox.y).toBe(true);
  });

  test('C6 [tablet]: Subhead and CTA do not vertically overlap', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Runs only in tablet project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const cta = await requireElement(page, '.hero-banner__cta');
    const subheadBox = await subhead.boundingBox();
    const ctaBox = await cta.boundingBox();
    expect(subheadBox && ctaBox).toBeTruthy();
    expect(subheadBox.y + subheadBox.height <= ctaBox.y).toBe(true);
  });

  test('C1 [tablet-lg]: No horizontal scroll on document', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Runs only in tablet-lg project');
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth <= clientWidth + 1).toBe(true);
  });

  test('C2 [tablet-lg]: No horizontal scroll on section', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Runs only in tablet-lg project');
    const section = await requireElement(page, SECTION_SELECTOR);
    const { scrollWidth, clientWidth } = await section.evaluate(el => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth <= clientWidth + 1).toBe(true);
  });

  test('C3 [tablet-lg]: Content container fits viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Runs only in tablet-lg project');
    const content = await requireElement(page, '.hero-banner__content');
    const { x, width } = await content.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, width: rect.width };
    });
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(x >= 0 && x + width <= viewportWidth).toBe(true);
  });

  test('C4 [tablet-lg]: Eyebrow and heading do not vertically overlap', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Runs only in tablet-lg project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const heading = await requireElement(page, '.hero-banner__heading');
    const eyebrowBox = await eyebrow.boundingBox();
    const headingBox = await heading.boundingBox();
    expect(eyebrowBox && headingBox).toBeTruthy();
    expect(eyebrowBox.y + eyebrowBox.height <= headingBox.y).toBe(true);
  });

  test('C5 [tablet-lg]: Heading and subhead do not vertically overlap', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Runs only in tablet-lg project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const headingBox = await heading.boundingBox();
    const subheadBox = await subhead.boundingBox();
    expect(headingBox && subheadBox).toBeTruthy();
    expect(headingBox.y + headingBox.height <= subheadBox.y).toBe(true);
  });

  test('C6 [tablet-lg]: Subhead and CTA do not vertically overlap', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Runs only in tablet-lg project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const cta = await requireElement(page, '.hero-banner__cta');
    const subheadBox = await subhead.boundingBox();
    const ctaBox = await cta.boundingBox();
    expect(subheadBox && ctaBox).toBeTruthy();
    expect(subheadBox.y + subheadBox.height <= ctaBox.y).toBe(true);
  });

  // --- GROUP D: Live screenshots (design breakpoints only) ---

  test('D1: Save mobile live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    await waitForSectionImages(page, SECTION_SELECTOR);
    const filePath = await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-mobile');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('D2: Save desktop live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    await waitForSectionImages(page, SECTION_SELECTOR);
    const filePath = await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-desktop');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  // --- GROUP E: Content placement (design breakpoints only) ---

  // Line count helper
  const lineCount = (el) => {
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.offsetHeight / lh);
  };

  test('E1 [desktop]: Heading wraps to 2 lines', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const lines = await heading.evaluate(lineCount);
    expect(lines).toBe(2);
  });

  test('E2 [desktop]: Subhead wraps to 2 lines', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const subhead = await requireElement(page, '.hero-banner__subhead');
    const lines = await subhead.evaluate(lineCount);
    expect(lines).toBe(2);
  });

  test('E3 [desktop]: Eyebrow renders as 1 line', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const eyebrow = await requireElement(page, '.hero-banner__eyebrow');
    const lines = await eyebrow.evaluate(lineCount);
    expect(lines).toBe(1);
  });

  test('E4 [desktop]: CTA renders as 1 line', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const cta = await requireElement(page, '.hero-banner__cta');
    const lines = await cta.evaluate(lineCount);
    expect(lines).toBe(1);
  });

  test('E5 [desktop]: Content inner offsetWidth ≤ 462 (max-width ~460)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Runs only in desktop project');
    const content = await requireElement(page, '.hero-banner__content-inner');
    const width = await content.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(462);
  });

  test('E6 [mobile]: Heading wraps ≥ 2 lines', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Runs only in mobile project');
    const heading = await requireElement(page, '.hero-banner__heading');
    const lines = await heading.evaluate(lineCount);
    expect(lines).toBeGreaterThanOrEqual(2);
  });
});
