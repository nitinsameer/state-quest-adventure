# Ambient Background Music

The app plays ambient background music during gameplay. The system will:

1. **Try to load a music file**: If `ambient-music.mp3` or `ambient-music.wav` exists in this folder, it will play
2. **Fallback to generated tone**: If no file exists, it generates a subtle ambient tone using Web Audio API

## Adding Your Own Music

To use a custom music file:

1. Get a royalty-free ambient/children's music track (MP3 recommended for best compatibility)
2. Save it as `ambient-music.mp3` in this folder (`public/`)
3. Recommended sources:
   - **Pixabay Music** (https://pixabay.com/music/)
   - **YouTube Audio Library**
   - **FreeSound.org**
   - **Incompetech**

## Music Recommendations

For a kids' exploration app, choose music that is:
- ✅ **Calm and non-intrusive** (doesn't distract from gameplay)
- ✅ **Loopable** (seamless loops work best)
- ✅ **Positive/adventurous tone** (encourages exploration)
- ✅ **15-30 seconds long** (plays on loop, so shorter is better)
- ✅ **Royalty-free and licensed for commercial/educational use**

## Current Behavior

If no `ambient-music.mp3` exists, the app falls back to a generated ambient pad:
- Frequency: 55 Hz (low A note)
- Style: Sine wave with slow LFO modulation (0.5 Hz)
- Volume: 15% of master volume
- Respects the Sound & Vibration toggle in settings

## Technical Details

- **Format**: MP3, WAV, or any browser-supported audio format
- **Sample Rate**: Any (resampled automatically)
- **Channels**: Mono or stereo
- **Volume**: Automatically mixed (respects master volume control)
- **Looping**: Set to infinite loop
