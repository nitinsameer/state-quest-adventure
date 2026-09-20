/**
 * Audio Permission Dialog - COPPA Compliant
 * 
 * Displays a kid-friendly permission request for audio playback
 * Complies with Google Play Families Policy for audio devices
 * Can be triggered at profile creation OR on first app load
 * 
 * Default: Audio is ENABLED (opt-out model)
 * User can disable in profile settings anytime
 */

import { useEffect, useState } from "react";
import { useProgress, isHydrated } from "@/lib/progress";
import { hasFeatureConsent, grantFeatureConsent } from "@/lib/parental-consent";
import { debugLog } from "@/lib/debug";
import { fxTap } from "@/lib/fx";

export interface AudioPermissionDialogProps {
  onAccept?: () => void;
  onReject?: () => void;
  open?: boolean;
  forceShow?: boolean; // Force show regardless of previous state
  context?: "profile-creation" | "first-load"; // Where dialog is shown from
}

export function AudioPermissionDialog({
  onAccept,
  onReject,
  open = false,
  forceShow = false,
  context = "first-load",
}: AudioPermissionDialogProps) {
  const [isOpen, setIsOpen] = useState(open);
  const progress = useProgress();

  // Auto-show on first launch (first-load context) OR when explicitly forced (profile-creation)
  useEffect(() => {
    // Don't show during hydration - wait until localStorage is ready
    if (!isHydrated()) {
      return;
    }

    // Check if we should show based on context and forceShow flag
    const hasSeenAudioPermission = localStorage.getItem(
      "india-explorer:audio-permission-shown:v1"
    ) === "1";

    const shouldShow = forceShow || (!hasSeenAudioPermission && context === "first-load");

    if (shouldShow && !isOpen) {
      debugLog("audio-permission", "Ready to show", { context, forceShow });
      setIsOpen(true);
      
      // Mark as seen (unless in profile-creation context with forceShow)
      if (context === "first-load" || !forceShow) {
        localStorage.setItem("india-explorer:audio-permission-shown:v1", "1");
      }
    }
  }, [isHydrated(), isOpen, forceShow, context]);

  // ← CRITICAL: Don't render anything until hydration is complete to avoid SSR mismatch
  if (!isHydrated()) return null;
  if (!isOpen) return null;

  const handleAccept = () => {
    debugLog("audio-permission", "User accepted audio", { context });
    fxTap();
    grantFeatureConsent("audio");
    setIsOpen(false);
    onAccept?.();
  };

  const handleReject = () => {
    debugLog("audio-permission", "User rejected audio", { context });
    setIsOpen(false);
    onReject?.();
  };

  const isProfileCreation = context === "profile-creation";
  const headerText = isProfileCreation 
    ? "Let's add some fun to your adventure! 🎵" 
    : "Can we play sounds?";
  const descriptionText = isProfileCreation
    ? "Your India Explorer adventure has fun sounds, music, and voice narration!"
    : "Your India Explorer adventure has fun sounds and music! 🎵";

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center">
      {/* Dialog backdrop - click outside to dismiss? NO - per COPPA, must be explicit button */}
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95">
        {/* Header - Kid-Friendly */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">🔊</div>
          <h2 className="text-display text-2xl font-extrabold text-ink">
            {headerText}
          </h2>
        </div>

        {/* Description - Simple, Clear, No Dark Patterns */}
        <p className="text-center text-sm text-ink/70 leading-relaxed mb-6">
          {descriptionText}
        </p>

        {/* Benefits list - Kid appropriate */}
        <div className="space-y-2 mb-6 px-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">🎮</span>
            <span className="font-semibold">Game sounds when you tap</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">🎵</span>
            <span className="font-semibold">Calm background music</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xl">🎧</span>
            <span className="font-semibold">Stories read to you</span>
          </div>
        </div>

        {/* Parental note */}
        <p className="text-xs text-muted-foreground text-center mb-6 italic">
          Parents: You can turn sound on/off anytime in settings
        </p>

        {/* Buttons - Clear actions, no manipulation */}
        {isProfileCreation ? (
          // Profile creation: Default YES (on), can say No
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="flex-1 h-12 rounded-2xl bg-gray-200 text-ink font-extrabold text-lg hover:bg-gray-300 transition-colors"
            >
              Not now 🔇
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-extrabold text-lg shadow-md hover:shadow-lg transition-all"
            >
              Yes, enable! 🔊
            </button>
          </div>
        ) : (
          // First load: Equal options
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="flex-1 h-12 rounded-2xl bg-gray-200 text-ink font-extrabold text-lg hover:bg-gray-300 transition-colors"
            >
              No thanks 🔇
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-extrabold text-lg shadow-md hover:shadow-lg transition-all"
            >
              Yes please! 🔊
            </button>
          </div>
        )}

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          No microphone access. We only play sounds.
        </p>
      </div>
    </div>
  );
}
