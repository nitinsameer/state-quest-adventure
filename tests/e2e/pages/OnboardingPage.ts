import { BasePage } from './BasePage';

/**
 * Onboarding & Profile Creation Page Object
 */
export class OnboardingPage extends BasePage {
  // Splash Screen
  private readonly splashScreen = 'text=/India.*Explorer/';
  private readonly loadingDots = '[class*="animate-pulse"]';

  // Welcome Screen
  private readonly welcomeScreen = '[class*="welcome"]';
  private readonly startButton = 'button:has-text(/Start|Begin/)';

  // Create Profile Screen
  private readonly createProfileHeader = 'text=/Pick your avatar/';
  private readonly avatarButtons = 'button[class*="rounded-2xl"][class*="border"]';
  private readonly ageBandOptions = '[class*="gradient"]';
  private readonly selectedAvatarConfirm = '[class*="gradient-saffron"][class*="animate-fade"]';
  private readonly saveButton = 'button:has-text(/Save|Continue/)';
  private readonly audioPermissionDialog = '[class*="modal"]';
  private readonly acceptAudioButton = 'button:has-text(/Yes|Accept|Allow/)';
  private readonly rejectAudioButton = 'button:has-text(/No|Deny|Skip/)';

  /**
   * Navigate to splash screen
   */
  async goto() {
    await super.goto('/');
    // Splash auto-redirects to welcome, so wait for welcome
    await this.waitForWelcomeScreen();
  }

  /**
   * Wait for splash to load
   */
  async waitForSplash() {
    await this.waitForElement(this.splashScreen, 5000);
  }

  /**
   * Wait for welcome screen
   */
  async waitForWelcomeScreen() {
    // Welcome is usually a background image, so we look for the "Start" button or click area
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Give redirect time
  }

  /**
   * Click start button to go to create profile
   */
  async clickStart() {
    // Welcome screen is a full-screen clickable area
    await this.page.click('body');
    await this.page.waitForLoadState('networkidle');
    await this.waitForCreateProfileScreen();
  }

  /**
   * Wait for create profile screen
   */
  async waitForCreateProfileScreen() {
    await this.waitForElement(this.createProfileHeader, 10000);
  }

  /**
   * Is create profile visible
   */
  async isCreateProfileVisible(): Promise<boolean> {
    return await this.elementExists(this.createProfileHeader);
  }

  /**
   * Get all avatar buttons (12 total)
   */
  async getAvatarCount(): Promise<number> {
    return await this.getElementCount(this.avatarButtons);
  }

  /**
   * Click on specific avatar by index
   */
  async selectAvatar(index: number) {
    const avatars = await this.page.locator(this.avatarButtons).all();
    if (index >= 0 && index < avatars.length) {
      await avatars[index].click();
      await this.page.waitForTimeout(300); // Animation
    }
  }

  /**
   * Select age band
   */
  async selectAgeBand(ageBand: '3-5' | '6-7' | '8-9' | '10-12') {
    const ageText = {
      '3-5': 'Sprout',
      '6-7': 'Seedling',
      '8-9': 'Sapling',
      '10-12': 'Mighty Tree',
    }[ageBand];

    await this.page.locator(`text=${ageText}`).click();
    await this.page.waitForTimeout(300); // Animation
  }

  /**
   * Verify avatar is selected (shows confirmation card)
   */
  async isAvatarSelected(): Promise<boolean> {
    return await this.isVisible(this.selectedAvatarConfirm);
  }

  /**
   * Click save profile button
   */
  async clickSaveProfile() {
    await this.waitAndClick(this.saveButton, 5000);
    await this.page.waitForTimeout(500); // Animation
  }

  /**
   * Handle audio permission dialog
   */
  async handleAudioPermission(accept: boolean) {
    try {
      if (accept) {
        await this.waitAndClick(this.acceptAudioButton, 5000);
      } else {
        await this.waitAndClick(this.rejectAudioButton, 5000);
      }
      await this.page.waitForTimeout(500);
    } catch {
      // Dialog might not appear, that's ok
    }
  }

  /**
   * Complete full onboarding flow
   */
  async completeOnboarding(options?: {
    avatar?: number;
    ageBand?: '3-5' | '6-7' | '8-9' | '10-12';
    acceptAudio?: boolean;
  }) {
    const { avatar = 0, ageBand = '8-9', acceptAudio = false } = options || {};

    // Click start
    await this.clickStart();

    // Select avatar
    await this.selectAvatar(avatar);

    // Select age band
    await this.selectAgeBand(ageBand);

    // Save profile
    await this.clickSaveProfile();

    // Handle audio permission
    await this.handleAudioPermission(acceptAudio);

    // Wait for redirect to home
    await this.waitForURL('/home', 10000);
  }

  /**
   * Get localStorage progress after onboarding
   */
  async getProgressData(): Promise<any> {
    return await this.getLocalStorageJSON('india-explorer:progress:v2');
  }

  /**
   * Verify user is onboarded
   */
  async isUserOnboarded(): Promise<boolean> {
    const progress = await this.getProgressData();
    return progress?.onboarded === true;
  }

  /**
   * Clear localStorage to reset app
   */
  async resetApp() {
    await this.clearLocalStorage();
    await this.page.reload();
  }
}
