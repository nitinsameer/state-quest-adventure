/**
 * Parent Consent Gate Component
 * COPPA Compliance: Blocks all app features until parent consent is collected
 * 
 * Flow:
 * 1. Splash screen: "Get started"
 * 2. Parent email form
 * 3. Confirmation email sent (simulated for MVP)
 * 4. Checkbox: "I confirm I'm the parent/guardian"
 * 5. "I Agree" button → stores consent → allows app to proceed
 * 
 * CRITICAL: This component renders BEFORE onboarding, BEFORE age gate
 * This prevents any Firebase events before consent
 */

import { useState, useEffect } from "react";
import { grantFeatureConsent, hasFeatureConsent } from "@/lib/parental-consent";
import { EMOJI } from "@/constants/emoji";

export function ParentConsentGate(): React.ReactNode {
  const [stage, setStage] = useState<"intro" | "email" | "confirm" | "accepted">("intro");
  const [email, setEmail] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState("");

  // Check if consent already given (return null to let app proceed)
  const consentGiven = hasFeatureConsent("analytics");
  if (consentGiven) {
    return null; // Consent exists - gate complete, render nothing
  }

  const handleGetStarted = () => {
    setStage("email");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // In production: send confirmation email via backend
    // For now: simulate email verification
    setError("");
    setStage("confirm");
  };

  const handleAgreedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAgreed(e.target.checked);
    if (e.target.checked) {
      setError("");
    }
  };

  const handleConfirm = () => {
    if (!isAgreed) {
      setError("Please confirm you're the parent/guardian");
      return;
    }

    // Grant consent - this enables Firebase analytics
    grantFeatureConsent("analytics");
    
    // Also grant audio consent (TTS) and file consent for future features
    grantFeatureConsent("audio");
    grantFeatureConsent("file");
    
    setStage("accepted");
  };

  if (stage === "accepted") {
    // Consent complete - render nothing (app will proceed)
    return null;
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-accent-1 to-accent-2 px-4">
      <div className="max-w-md w-full">
        {stage === "intro" && (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">{EMOJI.nav.map}</div>
            <h1 className="text-h1 text-white">Welcome to India Explorer!</h1>
            <p className="text-body text-white/90">
              Before we begin, we need your parent's permission.
            </p>
            <button
              onClick={handleGetStarted}
              className="w-full h-14 rounded-2xl bg-white text-accent-1 text-h4 font-bold shadow-lg transition-all hover:shadow-xl active:scale-95"
            >
              Let's Get Started
            </button>
            <p className="text-caption text-white/70">
              We follow strict child safety rules (COPPA)
            </p>
          </div>
        )}

        {stage === "email" && (
          <div className="space-y-4">
            <h2 className="text-h2 text-white text-center">Parent's Email</h2>
            <p className="text-body text-white/90 text-center">
              We'll send a confirmation to verify you're the parent.
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 px-4 rounded-lg border-2 border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-white"
              />
              {error && <p className="text-caption text-red-300">{error}</p>}
              <button
                type="submit"
                className="w-full h-14 rounded-2xl bg-white text-accent-1 text-h4 font-bold shadow-lg transition-all hover:shadow-xl active:scale-95"
              >
                Send Confirmation
              </button>
            </form>
          </div>
        )}

        {stage === "confirm" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">{EMOJI.action.check}</div>
              <h2 className="text-h2 text-white">Verify Confirmation</h2>
              <p className="text-body text-white/90 mt-2">
                We've sent a confirmation to <span className="font-bold">{email}</span>
              </p>
              <p className="text-caption text-white/70 mt-4">
                (Demo: Skip email verification for testing)
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={handleAgreedChange}
                  className="mt-1 w-5 h-5 accent-white"
                />
                <span className="text-body text-white/90">
                  I confirm I'm the parent/guardian and I consent to my child using this app with parental controls and safety features enabled.
                </span>
              </label>
              {error && <p className="text-caption text-red-300">{error}</p>}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!isAgreed}
              className="w-full h-14 rounded-2xl bg-white text-accent-1 text-h4 font-bold shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              I Agree
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
