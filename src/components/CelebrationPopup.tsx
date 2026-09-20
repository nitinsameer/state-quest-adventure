import React, { useEffect, useState } from "react";
import { useCelebrationStore, type CelebrationConfig } from "@/store/celebrationStore";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import "@/styles/celebrations.css";

/**
 * Base Celebration Modal Component
 * Renders the current celebration popup from the store
 */
function CelebrationModal({ config }: { config: CelebrationConfig }) {
  const [isExiting, setIsExiting] = useState(false);
  const dismiss = useCelebrationStore((state) => state.dismiss);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  useEffect(() => {
    if (config.confetti) {
      setConfettiTrigger((t) => t + 1);
    }
  }, [config.id, config.confetti]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      dismiss();
    }, 300);
  };

  const handleActionClick = () => {
    if (config.action) {
      config.action.onClick();
    }
    handleDismiss();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`celebration-backdrop ${isExiting ? "celebration-backdrop-exit" : "celebration-backdrop-enter"} bg-black/30`}
        onClick={handleDismiss}
        role="presentation"
      />

      {/* Modal */}
      <div
        className={`celebration-modal-container celebration-modal celebration-${config.type} ${
          isExiting ? "celebration-modal-exit" : "celebration-modal-enter"
        }`}
        role="alertdialog"
        aria-label={config.title}
      >
        <div
          className={`celebration-${config.type} bg-white rounded-3xl shadow-2xl p-8 w-[320px] text-center space-y-4`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="celebration-icon" role="img" aria-label="celebration">
            {config.icon}
          </div>

          {/* Title */}
          <h2 className="celebration-title">{config.title}</h2>

          {/* Subtitle */}
          {config.subtitle && <p className="celebration-subtitle">{config.subtitle}</p>}

          {/* Action Button */}
          {config.action && (
            <button
              onClick={handleActionClick}
              className="celebration-action-button w-full"
              type="button"
            >
              {config.action.label}
            </button>
          )}

          {/* Auto-dismiss hint if no action button */}
          {!config.action && (
            <p className="celebration-subtitle text-sm pt-2">Tap to continue</p>
          )}
        </div>
      </div>

      {/* Confetti overlay */}
      {config.confetti && confettiTrigger > 0 && (
        <ConfettiBurst trigger={confettiTrigger} size="big" />
      )}
    </>
  );
}

/**
 * CelebrationPopup Provider Component
 * Place this at the root level (in __root.tsx)
 * Manages the queue and renders current celebration
 */
export function CelebrationPopupProvider() {
  const current = useCelebrationStore((state) => state.current);

  if (!current) return null;

  return (
    <div className="fixed inset-0 pointer-events-auto z-[999]" style={{ pointerEvents: current ? "auto" : "none" }}>
      <CelebrationModal config={current} />
    </div>
  );
}
