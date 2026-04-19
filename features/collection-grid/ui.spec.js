const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { sectionTestUrl, saveScreenshot, qaDir, requireElement, loadTemplate } = require('../../playwright-config/helpers');
const AxeBuilder = require('@axe-core/playwright').default;

const SECTION = 'collection-grid-test';
const SECTION_SELECTOR = '[data-section-type="collection-grid"]';
const SECTION_TYPE = 'page';

const waitForSectionImages = async (page, selector) => {
  await page.evaluate((sel) => {
    const section = document.querySelector(sel);
    if (!section) return Promise.resolve();
    const images = Array.from(section.querySelectorAll('img'));
    return Promise.all(images.map(img => img.complete || new Promise(res => {
      img.onload = res;
      img.onerror = res;
    })));
  }, selector);
};

const readComputed = (locator, props) =>
  locator.evaluate((el, keys) => {
    const computed = getComputedStyle(el);
    return Object.fromEntries(keys.map(k => [k, computed[k]]));
  }, props);

test.beforeEach(async ({ page }) => {
  await page.goto(sectionTestUrl(SECTION_TYPE), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(SECTION_SELECTOR);
  await page.evaluate(() => document.fonts.ready);
});

test('A-1: Content completeness — required template settings populated', () => {
  const template = loadTemplate(SECTION_TYPE);
  const settings = template.sections[SECTION].settings;
  const blocks = template.sections[SECTION].blocks;
  const blockOrder = template.sections[SECTION].block_order;

  const required = [
    'heading_text',
    'cta_label',
    'cta_url',
    'show_cta',
    'show_arrows',
    'background_color',
    'section_font',
  ];

  const missing = required.filter(k => settings[k] == null || String(settings[k]).trim() === '');
  expect(
    missing,
    `Missing required content in templates/${SECTION_TYPE}.test.json → sections.${SECTION}.settings: ${missing.join(', ')}. Populate every design-required setting before running the spec.`,
  ).toEqual([]);

  expect(blockOrder.length, `Expected ≥ 6 blocks, found ${blockOrder.length}`).toBeGreaterThanOrEqual(6);

  blockOrder.slice(0, 6).forEach((blockId, idx) => {
    const block = blocks[blockId];
    const blockLabel = block.settings.label;
    const blockLink = block.settings.link;
    expect(blockLabel, `Block ${idx + 1} (${blockId}) label is blank`).not.toBe('');
    expect(blockLink, `Block ${idx + 1} (${blockId}) link is blank`).not.toBe('');
  });
});

test('B-1 [mobile]: Heading typography — font-size, line-height, weight, color', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const heading = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__heading`);
  const styles = await readComputed(heading, ['fontSize', 'lineHeight', 'fontWeight', 'color']);

  expect(styles.fontSize).toBe('32px');
  expect(styles.lineHeight).toBe('36px');
  expect(styles.fontWeight).toBe('700');
  expect(styles.color).toMatch(/rgb\(11,\s*30,\s*61\)/);
});

test('B-2 [desktop]: Heading typography — font-size, line-height, weight, color', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const heading = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__heading`);
  const styles = await readComputed(heading, ['fontSize', 'lineHeight', 'fontWeight', 'color']);

  expect(styles.fontSize).toBe('48px');
  expect(styles.lineHeight).toBe('52.8px');
  expect(styles.fontWeight).toBe('700');
  expect(styles.color).toMatch(/rgb\(11,\s*30,\s*61\)/);
});

test('B-3 [mobile]: View More CTA typography — font-size, line-height, weight, color, border', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const cta = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__cta`);
  const styles = await readComputed(cta, [
    'fontSize', 'lineHeight', 'fontWeight', 'color',
    'borderBottomWidth', 'borderBottomStyle', 'borderBottomColor', 'textTransform',
  ]);

  expect(styles.fontSize).toBe('16px');
  expect(styles.lineHeight).toBe('20px');
  expect(styles.fontWeight).toBe('700');
  expect(styles.color).toMatch(/rgb\(0,\s*0,\s*0\)/);
  expect(styles.borderBottomWidth).toBe('1px');
  expect(styles.borderBottomStyle).toBe('solid');
  expect(styles.borderBottomColor).toMatch(/rgb\(0,\s*0,\s*0\)/);
});

test('B-4 [desktop]: View More CTA typography — font-size, line-height, weight, color, border', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const cta = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__cta`);
  const styles = await readComputed(cta, [
    'fontSize', 'lineHeight', 'fontWeight', 'color',
    'borderBottomWidth', 'borderBottomStyle', 'borderBottomColor',
  ]);

  expect(styles.fontSize).toBe('16px');
  expect(styles.lineHeight).toBe('20px');
  expect(styles.fontWeight).toBe('700');
  expect(styles.color).toMatch(/rgb\(0,\s*0,\s*0\)/);
  expect(styles.borderBottomWidth).toBe('1px');
  expect(styles.borderBottomStyle).toBe('solid');
  expect(styles.borderBottomColor).toMatch(/rgb\(0,\s*0,\s*0\)/);
});

