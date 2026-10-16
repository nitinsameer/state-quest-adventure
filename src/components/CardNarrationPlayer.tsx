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
import {
  hasFeatureConsent,
  subscribeConsentChanges,
  grantFeatureConsent,
} from "@/lib/parental-consent";
import { KidsButton } from "./KidsButton";

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
  emoji = "🔊",
}: CardNarrationPlayerProps) {
  const [audioNarrationEnabled, setAudioNarrationEnabled] = useState(() => {
    const hasConsent = hasFeatureConsent("audio");
    return hasConsent;
  });
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const ttsState = useTtsState();
  const isCurrentPlaying = ttsState.narrationId === narrationId && ttsState.isPlaying;
  const [hasSupport] = useState(isTtsAvailable());

  // Subscribe to consent changes and re-render when consent status changes
  useEffect(() => {
    const currentConsent = hasFeatureConsent("audio");
    setAudioNarrationEnabled(currentConsent);

    const unsubscribe = subscribeConsentChanges("audio", () => {
      const consentAfterChange = hasFeatureConsent("audio");
      setAudioNarrationEnabled(consentAfterChange);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePlayClick = () => {
    if (!audioNarrationEnabled) {
      setShowPermissionPrompt(true);
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

  const handleEnableAudio = () => {
    grantFeatureConsent("audio");
    setAudioNarrationEnabled(true);
    setShowPermissionPrompt(false);

    // Auto-play the narration immediately after enabling
    playTts(narrationId, text, {
      speed: 0.85,
      pitch: 1.05,
    });
  };

  if (!hasSupport) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Permission Prompt Modal */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-(--padding-base)">
          <div className="bg-surface-card rounded-3xl p-(--padding-lg) max-w-sm shadow-2xl animate-in fade-in scale-in">
            <div className="text-center">
              <div className="text-5xl mb-(--space-2)">🎧</div>
              <h3 className="text-h4 font-bold mb-(--space-0-5)" style={{color: "var(--text-primary)"}}>
                Enable Audio?
              </h3>
              <p className="text-body-sm mb-(--space-2)" style={{color: "var(--text-primary)"}}>
                Would you like to enable audio to hear this story read aloud?
              </p>
              <div className="flex gap-(--gap-base)">
                <KidsButton
                  variant="secondary"
                  size="md"
                  onClick={() => setShowPermissionPrompt(false)}
                >
                  Not Now
                </KidsButton>
                <KidsButton
                  variant="primary"
                  size="md"
                  onClick={handleEnableAudio}
                >
                  Enable Audio
                </KidsButton>
              </div>
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
                : audioNarrationEnabled
                  ? "bg-action-primary-bg shadow-md hover:shadow-lg"
                  : "bg-action-primary-bg/50 shadow-md hover:shadow-lg"
            }`} style={{color: "var(--text-on-primary)"}}
            title={
              isCurrentPlaying
                ? "Stop narration"
                : audioNarrationEnabled
                  ? "Play narration"
                  : "Enable audio to play narration"
            }
          >
            {isCurrentPlaying ? "⏸️" : "▶️"}
          </button>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <div className="text-label font-bold text-action-primary-bg uppercase tracking-wide">
              🎧 Listen to Story
            </div>
            <div className="text-body-sm font-bold text-action-primary-bg mt-(--space-0-25)">
              {title}
            </div>
            {audioNarrationEnabled ? (
              <div className="text-caption text-action-primary-bg mt-(--space-0-25)">
                {isCurrentPlaying ? "🎵 Playing... tap to stop" : "Tap play to hear! 👂"}
              </div>
            ) : (
              <div className="text-caption text-action-primary-bg font-semibold mt-(--space-0-25)">
                📢 Tap to enable audio
              </div>
            )}
          </div>

          {/* Mute Indicator */}
          {!audioNarrationEnabled && (
            <div className="text-2xl animate-bounce flex-shrink-0">🔇</div>
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
