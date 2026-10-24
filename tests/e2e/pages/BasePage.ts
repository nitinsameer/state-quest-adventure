import { Page, expect } from "@playwright/test";

/**
 * Base Page Object Model
 * Common functionality and utilities for all page objects
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific route
   */
  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout, state: "visible" });
  }

  /**
   * Get text content of element
   */
  async getText(selector: string): Promise<string> {
    const element = await this.page.$(selector);
    return element ? await element.textContent() : "";
  }

  /**
   * Click element
   */
  async click(selector: string) {
    await this.page.click(selector);
  }

  /**
   * Type text into input
   */
  async type(selector: string, text: string) {
    await this.page.fill(selector, text);
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    return (await this.page.$(selector)) !== null;
  }

  /**
   * Wait and click
   */
  async waitAndClick(selector: string, timeout = 5000) {
    await this.waitForElement(selector, timeout);
    await this.click(selector);
  }

  /**
   * Get localStorage value
   */
  async getLocalStorageItem(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * Get parsed localStorage JSON
   */
  async getLocalStorageJSON(key: string): Promise<any> {
    const value = await this.getLocalStorageItem(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Set localStorage value
   */
  async setLocalStorageItem(key: string, value: string) {
    await this.page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
  }

  /**
   * Clear localStorage
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for URL to match
   */
  async waitForURL(urlPattern: string | RegExp, timeout = 5000) {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `./tests/screenshots/${name}.png` });
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  /**
   * Wait for condition
   */
  async waitFor(callback: () => Promise<boolean>, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await callback()) return;
      await this.page.waitForTimeout(interval);
    }
    throw new Error("Timeout waiting for condition");
  }

  /**
   * Get all text content from multiple elements
   */
  async getAllText(selector: string): Promise<string[]> {
    return await this.page.locator(selector).allTextContents();
  }

  /**
   * Check element visibility
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  /**
   * Check element is disabled
   */
  async isDisabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isDisabled();
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout, state: "hidden" });
  }
}
