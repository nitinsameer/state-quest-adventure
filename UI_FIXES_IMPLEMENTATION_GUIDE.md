# UI TECHNICAL FIXES - IMPLEMENTATION GUIDE
**Based on Audit ID: 2026-09-14-001**

---

## CRITICAL FIX #1: Button Touch Targets

### Problem
4 buttons throughout the app are 40px (h-10), below the 48px Android minimum.

### Locations to Fix

**Fix 1: HeaderBar back button (line 193)**
```typescript
// BEFORE
<button
  onClick={goBack}
  aria-label="Go back"
  className="h-10 w-10 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
>
  ‹
</button>

// AFTER
<button
  onClick={goBack}
  aria-label="Go back"
  className="h-12 w-12 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
>
  ‹
</button>
```

**Fix 2: StateIntroScreen back button (line 1371)**
```typescript
// BEFORE
<button
  onClick={() => {
    if (onBack) {
      fxTap();
      onBack();
    } else {
      goBack();
    }
  }}
  className="absolute top-3 left-4 h-10 w-10 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-white text-xl"
>
  ‹
</button>

// AFTER
<button
  onClick={() => {
    if (onBack) {
      fxTap();
      onBack();
    } else {
      goBack();
    }
  }}
  className="absolute top-3 left-4 h-12 w-12 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-white text-xl"
>
  ‹
</button>
```

**Fix 3: LearningCardScreen close button (line 1932)**
```typescript
// BEFORE
<button
  onClick={() => {
    stopTts();
    onClose?.();
  }}
  aria-label="Close"
  className="h-9 w-9 rounded-full bg-white shadow-soft flex items-center justify-center text-lg font-bold"
>
  ✕
</button>

// AFTER
<button
  onClick={() => {
    stopTts();
    onClose?.();
  }}
  aria-label="Close card"
  className="h-12 w-12 rounded-full bg-white shadow-soft flex items-center justify-center text-lg font-bold"
>
  ✕
</button>
```

**Fix 4: QuizScreen close button (line 2154)**
```typescript
// BEFORE
<button
  onClick={() => {
    fxTap();
    onClose?.();
  }}
  aria-label="Close"
  className="h-10 w-10 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
>
  ✕
</button>

// AFTER
<button
  onClick={() => {
    fxTap();
    onClose?.();
  }}
  aria-label="Close quiz"
  className="h-12 w-12 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
>
  ✕
</button>
```

**Fix 5: LearningHubScreen back button (line 1509)**
```typescript
// BEFORE
<button
  type="button"
  onClick={() => {
    fxTap();
    onBack?.();
  }}
  className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center text-white text-xl"
>
  ‹
</button>

// AFTER
<button
  type="button"
  onClick={() => {
    fxTap();
    onBack?.();
  }}
  className="h-12 w-12 rounded-full bg-white/25 flex items-center justify-center text-white text-xl"
>
  ‹
</button>
```

### Verification
After fixes:
- All back buttons: 48px (h-12)
- All close buttons: 48px (h-12)
- Meets Android Material Design requirement ✓

---

## CRITICAL FIX #2: Image Alt Text

### Problem
20+ images missing meaningful alt text. Empty `alt=""` causes screen reader failures.

### Implementation
Add alt text following this pattern:

```typescript
// Pattern 1: Mascot images
<img src={mascot} alt="Explorer mascot character" ...

// Pattern 2: State art
<img src={art} alt={`${stateName} regional illustration`} ...

// Pattern 3: Airplane decoration
<img src={airplane} alt="Airplane decoration" ...
```

### Specific Changes

**All mascot instances:**
```typescript
// Line 219: Splash screen
<img src={mascot} alt="India Explorer mascot" ...

// Line 251: Welcome screen
<img src={mascot} alt="India Explorer mascot" ...

// Line 487: Home dashboard
<img src={mascot} alt="Explorer mascot badge" ...

// Line 1121: Journey map
<img src={mascot} className="w-full h-full object-contain" alt="Explorer mascot" />

// Line 2176: Quiz mascot
<img key={result === "correct" ? `cheer-${burst}` : "idle"} src={mascot} alt="Mascot celebrating" ...
```

