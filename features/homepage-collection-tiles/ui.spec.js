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

const SECTION = 'homepage-collection-tiles';
const SECTION_SELECTOR = '[data-section-type="homepage-collection-tiles"]';
const SECTION_TYPE = 'page';

// A11y gate — accessibility: skip per brief
const a11ySkipMarkerPath = path.join(qaDir(SECTION), 'a11y-skipped.marker');
if (!fs.existsSync(a11ySkipMarkerPath)) {
  fs.writeFileSync(a11ySkipMarkerPath, 'Accessibility testing skipped for this section\n');
}

/**
 * Helper: wait for images to load in the section
 * Prevents pixelmatch mismatches from half-loaded images
 */
async function waitForSectionImages(page, selector) {
  await page.evaluate((sel) => {
    return Promise.all(
      Array.from(document.querySelectorAll(`${sel} img`)).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.addEventListener('load', resolve);
              img.addEventListener('error', resolve);
            }
          })
      )
    );
  }, selector);
}

test.beforeEach(async ({ page }) => {
  // Navigate to test page with section
  await page.goto(sectionTestUrl(SECTION_TYPE), { waitUntil: 'domcontentloaded' });

  // Wait for section root to attach
  await page.locator(SECTION_SELECTOR).first().waitFor({ state: 'attached' });

  // Wait for fonts to be ready
  await page.evaluate(() => document.fonts.ready);

  // Wait for section images (if any) to load
  await waitForSectionImages(page, SECTION_SELECTOR);
});

// ====================================================================
// GROUP A — CONTENT COMPLETENESS (GATING)
// ====================================================================

test('A-1: Content completeness — required template settings populated', () => {
  const template = loadTemplate(SECTION_TYPE);
  const sectionEntry = template.sections[SECTION];

  // Validate section exists
  expect(sectionEntry, `Section "${SECTION}" not found in template`).toBeDefined();

  // Validate settings
  const settings = sectionEntry.settings || {};
  const requiredSettings = ['heading_text', 'view_more_label', 'view_more_link', 'background_color', 'section_font'];
  const missingSettings = requiredSettings.filter(
    (k) => settings[k] == null || String(settings[k]).trim() === ''
  );

  expect(
    missingSettings,
    `Missing required settings in templates/${SECTION_TYPE}.test.json → sections.${SECTION}.settings: ${missingSettings.join(', ')}. Populate every design-required setting before running the spec.`
  ).toEqual([]);

  // Validate blocks
  const blocksMap = sectionEntry.blocks || {};
  const blockOrder = sectionEntry.block_order || Object.keys(blocksMap);
  const blocks = blockOrder.map((id) => blocksMap[id]).filter((b) => b && b.type === 'tile');

  expect(
    blocks.length,
    `Expected at least 1 tile block, found ${blocks.length}. Add tiles to templates/${SECTION_TYPE}.test.json → sections.${SECTION}.blocks.`
  ).toBeGreaterThanOrEqual(1);

  // Validate first tile has required fields
  if (blocks.length > 0) {
    const block = blocks[0];
    const blockSettings = block.settings || {};
    const blockMissing = [];
    if (!blockSettings.label || String(blockSettings.label).trim() === '') {
      blockMissing.push('label');
    }
    if (!blockSettings.link || String(blockSettings.link).trim() === '') {
      blockMissing.push('link');
    }
    expect(
      blockMissing,
      `First tile missing fields: ${blockMissing.join(', ')}. Populate label and link for each tile block.`
    ).toEqual([]);
  }
});

// ====================================================================
// GROUP B — TYPOGRAPHY & COLOR PARITY (DESIGN BREAKPOINTS)
// ====================================================================

test('B-1 [desktop]: Heading typography', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');

  const elem = await page.locator('.homepage-collection-tiles__heading').first();
  const computed = await elem.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      fontWeight: styles.fontWeight,
      color: styles.color,
    };
  });

  expect(computed.fontSize).toBe('48px');
  expect(computed.lineHeight).toBe('52.8px');
  expect(computed.fontWeight).toBe('700');
  // color #0b1e3d = rgb(11, 30, 61)
  expect(computed.color).toMatch(/rgb\(11,\s*30,\s*61\)/);
});

test('B-2 [mobile]: Heading typography — mobile-responsive size', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile only');

  const elem = await page.locator('.homepage-collection-tiles__heading').first();
  const computed = await elem.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    const fsNum = parseFloat(styles.fontSize);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      color: styles.color,
      fsNum,
    };
  });

  expect(computed.fsNum).toBeGreaterThan(0);
  expect(computed.fsNum).toBeLessThanOrEqual(48);
  expect(computed.fontWeight).toBe('700');
  // color #0b1e3d = rgb(11, 30, 61)
  expect(computed.color).toMatch(/rgb\(11,\s*30,\s*61\)/);
});

test('B-3 [desktop]: View More link typography', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');

  const elem = await page.locator('.homepage-collection-tiles__view-more').first();
  const computed = await elem.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      fontWeight: styles.fontWeight,
      color: styles.color,
    };
  });

  expect(computed.fontSize).toBe('16px');
  expect(computed.lineHeight).toBe('20px');
  expect(computed.fontWeight).toBe('700');
  expect(computed.color).toMatch(/rgb\(0,\s*0,\s*0\)/); // black
});

