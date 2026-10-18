/**
 * Simplified Parent Consent Gate Component
 * COPPA Compliance: Collects parent consent for app features
 * 
 * Simplified Flow:
 * 1. Single-stage intro with checkbox
 * 2. "I am a parent/guardian" acknowledgment
 * 3. "Let's Explore!" button → stores consent → calls onComplete callback
 * 4. Component returns null after consent granted
 * 
 * Rendered AFTER age selection (ageBand is set)
 * Does not block age selection screen (/create)
 */

import { useState } from "react";
import { grantFeatureConsent, hasFeatureConsent } from "@/lib/parental-consent";
import { EMOJI } from "@/constants/emoji";

interface ParentConsentGateProps {
  onComplete?: () => void;
}

export function ParentConsentGate({ onComplete }: ParentConsentGateProps = {}): React.ReactNode {
  const [isAgreed, setIsAgreed] = useState(false);
  const [stage, setStage] = useState<"idle" | "accepted">("idle");

  // Check if consent already given (return null to let app proceed)
  const consentGiven = hasFeatureConsent("analytics");
  if (consentGiven) {
    return null; // Consent exists - gate complete, render nothing
  }

  const handleAgreedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAgreed(e.target.checked);
  };

  const handleConfirm = () => {
    // Grant consent - this enables Firebase analytics
    grantFeatureConsent("analytics");

    // Also grant audio consent (TTS) and file consent for future features
    grantFeatureConsent("audio");
    grantFeatureConsent("file");

    setStage("accepted");
    onComplete?.();
  };

  if (stage === "accepted") {
    // Consent complete - render nothing (app will proceed)
    return null;
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-accent-1 to-accent-2 px-4 fixed inset-0 z-50">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Header Icon */}
        <div className="text-6xl mb-4">{EMOJI.nav.map}</div>

        {/* Title and Description */}
        <div>
          <h1 className="text-h2 text-white">Before you explore...</h1>
          <p className="text-body text-white/90 mt-3 leading-relaxed">
            We use the data your child creates to help them learn better and stay safe. We never share personal information.
          </p>
        </div>

        {/* Consent Checkbox */}
        <div className="space-y-3 text-left">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={handleAgreedChange}
              className="mt-2 w-5 h-5 accent-white flex-shrink-0"
            />
            <span className="text-body text-white/90">
              I am a parent or guardian. I agree to this app collecting learning data for my child.
            </span>
          </label>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleConfirm}
          disabled={!isAgreed}
          className="w-full h-14 rounded-2xl bg-white text-accent-1 text-h4 font-bold shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Let's Explore!
        </button>

        {/* Footer Text */}
        <p className="text-caption text-white/70">
          We follow strict child safety rules (COPPA)
        </p>
      </div>
    </div>
  );
}
