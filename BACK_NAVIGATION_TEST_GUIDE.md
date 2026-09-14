# Back Navigation Testing Guide

## Quick Testing Steps

### 1. Basic Tab Navigation Test
```
1. Launch app → Home screen
2. Tap "Journey" tab
3. Tap "Passport" tab
4. Tap "Badges" tab
5. Press Android back button
   ✅ Expected: Go to Badges → Passport → Journey → Home
   ❌ Bug: All goes directly to Home
```

### 2. Journey Internal Navigation Test
```
1. Home screen → Tap Journey tab
2. Tap on any state card (e.g., Rajasthan)
3. You enter the intro screen
4. Press Android back button
   ✅ Expected: Return to journey map
5. Tap the state again → intro screen
6. Tap continue button
7. Enter learning hub screen
8. Press Android back button
   ✅ Expected: Return to intro screen
9. Press Android back button again
   ✅ Expected: Return to journey map
```

### 3. State Route Navigation Test
```
1. Home screen → Tap Journey tab
2. Tap a state (enters /state/$slug/)
3. Tap "Learn" or continue button → enters learning hub (/state/$slug/learn)
4. Press Android back button
   ✅ Expected: Return to state intro (/state/$slug/)
5. Press Android back button again
   ✅ Expected: Return to journey map (/journey)
6. Press Android back button again
   ✅ Expected: Return to home (/home)
```

### 4. Card Viewing Test
```
1. Home → Journey → State → Learning Hub
2. Tap on a learning card
3. View the card with TTS narration
4. Press Android back button
   ✅ Expected: Return to learning hub
5. Tap another card
6. View it
7. Press Android back button
   ✅ Expected: Return to learning hub
```

### 5. Quiz Navigation Test
```
1. Home → Journey → State → Learning Hub
2. Tap "Take Quiz" button
3. Answer first quiz question
4. Press Android back button
   ✅ Expected: Return to learning hub
   
Note: Quiz typically completes when finished, so back behavior 
may depend on quiz completion state
```

### 6. Home Screen Exit Test
```
1. Navigate to any screen
2. Keep pressing Android back button until you reach home
3. On home screen, press Android back button
   ✅ Expected: App closes/minimizes
   ❌ Bug: Goes to some other screen instead of exiting
```

### 7. Rapid Back Button Test
```
1. Home → Journey → Tap state → Go through intro/hub/card screens
2. Rapidly press back button multiple times (faster than normal)
3. App should handle rapid presses gracefully
   ✅ Expected: Navigate back through each screen
   ❌ Bug: Skip screens or crash
```

## Expected Behavior Summary

| Current Location | Back Button Result | Navigation Type |
|------------------|-------------------|-----------------|
| Home | Exit app | Special |
| Tabs (Passport/Badges/Me) | Previous tab | Route history |
| Journey map (view === null) | Previous route (usually Home) | Route history |
| Journey intro | Journey map | Internal state |
| Journey hub | Journey intro | Internal state |
| Journey card/quiz | Journey hub | Internal state |
| /state/$slug | Journey | Route history |
| /state/$slug/learn | /state/$slug | Route history |
| /state/$slug/quiz | /state/$slug/learn | Route history |
| /state/$slug/card/$index | /state/$slug/learn | Route history |

## Debugging

### Enable Logs
Check browser/logcat logs for:
```
journey_map_screen: handleJourneyBack called, current view: intro
journey_map_screen: Back from intro to map
root_component: RootComponent rendering { pathname: '/journey' }
```

### Check Router State
In browser console (web only):
```javascript
// Access TanStack Router (if exposed)
window.router?.state?.location?.pathname
// Shows current route
```

### Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| Always goes to home | Journey handler not registered | Check if JourneyMapScreen is rendering, verify setJourneyBackHandler is called |
| Rapid back crashes | Race condition in state updates | Verify useEffect cleanup is working |
| Back doesn't work at all | useAndroidBackButton not called in root | Check if Capacitor.isNativePlatform() returns true on Android |
| Some routes skip | router.history.back() not working | Verify TanStack Router history is being tracked |

## Performance Notes
- Handler lookup is O(1) - just retrieves a reference
- No observable performance impact even with rapid back presses
- State updates are batched by React

## Integration Testing
When testing on actual Android device:
1. Build APK with `npm run build`
2. Deploy to Android via Capacitor/Gradle
3. Test on real device with actual Android back gesture
4. Verify in both Android native and web embedded contexts
