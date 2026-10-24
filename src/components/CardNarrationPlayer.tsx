/**
 * Card Narration Player Component
 * Displays a play button and plays TTS narration
 * Kid-friendly UI with simple controls
 * Audio works without permission checks
 */

import { useState } from "react";
import { playTts, stopTts, isTtsAvailable, useTtsState } from "@/lib/tts";
import { hasAudioEnabled } from "@/lib/parental-consent";
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
  const [audioDisabled, setAudioDisabled] = useState(false);
  const ttsState = useTtsState();
  const isCurrentPlaying = ttsState.narrationId === narrationId && ttsState.isPlaying;
  const [hasSupport] = useState(isTtsAvailable());
  const audioEnabled = hasAudioEnabled();

  const handlePlayClick = () => {
    if (!audioEnabled) {
      setAudioDisabled(true);
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
      {/* Audio Disabled Notice */}
      {audioDisabled && audioEnabled === false && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-(--padding-base)"
          style={{ backgroundColor: "var(--scrim)" }}
        >
          <div className="bg-surface-card rounded-3xl p-(--padding-lg) max-w-sm shadow-2xl animate-in fade-in scale-in">
            <div className="text-center">
              <div className="text-5xl mb-(--space-2)">{EMOJI.audio.muted}</div>
              <h3
                className="text-h4 font-bold mb-(--space-0-5)"
                style={{ color: "var(--text-primary)" }}
              >
                Audio is Off
              </h3>
              <p className="text-body-sm mb-(--space-2)" style={{ color: "var(--text-primary)" }}>
                Turn on audio in Profile settings to hear this story read aloud.
              </p>
              <KidsButton variant="primary" size="md" onClick={() => setAudioDisabled(false)}>
                Got It
              </KidsButton>
            </div>
          </div>
        </div>
      )}

      {/* Narration Player Card */}
      <div className="mt-(--space-0-5) p-(--padding-base) bg-fb-info-bg rounded-2xl border-2 border-fb-info-border">
        <div className="flex items-center gap-(--gap-base)">
          {/* Play Button */}
          <button
            onClick={handlePlayClick}
            className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl transition-transform active:scale-95 flex-shrink-0 ${
              isCurrentPlaying
                ? "bg-fb-warning-bg shadow-lg animate-pulse"
                : audioEnabled
                  ? "bg-action-primary-bg shadow-md hover:shadow-lg"
                  : "bg-action-primary-bg/50 shadow-md hover:shadow-lg"
            }`}
            style={{ color: "var(--text-on-primary)" }}
            title={
              isCurrentPlaying
                ? "Stop narration"
                : audioEnabled
                  ? "Play narration"
                  : "Audio is disabled"
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
            {audioEnabled ? (
              <div className="text-caption text-action-primary-bg mt-(--space-0-25)">
                {isCurrentPlaying
                  ? `${EMOJI.audio.music} Playing... tap to stop`
                  : `Tap play to hear! ${EMOJI.action.listen}`}
              </div>
            ) : (
              <div className="text-caption text-action-primary-bg font-semibold mt-(--space-0-25)">
                {EMOJI.audio.speaker} Audio is off
              </div>
            )}
          </div>

          {/* Mute Indicator */}
          {!audioEnabled && (
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
