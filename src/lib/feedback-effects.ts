/**
 * Unified feedback effects system
 * 
 * Provides reusable haptic and sound effect triggers throughout the app
 * Respects system settings and user preferences
 * 
 * Usage:
 *   playSound('success');
 *   vibrate('success');
 *   triggerFeedback('success'); // both sound + haptics
 */

/**
 * Haptic vibration patterns (in milliseconds)
 * Format: [vibration, pause, vibration, pause, ...]
 */
const HAPTIC_PATTERNS = {
  // Quick success tap
  tap: [50],
  
  // Success: pattern of celebratory taps
  success: [50, 30, 50, 30, 200],
  
  // Try-again: gentle encouraging vibration
  tryAgain: [100, 50, 100],
  
  // Error: warning vibration
  error: [200, 100, 200],
  
  // Unlock: celebratory pattern
  unlock: [100, 50, 100, 50, 100, 50, 150],
  
  // Achievement: strong celebratory pattern
  achievement: [50, 50, 100, 50, 100, 50, 100],
};

/**
 * Sound effect file paths
 */
const SOUND_FILES = {
  success: '/sounds/success.mp3',
  tryAgain: '/sounds/try-again.mp3',
  unlock: '/sounds/unlock.mp3',
  achievement: '/sounds/achievement.mp3',
  pop: '/sounds/pop.mp3',
};

type FeedbackType = keyof typeof HAPTIC_PATTERNS;
type SoundType = keyof typeof SOUND_FILES;

/**
 * Play a sound effect with volume control
 */
export function playSound(soundType: SoundType, volume = 0.6): void {
  try {
    if (typeof window === 'undefined') return;

    // Check if audio is enabled in user preferences
    const audioEnabled = localStorage.getItem('audioEnabled') !== 'false';
    if (!audioEnabled) return;

    const audio = new Audio(SOUND_FILES[soundType]);
    audio.volume = Math.max(0, Math.min(1, volume));
    
    // Try to play, silently fail if audio doesn't exist
    audio.play().catch(() => {
      // Audio file not available or playback failed - continue silently
    });
  } catch (error) {
    // Silently handle any audio errors
    console.debug('[FeedbackEffects] Sound playback error:', error);
  }
}

/**
 * Trigger device vibration with haptic pattern
 */
export function vibrate(feedbackType: FeedbackType): void {
  try {
    if (typeof navigator === 'undefined') return;

    // Check if haptics are enabled in user preferences
    const hapticsEnabled = localStorage.getItem('hapticsEnabled') !== 'false';
    if (!hapticsEnabled) return;

    const pattern = HAPTIC_PATTERNS[feedbackType];
    
    // Use Vibration API if available
    if ('vibration' in navigator) {
      navigator.vibration.vibrate(pattern);
    }
    // Fallback: Web Haptics API for future support
    else if ('HapticFeedback' in window) {
      // Future enhancement for better haptic support
    }
  } catch (error) {
    // Silently handle any vibration errors
    console.debug('[FeedbackEffects] Vibration error:', error);
  }
}

/**
 * Trigger combined feedback: sound + haptics
 */
export function triggerFeedback(feedbackType: FeedbackType, soundVolume = 0.6): void {
  vibrate(feedbackType);
  
  // Map feedback types to sound types
  const soundMapping: Record<FeedbackType, SoundType> = {
    tap: 'pop',
    success: 'success',
    tryAgain: 'tryAgain',
    error: 'tryAgain',
    unlock: 'unlock',
    achievement: 'achievement',
  };

  const soundType = soundMapping[feedbackType];
  playSound(soundType, soundVolume);
}

/**
 * Check if haptics are available on this device
 */
export function isHapticsAvailable(): boolean {
  if (typeof navigator === 'undefined') return false;
  return 'vibration' in navigator;
}

/**
 * Check if audio is available
 */
export function isAudioAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const audio = new Audio();
    return !!audio.canPlayType;
  } catch {
    return false;
  }
}

/**
 * Enable/disable audio
 */
export function setAudioEnabled(enabled: boolean): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('audioEnabled', String(enabled));
  }
}

/**
 * Enable/disable haptics
 */
export function setHapticsEnabled(enabled: boolean): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('hapticsEnabled', String(enabled));
  }
}

/**
 * Check if audio is currently enabled
 */
export function isAudioEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem('audioEnabled') !== 'false';
}

/**
 * Check if haptics are currently enabled
 */
export function isHapticsEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem('hapticsEnabled') !== 'false';
}
