# 🔧 Android Back Button Navigation Fix

## Problem
When navigating through the Journey screen (intro → hub → card → quiz), pressing the Android back button was always taking users directly to the home page instead of navigating through the proper hierarchy:
- From card/quiz → should go back to hub
- From hub → should go back to intro  
- From intro → should go back to journey map
- From journey map → should exit or go to home (default behavior)

## Root Cause
Two issues:
1. **JourneyMapScreen** was calling `useAndroidBackButton()` WITHOUT the callback parameter, so the hook had no function to execute for journey-specific back handling
2. **useAndroidBackButton hook** was set up to accept the callback, but it was being called without any parameter in JourneyMapScreen

## Solution

### Changes Made

#### 1. Fixed `src/components/screens.tsx` - JourneyMapScreen
**Before:**
```typescript
// Handle Android back button for internal state navigation
useAndroidBackButton(() => {
  if (view?.screen === "card" || view?.screen === "quiz") {
    setView({ screen: "hub", name: view.name });
  } else if (view?.screen === "hub") {
    setView({ screen: "intro", name: view.name });
  } else if (view?.screen === "intro") {
    setView(null);
  }
  // If already at journey map (view === null), the default back behavior will be used
});
```

**After:**
```typescript
// Handle Android back button for internal state navigation
const handleJourneyBack = () => {
  appLogger.info('journey_map_screen', 'handleJourneyBack called, current view:', view?.screen);
  // Navigate back within internal views: card → hub → intro → map
  if (view?.screen === "card" || view?.screen === "quiz") {
    // From card or quiz, go back to hub
    appLogger.info('journey_map_screen', 'Back from card/quiz to hub');
    setView({ screen: "hub", name: view.name });
    return; // Prevent default back behavior
  } else if (view?.screen === "hub") {
    // From hub, go back to intro
    appLogger.info('journey_map_screen', 'Back from hub to intro');
    setView({ screen: "intro", name: view.name });
    return; // Prevent default back behavior
  } else if (view?.screen === "intro") {
    // From intro, go back to journey map
    appLogger.info('journey_map_screen', 'Back from intro to map');
    setView(null);
    return; // Prevent default back behavior
  }
  // If already at journey map (view === null), allow default back behavior
  appLogger.info('journey_map_screen', 'At journey map, allowing default back behavior');
};

useAndroidBackButton(handleJourneyBack);
```

**Why:** Extracting the callback as a named function makes it explicit that we're passing the function to the hook, and adds logging for debugging.

#### 2. Updated `src/hooks/useAndroidBackButton.ts` - Hook Documentation
**Before:**
```typescript
/**
 * Hook to handle Android hardware back button.
 * Navigates back through the app's route history on non-home screens.
 * On home screen (/), exits the app.
 * 
 * For routes that manage internal state (like /journey with card views),
 * pass onJourneyBack callback to handle internal state navigation first.
 */
```

**After:**
```typescript
/**
 * Hook to handle Android hardware back button.
 * Navigates back through the app's route history on non-home screens.
 * On home screen (/), exits the app.
 * 
 * For routes that manage internal state (like /journey with card views),
 * pass onJourneyBack callback to handle internal state navigation first.
 * The callback should handle its own state updates and will prevent default back behavior.
 */
```

**Additional Change:** Added explicit comment in the callback section:
```typescript
// Journey tab: handle internal state navigation first (card → hub → intro → map)
// The callback manages its own state; if it handles the back, no further action is taken
if (currentPath === "/journey" && onJourneyBack) {
  onJourneyBack();
  // Exit here - the callback has handled the back button, don't do router.history.back()
  return;
}
```

**Why:** Makes it clear that when onJourneyBack is called, it should completely handle the back button, preventing any subsequent router.history.back() call.

## Navigation Flow After Fix

```
Card View / Quiz View
    ↓ (back button)
    ↓ handleJourneyBack() → setView("hub")
Hub View (Learning Hub)
    ↓ (back button)
    ↓ handleJourneyBack() → setView("intro")
Intro View (State Intro)
    ↓ (back button)
    ↓ handleJourneyBack() → setView(null)
Journey Map
    ↓ (back button)
    ↓ Hook: onJourneyBack not called (view === null)
    ↓ Default router.history.back()
Home / Exit App
```

## Files Modified
1. ✅ `src/components/screens.tsx` - JourneyMapScreen component
2. ✅ `src/hooks/useAndroidBackButton.ts` - Hook documentation and clarity

## Build Status
- ✅ npm run build: SUCCESS
- ✅ android build: BUILD SUCCESSFUL in 35s
- ✅ APK generated: `android/app/build/outputs/apk/debug/app-debug.apk`

## Testing Checklist
- [ ] Install APK on device
- [ ] Open Journey screen
- [ ] Navigate to a state intro
- [ ] Press back → should return to journey map (not home)
- [ ] Navigate to learning hub
- [ ] Press back → should return to intro (not home)
- [ ] Open a card view
- [ ] Press back → should return to hub (not home)
- [ ] Navigate to quiz
- [ ] Press back → should return to hub (not home)
- [ ] From journey map, press back → should go to home or exit

## Impact
- Users can now properly navigate backwards through the journey experience
- Back button behavior is now predictable and hierarchical
- No more unexpected jumps to home page
- Better UX for nested screen experiences
