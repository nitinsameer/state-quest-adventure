# ⚡ QUICK PRODUCTION DISABLE GUIDE

## 🎯 One-Command Fix to Disable Testing Mode

### BEFORE GOING TO PRODUCTION:

#### 1️⃣ Edit `src/lib/progress.ts`
**Line 327** - Change:
```typescript
const TESTING_MODE_UNLOCK_ALL_STATES = true; // TODO: DISABLE BEFORE PRODUCTION!
```
**TO:**
```typescript
const TESTING_MODE_UNLOCK_ALL_STATES = false; // ✅ PRODUCTION MODE
```

#### 2️⃣ Edit `src/components/screens.tsx`
**Line ~1077** - Simplify to:
```typescript
// Production: Only allow accessing unlocked states
if (n.status !== "locked") {
  setView({ screen: "intro", name: n.name });
}
```

Remove the testing mode check:
```typescript
// ❌ REMOVE THIS:
const TESTING_MODE = true; // TODO: Sync with progress.ts flag before production
if (n.status !== "locked" || TESTING_MODE) {
```

#### 3️⃣ Remove Testing Log
**Line ~347 in `src/lib/progress.ts`** - Remove:
```typescript
// ❌ DELETE THIS LINE:
console.log('🧪 TESTING MODE ACTIVE: All states unlocked for testing');
```

---

## ✅ Verify Changes

```bash
# Search for all testing references
grep -r "TESTING_MODE" src/

# Should return NO results when clean
```

---

## 🚀 Deploy to Production

```bash
# Build for web
npm run build

# Build for Android
cd android && ./gradlew clean assembleDebug

# Install on device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🧪 How to Test Production Mode Works

1. Open app on device
2. Look at Journey Map
3. **State 1:** Shows "🚀 Tap to start" (current/playable)
4. **States 2-36:** Shows "🔒 Locked" (cannot access)
5. Click State 2 → Should NOT open (locked)
6. Complete State 1 → State 2 unlocks automatically
7. State 2 becomes "🚀 Tap to start"

---

## ✨ That's It!

Just change 2 flags and remove 1 line = Back to production mode!

**Current Status:** 🧪 TESTING MODE (all states unlocked)
**After Changes:** ✅ PRODUCTION MODE (normal progression)
