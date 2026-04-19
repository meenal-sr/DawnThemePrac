const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const {
  sectionTestUrl,
  loadTemplate,
  saveScreenshot,
  qaDir,
  requireElement,
} = require('../../playwright-config/helpers');

const SECTION = 'promo-test';
const SECTION_SELECTOR = '[data-section-type="promo-test"]';
const SECTION_TYPE = 'page';

// A11y gate: brief says accessibility: skip
const A11Y_SKIP_MARKER = path.join(process.cwd(), 'features', SECTION, 'qa', 'a11y-skipped.marker');
fs.mkdirSync(path.dirname(A11Y_SKIP_MARKER), { recursive: true });
if (!fs.existsSync(A11Y_SKIP_MARKER)) {
  fs.writeFileSync(A11Y_SKIP_MARKER, 'A11y scan skipped per brief specification.');
}

/**
 * Get computed style properties from an element.
 * @param {Locator} locator
 * @param {...string} props - property names to retrieve
 * @returns {Promise<object>}
 */
async function getComputedStyles(locator, ...props) {
  return locator.evaluate((el, keys) => {
    const computed = window.getComputedStyle(el);
    const result = {};
    keys.forEach(key => {
      result[key] = computed[key];
    });
    return result;
  }, props);
}

/**
 * Normalize pixel values for comparison (handles floating-point precision).
 * @param {string} pxValue - e.g. "33.6px" or "33.599998px"
 * @returns {number}
 */
function pxToNumber(pxValue) {
  return parseFloat(pxValue);
}

