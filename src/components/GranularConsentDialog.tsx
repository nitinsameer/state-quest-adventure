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
        <div className="bg-gradient-to-r from-info-soft0 to-purple-500 p-[--padding-lg] text-white">
          <h2 className="text-2xl font-extrabold mb-[--space-0-25]">🔒 Stamp Privacy</h2>
          <p className="text-sm opacity-90">
            Manage who can see this stamp from {postcard.state}
          </p>
        </div>

        {/* Content */}
        <div className="p-[--padding-lg] space-y-[--gap-md] flex-1 overflow-y-auto">
          {/* Current State */}
          <div className="bg-muted-light rounded-2xl p-[--padding-md] border-2 border-muted">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-[--space-0-25]">
              Current Setting
            </div>
            <div className="flex items-center gap-[--gap-base]">
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
          <div className="space-y-[--gap-base]">
            {/* Accepted Option */}
            <button
              onClick={() => handleConsentChange("accepted")}
              className={`w-full p-[--padding-md] rounded-2xl border-2 transition text-left ${
                postcard.consentState === "accepted"
                  ? "bg-success-soft border-green-500"
                  : "bg-white border-muted hover:border-green-500"
              }`}
            >
              <div className="flex items-start gap-[--gap-base]">
                <div className="text-3xl flex-shrink-0">✅</div>
                <div className="flex-1">
                  <div className="font-bold text-ink">Shareable with Parents</div>
                  <div className="text-xs text-muted-foreground mt-[--space-0-25]">
                    You're OK with your parents, friends, or family seeing this stamp. It could be shared in messages or printed!
                  </div>
                </div>
              </div>
            </button>

            {/* Declined Option */}
            <button
              onClick={() => handleConsentChange("declined")}
              className={`w-full p-[--padding-md] rounded-2xl border-2 transition text-left ${
                postcard.consentState === "declined"
                  ? "bg-error-soft border-red-500"
                  : "bg-white border-muted hover:border-red-500"
              }`}
            >
              <div className="flex items-start gap-[--gap-base]">
                <div className="text-3xl flex-shrink-0">❌</div>
                <div className="flex-1">
                  <div className="font-bold text-ink">Private (Keep Personal)</div>
                  <div className="text-xs text-muted-foreground mt-[--space-0-25]">
                    You prefer to keep this stamp just for yourself. It won't be shared or exported.
                  </div>
                </div>
              </div>
            </button>

            {/* Pending Option */}
            <button
              onClick={() => handleConsentChange("pending")}
              className={`w-full p-[--padding-md] rounded-2xl border-2 transition text-left ${
                postcard.consentState === "pending"
                  ? "bg-warning-soft border-amber-500"
                  : "bg-white border-muted hover:border-amber-500"
              }`}
            >
              <div className="flex items-start gap-[--gap-base]">
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
          <div className="bg-info-soft rounded-2xl p-[--padding-md] border border-info">
            <div className="flex gap-[--gap-base]">
              <span className="text-lg flex-shrink-0">🔐</span>
              <div className="text-xs text-muted-foreground">
                <strong>You're in control:</strong> You can change your mind anytime. We never share your stamps without your permission.
              </div>
            </div>
          </div>

          {/* Consent History (Optional) */}
          {postcard.consentHistory && postcard.consentHistory.length > 1 && (
            <div className="bg-muted-light rounded-2xl p-[--padding-md]">
              <div className="text-xs font-bold text-muted-foreground uppercase mb-[--space-0-25]">
                Change History
              </div>
              <div className="space-y-[--space-0-25]">
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
        <div className="border-t border-muted p-[--padding-lg]">
          <button
            onClick={handleClose}
            className="w-full px-[--padding-md] py-[--padding-base] rounded-xl bg-muted text-muted-foreground font-bold text-sm transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

