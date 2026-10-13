import { useState, useEffect } from "react";
import { fxTap, fxWrong } from "@/lib/fx";
import { verifyPin, isGated } from "@/lib/parent-gate";

interface ResetPINDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Parental PIN Dialog for Reset Confirmation
 * - Shows PIN entry keypad
 * - 4-digit PIN (secure PBKDF2-hashed)
 * - 30-second timeout with countdown
 * - 5-attempt lockout with 5-minute cooldown
 * - Prevents accidental data loss
 */
export function ResetPINDialog({ open, onConfirm, onCancel }: ResetPINDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isValid, setIsValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!open) return;
    
    setPin("");
    setError("");
    setTimeLeft(30);
    setIsValid(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCancel(); // Auto-close on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onCancel]);

  const handleKeyPress = async (digit: string) => {
    if (pin.length < 4 || isVerifying) {
      const newPin = pin + digit;
      setPin(newPin);
      fxTap();

      // Check on 4th digit
      if (newPin.length === 4) {
        setIsVerifying(true);
        const result = await verifyPin(newPin);
        
        if (result.lockout) {
          setError(`🔒 Locked. Try again in ${result.remainingMinutes}m`);
          fxWrong();
          setPin("");
        } else if (result.success) {
          setIsValid(true);
          setError("");
          // Auto-confirm after 500ms
          setTimeout(() => {
            onConfirm();
          }, 500);
        } else {
          setError("❌ Incorrect PIN");
          fxWrong();
          setPin("");
          setTimeout(() => setError(""), 2000);
        }
        setIsVerifying(false);
      }
    }
  };

  const handleBackspace = () => {
    fxTap();
    setPin(pin.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    fxTap();
    setPin("");
    setError("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-(--padding-lg) w-[90%] max-w-sm shadow-2xl">
        {/* Header */}
        <div className="text-center mb-(--space-4)">
          <div className="text-4xl mb-(--space-0-5)">🔐</div>
          <h2 className="text-display text-xl font-extrabold text-text-primary">Parent PIN Required</h2>
          <p className="text-sm text-text-muted mt-(--space-0-5)">
            This will erase all progress. Enter the parental PIN to confirm.
          </p>
        </div>

        {/* Timer */}
        <div className="text-center mb-(--space-2)">
          <div className="text-xs font-bold text-text-muted">
            ⏱️ {timeLeft}s remaining
          </div>
          <div className="h-1.5 bg-[oklch(0.9_0.02_260)] rounded-full overflow-hidden mt-(--space-0-25)">
            <div
              className="h-full bg-action-error-bg transition-all"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* PIN Input Display */}
        <div className="bg-surface-sunken rounded-2xl p-(--padding-md) mb-(--space-2)">
          <div className="flex justify-center gap-(--gap-base)">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-12 w-12 rounded-lg flex items-center justify-center font-extrabold text-lg transition ${
                  i < pin.length
                    ? "bg-action-primary-bg text-text-on-primary"
                    : "bg-surface-card border-2 border-border-color text-text-muted"
                }`}
              >
                {i < pin.length ? "●" : "○"}
              </div>
            ))}
          </div>
          {error && (
            <div className="text-center text-sm font-bold text-action-error-fg mt-(--space-0-25)">
              {error}
            </div>
          )}
          {isValid && (
            <div className="text-center text-sm font-bold text-action-success-fg mt-(--space-0-25)">
              ✓ PIN correct, resetting...
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-(--gap-base) mb-(--space-2)">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(String(digit))}
              disabled={isValid || isVerifying}
              className="h-12 rounded-xl bg-surface-card border-2 border-border-color text-text-primary text-lg font-extrabold hover:bg-surface-raised active:scale-95 transition disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => handleKeyPress("0")}
            disabled={isValid || isVerifying}
            className="col-span-3 h-12 rounded-xl bg-surface-card border-2 border-border-color text-text-primary text-lg font-extrabold hover:bg-surface-raised active:scale-95 transition disabled:opacity-50"
          >
            0
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-(--gap-base)">
          <button
            onClick={handleBackspace}
            disabled={isValid || isVerifying}
            className="flex-1 h-10 rounded-lg bg-action-warning-bg text-text-on-primary font-extrabold text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            onClick={handleClear}
            disabled={isValid || isVerifying || pin.length === 0}
            className="flex-1 h-10 rounded-lg bg-action-error-bg text-text-on-primary font-extrabold text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          disabled={isValid || isVerifying}
          className="w-full h-10 rounded-lg bg-surface-muted text-text-muted font-extrabold text-sm hover:bg-surface-raised active:scale-95 transition mt-(--space-0-25) disabled:opacity-50"
        >
          Cancel
        </button>

        {/* PIN Info */}
        <div className="text-xs text-text-muted text-center mt-(--space-2) p-(--padding-base) bg-action-info-bg rounded-lg">
          <span>🔐 Secure parent PIN (set in Parent Zone)</span>
        </div>
      </div>
    </div>
  );
}

