/**
 * Card Narration Player Component
 * Displays a play button and plays TTS narration
 * Kid-friendly UI with simple controls
 */

import { useEffect, useState } from "react";
import {
  playTts,
  stopTts,
  isTtsPlaying,
  getCurrentNarrationId,
  useTtsState,
  isTtsAvailable,
} from "@/lib/tts";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { KidsButton } from "./KidsButton";
import { EMOJI } from "@/constants/emoji";

export interface CardNarrationPlayerProps {
  narrationId: string;
  text: string;
  title: string;
  emoji?: string;
}

export function CardNarrationPlayer({
  narrationId,
  text,
  title,
  emoji = EMOJI.audio.speaker,
}: CardNarrationPlayerProps) {
  const [audioNarrationEnabled, setAudioNarrationEnabled] = useState(() => {
    const soundEnabled = localStorage.getItem(STORAGE_KEYS.sound) === "1";
    return soundEnabled;
  });
  const ttsState = useTtsState();
  const isCurrentPlaying = ttsState.narrationId === narrationId && ttsState.isPlaying;
  const [hasSupport] = useState(isTtsAvailable());

  // Subscribe to storage changes to re-render when sound setting changes
  useEffect(() => {
    const soundEnabled = localStorage.getItem(STORAGE_KEYS.sound) === "1";
    setAudioNarrationEnabled(soundEnabled);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.sound) {
        setAudioNarrationEnabled(e.newValue === "1");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handlePlayClick = () => {
    if (!audioNarrationEnabled) {
      // Audio disabled by user via Profile settings
      return;
    }

    if (isCurrentPlaying) {
      stopTts();
    } else {
      playTts(narrationId, text, {
        speed: 0.85,
        pitch: 1.05,
      });
    }
  };

  if (!hasSupport) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Narration Player Card */}
      <div className="mt-(--space-0-5) p-(--padding-base) bg-fb-info-bg rounded-2xl border-2 border-fb-info-border">
        <div className="flex items-center gap-(--gap-base)">
          {/* Play Button */}
          <button
            onClick={handlePlayClick}
            className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl transition-transform active:scale-95 flex-shrink-0 ${
              isCurrentPlaying
                ? "bg-fb-warning-bg shadow-lg animate-pulse"
                : audioNarrationEnabled
                  ? "bg-action-primary-bg shadow-md hover:shadow-lg"
                  : "bg-action-primary-bg/50 shadow-md hover:shadow-lg"
            }`}
            style={{ color: "var(--text-on-primary)" }}
            title={
              isCurrentPlaying
                ? "Stop narration"
                : audioNarrationEnabled
                  ? "Play narration"
                  : "Enable audio to play narration"
            }
          >
            {isCurrentPlaying ? EMOJI.ui.pause : EMOJI.action.play}
          </button>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <div className="text-label font-bold text-action-primary-bg uppercase tracking-wide">
              {EMOJI.audio.headphones} Listen to Story
            </div>
            <div className="text-body-sm font-bold text-action-primary-bg mt-(--space-0-25)">
              {title}
            </div>
            {audioNarrationEnabled ? (
              <div className="text-caption text-action-primary-bg mt-(--space-0-25)">
                {isCurrentPlaying ? `${EMOJI.audio.music} Playing... tap to stop` : `Tap play to hear! ${EMOJI.action.listen}`}
              </div>
            ) : (
              <div className="text-caption text-action-primary-bg font-semibold mt-(--space-0-25)">
                {EMOJI.audio.speaker} Enable in Profile settings
              </div>
            )}
          </div>

          {/* Mute Indicator */}
          {!audioNarrationEnabled && (
            <div className="text-2xl animate-bounce flex-shrink-0">{EMOJI.audio.muted}</div>
          )}
        </div>

        {/* Progress Bar (simplified) */}
        {isCurrentPlaying && (
          <div className="mt-(--space-0-5) w-full bg-fb-info-bg/50 h-1.5 rounded-full overflow-hidden">
            <div className="bg-action-primary-bg h-full animate-pulse" style={{ width: "60%" }} />
          </div>
        )}
      </div>
    </div>
  );
}
