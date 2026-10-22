import { useRef } from "react";
import { useProgress, type PendingCelebration } from "@/lib/progress";
import { useNavigate } from "@tanstack/react-router";
import { QuizCelebrationScreen } from "./QuizCelebrationScreen";
import { useEffect } from "react";

/**
 * QuizCeremony: Renders the single-screen dopamine-driven celebration.
 *
 * This is now a lightweight wrapper that delegates to QuizCelebrationScreen.
 * It handles:
 * - Ceremony validation
 * - Navigation ref management
 * - Render guard
 */
export function QuizCeremony() {
  const progress = useProgress();
  const navigate = useNavigate();
  const navigationInProgressRef = useRef(false);

  // Get the first pending celebration (current ceremony)
  const ceremony = progress.pendingCelebrations?.[0];

  // Type guard: only proceed if ceremony is valid "full" type
  const isValidCeremony = ceremony && ceremony.type === "full";

  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY - before any guard checks
  // If dismissed, navigate to home ONLY if NOT already navigating via button
  useEffect(() => {
    if (isValidCeremony === false && !navigationInProgressRef.current) {
      navigate({ to: "/" });
    }
  }, [isValidCeremony, navigate]);

  // Guard rendering: return null if ceremony is invalid
  // (hooks are already called above, so this is safe)
  if (!isValidCeremony) {
    return null;
  }

  // At this point, ceremony is guaranteed to be PendingCelebration with type "full"
  const typedCeremony = ceremony as PendingCelebration & { type: "full" };

  return (
    <QuizCelebrationScreen
      ceremony={typedCeremony}
      navigationInProgressRef={navigationInProgressRef}
      navigate={navigate}
    />
  );
}

