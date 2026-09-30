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
  const title = hasManyDismissals
    ? "Save Your Stamp?"
    : "Save Picture to Your Photos?";
  const subtitle = hasManyDismissals
    ? "Your phone needs permission to save to the Photos app. You can enable it anytime in Settings."
    : "Your stamp will be saved to your phone's photos folder so you can share it anytime.";

  return (
    <StandardModal
      open={isOpen}
      onClose={handleAskLater}
      header={{
        icon: "📸",
        title,
        subtitle,
      }}
      headerGradient={["from-blue-400", "to-cyan-500"]}
      content={[
        !hasManyDismissals && {
          type: "custom",
          className: "space-y-3 bg-blue-50 rounded-2xl p-[--padding-md] border border-blue-200",
          children: (
            <div className="space-y-[--gap-base]">
              <div className="flex items-start gap-[--gap-base]">
                <div className="text-lg flex-shrink-0">1️⃣</div>
                <div>
                  <div className="font-bold text-sm text-ink">We ask permission</div>
                  <div className="text-xs text-muted-foreground">Your phone will ask if it's OK</div>
                </div>
              </div>
              <div className="flex items-start gap-[--gap-base]">
                <div className="text-lg flex-shrink-0">2️⃣</div>
                <div>
                  <div className="font-bold text-sm text-ink">Picture gets saved</div>
                  <div className="text-xs text-muted-foreground">Goes to your Photos app</div>
                </div>
              </div>
              <div className="flex items-start gap-[--gap-base]">
                <div className="text-lg flex-shrink-0">3️⃣</div>
                <div>
                  <div className="font-bold text-sm text-ink">You can share it</div>
                  <div className="text-xs text-muted-foreground">Text or email to friends & family</div>
                </div>
              </div>
            </div>
          ),
        },
        hasManyDismissals && {
          type: "custom",
          className: "bg-amber-50 rounded-2xl p-[--padding-md] border border-amber-200",
          children: (
            <div className="space-y-[--space-0-25]">
              <p className="text-sm font-semibold text-amber-900">
                💡 Need help? Ask a parent or guardian to enable photo saving in your phone's Settings.
              </p>
              <p className="text-xs text-amber-700">
                We don't require this feature to play. You can still enjoy all other parts of India Explorer!
              </p>
            </div>
          ),
        },
      ].filter(Boolean)}
      buttons={[
        {
          label: hasManyDismissals ? "Maybe Later" : "Ask Later",
          onClick: handleAskLater,
          variant: "secondary",
        },
        {
          label: "Yes, Allow 📸",
          onClick: handleAccept,
          variant: "primary",
        },
      ]}
      footer="🔒 We only save pictures YOU make. We never share them."
      maxWidth="max-w-md"
    />
  );
}
