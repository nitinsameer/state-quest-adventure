// Progression screens: StateCompletedScreen, StateUnlockScreen

import { fxTap } from "@/lib/fx";
import { useNavigate } from "@tanstack/react-router";

export function StateCompletedScreen({
  stateName,
  onContinue,
}: {
  stateName?: string;
  onContinue?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 flex flex-col items-center justify-center text-white p-6">
      <div className="text-7xl mb-4 animate-bounce">🎉</div>
      <h2 className="text-display text-3xl font-extrabold text-center">
        {stateName} Mastered!
      </h2>
      <p className="text-lg font-bold mt-3 text-center opacity-95">
        You've completed all the challenges!
      </p>
      <button
        onClick={() => {
          fxTap();
          onContinue?.();
        }}
        className="mt-8 h-14 px-8 rounded-2xl bg-white text-orange-600 text-display font-bold shadow-2xl"
      >
        Continue to Next State →
      </button>
    </div>
  );
}

export function StateUnlockScreen({
  stateName,
  message,
  onContinue,
}: {
  stateName?: string;
  message?: string;
  onContinue?: () => void;
}) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col items-center justify-center text-white p-6">
      <div className="text-7xl mb-4 animate-pulse">🔓</div>
      <h2 className="text-display text-3xl font-extrabold text-center">
        New State Unlocked!
      </h2>
      <p className="text-lg font-bold mt-3 text-center opacity-95">
        {message || `You can now explore ${stateName}!`}
      </p>
      <button
        onClick={() => {
          fxTap();
          onContinue?.();
        }}
        className="mt-8 h-14 px-8 rounded-2xl bg-white text-pink-600 text-display font-bold shadow-2xl"
      >
        Start Exploring ✨
      </button>
    </div>
  );
}
