/**
 * Audio Permission Dialog - COPPA Compliant
 * Uses StandardModal for consistent design across the app
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
import { StandardModal } from "@/components/StandardModal";

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
  context = "profile-creation",
}: AudioPermissionDialogProps) {
  const [isOpen, setIsOpen] = useState(open);
  const progress = useProgress();

  // For profile-creation context: sync parent's 'open' prop to internal state
  // This allows parent to control when dialog shows
  useEffect(() => {
    if (!isHydrated()) {
      return;
    }

    if (context === "profile-creation") {
      // Parent controls visibility via 'open' prop
      // Sync parent prop to internal state
      setIsOpen(open);
      return;
    }
  }, [open, context, isHydrated()]);

  // Auto-show on first launch (first-load context) OR when explicitly forced
  useEffect(() => {
    // Don't show during hydration - wait until localStorage is ready
    if (!isHydrated()) {
      return;
    }

    // CRITICAL: Never auto-show in profile-creation context
    // Profile creation dialog should ONLY show when explicitly triggered by parent
    // via showAudioPermission state, not via auto-detection
    if (context === "profile-creation") {
      return;
    }

    // Check if we should show based on context and forceShow flag
    const hasSeenAudioPermission = localStorage.getItem(
      "india-explorer:audio-permission-shown:v1"
    ) === "1";

    // Only auto-show for first-load context if not seen before
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
    
    // Close dialog immediately so it stops rendering
    setIsOpen(false);
    
    // Call callback after dialog closes
    setTimeout(() => {
      onAccept?.();
    }, 100);
  };

  const handleReject = () => {
    debugLog("audio-permission", "User rejected audio", { context });
    
    // Close dialog immediately so it stops rendering
    setIsOpen(false);
    
    // Call callback after dialog closes
    setTimeout(() => {
      onReject?.();
    }, 100);
  };

  const isProfileCreation = context === "profile-creation";
  const headerText = isProfileCreation 
    ? "Let's add some fun to your adventure! 🎵" 
    : "Can we play sounds?";

  return (
    <StandardModal
      open={isOpen}
      onClose={handleReject}
      header={{
        icon: "🔊",
        title: headerText,
      }}
      headerGradient={["from-green-400", "to-emerald-500"]}
      content={[
        {
          type: "text",
          text: isProfileCreation
            ? "Your India Explorer adventure has fun sounds, music, and voice narration!"
            : "Your India Explorer adventure has fun sounds and music! 🎵",
        },
        {
          type: "bullet",
          emoji: "🎮",
          text: "Game sounds when you tap",
        },
        {
          type: "bullet",
          emoji: "🎵",
          text: "Calm background music",
        },
        {
          type: "bullet",
          emoji: "🎧",
          text: "Stories read to you",
        },
        {
          type: "custom",
          className: "text-xs text-muted-foreground text-center italic py-2",
          children: <p>Parents: You can turn sound on/off anytime in settings</p>,
        },
      ]}
      buttons={[
        {
          label: isProfileCreation ? "Not now 🔇" : "No thanks 🔇",
          onClick: handleReject,
          variant: "secondary",
        },
        {
          label: isProfileCreation ? "Yes, enable! 🔊" : "Yes please! 🔊",
          onClick: handleAccept,
          variant: "primary",
        },
      ]}
      footer="No microphone access. We only play sounds."
      maxWidth="max-w-md"
    />
  );
}
