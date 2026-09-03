/**
 * File Permission Dialog - Kids App Safe
 * 
 * Displays a permission request for file storage (postcard saving)
 * Similar to AudioPermissionDialog - shows once, stores preference in localStorage
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
  const progress = useProgress();

  // Don't show on splash/welcome/create screens
  // IMPORTANT: Delay until after hydration to avoid hydration mismatch
  useEffect(() => {
    // Don't show during hydration - wait until localStorage is ready
    if (!isHydrated()) {
      return;
    }

    const hasSeenFilePermission = localStorage.getItem(
      "india-explorer:file-permission-shown:v1"
    ) === "1";

    // Show if:
    // 1. User hasn't seen it yet (!hasSeenFilePermission)
    // 2. App is fresh (!progress.onboarded) OR user just onboarded (just created profile)
    // 3. Not suppressed by another dialog
    if (!hasSeenFilePermission && !isOpen) {
      console.log("[FilePermissionDialog] Ready to show on first authenticated access");
      setIsOpen(true);
      localStorage.setItem("india-explorer:file-permission-shown:v1", "1");
    }
  }, [isHydrated(), isOpen]);

  const handleAccept = () => {
    console.log("[FilePermissionDialog] User accepted file permission");
    localStorage.setItem("india-explorer:file-permission-consent:v1", "1");
    setIsOpen(false);
    onAccept?.();
  };

  const handleReject = () => {
    console.log("[FilePermissionDialog] User rejected file permission");
    localStorage.setItem("india-explorer:file-permission-consent:v1", "0");
    setIsOpen(false);
    onReject?.();
  };

  // ← CRITICAL: Don't render anything until hydration is complete to avoid SSR mismatch
  if (!isHydrated()) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scale-in">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">📁</div>
          <h2 className="text-2xl font-extrabold text-ink">Save Your Postcard?</h2>
          <p className="text-sm text-muted-foreground mt-2">
            We'd like to save your postcard so you can share it with family and friends!
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2 bg-blue-50 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">✨</span>
            <div>
              <div className="font-bold text-sm text-ink">Save Postcards</div>
              <div className="text-xs text-muted-foreground">Keep memories of places you explore</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">📤</span>
            <div>
              <div className="font-bold text-sm text-ink">Share with Friends</div>
              <div className="text-xs text-muted-foreground">Show your India Explorer adventures</div>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-xs text-muted-foreground text-center bg-amber-50 rounded-xl p-3">
          We only save files you create. Your privacy is important to us! 🔒
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-3 rounded-xl bg-muted text-muted-foreground font-bold text-sm transition active:scale-95"
          >
            Not Now
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-3 rounded-xl bg-success text-white font-bold text-sm shadow-lg transition active:scale-95"
          >
            Allow 📁
          </button>
        </div>
      </div>
    </div>
  );
}
