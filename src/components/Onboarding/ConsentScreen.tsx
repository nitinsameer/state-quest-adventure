import { useState, useEffect } from "react";
import { fxTap, fxCorrect, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";

export interface ConsentScreenProps {
  parentConsented: boolean;
  onConsent: (consented: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function ConsentScreen({
  parentConsented,
  onConsent,
  onBack,
  onContinue,
}: ConsentScreenProps) {
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [checkAnimation, setCheckAnimation] = useState(false);

  const handleToggleConsent = () => {
    fxTap();

    if (!parentConsented) {
      // Transitioning to checked
      fxCorrect();
      setCheckAnimation(true);
      setTimeout(() => setCheckAnimation(false), 300);
      setConfettiBurst((n) => n + 1);
    }

    onConsent(!parentConsented);
  };

  const handleBack = () => {
    fxTap();
    onBack();
  };

  const handleContinue = () => {
    if (!parentConsented) return;
    fxTap();
    // Large confetti celebration
    setConfettiBurst((n) => n + 1);
    fxConfetti();

    // Navigate after celebration
    setTimeout(() => onContinue(), 300);
  };

  return (
    <div className="w-full h-full bg-accent-1-soft flex flex-col select-none touch-none relative overflow-hidden">
      <ConfettiBurst trigger={confettiBurst} size="big" />

      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-accent-1 text-text-on-primary">
        <h1 className="text-2xl font-black">Parental Consent</h1>
        <p className="text-sm opacity-90 mt-1">Step 3/3 — Let's make sure we're safe</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-center">
        {/* Consent Box */}
        <div className="bg-surface-card rounded-2xl p-6 shadow-elevated-1 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Your Digital Safety Matters</h2>

          {/* Privacy Notice */}
          <div className="mb-5 p-4 bg-accent-1-soft rounded-xl border-l-4 border-accent-1">
            <p className="text-sm text-text-secondary font-semibold mb-2">Privacy & Safety</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              We follow COPPA (Children's Online Privacy Protection Act) and keep kids safe. We don't
              sell data, and parents can request to delete information anytime.
            </p>
          </div>

          {/* COPPA Compliance Notice */}
          <div className="mb-6 p-4 bg-success-soft rounded-xl border-l-4 border-success">
            <p className="text-sm text-text-secondary font-semibold mb-2">Parent/Guardian Approval</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              By checking this box, you confirm you are a parent or guardian and agree to our Terms
              of Service and Privacy Policy on behalf of this child.
            </p>
          </div>

          {/* Checkbox */}
          <button
            type="button"
            onClick={handleToggleConsent}
            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 mb-4"
            style={{
              backgroundColor: parentConsented ? "var(--success)" : "var(--surface-raised)",
            }}
          >
            {/* Checkbox */}
            <div
              className={`relative w-6 h-6 rounded-lg border-2 flex-shrink-0 transition-all duration-200
                ${
                  parentConsented
                    ? "border-text-on-primary bg-text-on-primary"
                    : "border-border-color bg-surface-card"
                }
                ${checkAnimation ? "scale-110" : ""}
              `}
              style={
                checkAnimation
                  ? ({
                      animation: "check-pop 0.3s ease-out",
                    } as React.CSSProperties)
                  : undefined
              }
            >
              {parentConsented && (
                <svg
                  className="absolute inset-0 w-full h-full p-1 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{
                    animation: "check-draw 0.15s ease-out",
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <label className="flex-1 text-left cursor-pointer">
              <p
                className={`text-sm font-bold transition-colors ${
                  parentConsented ? "text-text-on-primary" : "text-text-primary"
                }`}
              >
                I am a parent/guardian. I agree to our Terms & Privacy Policy.
              </p>
            </label>
          </button>

          {/* Glow effect when enabled */}
          {parentConsented && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
              style={{
                boxShadow: "0 0 24px rgba(52, 168, 83, 0.3)",
              }}
            />
          )}
        </div>

        {/* Info message */}
        <div className="text-center">
          <p className="text-xs text-text-secondary">
            Your child's safety is our priority. We follow all child protection laws worldwide.
          </p>
        </div>
      </div>

      {/* Footer with buttons */}
      <div className="px-5 py-4 bg-surface-card border-t border-border-color flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-text-primary bg-surface-raised hover:bg-surface-sunken transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!parentConsented}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors text-lg
            ${
              parentConsented
                ? "bg-success text-text-on-primary hover:shadow-elevated-1"
                : "bg-surface-sunken text-text-secondary cursor-not-allowed opacity-50"
            }
          `}
        >
          {parentConsented ? "Continue to App" : "I Agree to Continue"}
        </button>
      </div>

      <style>{`
        @keyframes check-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes check-draw {
          0% {
            stroke-dasharray: 20;
            stroke-dashoffset: 20;
          }
          100% {
            stroke-dasharray: 20;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