test.describe('promo-test UI', () => {
  test.beforeEach(async ({ page }) => {
    const url = sectionTestUrl(SECTION_TYPE);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator(SECTION_SELECTOR).first().waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
  });

  // ================================================================
  // A — Content completeness (fixture validation gate)
  // ================================================================

  test('A-1: Content completeness — required template settings populated', () => {
    const template = loadTemplate(SECTION_TYPE);
    const settings = template.sections[SECTION].settings;
    const blocks = template.sections[SECTION].blocks || {};
    const blockOrder = template.sections[SECTION].block_order || [];

    const required = [
      'heading',
      'subheading_desktop',
      'subheading_mobile',
    ];

    // Check section settings
    const missing = required.filter(k => settings[k] == null || String(settings[k]).trim() === '');

    // Check block settings (minimum 3 blocks)
    if (blockOrder.length < 3) {
      missing.push(`block_count: expected ≥ 3, got ${blockOrder.length}`);
    }
    blockOrder.forEach((blockId) => {
      const block = blocks[blockId];
      if (!block) {
        missing.push(`block ${blockId}: not found`);
        return;
      }
      const blockRequired = ['title', 'description', 'cta_label', 'cta_link'];
      blockRequired.forEach((key) => {
        if (block.settings[key] == null || String(block.settings[key]).trim() === '') {
          missing.push(`block ${blockId}.${key}: blank or missing`);
        }
      });
    });

    expect(
      missing,
      `Missing required content in templates/${SECTION_TYPE}.test.json → sections.${SECTION}: ${missing.join(', ')}. Populate every design-required setting before running the spec.`,
    ).toEqual([]);
  });

  // ================================================================
  // B — Typography + color parity (mobile 375 + desktop 1440)
  // ================================================================

  // B-1: Mobile heading
  test('[mobile]: B-1 Section heading typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    const heading = await requireElement(page, `${SECTION_SELECTOR} .promo-test__heading`);
    const styles = await getComputedStyles(heading, 'fontSize', 'lineHeight', 'fontWeight', 'color');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(28, 0);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(33.6, 1);
    expect(styles.fontWeight).toBe('700');
    expect(styles.color).toBe('rgb(0, 0, 0)'); // #000000
  });

  // B-2: Desktop heading
  test('[desktop]: B-2 Section heading typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    const heading = await requireElement(page, `${SECTION_SELECTOR} .promo-test__heading`);
    const styles = await getComputedStyles(heading, 'fontSize', 'lineHeight', 'fontWeight', 'color');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(48, 0);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(52.8, 1);
    expect(styles.fontWeight).toBe('700');
    expect(styles.color).toBe('rgb(11, 30, 61)'); // #0b1e3d
  });

  // B-3: Mobile subhead
  test('[mobile]: B-3 Subhead typography (mobile)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    const subhead = await requireElement(page, `${SECTION_SELECTOR} .promo-test__subhead--mobile`);
    const styles = await getComputedStyles(subhead, 'fontSize', 'lineHeight', 'fontWeight', 'color', 'display');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(16, 0);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(20, 0);
    expect(styles.fontWeight).toBe('500');
    expect(styles.color).toBe('rgb(102, 102, 102)'); // #666666
    expect(styles.display).not.toBe('none');
  });

  // B-4: Desktop subhead
  test('[desktop]: B-4 Subhead typography (desktop)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    const subhead = await requireElement(page, `${SECTION_SELECTOR} .promo-test__subhead--desktop`);
    const styles = await getComputedStyles(subhead, 'fontSize', 'lineHeight', 'fontWeight', 'color', 'display');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(16, 0);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(20, 0);
    expect(styles.fontWeight).toBe('500');
    expect(styles.color).toBe('rgb(102, 102, 102)'); // #666666
    expect(styles.display).not.toBe('none');
  });

  // B-5: Mobile — desktop subhead hidden
  test('[mobile]: B-5 Desktop subhead hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    const subhead = await requireElement(page, `${SECTION_SELECTOR} .promo-test__subhead--desktop`);
    const styles = await getComputedStyles(subhead, 'display');

    expect(styles.display).toBe('none');
  });

  // B-6: Desktop — mobile subhead hidden
  test('[desktop]: B-6 Mobile subhead hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    const subhead = await requireElement(page, `${SECTION_SELECTOR} .promo-test__subhead--mobile`);
    const styles = await getComputedStyles(subhead, 'display');

    expect(styles.display).toBe('none');
  });

  // B-7: Mobile — desktop card hidden
  test('[mobile]: B-7 Desktop card snippet hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    // Desktop card is wrapped in a div with tw-hidden md:tw-block class
    const card = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--desktop`);
    const wrapper = await card.evaluate(el => window.getComputedStyle(el.parentElement).display);

    expect(wrapper).toBe('none');
  });

  // B-8: Desktop — mobile card hidden
  test('[desktop]: B-8 Mobile card snippet hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    // Mobile card is wrapped in a div with md:tw-hidden class
    const card = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--mobile`);
    const wrapper = await card.evaluate(el => window.getComputedStyle(el.parentElement).display);

    expect(wrapper).toBe('none');
  });

  // B-9: Mobile card title
  test('[mobile]: B-9 Card title (mobile) typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    const cardTitle = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--mobile .promo-test-card__title`);
    const styles = await getComputedStyles(cardTitle, 'fontSize', 'lineHeight', 'fontWeight', 'color');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(19.6, 1);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(26.6, 1);
    expect(styles.fontWeight).toBe('700');
    expect(styles.color).toBe('rgb(0, 0, 0)'); // #000000
  });

  // B-10: Desktop card title
  test('[desktop]: B-10 Card title (desktop) typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    const cardTitle = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--desktop .promo-test-card__title`);
    const styles = await getComputedStyles(cardTitle, 'fontSize', 'lineHeight', 'fontWeight', 'color');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(24, 0);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(28, 0);
    expect(styles.fontWeight).toBe('700');
    expect(styles.color).toBe('rgb(244, 246, 248)'); // #f4f6f8
  });

  // B-11: Mobile card description
  test('[mobile]: B-11 Card description (mobile) typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    const cardDesc = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--mobile .promo-test-card__description`);
    const styles = await getComputedStyles(cardDesc, 'fontSize', 'lineHeight', 'fontWeight', 'color');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(15, 0);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(24, 0);
    expect(styles.fontWeight).toBe('600');
    expect(styles.color).toBe('rgb(81, 81, 81)'); // #515151
  });

  // B-12: Desktop card description
  test('[desktop]: B-12 Card description (desktop) typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    const cardDesc = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--desktop .promo-test-card__description`);
    const styles = await getComputedStyles(cardDesc, 'fontSize', 'lineHeight', 'fontWeight', 'color');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(16, 0);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(20, 0);
    expect(styles.fontWeight).toBe('500');
    expect(styles.color).toBe('rgb(234, 234, 234)'); // #eaeaea
  });

  // B-13: Mobile CTA
  test('[mobile]: B-13 CTA label (mobile) typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    const cta = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--mobile .promo-test-card__cta`);
    const styles = await getComputedStyles(cta, 'fontSize', 'lineHeight', 'fontWeight', 'color', 'backgroundColor');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(15, 0);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(30, 0);
    expect(styles.fontWeight).toBe('700');
    expect(styles.color).toBe('rgb(255, 255, 255)'); // #ffffff
    expect(styles.backgroundColor).toBe('rgb(2, 125, 179)'); // #027db3
  });

  // B-14: Desktop CTA
  test('[desktop]: B-14 CTA label (desktop) typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    const cta = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--desktop .promo-test-card__cta`);
    const styles = await getComputedStyles(cta, 'fontSize', 'lineHeight', 'fontWeight', 'color', 'backgroundColor');

    expect(pxToNumber(styles.fontSize)).toBeCloseTo(16, 0);
    expect(pxToNumber(styles.lineHeight)).toBeCloseTo(28, 0);
    expect(styles.fontWeight).toBe('700');
    expect(styles.color).toBe('rgb(244, 246, 248)'); // #f4f6f8
    expect(styles.backgroundColor).toBe('rgb(2, 125, 179)'); // #027db3
  });

  // B-15: Mobile progress bar visible
  test('[mobile]: B-15 Progress bar visible', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    const progress = await requireElement(page, `${SECTION_SELECTOR} .carousel-progress`);
    const styles = await getComputedStyles(progress, 'display');

    expect(styles.display).not.toBe('none');
  });

  // B-16: Desktop progress bar hidden
  test('[desktop]: B-16 Progress bar hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    const progress = await requireElement(page, `${SECTION_SELECTOR} .carousel-progress`);
    const styles = await getComputedStyles(progress, 'display');

    expect(styles.display).toBe('none');
  });

  // ================================================================
  // C — Layout integrity (tablet 768 + tablet-lg 1280)
  // ================================================================

  // C-1: Tablet no h-scroll
  test('[tablet]: C-1 No horizontal scroll', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet breakpoint only');

    const noScroll = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth);
    expect(noScroll).toBe(true);
  });

  // C-2: Tablet-lg no h-scroll
  test('[tablet-lg]: C-2 No horizontal scroll', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg breakpoint only');

    const noScroll = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth);
    expect(noScroll).toBe(true);
  });

  // C-3: Tablet container width
  test('[tablet]: C-3 Content container within viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet breakpoint only');

    const inner = await requireElement(page, `${SECTION_SELECTOR} .promo-test__inner`);
    const offsetWidth = await inner.evaluate(el => el.offsetWidth);

    expect(offsetWidth).toBeLessThanOrEqual(768);
  });

  // C-4: Tablet-lg container width
  test('[tablet-lg]: C-4 Content container within viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg breakpoint only');

    const inner = await requireElement(page, `${SECTION_SELECTOR} .promo-test__inner`);
    const offsetWidth = await inner.evaluate(el => el.offsetWidth);

    expect(offsetWidth).toBeLessThanOrEqual(1280);
  });

  // ================================================================
  // D — Live screenshots (mobile 375 + desktop 1440)
  // ================================================================

  test('[mobile]: D-1 Save mobile live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-mobile');
  });

  test('[desktop]: D-2 Save desktop live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-desktop');
  });

  // ================================================================
  // E — Content placement parity (mobile 375 + desktop 1440)
  // ================================================================

  // E-1: Mobile card description line count
  test('[mobile]: E-1 Card description line count (mobile)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    const cardDesc = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--mobile .promo-test-card__description`);
    const lineCount = await cardDesc.evaluate((el) => {
      const lh = parseFloat(window.getComputedStyle(el).lineHeight);
      return Math.round(el.offsetHeight / lh);
    });

    expect(lineCount).toBeGreaterThanOrEqual(2);
  });

  // E-2: Desktop card description line count
  test('[desktop]: E-2 Card description line count (desktop)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    const cardDesc = await requireElement(page, `${SECTION_SELECTOR} .promo-test-card--desktop .promo-test-card__description`);
    const lineCount = await cardDesc.evaluate((el) => {
      const lh = parseFloat(window.getComputedStyle(el).lineHeight);
      return Math.round(el.offsetHeight / lh);
    });

    expect(lineCount).toBeGreaterThanOrEqual(2);
  });

  // E-3: Mobile section container width
  test('[mobile]: E-3 Section container max-width respected', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile breakpoint only');

    const inner = await requireElement(page, `${SECTION_SELECTOR} .promo-test__inner`);
    const offsetWidth = await inner.evaluate(el => el.offsetWidth);

    // At mobile, no strict max-width, but content fits within padding
    expect(offsetWidth).toBeLessThanOrEqual(375);
  });

  // E-4: Desktop section container width
  test('[desktop]: E-4 Section container max-width respected', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop breakpoint only');

    const inner = await requireElement(page, `${SECTION_SELECTOR} .promo-test__inner`);
    const offsetWidth = await inner.evaluate(el => el.offsetWidth);

    expect(offsetWidth).toBeLessThanOrEqual(1340);
  });
});
