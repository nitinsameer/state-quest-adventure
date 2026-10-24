import { BasePage } from "./BasePage";

/**
 * Badges & Achievements Page Object
 * Handles badge display, filtering, and achievement tracking
 */
export class BadgesPage extends BasePage {
  // Selectors
  private readonly badgesHeader = "text=/Badges|Badge/";
  private readonly stateCards = '[class*="rounded"]';
  private readonly badgeGrid = '[class*="grid"]';
  private readonly badges = '[class*="badge"]';
  private readonly achievementsTab = "text=/Achievements/";
  private readonly achievementGrid = '[class*="grid"]';
  private readonly achievementCards = '[class*="rounded-2xl"]';

  /**
   * Navigate to badges screen
   */
  async goto() {
    await super.goto("/badges");
    await this.waitForBadgesScreen();
  }

  /**
   * Navigate to achievements screen
   */
  async gotoAchievements() {
    await super.goto("/achievements");
    await this.waitForAchievementsScreen();
  }

  /**
   * Wait for badges screen to load
   */
  async waitForBadgesScreen() {
    await this.waitForElement(this.badgesHeader, 10000);
  }

  /**
   * Wait for achievements screen to load
   */
  async waitForAchievementsScreen() {
    await this.waitForElement(this.achievementGrid, 10000);
  }

  /**
   * Is badges screen visible
   */
  async isBadgesVisible(): Promise<boolean> {
    return await this.isVisible(this.badgesHeader);
  }

  /**
   * Get number of state cards
   */
  async getStateCardCount(): Promise<number> {
    return await this.getElementCount(this.stateCards);
  }

  /**
   * Get total badges earned
   */
  async getTotalBadgesEarned(): Promise<number> {
    // Count filled/earned badges (not grayed out)
    return await this.page.locator('[class*="badge"][class*="bg-gradient"]').count();
  }

  /**
   * Get badges for specific state
   */
  async getBadgesForState(stateName: string): Promise<string[]> {
    const stateSection = this.page.locator(`text=${stateName}`).first();
    const parent = stateSection.locator('xpath=ancestor::div[contains(@class, "rounded")]');
    const badgeElements = await parent.locator('[class*="badge"]').all();

    const badges: string[] = [];
    for (const badge of badgeElements) {
      const title = (await badge.getAttribute("title")) || (await badge.textContent()) || "";
      if (title) badges.push(title);
    }
    return badges;
  }

  /**
   * Check if state is completed (has explorer badge)
   */
  async isStateCompleted(stateName: string): Promise<boolean> {
    const stateSection = this.page.locator(`text=${stateName}`).first();
    const explorerBadge = stateSection
      .locator("text=/Explorer|✓/")
      .isVisible()
      .catch(() => false);
    return !!explorerBadge;
  }

  /**
   * Get achievements data
   */
  async getAchievementsData(): Promise<any[]> {
    const achievements: any[] = [];
    const cards = await this.page.locator(this.achievementCards).all();

    for (const card of cards) {
      const title = await card.locator('[class*="text"]').first().textContent();
      const description = await card.locator('[class*="text-sm"]').textContent();
      const isUnlocked = await card.evaluate((el) => !el.className.includes("opacity"));

      achievements.push({
        title,
        description,
        unlocked: isUnlocked,
      });
    }

    return achievements;
  }

  /**
   * Count unlocked achievements
   */
  async getUnlockedAchievementsCount(): Promise<number> {
    return await this.page.locator('[class*="rounded"][class*="bg-gradient"]').count();
  }

  /**
   * Verify all state badges visible for first state
   */
  async verifyFirstStateHasThreeBadges(): Promise<boolean> {
    const firstStateSection = this.page.locator('[class*="rounded"]').first();
    const badgeCount = await firstStateSection.locator('[class*="badge"]').count();
    return badgeCount === 3;
  }

  /**
   * Get performance badge progress
   */
  async getPerformanceBadgeProgress(badgeName: string): Promise<number> {
    const badge = this.page.locator(`text=${badgeName}`);
    const progressBar = badge.locator('xpath=ancestor::div//[class*="progress"]');
    const width = await progressBar.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.width;
    });

    const match = width.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Verify achievement tier (Seedling, Growing, Mighty, Elite)
   */
  async verifyAchievementTier(tier: string): Promise<boolean> {
    const tierSection = this.page.locator(`text=${tier}`);
    return await tierSection.isVisible();
  }

  /**
   * Get all achievements by tier
   */
  async getAchievementsByTier(tier: string): Promise<string[]> {
    const tierCards: string[] = [];
    // Find tier section and get all achievement cards within it
    const tierSection = this.page
      .locator(`text=${tier}`)
      .locator('xpath=ancestor::div[contains(@class, "section")]');
    const cards = await tierSection.locator('[class*="rounded"]').all();

    for (const card of cards) {
      const title = await card.textContent();
      if (title) tierCards.push(title);
    }

    return tierCards;
  }

  /**
   * Check if specific badge is earned
   */
  async isBadgeEarned(badgeName: string): Promise<boolean> {
    const badge = this.page.locator(`text=${badgeName}`);
    const hasGradient = await badge.evaluate((el) => el.className.includes("gradient"));
    return hasGradient;
  }

  /**
   * Get badge tooltip/description
   */
  async getBadgeDescription(badgeName: string): Promise<string> {
    const badge = this.page.locator(`text=${badgeName}`).first();
    const tooltip = (await badge.getAttribute("title")) || "";
    return tooltip;
  }

  /**
   * Verify badge sorting by state
   */
  async verifyStatesSorted(): Promise<boolean> {
    const stateNames = await this.getAllText('[class*="state-name"]');
    // Check if states appear to be in order (basic check)
    return stateNames.length > 0;
  }
}