test('B-5 [mobile]: Section background color', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const section = await requireElement(page, SECTION_SELECTOR);
  const bgColor = await section.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(bgColor).toMatch(/rgb\(244,\s*246,\s*248\)/);
});

test('B-6 [desktop]: Section background color', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const section = await requireElement(page, SECTION_SELECTOR);
  const bgColor = await section.evaluate(el => getComputedStyle(el).backgroundColor);
  expect(bgColor).toMatch(/rgb\(244,\s*246,\s*248\)/);
});

test('B-7 [mobile]: Arrows hidden on mobile breakpoint', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const prevArrow = page.locator(`${SECTION_SELECTOR} .carousel__nav-button--prev`).first();
  const isVisible = await prevArrow.isVisible();
  expect(isVisible, 'Prev arrow should be hidden on mobile').toBe(false);
});

test('B-8 [desktop]: Arrow button idle state colors & opacity', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const nextArrow = await requireElement(page, `${SECTION_SELECTOR} .carousel__nav-button--next`);
  await page.waitForFunction(sel => {
    const btn = document.querySelector(sel);
    return btn && !btn.hasAttribute('disabled');
  }, `${SECTION_SELECTOR} .carousel__nav-button--next`, { timeout: 5000 });

  const styles = await readComputed(nextArrow, ['backgroundColor', 'opacity']);
  expect(styles.opacity).toBe('1');
  expect(styles.backgroundColor).toMatch(/rgb\(244,\s*246,\s*248\)/);
});

test('B-9 [desktop]: Arrow disabled state opacity (prev disabled initial)', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  await page.waitForFunction(sel => {
    const btn = document.querySelector(sel);
    return btn && btn.hasAttribute('disabled');
  }, `${SECTION_SELECTOR} .carousel__nav-button--prev`, { timeout: 5000 });

  const prevArrow = await requireElement(page, `${SECTION_SELECTOR} .carousel__nav-button--prev`);
  await page.waitForFunction(sel => {
    const btn = document.querySelector(sel);
    return btn && getComputedStyle(btn).opacity === '0.4';
  }, `${SECTION_SELECTOR} .carousel__nav-button--prev`, { timeout: 2000 });

  const opacity = await prevArrow.evaluate(el => getComputedStyle(el).opacity);
  expect(opacity).toBe('0.4');
});

test('C-1 [tablet]: No horizontal scroll — layout integrity', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const section = await requireElement(page, SECTION_SELECTOR);
  const inner = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__inner`);

  const windowWidth = await page.evaluate(() => window.innerWidth);
  const innerWidth = await inner.evaluate(el => el.offsetWidth);
  const sectionWidth = await section.evaluate(el => el.offsetWidth);

  expect(sectionWidth, `Section width ${sectionWidth}px exceeds viewport ${windowWidth}px`).toBeLessThanOrEqual(windowWidth);
  expect(innerWidth, `Inner width ${innerWidth}px exceeds section ${sectionWidth}px`).toBeLessThanOrEqual(sectionWidth);
});

test('C-2 [tablet-lg]: No horizontal scroll — layout integrity', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const section = await requireElement(page, SECTION_SELECTOR);
  const inner = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__inner`);

  const windowWidth = await page.evaluate(() => window.innerWidth);
  const innerWidth = await inner.evaluate(el => el.offsetWidth);
  const sectionWidth = await section.evaluate(el => el.offsetWidth);

  expect(sectionWidth, `Section width ${sectionWidth}px exceeds viewport ${windowWidth}px`).toBeLessThanOrEqual(windowWidth);
  expect(innerWidth, `Inner width ${innerWidth}px exceeds section ${sectionWidth}px`).toBeLessThanOrEqual(sectionWidth);
});

