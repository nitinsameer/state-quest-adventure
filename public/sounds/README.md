# Sound Effects for India Explorer

This directory should contain the following sound effect files:

## Required Sound Files

- `success.mp3` - Celebratory sound for correct quiz answers (300-500ms)
- `try-again.mp3` - Encouraging sound for incorrect answers (300-500ms)
- `unlock.mp3` - Badge unlock celebration sound (400-600ms)
- `achievement.mp3` - State completion achievement sound (500-800ms)
- `pop.mp3` - Short tap/click sound effect (100-200ms)

## Recommendations

- Use child-friendly, positive tones
- Keep volumes moderate (avoid startling sounds)
- All files should be .mp3 format for browser compatibility
- Consider adding a mute setting in the audio settings UI
- Test audio on actual device to ensure quality

## Audio Settings

Users can control audio via:
- `localStorage.audioEnabled` - Enable/disable audio (default: true)
- `localStorage.hapticsEnabled` - Enable/disable haptics (default: true)

Use the `src/lib/feedback-effects.ts` module for all sound and haptic feedback.
