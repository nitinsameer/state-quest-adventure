/**
 * Native Android TextToSpeech Bridge via Capacitor
 * Calls Android's native TextToSpeech service directly
 */

import { registerPlugin } from "@capacitor/core";

export interface NativeTtsOptions {
  text: string;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface NativeTtsPlugin {
  speak(options: NativeTtsOptions): Promise<{ success: boolean }>;
  stop(): Promise<{ success: boolean }>;
  isAvailable(): Promise<{ available: boolean }>;
}

// Register the plugin
const NativeTts = registerPlugin<NativeTtsPlugin>("NativeTts", {
  web: {
    async speak() {
      return { success: false };
    },
    async stop() {
      return { success: false };
    },
    async isAvailable() {
      return { available: false };
    },
  },
});

export { NativeTts };
