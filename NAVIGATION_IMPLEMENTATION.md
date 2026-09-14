# Android Back Button Navigation - Implementation Guide

## Problem Fixed
Previously, the Android back gesture always navigated to the home screen regardless of which screen the user was on. This was because the back button handler was not properly routing to the correct destination based on the current route.

## Solution Implemented

### 1. **Global Journey Back Handler** (`src/lib/journeyBackHandler.ts`)
- Created a simple module to store and retrieve the journey-specific back handler
- Allows JourneyMapScreen to register its internal state navigation logic globally
- The root component can access this handler without prop drilling

### 2. **Improved Android Back Button Hook** (`src/hooks/useAndroidBackButton.ts`)
```typescript
- Exits app on home/welcome/root screens (as before)
- Calls the journey back handler (if registered) for /journey routes
- Falls back to router.history.back() for all other routes
- Uses router.history.length check to navigate to /home if no history exists
```

**Key improvement**: Uses TanStack Router's built-in `router.history` API which properly tracks all route changes across the entire app.

### 3. **Root Component Update** (`src/routes/__root.tsx`)
```typescript
- Gets the journey back handler dynamically via getJourneyBackHandler()
- Passes it to useAndroidBackButton so the hook can call it when needed
- The dynamic lookup ensures it always uses the current handler
```

### 4. **Journey Screen Handler Registration** (`src/components/screens.tsx`)
```typescript
- JourneyMapScreen registers its internal state navigation handler via useEffect
- Handler manages: card/quiz → hub → intro → map transitions
- When view === null (at journey map), handler returns without preventing default back
- This allows router.history.back() to take over and navigate to previous route
```

## How It Works - Navigation Flow

### Tab Routes (home, passport, badges, me)
```
User presses back on /passport
→ useAndroidBackButton() called
→ No journey handler registered (not on /journey)
→ router.history.back() executes
→ Takes you to previous route in history (e.g., /home)
✅ Works correctly
```

### Journey Internal States
```
User presses back while viewing a card at /journey
→ useAndroidBackButton() called
→ Journey handler IS registered
→ Handler checks view state: "card"
→ setView({ screen: "hub" }) - internal state change
→ No route change, stays on /journey
✅ Proper back within journey

User presses back at journey map (/journey with view === null)
→ useAndroidBackButton() called
→ Journey handler returns without handling
→ router.history.back() executes
→ Takes you to previous route (typically /home)
✅ Correct app-level back
```

### State Routes (/state/$slug/...)
```
User presses back from /state/$slug/learn
→ useAndroidBackButton() called
→ Not on /journey, no special handling
→ router.history.back() executes
→ Goes to /journey (typical previous route)
✅ Works correctly through route history
```

## Browser History Stack
TanStack Router maintains a proper history stack for all URL changes:
```
Example sequence:
/home → /journey → /state/rajasthan → /state/rajasthan/learn

History stack: [/home, /journey, /state/rajasthan, /state/rajasthan/learn]

Press back: removes /state/rajasthan/learn → go to /state/rajasthan
Press back: removes /state/rajasthan → go to /journey
Press back: removes /journey → go to /home
Press back: removes /home → exit app (special case)
```

## Key Design Decisions

1. **No Navigation Context Overhead**: Uses simple global handler instead of complex context system - simpler and more performant

2. **Journey Handler as Callback**: JourneyMapScreen registers a callback that's called by the root, avoiding the need to pass props or context through many levels

3. **Separation of Concerns**:
   - URL routing handled by TanStack Router
   - Internal Journey state handled by JourneyMapScreen
   - Back button dispatch happens in root component

4. **Handler Cleanup**: useEffect cleanup ensures handler is removed when JourneyMapScreen unmounts, preventing stale references

## Testing the Fix

### Test Cases
1. **Tab Navigation**: Tap home → journey → passport → home, press back - should go to previous tab
2. **Journey Internal**: View map → intro → hub → card, press back multiple times - should navigate through internal states
3. **State Routes**: Tap a state → view cards → take quiz, press back - should go through each screen
4. **App Exit**: From home, press back - should exit the app
5. **Mixed Navigation**: Jump between tabs and routes, press back - should navigate correctly

### Console Logging
All navigation events are logged via `appLogger`:
- `journey_map_screen`: Shows which view state changes occur
- `root_component`: Shows route changes

Check browser console/logcat for these logs during testing.

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/journeyBackHandler.ts` | Created - manages global journey handler |
| `src/hooks/useAndroidBackButton.ts` | Updated - uses journey handler and router.history.back() |
| `src/routes/__root.tsx` | Updated - imports and uses getJourneyBackHandler() |
| `src/components/screens.tsx` | Updated - JourneyMapScreen registers handler via useEffect |

## Backward Compatibility
✅ Fully backward compatible - all existing routes continue to work, just with proper back navigation now.

## Future Improvements
1. Add unit tests for back navigation logic
2. Create test scenarios for edge cases (rapid back presses, route changes during back navigation)
3. Add analytics to track back button usage patterns
