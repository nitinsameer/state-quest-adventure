import { QuizCelebrationScreen } from "./QuizCelebrationScreen";

/**
 * QuizCeremony: Renders the single-screen dopamine-driven celebration.
 *
 * This is a simple wrapper that delegates to QuizCelebrationScreen.
 * QuizCelebrationScreen handles all ceremony validation and navigation internally.
 */
export function QuizCeremony() {
  return <QuizCelebrationScreen />;
}
