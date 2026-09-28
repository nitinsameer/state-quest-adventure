// Quiz screens: QuizScreen, CorrectAnswerScreen

import { useGoBack, HeaderBar } from "./shared";
import { fxTap } from "@/lib/fx";

export function QuizScreen({
  stateName,
  onClose,
  onDone,
}: {
  stateName?: string;
  onClose?: () => void;
  onDone?: () => void;
}) {
  const goBack = useGoBack();

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <HeaderBar title={`${stateName} Quiz`} onBack={true} />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🧠</div>
          <h2 className="text-display text-2xl font-extrabold">Quiz Questions</h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-sm">
            Test your knowledge about {stateName}
          </p>
          <button
            onClick={() => {
              fxTap();
              onDone?.();
            }}
            className="mt-8 h-14 px-8 rounded-2xl gradient-saffron text-white text-display font-bold shadow-lg"
          >
            Complete Quiz ✓
          </button>
        </div>
      </div>
    </div>
  );
}

export function CorrectAnswerScreen({
  message,
  onContinue,
}: {
  message?: string;
  onContinue?: () => void;
}) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-green-400 to-emerald-500 flex flex-col items-center justify-center">
      <div className="text-7xl mb-4 animate-bounce">✓</div>
      <h2 className="text-display text-3xl font-extrabold text-white text-center px-6">
        {message || "Correct!"}
      </h2>
      <button
        onClick={() => {
          fxTap();
          onContinue?.();
        }}
        className="mt-8 h-14 px-8 rounded-2xl bg-white text-green-600 text-display font-bold shadow-lg"
      >
        Continue
      </button>
    </div>
  );
}
