import * as fs from 'fs';
import * as path from 'path';
import type { Page, TestInfo } from '@playwright/test';

const STORE_URL = process.env.STORE_URL?.trim() ?? '';
const THEME_ID = process.env.THEME_ID?.trim() ?? '';
const GLOBAL_PAGE_PATH = process.env.GLOBAL_PAGE_PATH?.trim() ?? '/pages/contact';
const DEFAULT_PRODUCT_PATH = process.env.DEFAULT_PRODUCT_PATH?.trim() ?? '/products/example-product';
const DEFAULT_COLLECTION_PATH = process.env.DEFAULT_COLLECTION_PATH?.trim() ?? '/collections/all';
const TEST_PAGE_TEMPLATE = process.env.TEST_PAGE_TEMPLATE?.trim() ?? 'page.test';
const TEST_PRODUCT_TEMPLATE = process.env.TEST_PRODUCT_TEMPLATE?.trim() ?? 'product.test';
const TEST_COLLECTION_TEMPLATE = process.env.TEST_COLLECTION_TEMPLATE?.trim() ?? 'collection.test';

export type SectionType = 'page' | 'product' | 'collection';

const TEST_CONFIG: Record<SectionType, { basePath: string; template: string }> = {
  page: { basePath: GLOBAL_PAGE_PATH, template: TEST_PAGE_TEMPLATE },
  product: { basePath: DEFAULT_PRODUCT_PATH, template: TEST_PRODUCT_TEMPLATE },
  collection: { basePath: DEFAULT_COLLECTION_PATH, template: TEST_COLLECTION_TEMPLATE },
};

/**
 * Build test URL for a section based on its type.
 * Reads template name from env and uses ?view= param.
 *
 * page:       /pages/contact?view=page.test&preview_theme_id=123
 * product:    /products/example?view=product.test&preview_theme_id=123
 * collection: /collections/all?view=collection.test&preview_theme_id=123
 */
export function sectionTestUrl(type: SectionType): string {
  const { basePath, template } = TEST_CONFIG[type];
  const clean = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return `https://${STORE_URL}${clean}?view=${template}&preview_theme_id=${THEME_ID}`;
}

/**
 * Build a preview URL for any path.
 */
export function previewUrl(pagePath: string): string {
  const clean = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return `https://${STORE_URL}${clean}?preview_theme_id=${THEME_ID}`;
}

export function qaDir(sectionName: string): string {
  const dir = path.join(process.cwd(), 'features', sectionName, 'qa');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function saveScreenshot(
  page: Page,
  selector: string,
  sectionName: string,
  name: string,
): Promise<string> {
  const dir = qaDir(sectionName);
  const filePath = path.join(dir, `${name}.png`);
  await page.locator(selector).first().screenshot({ path: filePath });
  return filePath;
}

/**
 * Save a full-page screenshot on test failure.
 */
export async function saveOnFailure(
  page: Page,
  testInfo: TestInfo,
  sectionName: string,
): Promise<void> {
  if (testInfo.status !== testInfo.expectedStatus) {
    const dir = qaDir(sectionName);
    const safeName = testInfo.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filePath = path.join(dir, `fail-${safeName}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
  }
}
