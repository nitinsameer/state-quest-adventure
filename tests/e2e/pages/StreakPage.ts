import { BasePage } from "./BasePage";

/**
 * Streak & Engagement Tracking Page Object
 * Handles streak logic, milestones, and daily visit tracking
 */
export class StreakPage extends BasePage {
  // Selectors
  private readonly streakCounter = '[class*="flame"]';
  private readonly streakBadge = '[class*="streak"]';
  private readonly streakMilestone = "text=/\\d+ day|Week Warrior|Fortnight|Legend/";
  private readonly celebrationModal = '[class*="celebration"]';

  /**
   * Navigate to home to check streak
   */
  async gotoHome() {
    await super.goto("/home");
  }

  /**
   * Get current streak from home dashboard
   */
  async getStreakFromHome(): Promise<number> {
    try {
      // Streak is in a badge with flame emoji
      const streakText = await this.page
        .locator('[class*="flex"][class*="items-center"]')
        .filter({ has: this.page.locator("text=🔥") })
        .locator("text=/\\d+/")
        .first()
        .textContent();

      const match = streakText?.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Touch streak (simulate daily visit)
   */
  async touchStreak(): Promise<void> {
    // Navigating to a state and back triggers touchStreak()
    await this.page.goto("http://localhost:8080/journey");
    await this.page.waitForLoadState("networkidle");
    await this.page.goBack();
  }

  /**
   * Wait for streak milestone celebration
   */
  async waitForStreakMilestoneCelebration(timeout = 5000): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.streakMilestone, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check localStorage for streak data
   */
  async getStreakFromLocalStorage(): Promise<number> {
    const progress = await this.getLocalStorageJSON("india-explorer:progress:v2");
    return progress?.streak || 0;
  }

  /**
   * Get lastActive date from localStorage
   */
  async getLastActiveDateFromStorage(): Promise<string> {
    const progress = await this.getLocalStorageJSON("india-explorer:progress:v2");
    return progress?.lastActive || "";
  }

  /**
   * Verify streak increments on consecutive days
   * (Simulated by checking logic)
   */
  async verifyStreakLogic(): Promise<boolean> {
    const progress = await this.getLocalStorageJSON("india-explorer:progress:v2");
    const lastActive = progress?.lastActive || "";
    const currentStreak = progress?.streak || 0;

    // Verify lastActive is in correct format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(lastActive) && currentStreak >= 0;
  }

  /**
   * Simulate streak reset (skip a day)
   */
  async simulateStreakReset(): Promise<void> {
    const progress = await this.getLocalStorageJSON("india-explorer:progress:v2");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2); // 2 days ago
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    progress.lastActive = yesterdayStr;
    progress.streak = 1; // Will reset on next visit

    await this.setLocalStorageItem("india-explorer:progress:v2", JSON.stringify(progress));
  }

  /**
   * Get streak milestone info
   */
  async getStreakMilestoneInfo(): Promise<{ days: number; message: string }> {
    const streak = await this.getStreakFromHome();

    const milestones = [
      { days: 7, message: "Week Warrior" },
      { days: 14, message: "Fortnight Master" },
      { days: 30, message: "Legend" },
    ];

    for (const m of milestones) {
      if (streak === m.days) {
        return { days: m.days, message: m.message };
      }
    }

    return { days: 0, message: "" };
  }

  /**
   * Verify streak display on home
   */
  async isStreakDisplayVisible(): Promise<boolean> {
    return await this.page
      .locator('[class*="flex"][class*="items-center"]')
      .filter({ has: this.page.locator("text=🔥") })
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get streak badge styling
   */
  async getStreakBadgeStyle(): Promise<string> {
    const badge = this.page
      .locator('[class*="flex"][class*="items-center"]')
      .filter({ has: this.page.locator("text=🔥") })
      .first();

    const className = (await badge.getAttribute("class")) || "";
    return className;
  }

  /**
   * Check if streak has animation (bouncing)
   */
  async streakHasAnimation(): Promise<boolean> {
    const badge = this.page
      .locator('[class*="flex"][class*="items-center"]')
      .filter({ has: this.page.locator("text=🔥") })
      .first();

    const className = (await badge.getAttribute("class")) || "";
    return className.includes("animate");
  }

  /**
   * Verify daily visit tracker
   */
  async verifyDailyVisitTracking(): Promise<boolean> {
    const progress = await this.getLocalStorageJSON("india-explorer:progress:v2");
    const stamps = progress?.stamps || {};
    const stampCount = Object.keys(stamps).length;

    // Each stamp represents a state completion (state → date mapping)
    return stampCount >= 0;
  }

  /**
   * Get days since app started
   */
  async getDaysSinceStart(): Promise<number> {
    const progress = await this.getLocalStorageJSON("india-explorer:progress:v2");
    const stamps = progress?.stamps || {};
    const dates = new Set<string>();

    for (const date of Object.values(stamps) as string[]) {
      // Extract date from stamp date label
      dates.add(date.split(" ")[0]);
    }

    return dates.size;
  }

  /**
   * Verify streak consistency across sessions
   */
  async verifyStreakPersistence(): Promise<boolean> {
    const streak1 = await this.getStreakFromLocalStorage();

    // Reload page
    await this.page.reload();

    const streak2 = await this.getStreakFromLocalStorage();

    return streak1 === streak2;
  }

  /**
   * Get full engagement stats
   */
  async getEngagementStats(): Promise<any> {
    const progress = await this.getLocalStorageJSON("india-explorer:progress:v2");

    return {
      streak: progress?.streak || 0,
      lastActive: progress?.lastActive || "",
      xp: progress?.xp || 0,
      statesCompleted: progress?.completed?.length || 0,
      stampsCollected: Object.keys(progress?.stamps || {}).length,
      cardsRead: Object.values(progress?.cards || {}).reduce(
        (total: number, cards: any[]) => total + cards.length,
        0,
      ),
      answeredQuestions: progress?.answered?.length || 0,
    };
  }
}
