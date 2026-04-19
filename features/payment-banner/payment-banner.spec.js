const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { sectionTestUrl, saveScreenshot, qaDir, requireElement, loadTemplate } = require('../../playwright-config/helpers');

const SECTION = 'payment-banner';
const SECTION_SELECTOR = '[data-section-type="payment-banner"]';
const SECTION_TYPE = 'page';

// A11y gate: section does not require accessibility scanning (brief §5 mode: skip)
const qaFolderPath = qaDir(SECTION);
const a11yMarkerPath = path.join(qaFolderPath, 'a11y-skipped.marker');
if (!fs.existsSync(a11yMarkerPath)) {
  fs.writeFileSync(a11yMarkerPath, 'Accessibility scanning skipped per brief §5.\n');
}

test.describe('payment-banner UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(sectionTestUrl(SECTION_TYPE), { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(SECTION_SELECTOR);
    await page.evaluate(() => document.fonts.ready);
  });

  // A-1: Content completeness — required template settings populated
  test('A-1: Content completeness — required template settings populated', () => {
    const template = loadTemplate(SECTION_TYPE);
    const settings = template.sections[SECTION].settings;
    const required = [
      'heading',
      'subheading',
      'card_1_title',
      'card_1_body',
      'card_1_cta_label',
      'card_1_cta_link',
      'card_2_title',
      'card_2_body',
      'card_2_cta_label',
      'card_2_cta_link',
    ];
    const missing = required.filter(
      (k) => settings[k] == null || String(settings[k]).trim() === '',
    );
    expect(
      missing,
      `Missing required content in templates/${SECTION_TYPE}.test.json → sections.${SECTION}.settings: ${missing.join(', ')}. Populate every design-required setting before running the spec.`,
    ).toEqual([]);
  });

  // B-1: [mobile] Intro heading typography
  test('B-1 [mobile]: Intro heading typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner__heading');
    const style = await page.locator('.payment-banner__heading').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
        margin: computed.margin,
      };
    });
    expect(style.fontSize).toBe('28px');
    expect(parseFloat(style.lineHeight)).toBeCloseTo(33.6, 0.5);
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(0, 0, 0)');
  });

  // B-2: [mobile] Intro subhead typography
  test('B-2 [mobile]: Intro subhead typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner__subhead');
    const style = await page.locator('.payment-banner__subhead').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('15px');
    expect(style.lineHeight).toBe('24px');
    expect(style.fontWeight).toBe('400');
    expect(style.color).toBe('rgb(81, 81, 81)');
  });

  // B-3: [desktop] Intro heading typography
  test('B-3 [desktop]: Intro heading typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner__heading');
    const style = await page.locator('.payment-banner__heading').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('48px');
    expect(parseFloat(style.lineHeight)).toBeCloseTo(52.8, 0.5);
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(11, 30, 61)');
  });

  // B-4: [desktop] Intro subhead typography
  test('B-4 [desktop]: Intro subhead typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner__subhead');
    const style = await page.locator('.payment-banner__subhead').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('16px');
    expect(style.lineHeight).toBe('20px');
    expect(style.fontWeight).toBe('500');
    expect(style.color).toBe('rgb(102, 102, 102)');
  });

  // B-5: [mobile] Card 1 title typography
  test('B-5 [mobile]: Card 1 title typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner-card-1-mobile__title');
    const style = await page.locator('.payment-banner-card-1-mobile__title').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('28px');
    expect(parseFloat(style.lineHeight)).toBeCloseTo(33.6, 0.5);
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(0, 0, 0)');
  });

  // B-6: [mobile] Card 1 body typography
  test('B-6 [mobile]: Card 1 body typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner-card-1-mobile__body');
    const style = await page.locator('.payment-banner-card-1-mobile__body').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('15px');
    expect(style.lineHeight).toBe('24px');
    expect(style.fontWeight).toBe('600');
    expect(style.color).toBe('rgb(81, 81, 81)');
  });

  // B-7: [mobile] Card 1 CTA label typography + styling
  test('B-7 [mobile]: Card 1 CTA label typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner-card-1-mobile__cta');
    const style = await page.locator('.payment-banner-card-1-mobile__cta').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        height: computed.height,
      };
    });
    expect(style.fontSize).toBe('15px');
    expect(style.lineHeight).toBe('30px');
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(255, 255, 255)');
    expect(style.backgroundColor).toBe('rgb(2, 125, 179)');
    expect(style.height).toBe('48px');
  });

  // B-8: [desktop] Card 1 eyebrow typography
  test('B-8 [desktop]: Card 1 eyebrow typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner-card-1-desktop__eyebrow');
    const style = await page.locator('.payment-banner-card-1-desktop__eyebrow').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
        textTransform: computed.textTransform,
      };
    });
    expect(style.fontSize).toBe('13px');
    expect(style.lineHeight).toBe('20px');
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(0, 0, 0)');
    expect(style.textTransform).toBe('uppercase');
  });

  // B-9: [desktop] Card 1 title typography
  test('B-9 [desktop]: Card 1 title typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner-card-1-desktop__title');
    const style = await page.locator('.payment-banner-card-1-desktop__title').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('48px');
    expect(parseFloat(style.lineHeight)).toBeCloseTo(52.3, 0.5);
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(11, 30, 61)');
  });

  // B-10: [desktop] Card 1 body typography
  test('B-10 [desktop]: Card 1 body typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner-card-1-desktop__body');
    const style = await page.locator('.payment-banner-card-1-desktop__body').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('16px');
    expect(style.lineHeight).toBe('20px');
    expect(style.fontWeight).toBe('400');
    expect(style.color).toBe('rgb(102, 102, 102)');
  });

  // B-11: [desktop] Card 1 CTA label typography + styling
  test('B-11 [desktop]: Card 1 CTA label typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner-card-1-desktop__cta');
    const style = await page.locator('.payment-banner-card-1-desktop__cta').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        height: computed.height,
      };
    });
    expect(style.fontSize).toBe('16px');
    expect(style.lineHeight).toBe('28px');
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(244, 246, 248)');
    expect(style.backgroundColor).toBe('rgb(2, 125, 179)');
    expect(style.borderColor).toBe('rgb(244, 246, 248)');
    expect(style.height).toBe('48px');
  });

  // B-12: [mobile] Card 2 title typography
  test('B-12 [mobile]: Card 2 title typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner-card-2-mobile__title');
    const style = await page.locator('.payment-banner-card-2-mobile__title').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('28px');
    expect(parseFloat(style.lineHeight)).toBeCloseTo(33.6, 0.5);
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(255, 255, 255)');
  });

  // B-13: [mobile] Card 2 body typography
  test('B-13 [mobile]: Card 2 body typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner-card-2-mobile__body');
    const style = await page.locator('.payment-banner-card-2-mobile__body').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('15px');
    expect(style.lineHeight).toBe('24px');
    expect(style.fontWeight).toBe('600');
    expect(style.color).toBe('rgb(255, 255, 255)');
  });

  // B-14: [mobile] Card 2 CTA label typography + styling
  test('B-14 [mobile]: Card 2 CTA label typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner-card-2-mobile__cta');
    const style = await page.locator('.payment-banner-card-2-mobile__cta').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        height: computed.height,
      };
    });
    expect(style.fontSize).toBe('15px');
    expect(style.lineHeight).toBe('30px');
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(0, 0, 0)');
    expect(style.backgroundColor).toBe('rgb(244, 246, 248)');
    expect(style.height).toBe('48px');
  });

  // B-15: [desktop] Card 2 title typography
  test('B-15 [desktop]: Card 2 title typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner-card-2-desktop__title');
    const style = await page.locator('.payment-banner-card-2-desktop__title').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('48px');
    expect(parseFloat(style.lineHeight)).toBeCloseTo(52.3, 0.5);
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(244, 246, 248)');
  });

  // B-16: [desktop] Card 2 body typography
  test('B-16 [desktop]: Card 2 body typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner-card-2-desktop__body');
    const style = await page.locator('.payment-banner-card-2-desktop__body').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
      };
    });
    expect(style.fontSize).toBe('16px');
    expect(style.lineHeight).toBe('20px');
    expect(style.fontWeight).toBe('400');
    expect(style.color).toBe('rgb(244, 246, 248)');
  });

  // B-17: [desktop] Card 2 CTA label typography + styling
  test('B-17 [desktop]: Card 2 CTA label typography', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner-card-2-desktop__cta');
    const style = await page.locator('.payment-banner-card-2-desktop__cta').first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        fontWeight: computed.fontWeight,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        height: computed.height,
      };
    });
    expect(style.fontSize).toBe('16px');
    expect(style.lineHeight).toBe('28px');
    expect(style.fontWeight).toBe('700');
    expect(style.color).toBe('rgb(0, 0, 0)');
    expect(style.backgroundColor).toBe('rgb(244, 246, 248)');
    expect(style.borderColor).toBe('rgb(244, 246, 248)');
    expect(style.height).toBe('38px');
  });

  // C-1: [tablet] Dual-DOM state (mobile card 1 still visible)
  test('C-1 [tablet]: Dual-DOM state (mobile card 1 visible)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet-only test');
    const mobileCard = page.locator('.payment-banner-card-1-mobile');
    const desktopCard = page.locator('.payment-banner-card-1-desktop');

    const mobileDisplay = await mobileCard.evaluate(
      (el) => window.getComputedStyle(el.parentElement).display,
    );
    const desktopDisplay = await desktopCard.evaluate(
      (el) => window.getComputedStyle(el.parentElement).display,
    );

    expect(mobileDisplay).not.toBe('none');
    expect(desktopDisplay).toBe('none');
  });

  // C-2: [tablet-lg] Dual-DOM state (desktop card 1 visible)
  test('C-2 [tablet-lg]: Dual-DOM state (desktop card 1 visible)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const mobileCard = page.locator('.payment-banner-card-1-mobile');
    const desktopCard = page.locator('.payment-banner-card-1-desktop');

    const mobileDisplay = await mobileCard.evaluate(
      (el) => window.getComputedStyle(el.parentElement).display,
    );
    const desktopDisplay = await desktopCard.evaluate(
      (el) => window.getComputedStyle(el.parentElement).display,
    );

    expect(mobileDisplay).toBe('none');
    expect(desktopDisplay).not.toBe('none');
  });

  // D-1: Save mobile live screenshot
  test('D-1: Save mobile live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await page.waitForTimeout(500);
    await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-mobile');
  });

  // D-2: Save desktop live screenshot
  test('D-2: Save desktop live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await page.waitForTimeout(500);
    await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-desktop');
  });

  // E-1: [desktop] Card 1 eyebrow is visible
  test('E-1 [desktop]: Card 1 eyebrow is visible', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const el = page.locator('.payment-banner-card-1-desktop__eyebrow');
    const display = await el.evaluate((node) => window.getComputedStyle(node).display);
    expect(display).not.toBe('none');
  });

  // E-2: [mobile] Card 1 eyebrow not in mobile DOM
  test('E-2 [mobile]: Card 1 eyebrow not in mobile DOM', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const el = page.locator('.payment-banner-card-1-mobile__eyebrow');
    expect(await el.count()).toBe(0);
  });

  // E-3: [desktop] Card 1 container dimensions
  test('E-3 [desktop]: Card 1 container dimensions', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner-card-1-desktop');
    const dims = await page.locator('.payment-banner-card-1-desktop').first().evaluate((node) => ({
      offsetWidth: node.offsetWidth,
      offsetHeight: node.offsetHeight,
    }));
    expect(dims.offsetWidth).toBe(920);
    expect(dims.offsetHeight).toBe(573);
  });

  // E-4: [mobile] Card 1 height constrained
  test('E-4 [mobile]: Card 1 height constrained', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner-card-1-mobile');
    const height = await page.locator('.payment-banner-card-1-mobile').first().evaluate((node) => node.offsetHeight);
    expect(height).toBeGreaterThan(0);
  });

  // E-5: [desktop] Card 2 container dimensions
  test('E-5 [desktop]: Card 2 container dimensions', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, '.payment-banner-card-2-desktop');
    const dims = await page.locator('.payment-banner-card-2-desktop').first().evaluate((node) => ({
      offsetWidth: node.offsetWidth,
      offsetHeight: node.offsetHeight,
    }));
    expect(dims.offsetWidth).toBe(390);
    expect(dims.offsetHeight).toBe(573);
  });

  // E-6: [mobile] Card 2 height constrained
  test('E-6 [mobile]: Card 2 height constrained', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, '.payment-banner-card-2-mobile');
    const height = await page.locator('.payment-banner-card-2-mobile').first().evaluate((node) => node.offsetHeight);
    expect(height).toBeGreaterThan(0);
  });

  // E-7: [desktop] Section padding matches design spec
  test('E-7 [desktop]: Section padding matches design spec', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    await requireElement(page, SECTION_SELECTOR);
    const padding = await page.locator(SECTION_SELECTOR).first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        paddingTop: parseFloat(computed.paddingTop),
        paddingBottom: parseFloat(computed.paddingBottom),
        paddingLeft: parseFloat(computed.paddingLeft),
        paddingRight: parseFloat(computed.paddingRight),
      };
    });
    expect(padding.paddingTop).toBeCloseTo(60, 1);
    expect(padding.paddingBottom).toBeCloseTo(40, 1);
    expect(padding.paddingLeft).toBeCloseTo(50, 1);
    expect(padding.paddingRight).toBeCloseTo(50, 1);
  });

  // E-8: [mobile] Section padding matches design spec
  test('E-8 [mobile]: Section padding matches design spec', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    await requireElement(page, SECTION_SELECTOR);
    const padding = await page.locator(SECTION_SELECTOR).first().evaluate((node) => {
      const computed = window.getComputedStyle(node);
      return {
        paddingTop: parseFloat(computed.paddingTop),
        paddingLeft: parseFloat(computed.paddingLeft),
        paddingRight: parseFloat(computed.paddingRight),
      };
    });
    expect(padding.paddingTop).toBeCloseTo(30, 1);
    expect(padding.paddingLeft).toBeCloseTo(16, 1);
    expect(padding.paddingRight).toBeCloseTo(16, 1);
  });
});
