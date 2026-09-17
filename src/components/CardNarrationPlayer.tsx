/**
 * Card Narration Player Component
 * Displays a play button and plays TTS narration
 * Kid-friendly UI with simple controls
 */

import { useEffect, useState } from "react";
import { playTts, stopTts, isTtsPlaying, getCurrentNarrationId, useTtsState, isTtsAvailable } from "@/lib/tts";
import { hasFeatureConsent } from "@/lib/parental-consent";

export interface CardNarrationPlayerProps {
  narrationId: string;
  text: string;
  title: string;
  emoji?: string;
}

export function CardNarrationPlayer({ narrationId, text, title, emoji = "🔊" }: CardNarrationPlayerProps) {
  const audioNarrationEnabled = hasFeatureConsent('audio');
  const ttsState = useTtsState();
  const isCurrentPlaying = ttsState.narrationId === narrationId && ttsState.isPlaying;
  const [hasSupport] = useState(isTtsAvailable());

  const handlePlayClick = () => {
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
      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
        <div className="flex items-center gap-2">
          {/* Play Button */}
          <button
            onClick={handlePlayClick}
            disabled={!audioNarrationEnabled}
            className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl transition-transform active:scale-95 flex-shrink-0 ${
              isCurrentPlaying
                ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg animate-pulse"
                : audioNarrationEnabled
                  ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={isCurrentPlaying ? "Stop narration" : "Play narration"}
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
              <div className="text-xs text-red-600 font-semibold mt-1">🔇 Audio narration is disabled</div>
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
