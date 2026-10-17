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
import { EMOJI } from "@/constants/emoji";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { StandardModal } from "@/components/StandardModal";

export interface AudioPermissionDialogProps {
  onAccept?: () => void;
  onReject?: () => void;
  open?: boolean;
  forceShow?: boolean; // Force show regardless of previous state
  context?: "profile-creation" | "profile-settings" | "first-load"; // Where dialog is shown from
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
  // For profile-settings context: also sync parent's 'open' prop
  // This allows parent to control when dialog shows
  useEffect(() => {
    if (!isHydrated()) {
      return;
    }

    // For both profile-creation AND profile-settings contexts,
    // sync the parent's open prop to internal state
    if (context === "profile-creation" || context === "profile-settings") {
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

    // CRITICAL: Never auto-show in profile-creation or profile-settings context
    // These contexts should ONLY show when explicitly triggered by parent
    // via showAudioPermission state, not via auto-detection
    if (context === "profile-creation" || context === "profile-settings") {
      return;
    }

    // Check if we should show based on context and forceShow flag
    const hasSeenAudioPermission =
      localStorage.getItem(STORAGE_KEYS.audioPermissionShown) === "1";

    // Only auto-show for first-load context if not seen before
    const shouldShow = forceShow || (!hasSeenAudioPermission && context === "first-load");

    if (shouldShow && !isOpen) {
      debugLog("audio-permission", "Ready to show", { context, forceShow });
      setIsOpen(true);

      // Mark as seen (unless in profile contexts with forceShow)
      if (context === "first-load" || !forceShow) {
        localStorage.setItem(STORAGE_KEYS.audioPermissionShown, "1");
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
    ? "Your adventure just got better! 🎵"
    : "Can we play sounds?";

  return (
    <StandardModal
      open={isOpen}
      onClose={handleReject}
      header={{
        icon: EMOJI.audio.music,
        title: headerText,
        floatingIcon: true,
      }}
      buttonsLayout="stack"
      content={[
        {
          type: "text",
          text: isProfileCreation
            ? "Make your adventure come alive with sound!"
            : "Bring your India Explorer adventure to life! 🎵",
        },
        {
          type: "badgeGrid",
          badges: [
            { emoji: EMOJI.audio.sounds, label: "Tap Sounds" },
            { emoji: EMOJI.audio.music, label: "Music" },
            { emoji: EMOJI.audio.stories, label: "Stories" },
          ],
        },
      ]}
      buttons={[
        {
          label: "No, explore quietly 🔇",
          onClick: handleReject,
          variant: "ghost",
        },
        {
          label: "Yes, turn on sounds! 🔊",
          onClick: handleAccept,
          variant: "primary",
          customClass:
            "w-full px-4 py-3 rounded-full bg-success text-on-header font-bold text-sm shadow-lg transition active:scale-95",
        },
      ]}
      footer="You can change this anytime in Profile settings"
      maxWidth="max-w-md"
    />
  );
}
