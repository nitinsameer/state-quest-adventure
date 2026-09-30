/**
 * GranularConsentDialog - Per-postcard consent toggle
 * 
 * Proposal C: COPPA-compliant, reversible consent dialog
 * 
 * Explains:
 * - What each consent state means
 * - Why parent consent matters for sharing
 * - How to toggle ON/OFF anytime
 * 
 * States:
 * - Accepted: Can potentially share with parents/friends
 * - Declined: Keep private (still saved, just not for sharing)
 * - Pending: Not yet decided
 */

import { useEffect, useState } from "react";
import type { LibraryPostcard, ConsentState } from "@/lib/postcard-library";
import { fxTap } from "@/lib/fx";

export interface GranularConsentDialogProps {
  open?: boolean;
  postcard: LibraryPostcard | null;
  onClose?: () => void;
  onConsentChange?: (newState: ConsentState) => void;
}

export function GranularConsentDialog({
  open = false,
  postcard,
  onClose,
  onConsentChange,
}: GranularConsentDialogProps) {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  if (!isOpen || !postcard) return null;

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleConsentChange = (newState: ConsentState) => {
    fxTap();
    onConsentChange?.(newState);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
          <h2 className="text-2xl font-extrabold mb-2">🔒 Stamp Privacy</h2>
          <p className="text-sm opacity-90">
            Manage who can see this stamp from {postcard.state}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Current State */}
          <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
            <div className="text-xs font-bold text-gray-600 uppercase mb-2">
              Current Setting
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {postcard.consentState === "accepted"
                  ? "✅"
                  : postcard.consentState === "declined"
                    ? "❌"
                    : "⏳"}
              </div>
              <div>
                <div className="font-bold text-ink capitalize">
                  {postcard.consentState === "accepted"
                    ? "Shareable with Parents"
                    : postcard.consentState === "declined"
                      ? "Private (Not Shareable)"
                      : "Not Yet Decided"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last changed:{" "}
                  {postcard.consentChangedAt
                    ? new Date(postcard.consentChangedAt).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Cards */}
          <div className="space-y-3">
            {/* Accepted Option */}
            <button
              onClick={() => handleConsentChange("accepted")}
              className={`w-full p-4 rounded-2xl border-2 transition text-left ${
                postcard.consentState === "accepted"
                  ? "bg-green-50 border-green-500"
                  : "bg-white border-gray-200 hover:border-green-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">✅</div>
                <div className="flex-1">
                  <div className="font-bold text-ink">Shareable with Parents</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    You're OK with your parents, friends, or family seeing this stamp. It could be shared in messages or printed!
                  </div>
                </div>
              </div>
            </button>

            {/* Declined Option */}
            <button
              onClick={() => handleConsentChange("declined")}
              className={`w-full p-4 rounded-2xl border-2 transition text-left ${
                postcard.consentState === "declined"
                  ? "bg-red-50 border-red-500"
                  : "bg-white border-gray-200 hover:border-red-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">❌</div>
                <div className="flex-1">
                  <div className="font-bold text-ink">Private (Keep Personal)</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    You prefer to keep this stamp just for yourself. It won't be shared or exported.
                  </div>
                </div>
              </div>
            </button>

            {/* Pending Option */}
            <button
              onClick={() => handleConsentChange("pending")}
              className={`w-full p-4 rounded-2xl border-2 transition text-left ${
                postcard.consentState === "pending"
                  ? "bg-amber-50 border-amber-500"
                  : "bg-white border-gray-200 hover:border-amber-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">⏳</div>
                <div className="flex-1">
                  <div className="font-bold text-ink">Not Yet Decided</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    You haven't decided yet. You can always come back and choose anytime!
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Privacy Note */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex gap-3">
              <span className="text-lg flex-shrink-0">🔐</span>
              <div className="text-xs text-gray-700">
                <strong>You're in control:</strong> You can change your mind anytime. We never share your stamps without your permission.
              </div>
            </div>
          </div>

          {/* Consent History (Optional) */}
          {postcard.consentHistory && postcard.consentHistory.length > 1 && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs font-bold text-gray-600 uppercase mb-2">
                Change History
              </div>
              <div className="space-y-2">
                {postcard.consentHistory
                  .slice()
                  .reverse()
                  .slice(0, 3)
                  .map((entry, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      <span className="font-semibold capitalize">
                        {entry.state === "accepted"
                          ? "✅"
                          : entry.state === "declined"
                            ? "❌"
                            : "⏳"}{" "}
                        {entry.state}
                      </span>
                      {" — "}
                      {new Date(entry.changedAt).toLocaleDateString()}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={handleClose}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
