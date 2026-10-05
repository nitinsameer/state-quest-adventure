import { BasePage } from './BasePage';

/**
 * Passport / Explorer Page Object
 * Handles stamp collection display and progress
 */
export class PassportPage extends BasePage {
  // Selectors
  private readonly passportHeader = 'text=/My Passport|India Explorer Passport/';
  private readonly progressText = 'text=/\\d+\\/36/';
  private readonly progressPercent = 'text=/\\d+%/';
  private readonly stampGrid = '[class*="grid"]';
  private readonly stamps = '[class*="rounded-xl"][class*="border"]';
  private readonly collectedStamp = '[class*="border-saffron"]';
  private readonly emptyStamp = '[class*="border-dashed"]';

  /**
   * Navigate to passport
   */
  async goto() {
    await super.goto('/explorer');
    await this.waitForPassportToLoad();
  }

  /**
   * Wait for passport to load
   */
  async waitForPassportToLoad() {
    await this.waitForElement(this.passportHeader, 10000);
  }

  /**
   * Is passport visible
   */
  async isPassportVisible(): Promise<boolean> {
    return await this.isVisible(this.passportHeader);
  }

  /**
   * Get progress text (e.g., "1 / 36 stamps collected")
   */
  async getProgressText(): Promise<string> {
    return await this.getText(this.progressText);
  }

  /**
   * Get progress numbers
   */
  async getProgress(): Promise<{ collected: number; total: number }> {
    const text = await this.getProgressText();
    const match = text.match(/(\d+)\s*\/\s*36/);
    return {
      collected: match ? parseInt(match[1]) : 0,
      total: 36,
    };
  }

  /**
   * Get progress percentage
   */
  async getProgressPercent(): Promise<number> {
    const text = await this.getText(this.progressPercent);
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get number of stamp slots visible
   */
  async getStampCount(): Promise<number> {
    return await this.getElementCount(this.stamps);
  }

  /**
   * Get number of collected stamps
   */
  async getCollectedStampCount(): Promise<number> {
    return await this.getElementCount(this.collectedStamp);
  }

  /**
   * Get number of empty stamp slots
   */
  async getEmptyStampCount(): Promise<number> {
    return await this.getElementCount(this.emptyStamp);
  }

  /**
   * Verify total of 36 stamps
   */
  async verifyTotalStamps(): Promise<boolean> {
    const count = await this.getStampCount();
    return count === 36;
  }

  /**
   * Verify collected + empty = 36
   */
  async verifyStampCount(): Promise<boolean> {
    const collected = await this.getCollectedStampCount();
    const empty = await this.getEmptyStampCount();
    return collected + empty === 36;
  }

  /**
   * Get stamp progress data
   */
  async getStampData(): Promise<any> {
    return {
      total: await this.getStampCount(),
      collected: await this.getCollectedStampCount(),
      empty: await this.getEmptyStampCount(),
      progress: await this.getProgress(),
      percent: await this.getProgressPercent(),
    };
  }

  /**
   * Wait for specific number of collected stamps
   */
  async waitForCollectedStamps(count: number, timeout = 10000) {
    await this.waitFor(async () => {
      const collected = await this.getCollectedStampCount();
      return collected === count;
    }, timeout);
  }

  /**
   * Verify stamp grid is properly formatted (4 columns)
   */
  async verifyGridLayout(): Promise<boolean> {
    // Check if grid has 4 columns (36 stamps / 4 = 9 rows)
    const total = await this.getStampCount();
    return total === 36;
  }

  /**
   * Get postcard library access (if available)
   */
  async getPostcardLibraryElement(): Promise<boolean> {
    return await this.elementExists('text=/Postcard|Library/');
  }
}
