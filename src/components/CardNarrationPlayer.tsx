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
    console.log("[CardNarrationPlayer] ===== INITIAL RENDER =====");
    console.log("[CardNarrationPlayer] Checking audio consent:", { hasConsent });
    console.log("[CardNarrationPlayer] narrationId:", narrationId);
    console.log("[CardNarrationPlayer] text length:", text.length);
    console.log("[CardNarrationPlayer] title:", title);
    return hasConsent;
  });
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const ttsState = useTtsState();
  const isCurrentPlaying = ttsState.narrationId === narrationId && ttsState.isPlaying;
  const [hasSupport] = useState(isTtsAvailable());

  console.log("[CardNarrationPlayer] STATE UPDATE:", {
    audioNarrationEnabled,
    showPermissionPrompt,
    isCurrentPlaying,
    hasSupport,
    narrationId,
  });

  // Subscribe to consent changes and re-render when consent status changes
  useEffect(() => {
    console.log("[CardNarrationPlayer] ===== useEffect MOUNTED =====");
    const currentConsent = hasFeatureConsent("audio");
    console.log("[CardNarrationPlayer] useEffect - current consent:", { currentConsent });
    setAudioNarrationEnabled(currentConsent);

    const unsubscribe = subscribeConsentChanges("audio", () => {
      const consentAfterChange = hasFeatureConsent("audio");
      console.log("[CardNarrationPlayer] ⚡ Consent changed via listener - NEW VALUE:", {
        consentAfterChange,
      });
      setAudioNarrationEnabled(consentAfterChange);
    });

    return () => {
      console.log("[CardNarrationPlayer] useEffect UNMOUNTED - unsubscribing");
      unsubscribe();
    };
  }, []);

  const handlePlayClick = () => {
    console.log("\n[CardNarrationPlayer] ===== PLAY BUTTON CLICKED =====");
    console.log("[CardNarrationPlayer] narrationId:", narrationId);
    console.log("[CardNarrationPlayer] title:", title);
    console.log("[CardNarrationPlayer] audioNarrationEnabled:", audioNarrationEnabled);
    console.log("[CardNarrationPlayer] isCurrentPlaying:", isCurrentPlaying);
    console.log("[CardNarrationPlayer] hasSupport:", hasSupport);
    console.log("[CardNarrationPlayer] showPermissionPrompt:", showPermissionPrompt);

    if (!audioNarrationEnabled) {
      console.log(
        "[CardNarrationPlayer] ❌ BLOCKED: Audio narration not enabled - showing permission prompt",
      );
      setShowPermissionPrompt(true);
      return;
    }

    if (isCurrentPlaying) {
      console.log("[CardNarrationPlayer] ⏸ STOPPING TTS", { narrationId });
      stopTts();
    } else {
      console.log("[CardNarrationPlayer] ▶️ STARTING TTS PLAYBACK");
      console.log(
        "[CardNarrationPlayer] Text preview:",
        text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      );
      playTts(narrationId, text, {
        speed: 0.85,
        pitch: 1.05,
      });
    }
  };

  const handleEnableAudio = () => {
    console.log("\n[CardNarrationPlayer] ===== ENABLE AUDIO BUTTON CLICKED =====");
    console.log("[CardNarrationPlayer] About to grantFeatureConsent('audio')");
    grantFeatureConsent("audio");
    console.log("[CardNarrationPlayer] ✅ Feature consent granted");

    const consentAfterGrant = hasFeatureConsent("audio");
    console.log("[CardNarrationPlayer] Verifying consent after grant:", { consentAfterGrant });

    setAudioNarrationEnabled(true);
    console.log("[CardNarrationPlayer] State updated - audioNarrationEnabled set to true");

    setShowPermissionPrompt(false);
    console.log("[CardNarrationPlayer] Permission prompt closed");

    // Auto-play the narration immediately after enabling
    console.log("[CardNarrationPlayer] Auto-playing narration");
    playTts(narrationId, text, {
      speed: 0.85,
      pitch: 1.05,
    });
    console.log("[CardNarrationPlayer] playTts() called");
  };

  if (!hasSupport) {
    console.warn("[CardNarrationPlayer] TTS not supported on this platform");
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
              <h3 className="text-xl font-bold text-text-primary mb-(--space-0-5)">
                Enable Audio?
              </h3>
              <p className="text-sm text-text-muted mb-(--space-2)">
                Would you like to enable audio to hear this story read aloud?
              </p>
              <div className="flex gap-(--gap-base)">
                <button
                  onClick={() => setShowPermissionPrompt(false)}
                  className="flex-1 px-(--padding-md) py-(--padding-base) rounded-xl bg-surface-muted text-text-muted font-bold transition active:scale-95"
                >
                  Not Now
                </button>
                <button
                  onClick={handleEnableAudio}
                  className="flex-1 px-(--padding-md) py-(--padding-base) rounded-xl bg-action-primary-bg text-text-on-primary font-bold transition active:scale-95"
                >
                  Enable Audio
                </button>
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
                ? "bg-fb-warning-bg text-text-on-primary shadow-lg animate-pulse"
                : audioNarrationEnabled
                  ? "bg-action-primary-bg text-text-on-primary shadow-md hover:shadow-lg"
                  : "bg-action-primary-bg/50 text-text-on-primary shadow-md hover:shadow-lg"
            }`}
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
            <div className="text-xs font-bold text-action-primary-bg uppercase tracking-wide">
              🎧 Listen to Story
            </div>
            <div className="text-sm font-bold text-action-primary-bg mt-(--space-0-25)">
              {title}
            </div>
            {audioNarrationEnabled ? (
              <div className="text-xs text-action-primary-bg mt-(--space-0-25)">
                {isCurrentPlaying ? "🎵 Playing... tap to stop" : "Tap play to hear! 👂"}
              </div>
            ) : (
              <div className="text-xs text-action-primary-bg font-semibold mt-1">
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
