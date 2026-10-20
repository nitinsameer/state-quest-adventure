# Onboarding Component

This directory contains the redesigned onboarding flow for the State Quest Adventure application.

## Structure

The onboarding redesign implements a step-by-step guided experience:

1. **Welcome Screen** - Introduction to the app experience
2. **Avatar Selection** - Pick your avatar with preview
3. **Age Selection** - Choose age with skip option (defaults to 6-7)
4. **COPPA Compliance** - Parent consent and parental controls
5. **Celebratory Feedback** - Audio cues and animations for user engagement

## Features

### Audio System
- Celebratory sounds for each selection
- Touch feedback sounds
- Integrated with `src/lib/audio/` module
- Plays on avatar selection, age confirmation, and COPPA agreement

### Design
- Step-by-step progression with clear visual feedback
- Smooth transitions between screens
- Skip options where appropriate
- Accessibility compliant interactions

### Audio Compliance
- Parent consent checkbox integrated into profile creation
- Removed as separate screen
- Streamlined user experience

## Dependencies

- React 19.2.0
- Tailwind CSS 4.2.1
- @radix-ui components for accessible UI
- Audio system for engagement feedback
- Zustand for state management

## Related Directories

- `src/lib/audio/` - Audio playback and management
- `src/constants/` - UI constants and configurations
- `src/hooks/` - Custom React hooks for onboarding logic
- `tests/e2e/journeys/` - E2E tests for onboarding flow

## Notes

- Ensure audio is not disabled on device
- All selections are celebratory and engaging
- Each step should feel rewarding to the user
- Test on actual devices for audio feedback
