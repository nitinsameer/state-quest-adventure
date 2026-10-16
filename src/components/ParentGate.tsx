/**
 * ParentGate Component
 *
 * Secure gate for parent zone access and sensitive actions
 * - Requires PIN verification before accessing /parent
 * - Gate session expires after 5 minutes or on logout
 * - "Forgot PIN" uses arithmetic challenge to recover access
 */

import { useState, useEffect } from "react";
import { hasPin, setPin, verifyPin, isGated, migrateOldPIN } from "@/lib/parent-gate";
import { StandardModal } from "@/components/StandardModal";
import { fxTap } from "@/lib/fx";

export interface ParentGateProps {
  onVerified: () => void;
  onCancel: () => void;
}

type GateMode = "pin-entry" | "pin-create" | "forgot-pin" | "challenge";

export function ParentGate({ onVerified, onCancel }: ParentGateProps) {
  const [mode, setMode] = useState<GateMode>("pin-entry");
  const [pin, setPin_State] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot PIN challenge
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [challengeError, setChallengeError] = useState("");

  // Initialize
  useEffect(() => {
    const init = async () => {
      // Migrate old plain PIN if exists
      await migrateOldPIN();

      // Check if already gated
      if (isGated()) {
        onVerified();
        return;
      }

      // Determine mode
      const hasPIN = hasPin();
      if (!hasPIN) {
        setMode("pin-create");
      }
    };

    init();
  }, [onVerified]);

  // PIN Entry Mode
  const handlePinVerify = async () => {
    if (!pin) {
      setPinError("Enter your PIN");
      return;
    }

    setLoading(true);
    setPinError("");

    try {
      const result = await verifyPin(pin);

      if (result.success) {
        fxTap();
        onVerified();
      } else if (result.lockout) {
        setPinError(
          `Locked. Try again in ${result.remainingMinutes} minute${result.remainingMinutes > 1 ? "s" : ""}`,
        );
      } else {
        setPinError("Wrong PIN. Try again.");
        setPin_State("");
      }
    } finally {
      setLoading(false);
    }
  };

  // PIN Creation Mode
  const handlePinCreate = async () => {
    if (!pin || pin.length < 4) {
      setPinError("PIN must be at least 4 characters");
      return;
    }

    if (pin !== pinConfirm) {
      setPinError("PINs don't match");
      return;
    }

    setLoading(true);
    setPinError("");

    try {
      const success = await setPin(pin);

      if (success) {
        fxTap();
        await verifyPin(pin); // Auto-verify after creation
        onVerified();
      } else {
        setPinError("Failed to save PIN");
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot PIN - Generate Challenge
  const handleForgotPin = () => {
    // Two 2-digit numbers (10-99) - requires grade 3+ math
    const a = Math.floor(Math.random() * 90) + 10;
    const b = Math.floor(Math.random() * 90) + 10;
    setNum1(a);
    setNum2(b);
    setChallengeAnswer("");
    setChallengeError("");
    setMode("challenge");
  };

  // Challenge Verification
  const handleChallengeSubmit = async () => {
    if (!challengeAnswer) {
      setChallengeError("Enter the answer");
      return;
    }

    const correct = num1 * num2;
    const userAnswer = parseInt(challengeAnswer, 10);

    if (userAnswer !== correct) {
      setChallengeError("Not quite. Try the multiplication again.");
      setChallengeAnswer("");
      return;
    }

    fxTap();
    setMode("pin-create");
    setPin_State("");
    setPinConfirm("");
    setPinError("");
    setChallengeError("");
  };

  return (
    <StandardModal
      open={true}
      header={{
        icon: "=",
        title:
          mode === "pin-entry"
            ? "Parent Access"
            : mode === "pin-create"
              ? "Create Parent PIN"
              : mode === "challenge"
                ? "Verify You're a Parent"
                : "Recover PIN",
        closeButton: false,
        floatingIcon: true,
      }}
      onClose={onCancel}
      maxWidth="max-w-sm"
    >
      <div className="space-y-4 p-4">
        {mode === "pin-entry" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">Enter PIN</label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  setPin_State(e.target.value);
                  setPinError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePinVerify();
                }}
                className="w-full rounded-lg border-2 border-[var(--border-color)] px-4 py-2 text-center tracking-widest bg-surface-card text-text-primary"
              />
              {pinError && (
                <p className="text-xs text-[var(--fb-error-fg)] font-semibold">{pinError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 rounded-lg bg-[var(--surface-muted)] px-4 py-2 font-semibold text-text-primary hover:bg-[var(--surface-raised)]"
              >
                Cancel
              </button>
              <button
                onClick={handlePinVerify}
                disabled={loading}
                className="flex-1 rounded-lg bg-[var(--action-primary-bg)] px-4 py-2 font-semibold text-text-on-primary hover:bg-[var(--action-primary-hover)] disabled:opacity-50"
              >
                {loading ? "Checking..." : "Verify"}
              </button>
            </div>

            <button
              onClick={handleForgotPin}
              className="w-full text-xs text-accent-1 hover:underline"
            >
              Forgot PIN?
            </button>
          </>
        )}

        {mode === "pin-create" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">
                Create a PIN (4+ digits)
              </label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  setPin_State(e.target.value);
                  setPinError("");
                }}
                className="w-full rounded-lg border-2 border-[var(--border-color)] px-4 py-2 text-center tracking-widest bg-surface-card text-text-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="••••"
                value={pinConfirm}
                onChange={(e) => {
                  setPinConfirm(e.target.value);
                  setPinError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePinCreate();
                }}
                className="w-full rounded-lg border-2 border-[var(--border-color)] px-4 py-2 text-center tracking-widest bg-surface-card text-text-primary"
              />
              {pinError && (
                <p className="text-xs text-[var(--fb-error-fg)] font-semibold">{pinError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 rounded-lg bg-[var(--surface-muted)] px-4 py-2 font-semibold text-text-primary hover:bg-[var(--surface-raised)]"
              >
                Cancel
              </button>
              <button
                onClick={handlePinCreate}
                disabled={loading}
                className="flex-1 rounded-lg bg-[var(--action-primary-bg)] px-4 py-2 font-semibold text-text-on-primary hover:bg-[var(--action-primary-hover)] disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create PIN"}
              </button>
            </div>
          </>
        )}

        {mode === "challenge" && (
          <>
            <div className="space-y-4 rounded-lg bg-[var(--surface-raised)] p-4 text-center">
              <p className="text-sm text-text-primary/70">
                Let's verify you're a parent. Multiply these numbers:
              </p>
              <p className="text-3xl font-bold text-text-primary">
                {num1} × {num2} = ?
              </p>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Answer"
                value={challengeAnswer}
                onChange={(e) => {
                  setChallengeAnswer(e.target.value);
                  setChallengeError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChallengeSubmit();
                }}
                className="mx-auto block w-32 rounded-lg border-2 border-[var(--border-color)] px-3 py-2 text-center text-lg font-semibold"
              />
              {challengeError && (
                <p className="text-xs text-[var(--fb-error-fg)] font-semibold">{challengeError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMode("pin-entry")}
                className="flex-1 rounded-lg bg-[var(--surface-muted)] px-4 py-2 font-semibold text-text-primary hover:bg-[var(--surface-raised)]"
              >
                Back
              </button>
              <button
                onClick={handleChallengeSubmit}
                className="flex-1 rounded-lg bg-[var(--action-primary-bg)] px-4 py-2 font-semibold text-text-on-primary hover:bg-[var(--action-primary-hover)]"
              >
                Check Answer
              </button>
            </div>
          </>
        )}
      </div>
    </StandardModal>
  );
}