test('C-3 [tablet]: Header row layout — no wrapping', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const header = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__header`);
  const headerHeight = await header.evaluate(el => el.offsetHeight);

  expect(headerHeight, `Header wraps too much (${headerHeight}px)`).toBeLessThanOrEqual(150);
});

test('C-4 [tablet-lg]: Header row layout — no wrapping', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const header = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__header`);
  const headerHeight = await header.evaluate(el => el.offsetHeight);

  expect(headerHeight, `Header wraps too much (${headerHeight}px)`).toBeLessThanOrEqual(150);
});

test('C-5 [tablet]: Carousel track present', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const carousel = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__carousel`);
  const carouselWidth = await carousel.evaluate(el => el.offsetWidth);

  expect(carouselWidth, `Carousel exceeds viewport width`).toBeGreaterThan(0);
});

test('C-6 [tablet-lg]: Carousel present', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const carousel = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__carousel`);
  const carouselWidth = await carousel.evaluate(el => el.offsetWidth);
  expect(carouselWidth, 'Carousel zero width').toBeGreaterThan(0);
});

test('D-1 [mobile]: Save live screenshot for pixelmatch', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  qaDir('collection-grid');
  await saveScreenshot(page, SECTION_SELECTOR, 'collection-grid', 'live-mobile');
});

test('D-2 [desktop]: Save live screenshot for pixelmatch', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  qaDir('collection-grid');
  await saveScreenshot(page, SECTION_SELECTOR, 'collection-grid', 'live-desktop');
});

test('E-1 [mobile]: Heading line wrapping — max 2 lines', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const heading = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__heading`);
  const lineCount = await heading.evaluate(el => {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.offsetHeight / lineHeight);
  });

  expect(lineCount, `Heading wraps to ${lineCount} lines (expected ≤ 2)`).toBeLessThanOrEqual(2);
});

test('E-2 [desktop]: Heading line wrapping — 1 line (design intent)', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const heading = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__heading`);
  const lineCount = await heading.evaluate(el => {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.offsetHeight / lineHeight);
  });

  expect(lineCount, `Heading wraps to ${lineCount} lines (expected 1)`).toBe(1);
});

test('E-3 [mobile]: CTA label line wrapping — max 1 line', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const cta = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__cta`);
  const lineCount = await cta.evaluate(el => {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.offsetHeight / lineHeight);
  });

  expect(lineCount, `CTA wraps to ${lineCount} lines (expected 1)`).toBeLessThanOrEqual(1);
});

test('E-4 [desktop]: CTA label line wrapping — 1 line', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const cta = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__cta`);
  const lineCount = await cta.evaluate(el => {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.offsetHeight / lineHeight);
  });

  expect(lineCount, `CTA wraps to ${lineCount} lines (expected 1)`).toBe(1);
});

test('E-5 [mobile]: Section content container max-width constraint', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const inner = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__inner`);
  const innerWidth = await inner.evaluate(el => el.offsetWidth);
  const windowWidth = await page.evaluate(() => window.innerWidth);

  expect(innerWidth, `Inner width ${innerWidth}px exceeds viewport ${windowWidth}px`).toBeLessThanOrEqual(windowWidth);
});

test('E-6 [desktop]: Section content container max-width ≤ 1338px', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);

  const inner = await requireElement(page, `${SECTION_SELECTOR} .collection-grid__inner`);
  const innerWidth = await inner.evaluate(el => el.offsetWidth);

  expect(innerWidth, `Inner width ${innerWidth}px exceeds max-width 1338px`).toBeLessThanOrEqual(1338);
});

const runA11yScan = async (page, projectName) => {
  const axe = new AxeBuilder({ page });
  const section = await page.locator(SECTION_SELECTOR).elementHandle();
  axe.include(section);

  const results = await axe
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const violations = results.violations || [];
  const criticalOrSerious = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');

  const violationsPath = path.join(qaDir('collection-grid'), `a11y-${projectName}.json`);
  fs.writeFileSync(violationsPath, JSON.stringify(violations, null, 2));

  expect(criticalOrSerious, `A11y critical/serious violations: ${JSON.stringify(criticalOrSerious, null, 2)}`).toEqual([]);
};

test('A11y scan [mobile]', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);
  await runA11yScan(page, 'mobile');
});

test('A11y scan [tablet]', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);
  await runA11yScan(page, 'tablet');
});

test('A11y scan [tablet-lg]', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);
  await runA11yScan(page, 'tablet-lg');
});

test('A11y scan [desktop]', async ({ page }) => {
  await waitForSectionImages(page, SECTION_SELECTOR);
  await runA11yScan(page, 'desktop');
});
