/**
 * AudioSettingToggle - Profile Audio Settings Control
 * 
 * Allows users to enable/disable AUDIO NARRATION in profile settings
 * Uses parental-consent system (not sound effects toggle)
 * Changes take effect immediately (no app restart needed)
 * Affects:
 * - TTS narration: Controlled by hasFeatureConsent('audio')
 * - Celebration sounds: Respects audio consent
 */

import { useState, useEffect } from "react";
import { fxTap } from "@/lib/fx";
import { stopTts } from "@/lib/tts";
import {
  hasFeatureConsent,
  grantFeatureConsent,
  revokeFeatureConsent,
  subscribeConsentChanges,
} from "@/lib/parental-consent";

export function AudioSettingToggle() {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return hasFeatureConsent('audio');
  });
  const [isToggling, setIsToggling] = useState(false);

  // Subscribe to consent changes
  useEffect(() => {
    const unsubscribe = subscribeConsentChanges('audio', () => {
      setAudioEnabled(hasFeatureConsent('audio'));
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    if (isToggling) return;
    setIsToggling(true);
    fxTap(); // Play feedback before changing
    
    const newState = !audioEnabled;
    
    if (newState) {
      grantFeatureConsent('audio');
      setAudioEnabled(true);
    } else {
      revokeFeatureConsent('audio');
      setAudioEnabled(false);
      stopTts(); // Stop any active TTS immediately
    }
    
    setIsToggling(false);
  };

  return (
    <div className="flex items-center justify-between p-(--padding-md) rounded-2xl bg-accent-1-soft border border-accent-1">
      {/* Left: Label & Description */}
      <div className="flex-1">
        <h3 className="font-bold text-ink text-base">🎧 Audio Narration</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {audioEnabled 
            ? "✓ Stories are read aloud" 
            : "✗ Audio is disabled"}
        </p>
      </div>

      {/* Right: Toggle Switch */}
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`ml-(--space-3) relative inline-flex h-8 w-14 items-center rounded-full transition-all flex-shrink-0 ${
          audioEnabled
            ? "bg-success shadow-lg shadow-success/50"
            : "bg-muted shadow-md"
        } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}`}
      >
        {/* Toggle Thumb */}
        <div
          className={`inline-block h-6 w-6 transform rounded-full bg-surface-card shadow-lg transition-transform ${
            audioEnabled ? "translate-x-7" : "translate-x-1"
          } ${isToggling ? "scale-95" : "scale-100"}`}
        />
        
        {/* Status Indicator */}
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          {audioEnabled ? "✓" : "✗"}
        </span>
      </button>
    </div>
  );
}

/**
 * AudioSettingToggleCompact - Minimal version for inline settings
 * Shows just the toggle without extra description
 */
export function AudioSettingToggleCompact() {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return hasFeatureConsent('audio');
  });

  useEffect(() => {
    const unsubscribe = subscribeConsentChanges('audio', () => {
      setAudioEnabled(hasFeatureConsent('audio'));
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    fxTap();
    const newState = !audioEnabled;
    
    if (newState) {
      grantFeatureConsent('audio');
      setAudioEnabled(true);
    } else {
      revokeFeatureConsent('audio');
      setAudioEnabled(false);
      stopTts();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ${
        audioEnabled
          ? "bg-success"
          : "bg-muted"
      } hover:scale-105 active:scale-95`}
      title={audioEnabled ? "Disable audio narration" : "Enable audio narration"}
    >
      <div
        className={`inline-block h-5 w-5 transform rounded-full bg-surface-card shadow-md transition-transform ${
          audioEnabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/**
 * AudioSettingRow - For use in settings lists
 * Shows icon, label, and toggle in a list row format
 */
export function AudioSettingRow() {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return hasFeatureConsent('audio');
  });

  useEffect(() => {
    const unsubscribe = subscribeConsentChanges('audio', () => {
      setAudioEnabled(hasFeatureConsent('audio'));
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    fxTap();
    const newState = !audioEnabled;
    
    if (newState) {
      grantFeatureConsent('audio');
      setAudioEnabled(true);
    } else {
      revokeFeatureConsent('audio');
      setAudioEnabled(false);
      stopTts();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="w-full flex items-center justify-between p-(--padding-md) rounded-2xl bg-surface-card border border-muted hover:border-accent-1 hover:bg-accent-1-soft transition"
    >
      {/* Left: Icon & Labels */}
      <div className="flex items-start gap-(--gap-base)">
        <div className="text-3xl flex-shrink-0">🎧</div>
        <div className="text-left">
          <div className="font-bold text-ink">Audio Narration</div>
          <div className="text-xs text-muted-foreground">
            {audioEnabled ? "Enabled ✓" : "Disabled ✗"}
          </div>
        </div>
      </div>

      {/* Right: Toggle */}
      <div
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all flex-shrink-0 ml-4 ${
          audioEnabled
            ? "bg-success"
            : "bg-muted"
        }`}
      >
        <div
          className={`inline-block h-6 w-6 transform rounded-full bg-surface-card shadow-md transition-transform ${
            audioEnabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}

