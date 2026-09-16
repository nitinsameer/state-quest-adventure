# Profile Screen Options Summary

## Current Profile Settings Available

The Profile screen (`/me`) currently has **4 main toggle options**:

### 1. 🔊 Sound & Vibration
- **Status:** ✅ Active
- **Function:** Controls all audio feedback (sound effects, haptics)
- **When ON:** Sounds are on, vibrations enabled
- **When OFF:** Sounds are off, no vibrations
- **Affects:** 
  - Sound effects (fxTap, fxCorrect, fxWrong, etc.)
  - Vibration patterns
  - All auditory feedback

---

### 2. 🎧 Audio Narration
- **Status:** ✅ Active (Recently Added)
- **Function:** Enables/disables text-to-speech narration
- **When ON:** Stories are read aloud (TTS narration)
- **When OFF:** Turn on to hear stories
- **Storage Key:** `india-explorer:audio-enabled:v1`
- **Affects:**
  - TTS playback for card content
  - State narrations in native languages
  - Learning audio narration

---

### 3. 📁 Save & Share
- **Status:** ✅ Active (Recently Added)
- **Function:** Allows saving and sharing postcards
- **When ON:** Can save postcards to device
- **When OFF:** Turn on to save postcards
- **Storage Key:** `india-explorer:file-enabled:v1`
- **Affects:**
  - Postcard save functionality
  - File operations on device
  - Share capabilities

---

### 4. 🎯 Daily Goals
- **Status:** ✅ Display Only
- **Shows:**
  - Current daily goal
  - Day streak count
  - Days until next milestone reward
  - Next reward milestone

---

### 5. 🏆 Achievements
- **Status:** ✅ Link to Badges Page
- **Shows:** Badges earned count (X/20)
- **Navigation:** Links to `/badges` page

---

### 6. 👨‍👩‍👧 Parent Zone
- **Status:** ✅ Available
- **Shows:** Parent controls placeholder
- **Function:** Parental control features

---

### 7. 🔒 Privacy Policy
- **Status:** ✅ Available
- **Function:** Link to privacy policy page
- **Navigation:** Links to `/privacy` page

---

## Implementation Details

### Audio Narration Toggle
```typescript
// State management
const [audioEnabled, setAudioEnabled] = useState(() => {
  return localStorage.getItem("india-explorer:audio-enabled:v1") === "1";
});

// Toggle function
const toggleAudio = () => {
  const newState = !audioEnabled;
  setAudioEnabled(newState);
  localStorage.setItem("india-explorer:audio-enabled:v1", newState ? "1" : "0");
  if (newState) fxTap(); // Play tap sound on enable
};
```

### Save & Share Toggle
```typescript
// State management
const [fileEnabled, setFileEnabled] = useState(() => {
  return localStorage.getItem("india-explorer:file-enabled:v1") === "1";
});

// Toggle function
const toggleFile = () => {
  const newState = !fileEnabled;
  setFileEnabled(newState);
  localStorage.setItem("india-explorer:file-enabled:v1", newState ? "1" : "0");
  if (newState) fxTap(); // Play tap sound on enable
};
```

---

## UI Layout

Profile screen shows options in this order:

1. **Header Section**
   - Avatar display with level badge
   - User name (editable)
   - Age band display

2. **Stats Row**
   - XP count
   - States completed
   - Badges earned

3. **Settings Section** (Space-separated toggles)
   - Sound & Vibration (🔊)
   - Audio Narration (🎧)
   - Save & Share (📁)

4. **Features Section**
   - Achievements (🏆) → Link to Badges
   - Daily Goals (🎯) → Display
   - Parent Zone (👨‍👩‍👧) → Controls
   - Privacy Policy (🔒) → Link

---

## Storage Persistence

All settings are stored in localStorage with these keys:

```
Sound & Vibration: Managed by useSoundOn() hook
Audio Narration:   india-explorer:audio-enabled:v1
Save & Share:      india-explorer:file-enabled:v1
```

---

## Related Features

### When Audio Narration is ON:
- TTS plays automatically on learning cards
- Narration respects Sound & Vibration toggle
- Multi-language support (11 languages)
- Speed/pitch configured for kids

### When Save & Share is ON:
- Postcards can be saved to device
- Share functionality available
- File operations allowed

---

## Accessibility

All toggles include:
- ✅ ARIA role="switch"
- ✅ aria-checked attribute
- ✅ aria-label descriptive text
- ✅ Clear visual toggle state
- ✅ Touch-friendly (large tap target)
- ✅ Visual feedback on interaction

---

## Visual Design

- **Round toggle buttons** with smooth animations
- **Color-coded icons:**
  - 🔊 Sound & Vibration: Blue icon
  - 🎧 Audio Narration: Blue background
  - 📁 Save & Share: Green background
- **Smooth transitions** on toggle
- **Active scale effect** (0.99x) on tap
- **Green success color** when enabled
- **Gray muted color** when disabled

---

**Status:** ✅ All 3 options fully implemented and functional
