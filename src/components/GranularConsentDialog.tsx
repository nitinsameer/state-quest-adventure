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
import { EMOJI } from "@/constants/emoji";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-bg-header p-(--padding-lg)" style={{ color: "var(--text-on-primary)" }}>
          <h2 className="text-2xl font-extrabold mb-(--space-0-25)">🔒 Stamp Privacy</h2>
          <p className="text-sm opacity-90">Manage who can see this stamp from {postcard.state}</p>
        </div>

        {/* Content */}
        <div className="p-(--padding-lg) space-y-(--gap-md) flex-1 overflow-y-auto">
          {/* Current State */}
          <div className="bg-surface-raised rounded-2xl p-(--padding-md) border-2 border-border-color">
            <div
              className="text-xs font-bold uppercase mb-(--space-0-25)"
              style={{ color: "var(--text-muted)" }}
            >
              Current Setting
            </div>
            <div className="flex items-center gap-(--gap-base)">
              <div className="text-3xl">
                {postcard.consentState === "accepted"
                  ? EMOJI.ui.checkButton
                  : postcard.consentState === "declined"
                    ? EMOJI.ui.delete
                    : EMOJI.ui.pending}
              </div>
              <div>
                <div className="font-bold capitalize" style={{ color: "var(--text-primary)" }}>
                  {postcard.consentState === "accepted"
                    ? "Shareable with Parents"
                    : postcard.consentState === "declined"
                      ? "Private (Not Shareable)"
                      : "Not Yet Decided"}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Last changed:{" "}
                  {postcard.consentChangedAt
                    ? new Date(postcard.consentChangedAt).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Cards */}
          <div className="space-y-(--gap-base)">
            {/* Accepted Option */}
            <button
              onClick={() => handleConsentChange("accepted")}
              className={`w-full p-(--padding-md) rounded-2xl border-2 transition text-left ${
                postcard.consentState === "accepted"
                  ? "bg-action-success-bg border-action-success-bg"
                  : "bg-surface-card border-border-color hover:border-action-success-bg"
              }`}
            >
              <div className="flex items-start gap-(--gap-base)">
                <div className="text-3xl flex-shrink-0">{EMOJI.ui.checkButton}</div>
                <div className="flex-1">
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>
                    Shareable with Parents
                  </div>
                  <div className="text-xs mt-(--space-0-25)" style={{ color: "var(--text-muted)" }}>
                    You're OK with your parents, friends, or family seeing this stamp. It could be
                    shared in messages or printed!
                  </div>
                </div>
              </div>
            </button>

            {/* Declined Option */}
            <button
              onClick={() => handleConsentChange("declined")}
              className={`w-full p-(--padding-md) rounded-2xl border-2 transition text-left ${
                postcard.consentState === "declined"
                  ? "bg-fb-error-bg border-fb-error-bg"
                  : "bg-surface-card border-border-color hover:border-fb-error-bg"
              }`}
            >
              <div className="flex items-start gap-(--gap-base)">
                <div className="text-3xl flex-shrink-0">{EMOJI.ui.delete}</div>
                <div className="flex-1">
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>
                    Private (Keep Personal)
                  </div>
                  <div className="text-xs mt-(--space-0-25)" style={{ color: "var(--text-muted)" }}>
                    You prefer to keep this stamp just for yourself. It won't be shared or exported.
                  </div>
                </div>
              </div>
            </button>

            {/* Pending Option */}
            <button
              onClick={() => handleConsentChange("pending")}
              className={`w-full p-(--padding-md) rounded-2xl border-2 transition text-left ${
                postcard.consentState === "pending"
                  ? "bg-fb-warning-bg border-fb-warning-bg"
                  : "bg-surface-card border-border-color hover:border-fb-warning-bg"
              }`}
            >
              <div className="flex items-start gap-(--gap-base)">
                <div className="text-3xl flex-shrink-0">{EMOJI.ui.pending}</div>
                <div className="flex-1">
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>
                    Not Yet Decided
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    You haven't decided yet. You can always come back and choose anytime!
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Privacy Note */}
          <div className="bg-fb-info-bg rounded-2xl p-(--padding-md) border border-fb-info-border">
            <div className="flex gap-(--gap-base)">
              <span className="text-lg flex-shrink-0">{EMOJI.action.lock}</span>
              <div className="text-xs" style={{ color: "var(--text-on-primary)" }}>
                <strong>You're in control:</strong> You can change your mind anytime. We never share
                your stamps without your permission.
              </div>
            </div>
          </div>

          {/* Consent History (Optional) */}
          {postcard.consentHistory && postcard.consentHistory.length > 1 && (
            <div className="bg-surface-raised rounded-2xl p-(--padding-md)">
              <div
                className="text-xs font-bold uppercase mb-(--space-0-25)"
                style={{ color: "var(--text-muted)" }}
              >
                Change History
              </div>
              <div className="space-y-(--space-0-25)">
                {postcard.consentHistory
                  .slice()
                  .reverse()
                  .slice(0, 3)
                  .map((entry, idx) => (
                    <div key={idx} className="text-xs" style={{ color: "var(--text-muted)" }}>
                      <span className="font-semibold capitalize">
                        {entry.state === "accepted"
                          ? EMOJI.ui.checkButton
                          : entry.state === "declined"
                            ? EMOJI.ui.delete
                            : EMOJI.ui.pending}{" "}
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
        <div className="border-t border-border-color p-(--padding-lg)">
          <button
            onClick={handleClose}
            className="w-full px-(--padding-md) py-(--padding-base) rounded-xl bg-surface-raised font-bold text-sm transition active:scale-95"
            style={{ color: "var(--text-muted)" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
