import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getStateBySlug } from "@/lib/states";
import { PlaceError, NotFoundPlace } from "@/components/PlaceFallbacks";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { useEffect, useState } from "react";
import { EMOJI } from "@/lib/emoji";

export const Route = createFileRoute("/state/$slug/quiz-done")({
  head: ({ params }) => {
    const state = getStateBySlug(params.slug);
    const stateName = state?.name || "Quiz";
    const title = `${stateName} Complete! — India Explorer`;
    const description = `Awesome work! You completed the ${stateName} quiz. Earn your passport stamp and badges.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: QuizDone,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function QuizDone() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [animateIn, setAnimateIn] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Android back button: go to home
  useAndroidBackButton(() => {
    navigate({ to: "/home" });
  });

  const state = getStateBySlug(slug);
  const stateName = state?.name || "State";

  const handleContinue = () => {
    navigate({ to: "/state/$slug/learn", params: { slug } });
  };

  const handleHome = () => {
    navigate({ to: "/home" });
  };

  const handleNextState = () => {
    navigate({ to: "/journey" });
  };

  return (
    <div className="h-screen w-full bg-surface-card flex flex-col items-center justify-center overflow-hidden relative">
      {/* Confetti-like background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 rounded-full opacity-0 ${
              i % 3 === 0
                ? "bg-accent-2"
                : i % 3 === 1
                  ? "bg-accent-3"
                  : "bg-accent-4"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: animateIn
                ? `pop-burst ${0.6 + i * 0.05}s ease-out forwards`
                : "none",
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 text-center px-6 max-w-sm transition-all duration-700 ${
          animateIn
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
      >
        {/* Celebration Emoji */}
        <div className="text-8xl mb-6 inline-block animate-bounce">
          {EMOJI.celebration.confetti}
        </div>

        {/* Main Heading */}
        <h1 className="text-h1 text-4xl font-black text-display mb-2">
          Awesome Work!
        </h1>

        {/* Subheading */}
        <p className="text-h4 text-text-secondary mb-6">
          You completed {stateName}
          <br />
          and earned your passport stamp {EMOJI.action.stamp}
        </p>

        {/* Achievement Summary */}
        <div className="bg-accent-3-soft/50 rounded-2xl p-6 mb-8 border-2 border-accent-3">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-black text-accent-3 mb-1">+300</div>
              <div className="text-xs font-bold text-text-secondary uppercase">XP Earned</div>
            </div>
            <div className="w-px h-12 bg-accent-3/30" />
            <div className="text-center">
              <div className="text-3xl mb-1">{EMOJI.action.star}</div>
              <div className="text-xs font-bold text-text-secondary uppercase">Badge Unlocked</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          {/* Continue/Replay Button */}
          <button
            onClick={handleContinue}
            className="w-full h-14 rounded-2xl bg-accent-3 text-text-on-accent font-bold text-h4 active:scale-95 transition-transform"
          >
            Replay {stateName}
          </button>

          {/* Next State / Journey Button */}
          <button
            onClick={handleNextState}
            className="w-full h-14 rounded-2xl bg-accent-2 text-text-on-accent font-bold text-h4 active:scale-95 transition-transform"
          >
            Continue Journey →
          </button>

          {/* Home Button */}
          <button
            onClick={handleHome}
            className="w-full h-14 rounded-2xl border-2 border-accent-1 text-accent-1 font-bold text-h4 active:scale-95 transition-transform"
          >
            Back to Home
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pop-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(${Math.cos(Math.random() * Math.PI * 2) * 100}px),
              calc(${Math.sin(Math.random() * Math.PI * 2) * 100}px)
            )
            scale(0);
          }
        }
      `}</style>
    </div>
  );
}
