import { BasePage } from './BasePage';

/**
 * Quiz Page Object
 * Handles quiz questions, answers, and scoring
 */
export class QuizPage extends BasePage {
  // Selectors
  private readonly quizHeader = 'text=/Question \\d+ of \\d+/';
  private readonly questionPrompt = '[class*="text-lg"]';
  private readonly answerOptions = 'button[class*="rounded"]';
  private readonly progressCounter = 'text=/Question \\d+ of \\d+/';
  private readonly scoreDisplay = 'text=/\\d+\\/\\d+/';
  private readonly completeButton = 'button:has-text(/Continue|Next|Done/)';
  private readonly celebrationModal = '[class*="modal"]';

  /**
   * Navigate to quiz for a state
   */
  async goto(stateName: string) {
    const slug = stateName.toLowerCase().replace(/\s+/g, '-');
    await super.goto(`/state/${slug}/quiz`);
    await this.waitForQuizToLoad();
  }

  /**
   * Wait for quiz to load
   */
  async waitForQuizToLoad() {
    await this.waitForElement(this.quizHeader, 10000);
  }

  /**
   * Get current question number
   */
  async getCurrentQuestion(): Promise<number> {
    const text = await this.getText(this.progressCounter);
    const match = text.match(/Question (\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  /**
   * Get total questions
   */
  async getTotalQuestions(): Promise<number> {
    const text = await this.getText(this.progressCounter);
    const match = text.match(/of (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get question prompt text
   */
  async getQuestionText(): Promise<string> {
    return await this.getText(this.questionPrompt);
  }

  /**
   * Get all answer option texts
   */
  async getAnswerOptions(): Promise<string[]> {
    const options = await this.getAllText(this.answerOptions);
    return options.filter(o => o.trim().length > 0);
  }

  /**
   * Click answer option by text
   */
  async selectAnswer(answerText: string) {
    const button = this.page.locator(`text=${answerText}`).first();
    await button.click();
    await this.page.waitForTimeout(500); // Wait for feedback animation
  }

  /**
   * Click answer option by index
   */
  async selectAnswerByIndex(index: number) {
    const options = await this.page.locator(this.answerOptions).all();
    if (index >= 0 && index < options.length) {
      await options[index].click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Get number of answer options
   */
  async getAnswerCount(): Promise<number> {
    return await this.getElementCount(this.answerOptions);
  }

  /**
   * Verify correct answer is in options
   */
  async isAnswerInOptions(answer: string): Promise<boolean> {
    const options = await this.getAnswerOptions();
    return options.some(o => o.includes(answer));
  }

  /**
   * Check for duplicate options
   */
  async hasDuplicateOptions(): Promise<boolean> {
    const options = await this.getAnswerOptions();
    return new Set(options).size !== options.length;
  }

  /**
   * Complete quiz by answering all questions (with random answers)
   */
  async completeQuizRandom() {
    const totalQuestions = await this.getTotalQuestions();
    let correctCount = 0;

    for (let i = 0; i < totalQuestions; i++) {
      const options = await this.getAnswerOptions();
      const randomIndex = Math.floor(Math.random() * options.length);
      await this.selectAnswerByIndex(randomIndex);

      // Check if we move to next question
      const currentQ = await this.getCurrentQuestion();
      if (currentQ === i + 2 || i === totalQuestions - 1) {
        // Moved to next or is last
      } else {
        // Try next question in a moment
        await this.page.waitForTimeout(100);
      }
    }

    return correctCount;
  }

  /**
   * Complete quiz by answering specific answers
   */
  async completeQuizWithAnswers(answers: string[]) {
    for (const answer of answers) {
      await this.selectAnswer(answer);
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Wait for quiz completion screen
   */
  async waitForCompletionScreen(timeout = 15000) {
    try {
      await this.page.waitForSelector('text=/\\d+\\/\\d+/|Score|Complete/', { timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get final score
   */
  async getFinalScore(): Promise<{ correct: number; total: number }> {
    const scoreText = await this.getText(this.scoreDisplay);
    const match = scoreText.match(/(\d+)\/(\d+)/);
    return {
      correct: match ? parseInt(match[1]) : 0,
      total: match ? parseInt(match[2]) : 0,
    };
  }

  /**
   * Get score percentage
   */
  async getScorePercent(): Promise<number> {
    const score = await this.getFinalScore();
    return Math.round((score.correct / score.total) * 100);
  }

  /**
   * Click continue button on completion screen
   */
  async clickContinue() {
    await this.waitAndClick(this.completeButton, 5000);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Is quiz completed
   */
  async isQuizCompleted(): Promise<boolean> {
    try {
      return await this.waitForCompletionScreen(3000);
    } catch {
      return false;
    }
  }

  /**
   * Complete entire quiz flow
   */
  async completeQuizFlow() {
    await this.waitForQuizToLoad();

    const totalQuestions = await this.getTotalQuestions();
    if (totalQuestions === 0) {
      throw new Error('No questions found in quiz');
    }

    // Answer all questions randomly
    await this.completeQuizRandom();

    // Wait for completion
    const completed = await this.waitForCompletionScreen();
    if (!completed) {
      throw new Error('Quiz did not complete');
    }

    // Get score
    const score = await this.getFinalScore();
    console.log(`Quiz score: ${score.correct}/${score.total} (${await this.getScorePercent()}%)`);

    // Click continue
    await this.clickContinue();
  }

  /**
   * Verify question has 4 options (1 correct + 3 distractors)
   */
  async verifyQuestionFormat(): Promise<boolean> {
    const optionCount = await this.getAnswerCount();
    return optionCount === 4;
  }

  /**
   * Get quiz metadata
   */
  async getQuizMetadata(): Promise<any> {
    return {
      currentQuestion: await this.getCurrentQuestion(),
      totalQuestions: await this.getTotalQuestions(),
      options: await this.getAnswerOptions(),
      optionCount: await this.getAnswerCount(),
      questionText: await this.getQuestionText(),
    };
  }
}
