/**
 * Audio Test Route - Developer Only
 * Minimal TTS test that bypasses all application logic
 */

import { createFileRoute } from "@tanstack/react-router";
import { AudioTestScreen } from "@/components/AudioTestScreen";

export const Route = createFileRoute("/audio-test")({
  component: AudioTestComponent,
});

function AudioTestComponent() {
  return <AudioTestScreen />;
}
