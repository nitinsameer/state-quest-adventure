/**
 * Generate a simple ambient music loop (10 seconds)
 * Creates a loopable background music file for the app
 * Uses Web Audio API to generate, then exports to WAV
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "../public/ambient-music.wav");

// WAV file generation helper
function generateWAV() {
  const sampleRate = 44100;
  const duration = 10; // 10 seconds loop
  const samples = sampleRate * duration;

  // Create offline audio context to generate the music
  const OfflineAudioContext =
    typeof OfflineAudioContext !== "undefined"
      ? OfflineAudioContext
      : typeof webkitOfflineAudioContext !== "undefined"
      ? webkitOfflineAudioContext
      : null;

  if (!OfflineAudioContext) {
    console.error(
      "OfflineAudioContext not available - skipping ambient music generation"
    );
    console.log(
      "Note: You can manually add ambient-music.mp3 to public/ folder"
    );
    return null;
  }

  const offlineCtx = new OfflineAudioContext(1, samples, sampleRate);

  // Create two layers: low drone + soft chord progression
  // Layer 1: Low ambient pad (A2 note = 110 Hz)
  const pad = offlineCtx.createOscillator();
  pad.type = "sine";
  pad.frequency.setValueAtTime(55, 0);

  const padGain = offlineCtx.createGain();
  padGain.gain.setValueAtTime(0.05, 0);

  // Layer 2: Chord progression (C major chord - soft)
  const chord1 = offlineCtx.createOscillator();
  chord1.type = "sine";
  chord1.frequency.setValueAtTime(261.63, 0); // C4

  const chord2 = offlineCtx.createOscillator();
  chord2.type = "sine";
  chord2.frequency.setValueAtTime(329.63, 0); // E4

  const chord3 = offlineCtx.createOscillator();
  chord3.type = "sine";
  chord3.frequency.setValueAtTime(392.0, 0); // G4

  const chordGain = offlineCtx.createGain();
  chordGain.gain.setValueAtTime(0.02, 0);

  // Add subtle LFO modulation to pad for warmth
  const lfo = offlineCtx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(0.5, 0);

  const lfoGain = offlineCtx.createGain();
  lfoGain.gain.setValueAtTime(0.005, 0);

  // Connect signal chain
  pad.connect(padGain);
  chord1.connect(chordGain);
  chord2.connect(chordGain);
  chord3.connect(chordGain);

  lfo.connect(pad.frequency);

  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.08, 0);

  padGain.connect(masterGain);
  chordGain.connect(masterGain);

  masterGain.connect(offlineCtx.destination);

  // Start nodes
  pad.start(0);
  chord1.start(0);
  chord2.start(0);
  chord3.start(0);
  lfo.start(0);

  // Stop nodes at end
  pad.stop(duration);
  chord1.stop(duration);
  chord2.stop(duration);
  chord3.stop(duration);
  lfo.stop(duration);

  // Render the audio
  return offlineCtx.startRendering();
}

// Convert AudioBuffer to WAV ArrayBuffer
function audioBufferToWAV(audioBuffer) {
  const raw = offlineCtx.createBuffer(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const rawData = raw.getChannelData(0);
  for (let i = 0; i < audioBuffer.length; i++) {
    rawData[i] = audioBuffer.getChannelData(0)[i];
  }

  const wav = encodeWAV(raw);
  return new Blob([wav], { type: "audio/wav" });
}

function encodeWAV(audioBuffer) {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  const channelData = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i));
  }

  const interleaved = new Float32Array(
    audioBuffer.length * numberOfChannels
  );
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      interleaved[i * numberOfChannels + channel] = channelData[channel][i];
    }
  }

  const dataLength = interleaved.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const s = Math.max(-1, Math.min(1, interleaved[i]));
    view.setInt16(
      offset,
      s < 0 ? s * 0x8000 : s * 0x7fff,
      true
    );
    offset += 2;
  }

  return buffer;
}

console.log("Note: Ambient music generation via Node.js requires additional setup.");
console.log("Please manually add an ambient-music.mp3 or .wav file to public/ folder:");
console.log("");
console.log("Recommended: Download from Pixabay");
console.log("  - URL: https://pixabay.com/music/");
console.log("  - Search: 'ambient children' or 'calm background'");
console.log("  - Name it: ambient-music.mp3");
console.log("  - Place in: public/ folder");