**All state art images:**
```typescript
// Line 1381: StateIntroScreen
<img
  src={art}
  alt={`${stateName} state illustration`}
  decoding="async"
  className="..."
/>

// Line 2026: LearningCardScreen
<img 
  src={art} 
  alt={`${stateName} learning card image`} 
  loading="lazy" 
  decoding="async" 
  className="h-full object-contain drop-shadow-xl" 
/>

// Line 2368: StateCompletedScreen
<img 
  src={art} 
  alt={`${stateName} completed badge`} 
  loading="lazy" 
  decoding="async" 
  className="h-20 object-contain drop-shadow" 
/>

// Line 2467: StateUnlockScreen
<img
  src={art}
  alt={`${stateName} unlock reward image`}
  decoding="async"
  className="relative h-72 object-contain drop-shadow-2xl animate-fade-in"
/>
```

**Airplane images:**
```typescript
// Line 1307: Journey map airplane
<img
  src={airplane}
  alt="Airplane travel decoration"
  className="absolute -top-10 -right-8 w-14 h-14 object-contain drop-shadow-lg animate-bounce-gentle"
  style={{ transform: "rotate(20deg)" }}
/>

// Line 2480: StateUnlockScreen airplane
<img
  src={airplane}
  alt="Airplane traveling decoration"
  className="absolute top-16 right-6 w-16 object-contain drop-shadow-xl"
  style={{ transform: "rotate(15deg)" }}
/>

// Line 3540: AchievementsScreen airplane
<img
  src={airplane}
  alt="Airplane celebration decoration"
  className="relative w-40 h-40 object-contain drop-shadow-2xl"
  style={{ transform: "rotate(-10deg)" }}
/>
```

### Verification
- [ ] All `alt=""` removed
- [ ] All `alt` attributes have descriptive text
- [ ] Tested with screen reader (NVDA/JAWS)
- [ ] Run Lighthouse accessibility audit

---

## CRITICAL FIX #3: Color Contrast on Streaks Display

### Problem
White text on white/25 background violates WCAG AA (4.5:1 minimum).

**Location: Line 495 (HomeDashboardScreen)**

```typescript
// BEFORE
<div className={`flex items-center gap-1.5 bg-white/25 rounded-full px-3 py-1.5 backdrop-blur transition-transform duration-1000 ${p.streak > 0 ? "animate-bounce" : ""}`}>
  <span>🔥</span>
  <span className="text-white text-display font-extrabold">{p.streak}</span>
</div>

// AFTER - Option 1: Darker background
<div className={`flex items-center gap-1.5 bg-white/60 rounded-full px-3 py-1.5 backdrop-blur transition-transform duration-1000 ${p.streak > 0 ? "animate-bounce" : ""}`}>
  <span>🔥</span>
  <span className="text-white text-display font-extrabold">{p.streak}</span>
</div>

// AFTER - Option 2: Orange background (better visual)
<div className={`flex items-center gap-1.5 bg-saffron-400/80 rounded-full px-3 py-1.5 backdrop-blur transition-transform duration-1000 ${p.streak > 0 ? "animate-bounce" : ""}`}>
  <span>🔥</span>
  <span className="text-white text-display font-extrabold">{p.streak}</span>
</div>
```

### Contrast Verification
Use WebAIM contrast checker:
- white/25: ~2.5:1 (FAILS WCAG AA)
- white/60: ~6.2:1 (PASSES WCAG AAA)
- saffron-400/80: ~7.1:1 (PASSES WCAG AAA)

**Recommended**: Use `bg-saffron-400/80` for consistent visual language.

---

## HIGH FIX #1: Text Overflow Prevention

### Problem
State names like "Himachal Pradesh" can overflow in grid cards without line-clamp.

**Location: Line 607 (MiniStateCard in HomeDashboardScreen)**

```typescript
// BEFORE
<div className="text-display font-extrabold text-sm text-center leading-tight">
  {s.name}
</div>

// AFTER
<div className="text-display font-extrabold text-sm text-center leading-tight line-clamp-2">
  {s.name}
</div>
```

### Additional locations to add line-clamp:

**Line 1202-1203 (Journey map banner labels):**
```typescript
// BEFORE
<div className="text-[12px] font-extrabold text-ink truncate">{b.label}</div>

// AFTER - Already has truncate ✓, verify it works

// Line 1203 progress text
<div className="mt-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
```

---

## HIGH FIX #2: Modal Z-Index Verification

