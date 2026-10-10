/**
 * File Permission Dialog - COPPA Compliant
 * Uses StandardModal for consistent design across the app
 * 
 * On-demand permission request for saving postcards to device storage.
 * Only shown when user clicks "Save to Photos" button.
 * 
 * Enhanced Features:
 * - Kid-friendly language: "Save Picture" instead of technical permission names
 * - "Ask Later" button instead of forcing decision
 * - Tracks dismissal count: after 3+ denials, shows softer message
 * - Clear action: explains picture will be saved to photos folder
 * - Granular: only requests WRITE permission
 * - Reversible: user can deny and try again (no forced consent)
 * 
 * This is COPPA-compliant and transparent about data usage.
 */

import { useEffect, useState } from "react";
import { useProgress, isHydrated } from "@/lib/progress";
import { grantFeatureConsent } from "@/lib/parental-consent";
import { fxTap } from "@/lib/fx";
import { StandardModal } from "@/components/StandardModal";

export interface FilePermissionDialogProps {
  open?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

export function FilePermissionDialog({
  open = false,
  onAccept,
  onReject,
}: FilePermissionDialogProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [dismissalCount, setDismissalCount] = useState(0);

  useEffect(() => {
    if (open && isHydrated()) {
      // Load dismissal count from localStorage when dialog opens
      const count = parseInt(
        localStorage.getItem("india-explorer:file-permission-dismissals:v1") || "0",
        10
      );
      setDismissalCount(count);
    }
    setIsOpen(open);
  }, [open]);

  const handleAccept = () => {
    console.log("[FilePermissionDialog] User accepted - will save picture to photos");
    fxTap();
    grantFeatureConsent('file');
    // Reset dismissal count on accept
    localStorage.setItem("india-explorer:file-permission-dismissals:v1", "0");
    setIsOpen(false);
    onAccept?.();
  };

  const handleAskLater = () => {
    console.log("[FilePermissionDialog] User selected 'Ask Later'", { dismissalCount });
    fxTap();
    // Increment dismissal count
    const newCount = dismissalCount + 1;
    setDismissalCount(newCount);
    localStorage.setItem("india-explorer:file-permission-dismissals:v1", String(newCount));
    setIsOpen(false);
    onReject?.();
  };

  // ← CRITICAL: Don't render anything until hydration is complete to avoid SSR mismatch
  if (!isHydrated()) return null;
  if (!isOpen) return null;

  // Determine which message to show based on dismissal count
  const hasManyDismissals = dismissalCount >= 3;

  const contentItems = [
    {
      type: "text" as const,
      text: "Save your state stamps to your photos!",
    },
    !hasManyDismissals && {
      type: "badgeGrid" as const,
      badges: [
        { emoji: "🔍", label: "Quick Check" },
        { emoji: "📲", label: "One Tap" },
        { emoji: "✅", label: "Done!" },
      ],
    },
    !hasManyDismissals && {
      type: "custom" as const,
      className: "bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200",
      children: (
        <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
          <span className="text-lg">🔒</span>
          <span>Your photos stay private</span>
        </div>
      ),
    },
    !hasManyDismissals && {
      type: "text" as const,
      text: "We only save pictures YOU create. Your photos folder stays safe.",
      className: "text-xs text-muted-foreground",
    },
    hasManyDismissals && {
      type: "custom" as const,
      className: "bg-warning-soft rounded-2xl p-[--padding-md] border border-warning",
      children: (
        <div className="space-y-[--space-0-25]">
          <p className="text-sm font-semibold text-warning">
            💡 Need help? Ask a parent or guardian to enable photo saving in your phone's Settings.
          </p>
          <p className="text-xs text-amber-700">
            We don't require this feature to play. You can still enjoy all other parts of India Explorer!
          </p>
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <StandardModal
      open={isOpen}
      onClose={handleAskLater}
      header={{
        icon: "📸",
        title: "Capture Your Moment! 📸",
        floatingIcon: true,
        floatingIconGradient: ["from-amber-400", "to-orange-500"],
      }}
      buttonsLayout="stack"
      content={contentItems}
      buttons={[
        {
          label: "Maybe Later",
          onClick: handleAskLater,
          variant: "ghost",
        },
        {
          label: "Yes, Save My Stamp! 📸",
          onClick: handleAccept,
          variant: "primary",
          customClass: "w-full px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm shadow-lg transition active:scale-95",
        },
      ]}
      footer="Always enable later from Profile settings"
      maxWidth="max-w-md"
    />
  );
}

