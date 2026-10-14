import React, { useEffect, useState } from "react";
import { useCelebrationStore, type CelebrationConfig } from "@/store/celebrationStore";
import { StandardModal } from "@/components/StandardModal";
import { ConfettiBurst } from "@/components/ConfettiBurst";

/**
 * Base Celebration Modal Component
 * Renders the current celebration popup from the store using StandardModal
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

  // Map config to StandardModal props
  const buttons = config.action
    ? [
        {
          label: config.action.label,
          onClick: handleActionClick,
          variant: "primary" as const,
        },
      ]
    : [];

  const footer = !config.action ? "Tap to continue" : undefined;

  return (
    <>
      {/* Use StandardModal for consistent styling */}
      <StandardModal
        open={!isExiting}
        onClose={handleDismiss}
        header={{
          icon: config.icon,
          title: config.title,
          subtitle: config.subtitle,
          closeButton: config.showCloseButton,
          onClose: handleDismiss,
        }}
        buttons={buttons}
        footer={footer}
        maxWidth="max-w-sm"
      />

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