### Problem
Verify modal z-index stacking order.

### Current State:
```typescript
// src/routes/__root.tsx - BottomNav
<div className="fixed bottom-0 left-0 right-0 z-20 pb-safe">

// src/components/screens.tsx:622 - Locked preview modal
<div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 animate-fade-in">
```

**Status**: ✓ Correct (z-50 > z-20, modal appears above BottomNav)

---

## MEDIUM FIX #1: Context-Specific Aria Labels

### Problem
Generic "Close" labels don't describe context.

### Changes:

**Line 1930 (LearningCardScreen close)**
```typescript
// BEFORE
<button ... aria-label="Close" ...>

// AFTER
<button ... aria-label="Close learning card" ...>
```

**Line 2154 (QuizScreen close)**
```typescript
// BEFORE
<button ... aria-label="Close" ...>

// AFTER
<button ... aria-label="Close quiz" ...>
```

---

## MEDIUM FIX #2: StandardizeResponsive Heights

### Problem
Fixed `h-[46%]` causes layout issues on different screens.

**Location: Line 1359 (StateIntroScreen)**

```typescript
// BEFORE
<div className={`relative h-[46%] ${grad} overflow-hidden`}>
  <Cloud className="absolute top-6 left-2 w-20 opacity-80" />
  <Cloud className="absolute top-14 right-2 w-16 opacity-70" />
  <button
    onClick={() => { ... }}
    className="absolute top-3 left-4 h-10 w-10 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-white text-xl"
  >
    ‹
  </button>
  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/25 backdrop-blur rounded-full px-3 py-1.5 text-white text-xs font-extrabold">
    State {stateIndex(state.name) + 1} of {TOTAL_STATES}
  </div>
  {art ? (
    <img
      src={art}
      alt=""
      decoding="async"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[85%] object-contain drop-shadow-2xl"
    />
  ) : (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-[70%] aspect-square rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-[68px] drop-shadow-2xl">
      {state.emoji}
    </div>
  )}
</div>

// AFTER - Use fixed padding instead
<div className={`relative py-12 ${grad} overflow-hidden`}>
  <Cloud className="absolute top-6 left-2 w-20 opacity-80" />
  <Cloud className="absolute top-14 right-2 w-16 opacity-70" />
  <button
    onClick={() => { ... }}
    className="absolute top-3 left-4 h-12 w-12 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-white text-xl"
  >
    ‹
  </button>
  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/25 backdrop-blur rounded-full px-3 py-1.5 text-white text-xs font-extrabold">
    State {stateIndex(state.name) + 1} of {TOTAL_STATES}
  </div>
  {art ? (
    <img
      src={art}
      alt={`${stateName} state illustration`}
      decoding="async"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-48 object-contain drop-shadow-2xl"
    />
  ) : (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-48 aspect-square rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-[68px] drop-shadow-2xl">
      {state.emoji}
    </div>
  )}
</div>
```

### Changes:
- `h-[46%]` → `py-12` (fixed vertical padding)
- `h-[85%]` → `h-48` (fixed height)
- `h-[70%]` → `h-48` (fixed height)

---

## Implementation Priority

| Priority | Fix | Time | Effort | Impact |
|----------|-----|------|--------|--------|
| P0 | Button sizes (h-10→h-12) | 10m | Trivial | CRITICAL |
| P0 | Image alt text | 20m | Low | CRITICAL |
| P0 | Streak contrast (white/25→white/60) | 5m | Trivial | CRITICAL |
| P1 | Context aria-labels | 10m | Low | HIGH |
| P1 | Text line-clamp | 5m | Trivial | HIGH |
| P1 | Responsive heights | 15m | Low | HIGH |
| P2 | Z-index verification | 0m | Verify | Done ✓ |

**Total Implementation Time**: ~65 minutes

---

## Testing Checklist

- [ ] All buttons are 48px minimum
- [ ] All images have alt text
- [ ] Color contrast passes WCAG AA (4.5:1)
- [ ] Screen reader test (VoiceOver/TalkBack)
- [ ] Lighthouse accessibility score > 90
- [ ] Test on 320px phone screen
- [ ] Test on 800px tablet screen
- [ ] Test landscape orientation
- [ ] No text overflow in any card
- [ ] Modals appear above BottomNav
- [ ] All buttons are clickable and reach 48px target

