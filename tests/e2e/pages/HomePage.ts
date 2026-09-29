import { BasePage } from './BasePage';

/**
 * Home Dashboard Page Object
 */
export class HomePage extends BasePage {
  // Selectors
  private readonly homeHeader = 'text=Namaste';
  private readonly xpDisplay = '[class*="text-2xl"][class*="font-extrabold"]'; // XP number
  private readonly levelDisplay = 'text=/Level \\d+/';
  private readonly streakCounter = 'text=/\\d+/'; // Flame icon + number
  private readonly statesCount = 'text=/\\d+/'; // From stat cards
  private readonly badgesCount = 'text=/\\d+/';
  private readonly stampsCount = 'text=/\\d+/';
  private readonly continueJourneyCard = '[class*="Continue your journey"]';
  private readonly playButton = 'button:has-text("Play")';
  private readonly indiaExploredPercent = 'text=/\\d+%/';
  private readonly progressBar = '[class*="gradient-saffron"]';

  /**
   * Navigate to home
   */
  async goto() {
    await super.goto('/home');
    await this.waitForHomeToLoad();
  }

  /**
   * Wait for home dashboard to fully load
   */
  async waitForHomeToLoad() {
    await this.waitForElement(this.homeHeader, 10000);
  }

  /**
   * Verify home is displayed with user name
   */
  async isHomeDisplayed(): Promise<boolean> {
    return await this.isVisible(this.homeHeader);
  }

  /**
   * Get XP value
   */
  async getXPValue(): Promise<number> {
    const xpText = await this.page.locator('text=/\\d+.*XP/').textContent();
    const match = xpText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get current level
   */
  async getLevel(): Promise<number> {
    const levelText = await this.getText(this.levelDisplay);
    const match = levelText.match(/Level (\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  /**
   * Get streak count
   */
  async getStreak(): Promise<number> {
    // Streak is in the flame badge at top right
    const streakLocator = this.page.locator('.flex.items-center.gap-1.5.bg-white\\/70');
    const streakText = await streakLocator.locator('text=/\\d+/').first().textContent();
    return streakText ? parseInt(streakText) : 0;
  }

  /**
   * Get India explored percentage
   */
  async getIndiaExploredPercent(): Promise<number> {
    const percentText = await this.page.locator('text=/\\d+%/').last().textContent();
    const match = percentText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get states count from stat cards
   */
  async getStatesCount(): Promise<number> {
    const stateCard = this.page.locator('text=States').first();
    const parent = stateCard.locator('xpath=ancestor::div[contains(@class, "rounded")]');
    const countText = await parent.locator('text=/\\d+/').first().textContent();
    return countText ? parseInt(countText) : 0;
  }

  /**
   * Get badges count from stat cards
   */
  async getBadgesCount(): Promise<number> {
    const badgeCard = this.page.locator('text=Badges').first();
    const parent = badgeCard.locator('xpath=ancestor::div[contains(@class, "rounded")]');
    const countText = await parent.locator('text=/\\d+/').first().textContent();
    return countText ? parseInt(countText) : 0;
  }

  /**
   * Get stamps count from stat cards
   */
  async getStampsCount(): Promise<number> {
    const stampCard = this.page.locator('text=Stamps').first();
    const parent = stampCard.locator('xpath=ancestor::div[contains(@class, "rounded")]');
    const countText = await parent.locator('text=/\\d+/').first().textContent();
    return countText ? parseInt(countText) : 0;
  }

  /**
   * Get current state name (from Continue Your Journey)
   */
  async getCurrentStateName(): Promise<string> {
    const continueCard = this.page.locator('[class*="rounded-3xl"][class*="bg-white"]').nth(0);
    const stateName = await continueCard.locator('text=/[A-Z]/').first().textContent();
    return stateName || '';
  }

  /**
   * Click play button to start state
   */
  async clickPlayButton() {
    await this.page.locator('button:has-text("Play")').click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for specific XP value
   */
  async waitForXPValue(expectedXP: number, timeout = 10000) {
    await this.waitFor(async () => {
      const currentXP = await this.getXPValue();
      return currentXP === expectedXP;
    }, timeout);
  }

  /**
   * Get progress bar width percentage
   */
  async getProgressBarPercent(): Promise<number> {
    const progressBar = this.page.locator('[class*="bg-white"][class*="transition-all"]').first();
    const style = await progressBar.getAttribute('style');
    const match = style?.match(/width:\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Verify all home stats are visible
   */
  async verifyAllStatsVisible(): Promise<boolean> {
    const statsVisible =
      (await this.isVisible(this.xpDisplay)) &&
      (await this.isVisible(this.levelDisplay)) &&
      (await this.isVisible(this.streakCounter)) &&
      (await this.isVisible(this.indiaExploredPercent));
    return statsVisible;
  }

  /**
   * Wait for home to update with new data
   */
  async waitForHomeRefresh(timeout = 5000) {
    await this.page.waitForTimeout(500); // Give React time to update
    await this.page.waitForLoadState('networkidle');
  }
}
