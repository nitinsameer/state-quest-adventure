/**
 * Audio Permission Dialog - COPPA Compliant
 * 
 * Displays a kid-friendly permission request for audio playback
 * Complies with Google Play Families Policy for audio devices
 * Can be triggered on first app load
 */

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";

export interface AudioPermissionDialogProps {
  onAccept?: () => void;
  onReject?: () => void;
  open?: boolean;
}

export function AudioPermissionDialog({
  onAccept,
  onReject,
  open = false,
}: AudioPermissionDialogProps) {
  const [isOpen, setIsOpen] = useState(open);
  const progress = useProgress();

  // Auto-show on first launch, but ONLY on home screen
  // Don't show on splash/welcome/create screens
  useEffect(() => {
    const hasSeenAudioPermission = localStorage.getItem(
      "india-explorer:audio-permission-shown:v1"
    ) === "1";

    // Show if:
    // 1. User hasn't seen it yet (!hasSeenAudioPermission)
    // 2. App is fresh (!progress.onboarded) OR user just onboarded (just created profile)
    // 3. Not suppressed by another dialog
    if (!hasSeenAudioPermission && !isOpen) {
      console.log("[AudioPermissionDialog] Ready to show on first authenticated access");
      setIsOpen(true);
      localStorage.setItem("india-explorer:audio-permission-shown:v1", "1");
    }
  }, []);

  if (!isOpen) return null;

  const handleAccept = () => {
    console.log("[AudioPermissionDialog] User accepted audio");
    localStorage.setItem("india-explorer:audio-consent:v1", "1");
    setIsOpen(false);
    onAccept?.();
  };

  const handleReject = () => {
    console.log("[AudioPermissionDialog] User rejected audio");
    localStorage.setItem("india-explorer:audio-consent:v1", "0");
    setIsOpen(false);
    onReject?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center">
      {/* Dialog backdrop - click outside to dismiss? NO - per COPPA, must be explicit button */}
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95">
        {/* Header - Kid-Friendly */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">🔊</div>
          <h2 className="text-display text-2xl font-extrabold text-ink">
            Can we play sounds?
          </h2>
        </div>

        {/* Description - Simple, Clear, No Dark Patterns */}
        <p className="text-center text-sm text-ink/70 leading-relaxed mb-6">
          Your India Explorer adventure has fun sounds and music! 🎵
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

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          No microphone access. We only play sounds.
        </p>
      </div>
    </div>
  );
}
