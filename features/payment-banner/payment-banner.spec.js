const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const {
  sectionTestUrl,
  saveScreenshot,
  qaDir,
  loadTemplate,
  requireElement,
} = require('../../playwright-config/helpers');

const SECTION = 'payment-banner';
const SECTION_SELECTOR = '[data-section-type="payment-banner"]';
const SECTION_TYPE = 'page';

// A11y gate: skip mode — write marker file at module load
const a11yMarkerPath = path.join(process.cwd(), 'features', SECTION, 'qa', 'a11y-skipped.marker');
(() => {
  const markerDir = path.dirname(a11yMarkerPath);
  fs.mkdirSync(markerDir, { recursive: true });
  if (!fs.existsSync(a11yMarkerPath)) {
    fs.writeFileSync(a11yMarkerPath, 'A11y checks skipped for this section.\n');
  }
})();

test.describe('payment-banner UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(sectionTestUrl(SECTION_TYPE), { waitUntil: 'domcontentloaded' });
    const sectionRoot = page.locator(SECTION_SELECTOR);
    await sectionRoot.waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
  });

  // ============ A — Content completeness ============
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
      k => settings[k] == null || String(settings[k]).trim() === '',
    );
    expect(
      missing,
      `Missing required content in templates/${SECTION_TYPE}.test.json → sections.${SECTION}.settings: ${missing.join(', ')}. Populate every design-required setting before running the spec.`,
    ).toEqual([]);
  });

  // ============ B — Typography + color parity (manual-debug) ============
  test('B-1 [mobile]: H2 typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const h2 = await requireElement(page, `${SECTION_SELECTOR} .payment-banner__heading`);
    const computed = await h2.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(28, 1);
    expect(computed.lineHeight).toBeCloseTo(33.6, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-2 [desktop]: H2 typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const h2 = await requireElement(page, `${SECTION_SELECTOR} .payment-banner__heading`);
    const computed = await h2.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(48, 1);
    expect(computed.lineHeight).toBeCloseTo(52.8, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(11, 30, 61)'); // #0b1e3d
  });

  test('B-3 [mobile]: Subhead typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const subhead = await requireElement(page, `${SECTION_SELECTOR} .payment-banner__subhead`);
    const computed = await subhead.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(15, 1);
    expect(computed.lineHeight).toBeCloseTo(24, 0.5);
    expect(computed.fontWeight).toBe('400');
    expect(computed.color).toBe('rgb(81, 81, 81)'); // #515151
  });

  test('B-4 [desktop]: Subhead typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const subhead = await requireElement(page, `${SECTION_SELECTOR} .payment-banner__subhead`);
    const computed = await subhead.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(16, 1);
    expect(computed.lineHeight).toBeCloseTo(20, 0.5);
    expect(computed.fontWeight).toBe('500');
    expect(computed.color).toBe('rgb(102, 102, 102)'); // #666
  });

  test('B-5 [mobile]: Card 1 title typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const title = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__title`);
    const computed = await title.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(28, 1);
    expect(computed.lineHeight).toBeCloseTo(33.6, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-6 [desktop]: Card 1 title typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const title = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__title`);
    const computed = await title.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(48, 1);
    expect(computed.lineHeight).toBeCloseTo(52.3, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(11, 30, 61)'); // #0b1e3d
  });

  test('B-7 [mobile]: Card 1 body typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const body = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__body`);
    const computed = await body.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(15, 1);
    expect(computed.lineHeight).toBeCloseTo(24, 0.5);
    expect(computed.fontWeight).toBe('600');
    expect(computed.color).toBe('rgb(81, 81, 81)'); // #515151
  });

  test('B-8 [desktop]: Card 1 body typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const body = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__body`);
    const computed = await body.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(16, 1);
    expect(computed.lineHeight).toBeCloseTo(20, 0.5);
    expect(computed.fontWeight).toBe('400');
    expect(computed.color).toBe('rgb(102, 102, 102)'); // #666
  });

  test('B-9 [desktop]: Card 1 eyebrow typography — desktop only', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const eyebrow = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__eyebrow`);
    const computed = await eyebrow.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
        textTransform: style.textTransform,
      };
    });
    expect(computed.fontSize).toBeCloseTo(13, 1);
    expect(computed.lineHeight).toBeCloseTo(20, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
    expect(computed.textTransform).toBe('uppercase');
  });

  test('B-10 [mobile]: Card 1 CTA pill typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const cta = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__cta`);
    const computed = await cta.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(15, 1);
    expect(computed.lineHeight).toBeCloseTo(30, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(255, 255, 255)'); // #fff
  });

  test('B-11 [desktop]: Card 1 CTA pill typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const cta = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__cta`);
    const computed = await cta.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(16, 1);
    expect(computed.lineHeight).toBeCloseTo(28, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(244, 246, 248)'); // #f4f6f8
  });

  test('B-12 [mobile]: Card 2 title typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const title = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__title`);
    const computed = await title.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(28, 1);
    expect(computed.lineHeight).toBeCloseTo(33.6, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(255, 255, 255)'); // #fff
  });

  test('B-13 [desktop]: Card 2 title typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const title = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__title`);
    const computed = await title.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(48, 1);
    expect(computed.lineHeight).toBeCloseTo(52.3, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(244, 246, 248)'); // #f4f6f8
  });

  test('B-14 [mobile]: Card 2 body typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const body = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__body`);
    const computed = await body.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(15, 1);
    expect(computed.lineHeight).toBeCloseTo(24, 0.5);
    expect(computed.fontWeight).toBe('600');
    expect(computed.color).toBe('rgb(255, 255, 255)'); // #fff
  });

  test('B-15 [desktop]: Card 2 body typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const body = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__body`);
    const computed = await body.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(16, 1);
    expect(computed.lineHeight).toBeCloseTo(20, 0.5);
    expect(computed.fontWeight).toBe('400');
    expect(computed.color).toBe('rgb(244, 246, 248)'); // #f4f6f8
  });

  test('B-16 [mobile]: Card 2 CTA pill typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const cta = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__cta`);
    const computed = await cta.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(15, 1);
    expect(computed.lineHeight).toBeCloseTo(30, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-17 [desktop]: Card 2 CTA pill typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const cta = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__cta`);
    const computed = await cta.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(16, 1);
    expect(computed.lineHeight).toBeCloseTo(28, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-18 [mobile]: Card 1 CTA pill height — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const cta = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__cta`);
    const height = await cta.evaluate(el => el.offsetHeight);
    expect(height).toBe(48);
  });

  test('B-19 [mobile]: Card 2 CTA pill height — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const cta = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__cta`);
    const height = await cta.evaluate(el => el.offsetHeight);
    expect(height).toBe(48);
  });

  test('B-20 [desktop]: Card 1 CTA pill height — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const cta = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__cta`);
    const height = await cta.evaluate(el => el.offsetHeight);
    expect(height).toBe(48);
  });

  test('B-21 [desktop]: Card 2 CTA pill height — desktop (smaller than card 1)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const cta = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__cta`);
    const height = await cta.evaluate(el => el.offsetHeight);
    expect(height).toBe(38);
  });

  // ============ C — Layout integrity (manual-debug) ============
  test('C-1 [tablet]: No horizontal scroll', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet-only test');
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasScroll).toBe(false);
  });

  test('C-2 [tablet]: Section container fits viewport width', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const width = await section.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(768);
  });

  test('C-3 [tablet]: Mobile cards visible, desktop cards hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet-only test');
    const mobileCard1 = await requireElement(page, `${SECTION_SELECTOR} .payment-banner__card-1-wrap--mobile`);
    const desktopCard1 = await requireElement(page, `${SECTION_SELECTOR} .payment-banner__card-1-wrap`);
    const mobileDisplay = await mobileCard1.evaluate(el => window.getComputedStyle(el).display);
    const desktopDisplay = await desktopCard1.evaluate(el => window.getComputedStyle(el).display);
    expect(mobileDisplay).not.toBe('none');
    expect(desktopDisplay).toBe('none');
  });

  test('C-4 [tablet-lg]: No horizontal scroll', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasScroll).toBe(false);
  });

  test('C-5 [tablet-lg]: Section container fits viewport width', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const width = await section.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(1280);
  });

  test('C-6 [tablet-lg]: Desktop cards visible, mobile cards hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const mobileCard1 = await requireElement(page, `${SECTION_SELECTOR} .payment-banner__card-1-wrap--mobile`);
    const desktopCard1 = await requireElement(page, `${SECTION_SELECTOR} .payment-banner__card-1-wrap`);
    const mobileDisplay = await mobileCard1.evaluate(el => window.getComputedStyle(el).display);
    const desktopDisplay = await desktopCard1.evaluate(el => window.getComputedStyle(el).display);
    expect(mobileDisplay).toBe('none');
    expect(desktopDisplay).not.toBe('none');
  });

  // ============ D — Live screenshots (pipeline-executed) ============
  test('D-1: Save mobile live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only screenshot');
    await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-mobile');
  });

  test('D-2: Save desktop live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only screenshot');
    await saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-desktop');
  });

  // ============ E — Content placement (manual-debug) ============
  test('E-1 [mobile]: Card 1 eyebrow not visible on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const eyebrowCount = await page.locator(`${SECTION_SELECTOR} .payment-banner-card-1__eyebrow`).count();
    expect(eyebrowCount).toBe(0);
  });

  test('E-2 [mobile]: Card 2 decorative bars not visible on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const barBlueCount = await page.locator(`${SECTION_SELECTOR} .payment-banner-card-2__bar-blue`).count();
    const barOrangeCount = await page.locator(`${SECTION_SELECTOR} .payment-banner-card-2__bar-orange`).count();
    const logoPanelCount = await page.locator(`${SECTION_SELECTOR} .payment-banner-card-2__logos-panel`).count();
    expect(barBlueCount).toBe(0);
    expect(barOrangeCount).toBe(0);
    expect(logoPanelCount).toBe(0);
  });

  test('E-3 [mobile]: Section padding — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const padding = await section.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        top: parseFloat(style.paddingTop),
        bottom: parseFloat(style.paddingBottom),
        left: parseFloat(style.paddingLeft),
        right: parseFloat(style.paddingRight),
      };
    });
    expect(padding.top).toBeCloseTo(30, 1);
    expect(padding.bottom).toBeCloseTo(30, 1);
    expect(padding.left).toBeCloseTo(16, 1);
    expect(padding.right).toBeCloseTo(16, 1);
  });

  test('E-4 [desktop]: Card 1 eyebrow visible on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const eyebrow = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-1__eyebrow`);
    const display = await eyebrow.evaluate(el => window.getComputedStyle(el).display);
    expect(display).not.toBe('none');
  });

  test('E-5 [desktop]: Card 2 decorative bars visible on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const barBlue = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__bar-blue`);
    const barOrange = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__bar-orange`);
    const logoPanel = await requireElement(page, `${SECTION_SELECTOR} .payment-banner-card-2__logos-panel`);
    const blueDisplay = await barBlue.evaluate(el => window.getComputedStyle(el).display);
    const orangeDisplay = await barOrange.evaluate(el => window.getComputedStyle(el).display);
    const panelDisplay = await logoPanel.evaluate(el => window.getComputedStyle(el).display);
    expect(blueDisplay).not.toBe('none');
    expect(orangeDisplay).not.toBe('none');
    expect(panelDisplay).not.toBe('none');
  });

  test('E-6 [desktop]: Section padding — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const padding = await section.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        top: parseFloat(style.paddingTop),
        bottom: parseFloat(style.paddingBottom),
        left: parseFloat(style.paddingLeft),
        right: parseFloat(style.paddingRight),
      };
    });
    expect(padding.top).toBeCloseTo(60, 1);
    expect(padding.bottom).toBeCloseTo(50, 1);
    expect(padding.left).toBeCloseTo(40, 1);
    expect(padding.right).toBeCloseTo(40, 1);
  });

  test('E-7 [desktop]: Intro max-width constraint', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const intro = await requireElement(page, `${SECTION_SELECTOR} .payment-banner__intro`);
    const maxWidth = await intro.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.maxWidth);
    });
    expect(maxWidth).toBeCloseTo(591, 5);
  });
});
