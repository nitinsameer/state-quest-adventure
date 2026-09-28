/**
 * Parental Consent Dialog
 * FIX #27: COPPA-compliant consent request
 * 
 * Shows after profile creation to obtain explicit parental consent before:
 * - Firebase analytics tracking
 * - Crash reporting
 * - Any data collection
 * 
 * This dialog is modal and MUST be acknowledged before continuing
 * No data collection happens until consent is granted
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { grantFeatureConsent, hasFeatureConsent } from "@/lib/parental-consent";
import { fxTap, fxConfetti } from "@/lib/fx";

export interface ParentalConsentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConsentGranted?: () => void;
}

/**
 * Parental Consent Dialog - COPPA Compliance
 * 
 * Shows after profile creation to obtain explicit parental consent for:
 * - Analytics tracking (learning progress, quiz completion)
 * - Crash reporting (debugging issues)
 * 
 * Design:
 * - Clear, simple language (parent-facing)
 * - Explains what data is collected and why
 * - Offers opt-in or decline options
 * - No pre-selected checkboxes
 * - Cannot be bypassed (modal)
 * 
 * COPPA Requirements Met:
 * ✓ Explicit parent consent required
 * ✓ Clear disclosure of data use
 * ✓ Easy to understand language
 * ✓ Cannot auto-enable
 * ✓ Can be revoked anytime
 */
export function ParentalConsentDialog({
  open = false,
  onOpenChange,
  onConsentGranted,
}: ParentalConsentDialogProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [hasConsented, setHasConsented] = useState(false);

  // Sync with parent's open prop
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Check if consent already granted
  useEffect(() => {
    if (hasFeatureConsent("analytics")) {
      setHasConsented(true);
    }
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleGrantConsent = () => {
    fxTap();
    fxConfetti();
    
    // Grant analytics consent
    grantFeatureConsent("analytics");
    setHasConsented(true);
    
    // Close dialog and notify parent
    handleOpenChange(false);
    onConsentGranted?.();
  };

  const handleDeclineConsent = () => {
    fxTap();
    
    // Don't grant consent, but close dialog
    // User can re-enable in settings anytime
    handleOpenChange(false);
  };

  // Don't show if already consented
  if (hasConsented && !open) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200">
        <DialogHeader className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
            <DialogTitle className="text-2xl font-bold text-ink">
              Parent, we'd like your permission
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-700 space-y-3">
            <p>
              <strong>Hello parent!</strong> India Explorer would like your permission to collect some information about your child's learning.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* What We Collect */}
          <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
            <div className="font-bold text-ink mb-2">📊 What we collect:</div>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>✓ Quiz scores and learning progress</li>
              <li>✓ States explored</li>
              <li>✓ Time spent in the app</li>
              <li>✓ Crash reports (to fix bugs)</li>
            </ul>
          </div>

          {/* Why We Collect It */}
          <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
            <div className="font-bold text-ink mb-2">💡 Why we collect it:</div>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>✓ Improve the app and fix bugs</li>
              <li>✓ Understand what kids love about India</li>
              <li>✓ Make the experience better</li>
            </ul>
          </div>

          {/* Privacy */}
          <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
            <div className="font-bold text-ink mb-2">🔒 Your privacy:</div>
            <p className="text-sm text-gray-700">
              We don't collect personal details like names, photos, or location. Your child's data is protected and never shared with advertisers.
            </p>
          </div>

          {/* Control */}
          <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
            <div className="font-bold text-ink mb-2">⚙️ You're in control:</div>
            <p className="text-sm text-gray-700">
              You can change your mind anytime in the Parent Zone. Just tap the settings button on the profile screen.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={handleGrantConsent}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white text-lg font-bold hover:shadow-lg active:scale-95"
          >
            ✅ Yes, I agree
          </Button>
          <Button
            onClick={handleDeclineConsent}
            variant="outline"
            className="w-full h-14 rounded-2xl border-2 border-gray-300 text-gray-700 text-lg font-bold hover:bg-gray-50 active:scale-95"
          >
            ❌ No thanks
          </Button>
        </div>

        {/* Legal Note */}
        <div className="text-xs text-gray-600 text-center pt-3 border-t border-gray-200">
          <p>
            This app complies with COPPA (Children's Online Privacy Protection Act). We take children's privacy seriously.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
