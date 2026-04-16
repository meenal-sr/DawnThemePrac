import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const STORAGE_STATE_PATH = 'tests/.auth/storage-state.json';

const TEST_TEMPLATES: Record<string, string> = {
  TEST_PAGE_TEMPLATE: 'page',
  TEST_PRODUCT_TEMPLATE: 'product',
  TEST_COLLECTION_TEMPLATE: 'collection',
};

/**
 * Ensure dedicated test templates exist.
 * Creates empty template JSON if missing so Shopify can resolve ?view= param.
 */
function ensureTestTemplates(): void {
  const templatesDir = path.join(process.cwd(), 'templates');

  for (const [envKey, prefix] of Object.entries(TEST_TEMPLATES)) {
    const templateName = process.env[envKey]?.trim();
    if (!templateName) continue;

    const filePath = path.join(templatesDir, `${templateName}.json`);
    if (!fs.existsSync(filePath)) {
      const content = JSON.stringify({ sections: {}, order: [] }, null, 2) + '\n';
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Created test template: ${templateName}.json`);
    }
  }
}

async function globalSetup(_config: FullConfig): Promise<void> {
  // Ensure test templates exist before running tests
  ensureTestTemplates();

  const storeUrl = process.env.STORE_URL?.trim();
  const themeId = process.env.THEME_ID?.trim();
  const password = process.env.STORE_PASSWORD?.trim() || 'umesh';

  if (!storeUrl || !themeId) {
    throw new Error('Missing STORE_URL or THEME_ID in .env');
  }

  // Ensure auth directory exists
  fs.mkdirSync(path.dirname(STORAGE_STATE_PATH), { recursive: true });

  const targetUrl = `https://${storeUrl}?preview_theme_id=${themeId}`;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(targetUrl);

  const isPasswordPage =
    page.url().includes('/password') ||
    (await page.locator('input[type="password"]').isVisible().catch(() => false));

  if (isPasswordPage) {
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10_000 });
    await passwordInput.fill(password);

    const enterButton = page.locator('button:has-text("Enter"), input[type="submit"]');
    await enterButton.waitFor({ state: 'visible', timeout: 10_000 });
    await enterButton.click();

    await page.waitForURL((url) => !url.pathname.includes('/password'), {
      timeout: 15_000,
    });
  }

  await page.context().storageState({ path: STORAGE_STATE_PATH });

  await browser.close();
}

export default globalSetup;