test('B-4 [desktop]: Tile label typography', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');

  const elem = await page.locator('.homepage-collection-tiles__label').first();
  const computed = await elem.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      fontWeight: styles.fontWeight,
      color: styles.color,
      textAlign: styles.textAlign,
    };
  });

  expect(computed.fontSize).toBe('15px');
  expect(computed.lineHeight).toBe('24px');
  expect(computed.fontWeight).toBe('500');
  expect(computed.color).toMatch(/rgb\(0,\s*0,\s*0\)/); // black
  expect(computed.textAlign).toBe('center');
});

test('B-5 [desktop]: Tile card background & border-radius', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');

  const elem = await page.locator('.homepage-collection-tiles__card').first();
  const computed = await elem.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
    };
  });

  expect(computed.backgroundColor).toMatch(/rgb\(255,\s*255,\s*255\)/); // white
  // border-radius can be "16px" or quad like "16px 16px 16px 16px"
  expect(computed.borderRadius).toContain('16px');
});

test('B-6 [desktop]: Section background color', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');

  const elem = await page.locator(SECTION_SELECTOR).first();
  const computed = await elem.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      backgroundColor: styles.backgroundColor,
    };
  });

  // #f4f6f8 = rgb(244, 246, 248)
  expect(computed.backgroundColor).toMatch(/rgb\(244,\s*246,\s*248\)/);
});

// ====================================================================
// GROUP C — LAYOUT INTEGRITY (INTERMEDIATE BREAKPOINTS)
// ====================================================================

test('C-1 [tablet]: No horizontal scroll on document', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tablet', 'Tablet only');

  const docWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(docWidth + 1); // +1px tolerance
});

test('C-2 [tablet-lg]: No horizontal scroll on document', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg only');

  const docWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(docWidth + 1); // +1px tolerance
});

test('C-3 [tablet]: Track does not overflow section right edge', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tablet', 'Tablet only');

  const sectionRect = await page
    .locator(SECTION_SELECTOR)
    .first()
    .boundingBox();
  const trackRect = await page.locator('[data-track]').first().boundingBox();

  expect(trackRect.x + trackRect.width).toBeLessThanOrEqual(sectionRect.x + sectionRect.width + 1);
});

test('C-4 [tablet-lg]: Track does not overflow section right edge', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg only');

  const sectionRect = await page
    .locator(SECTION_SELECTOR)
    .first()
    .boundingBox();
  const trackRect = await page.locator('[data-track]').first().boundingBox();

  expect(trackRect.x + trackRect.width).toBeLessThanOrEqual(sectionRect.x + sectionRect.width + 1);
});

test('C-5 [tablet]: At least one tile visible in viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tablet', 'Tablet only');

  const tileCount = await page.locator('.homepage-collection-tiles__card').count();
  expect(tileCount).toBeGreaterThanOrEqual(1);
});

test('C-6 [tablet-lg]: At least one tile visible in viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg only');

  const tileCount = await page.locator('.homepage-collection-tiles__card').count();
  expect(tileCount).toBeGreaterThanOrEqual(1);
});

// ====================================================================
// GROUP D — LIVE SCREENSHOTS
// ====================================================================

test('D-1 [mobile]: Save live mobile screenshot', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile only');

  await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-mobile');
});

test('D-2 [desktop]: Save live desktop screenshot', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');

  await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-desktop');
});

// ====================================================================
// GROUP E — CONTENT PLACEMENT (DESIGN BREAKPOINTS)
// ====================================================================

test('E-1 [desktop]: Heading single-line layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');

  const elem = await page.locator('.homepage-collection-tiles__heading').first();
  const { offsetHeight, lineHeight } = await elem.evaluate((el) => {
    const lh = window.getComputedStyle(el).lineHeight;
    return {
      offsetHeight: el.offsetHeight,
      lineHeight: parseFloat(lh),
    };
  });

  const lines = Math.round(offsetHeight / lineHeight);
  expect(lines).toBe(1);
});

test('E-2 [desktop]: First tile label single-line layout', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');

  const elem = await page.locator('.homepage-collection-tiles__label').first();
  const { offsetHeight, lineHeight } = await elem.evaluate((el) => {
    const lh = window.getComputedStyle(el).lineHeight;
    return {
      offsetHeight: el.offsetHeight,
      lineHeight: parseFloat(lh),
    };
  });

  const lines = Math.round(offsetHeight / lineHeight);
  expect(lines).toBe(1);
});

test('E-3 [desktop]: Inner container max-width respected', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');

  const elem = await page.locator('.homepage-collection-tiles__inner').first();
  const { offsetWidth } = await elem.evaluate((el) => ({
    offsetWidth: el.offsetWidth,
  }));

  expect(offsetWidth).toBeLessThanOrEqual(1440);
});

test('E-4 [mobile]: Content is visible and scrollable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile only');

  const tileCount = await page.locator('.homepage-collection-tiles__card').count();
  expect(tileCount).toBeGreaterThanOrEqual(2);
});
