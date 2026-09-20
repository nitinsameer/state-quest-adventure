/**
 * Card Narration Player Component
 * Displays a play button and plays TTS narration
 * Kid-friendly UI with simple controls
 */

import { useEffect, useState } from "react";
import { playTts, stopTts, isTtsPlaying, getCurrentNarrationId, useTtsState, isTtsAvailable } from "@/lib/tts";
import { hasFeatureConsent, subscribeConsentChanges, grantFeatureConsent } from "@/lib/parental-consent";

export interface CardNarrationPlayerProps {
  narrationId: string;
  text: string;
  title: string;
  emoji?: string;
}

export function CardNarrationPlayer({ narrationId, text, title, emoji = "🔊" }: CardNarrationPlayerProps) {
  const [audioNarrationEnabled, setAudioNarrationEnabled] = useState(() => {
    const hasConsent = hasFeatureConsent('audio');
    console.log("[CardNarrationPlayer] Initial render - checking consent:", { hasConsent });
    return hasConsent;
  });
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const ttsState = useTtsState();
  const isCurrentPlaying = ttsState.narrationId === narrationId && ttsState.isPlaying;
  const [hasSupport] = useState(isTtsAvailable());

  // Subscribe to consent changes and re-render when consent status changes
  useEffect(() => {
    const currentConsent = hasFeatureConsent('audio');
    console.log("[CardNarrationPlayer] useEffect - checking consent:", { currentConsent });
    setAudioNarrationEnabled(currentConsent);
    
    const unsubscribe = subscribeConsentChanges('audio', () => {
      console.log("[CardNarrationPlayer] Consent changed via listener - updating state");
      setAudioNarrationEnabled(hasFeatureConsent('audio'));
    });

    return unsubscribe;
  }, []);

  const handlePlayClick = () => {
    console.log("[AUDIO DEBUG] Play button clicked", { narrationId, title, audioNarrationEnabled });
    
    if (!audioNarrationEnabled) {
      // Show permission prompt instead of disabling button
      setShowPermissionPrompt(true);
      return;
    }
    
    if (isCurrentPlaying) {
      console.log("[AUDIO DEBUG] ⏸ Stopping TTS", { narrationId });
      stopTts();
    } else {
      console.log("[AUDIO DEBUG] ▶️ Starting TTS playback", { 
        narrationId, 
        titleLength: title.length,
        textLength: text.length,
        audioNarrationEnabled,
        hasSupport,
        isCurrentPlaying,
      });
      console.log("[AUDIO DEBUG] Text:", text.substring(0, 100) + (text.length > 100 ? "..." : ""));
      playTts(narrationId, text, {
        speed: 0.85,
        pitch: 1.05,
      });
    }
  };

  const handleEnableAudio = () => {
    console.log("[AUDIO DEBUG] User enabling audio from TTS prompt");
    grantFeatureConsent('audio');
    setAudioNarrationEnabled(true);
    setShowPermissionPrompt(false);
    // Auto-play the narration immediately after enabling
    playTts(narrationId, text, {
      speed: 0.85,
      pitch: 1.05,
    });
  };

  if (!hasSupport) {
    console.warn("[CardNarrationPlayer] TTS not supported on this platform");
    return null;
  }

  return (
    <div className="w-full">
      {/* Permission Prompt Modal */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm shadow-2xl animate-in fade-in scale-in">
            <div className="text-center">
              <div className="text-5xl mb-4">🎧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enable Audio?</h3>
              <p className="text-sm text-gray-700 mb-6">
                Would you like to enable audio to hear this story read aloud?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPermissionPrompt(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-gray-900 font-bold transition active:scale-95"
                >
                  Not Now
                </button>
                <button
                  onClick={handleEnableAudio}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold transition active:scale-95"
                >
                  Enable Audio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Narration Player Card */}
      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
        <div className="flex items-center gap-2">
          {/* Play Button */}
          <button
            onClick={handlePlayClick}
            className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl transition-transform active:scale-95 flex-shrink-0 ${
              isCurrentPlaying
                ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg animate-pulse"
                : audioNarrationEnabled
                  ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-md hover:shadow-lg"
                  : "bg-blue-300 text-white shadow-md hover:shadow-lg"
            }`}
            title={isCurrentPlaying ? "Stop narration" : audioNarrationEnabled ? "Play narration" : "Enable audio to play narration"}
          >
            {isCurrentPlaying ? "⏸️" : "▶️"}
          </button>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
              🎧 Listen to Story
            </div>
            <div className="text-sm font-bold text-blue-900 mt-0.5">{title}</div>
            {audioNarrationEnabled ? (
              <div className="text-xs text-blue-700 mt-1">
                {isCurrentPlaying ? "🎵 Playing... tap to stop" : "Tap play to hear! 👂"}
              </div>
            ) : (
              <div className="text-xs text-blue-600 font-semibold mt-1">📢 Tap to enable audio</div>
            )}
          </div>

          {/* Mute Indicator */}
          {!audioNarrationEnabled && (
            <div className="text-2xl animate-bounce flex-shrink-0">🔇</div>
          )}
        </div>

        {/* Progress Bar (simplified) */}
        {isCurrentPlaying && (
          <div className="mt-3 w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full animate-pulse" style={{ width: "60%" }} />
          </div>
        )}
      </div>
    </div>
  );
}
