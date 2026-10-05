import { BasePage } from './BasePage';

/**
 * Learning Hub Page Object
 * Handles learning cards, card reading, and quiz unlock
 */
export class LearningHubPage extends BasePage {
  // Selectors
  private readonly hubHeader = '[class*="Learning Hub"]';
  private readonly progressBar = '[class*="bg-white/25"]';
  private readonly progressText = 'text=/\\d+ \\/ 6/';
  private readonly cards = '[class*="rounded-2xl"][class*="p-3"]';
  private readonly quizButton = 'button:has-text(/Take Quiz|Quiz/)'
  private readonly cardModal = '[class*="modal"]';
  private readonly cardContent = '[class*="text-white"]';
  private readonly closeButton = 'button:has-text(/Back|Close|←/)';
  private readonly celebrationModal = '[class*="celebration"]';
  private readonly masteryMessage = 'text=/MASTERED/';

  /**
   * Navigate to learning hub for a state
   */
  async goto(stateName: string) {
    const slug = stateName.toLowerCase().replace(/\s+/g, '-');
    await super.goto(`/state/${slug}/learn`);
    await this.waitForHubToLoad();
  }

  /**
   * Wait for learning hub to load
   */
  async waitForHubToLoad() {
    await this.waitForElement(this.hubHeader, 10000);
  }

  /**
   * Get current progress (cards read)
   */
  async getProgress(): Promise<{ read: number; total: number }> {
    const progressText = await this.getText(this.progressText);
    const match = progressText.match(/(\d+) \/ (\d+)/);
    return {
      read: match ? parseInt(match[1]) : 0,
      total: match ? parseInt(match[2]) : 0,
    };
  }

  /**
   * Get progress percentage
   */
  async getProgressPercent(): Promise<number> {
    const progress = await this.getProgress();
    return Math.round((progress.read / progress.total) * 100);
  }

  /**
   * Get number of cards visible
   */
  async getCardCount(): Promise<number> {
    return await this.getElementCount(this.cards);
  }

  /**
   * Click on a specific card (0-5 index)
   */
  async clickCard(index: number) {
    const cardElements = await this.page.locator(this.cards).all();
    if (index >= 0 && index < cardElements.length) {
      await cardElements[index].click();
      await this.page.waitForTimeout(500); // Animation
    }
  }

  /**
   * Verify card modal opened
   */
  async isCardModalOpen(): Promise<boolean> {
    return await this.isVisible(this.cardContent);
  }

  /**
   * Get card modal title
   */
  async getCardTitle(): Promise<string> {
    // Card title is usually in a heading
    const title = await this.page.locator('[class*="text-lg"]').first().textContent();
    return title || '';
  }

  /**
   * Close card modal
   */
  async closeCardModal() {
    // Click outside or press escape
    await this.page.press('Escape');
    await this.page.waitForTimeout(300); // Animation
  }

  /**
   * Read all 6 cards in sequence
   */
  async readAllCards() {
    let cardsRead = 0;
    const { total } = await this.getProgress();

    for (let i = 0; i < total; i++) {
      const currentProgress = await this.getProgress();
      if (currentProgress.read >= total) break; // All read

      await this.clickCard(i);
      await this.page.waitForTimeout(300);

      // Close modal
      await this.closeCardModal();
      await this.page.waitForTimeout(300);

      cardsRead++;
    }

    return cardsRead;
  }

  /**
   * Is quiz button enabled
   */
  async isQuizButtonEnabled(): Promise<boolean> {
    return !(await this.isDisabled(this.quizButton));
  }

  /**
   * Is quiz button disabled
   */
  async isQuizButtonDisabled(): Promise<boolean> {
    return await this.isDisabled(this.quizButton);
  }

  /**
   * Get quiz button text
   */
  async getQuizButtonText(): Promise<string> {
    return await this.getText(this.quizButton);
  }

  /**
   * Click quiz button
   */
  async clickQuizButton() {
    await this.click(this.quizButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for completion celebration
   */
  async waitForCompletionCelebration(timeout = 10000) {
    try {
      await this.page.waitForSelector('text=/MASTERED/', { timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close celebration modal
   */
  async closeCelebration() {
    // Usually auto-closes or click outside
    await this.page.press('Escape');
    await this.page.waitForTimeout(500);
  }

  /**
   * Get progress bar fill percentage
   */
  async getProgressBarPercent(): Promise<number> {
    const { read, total } = await this.getProgress();
    return Math.round((read / total) * 100);
  }

  /**
   * Wait for specific progress
   */
  async waitForProgress(expectedCards: number, timeout = 10000) {
    await this.waitFor(async () => {
      const { read } = await this.getProgress();
      return read === expectedCards;
    }, timeout);
  }

  /**
   * Get all card titles
   */
  async getAllCardTitles(): Promise<string[]> {
    const cardElements = await this.page.locator(this.cards).all();
    const titles: string[] = [];

    for (const card of cardElements) {
      const title = await card.locator('text=/Capital|Language|Food|Places|Animal|Fact/').first().textContent();
      if (title) titles.push(title);
    }

    return titles;
  }

  /**
   * Verify all 6 card categories are visible
   */
  async verifyAllCategoriesVisible(): Promise<boolean> {
    const categories = ['Capital', 'Language', 'Food', 'Places', 'Animal', 'Fact'];
    const titles = await this.getAllCardTitles();

    for (const cat of categories) {
      if (!titles.some(t => t.includes(cat))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Complete full learning flow (read all cards)
   */
  async completeLearningFlow() {
    await this.waitForHubToLoad();

    // Verify all cards visible
    const cardCount = await this.getCardCount();
    if (cardCount !== 6) {
      throw new Error(`Expected 6 cards, got ${cardCount}`);
    }

    // Read all cards
    for (let i = 0; i < 6; i++) {
      const progress = await this.getProgress();
      if (progress.read >= 6) break;

      await this.clickCard(i);
      await this.page.waitForTimeout(300);
      await this.closeCardModal();
      await this.page.waitForTimeout(300);
    }

    // Verify quiz is now enabled
    const quizEnabled = await this.isQuizButtonEnabled();
    if (!quizEnabled) {
      throw new Error('Quiz button should be enabled after reading all cards');
    }

    // Wait for mastery celebration
    const celebrated = await this.waitForCompletionCelebration();
    if (!celebrated) {
      console.warn('Did not see mastery celebration');
    }
  }
}
