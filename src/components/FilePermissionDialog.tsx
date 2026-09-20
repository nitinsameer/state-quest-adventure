/**
 * FilePermissionDialog - Proposal B Implementation
 * 
 * COPPA-compliant permission request for saving postcards to device storage.
 * 
 * Key Changes (Proposal B):
 * - Only shown when user clicks "Save to Photos" (not upfront)
 * - Kid-friendly language: "Save Picture" instead of "READ/WRITE_EXTERNAL_STORAGE"
 * - Clear action: explains picture will be saved to photos folder
 * - Granular: only requests WRITE permission (not READ)
 * - Reversible: user can deny and try again (no forced consent)
 * 
 * This replaces the old proactive permission request with on-demand, clear consent.
 */

import { useEffect, useState } from "react";
import { useProgress, isHydrated } from "@/lib/progress";

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

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleAccept = () => {
    console.log("[FilePermissionDialog] User accepted - will save picture to photos");
    localStorage.setItem("india-explorer:file-permission-consent:v1", "1");
    setIsOpen(false);
    onAccept?.();
  };

  const handleReject = () => {
    console.log("[FilePermissionDialog] User rejected - picture not saved");
    // Note: We do NOT set consent to "0" - user can try again anytime
    setIsOpen(false);
    onReject?.();
  };

  // ← CRITICAL: Don't render anything until hydration is complete to avoid SSR mismatch
  if (!isHydrated()) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scale-in">
        {/* Header - Kid-friendly and clear */}
        <div className="text-center">
          <div className="text-5xl mb-3">📸</div>
          <h2 className="text-2xl font-extrabold text-ink">Save Picture to Your Photos?</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Your postcard will be saved to your phone's photos folder so you can share it anytime.
          </p>
        </div>

        {/* What Happens - Clear explanation */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-lg flex-shrink-0">1️⃣</div>
              <div>
                <div className="font-bold text-sm text-ink">We ask permission</div>
                <div className="text-xs text-muted-foreground">Your phone will ask if it's OK</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-lg flex-shrink-0">2️⃣</div>
              <div>
                <div className="font-bold text-sm text-ink">Picture gets saved</div>
                <div className="text-xs text-muted-foreground">Goes to your Photos app</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-lg flex-shrink-0">3️⃣</div>
              <div>
                <div className="font-bold text-sm text-ink">You can share it</div>
                <div className="text-xs text-muted-foreground">Text or email to friends & family</div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Note - COPPA transparent */}
        <div className="text-xs text-muted-foreground text-center bg-amber-50 rounded-xl p-3 border border-amber-200">
          🔒 We only save pictures YOU make. We never share them. You can change your mind anytime.
        </div>

        {/* Buttons - Clear CTAs */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm transition active:scale-95"
          >
            Not Now
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-3 rounded-xl bg-success text-white font-bold text-sm shadow-lg transition active:scale-95"
          >
            Yes, Save 📸
          </button>
        </div>
      </div>
    </div>
  );
}
