import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getStateBySlug, stateSlug } from "@/lib/states";
import { PlaceError, NotFoundPlace } from "@/components/PlaceFallbacks";
import { getProgress, statesWithProgress } from "@/lib/progress";

export const Route = createFileRoute("/state/$slug/quiz-done")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();

    // Guard: only reachable once the state has actually been completed
    const progress = getProgress();
    if (!progress.completed.includes(state.name)) {
      throw redirect({ to: "/state/$slug/learn", params: { slug: params.slug } });
    }

    return { name: state.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — India Explorer" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} Complete! — India Explorer`;
    const description = `Awesome work! You completed the ${loaderData.name} quiz.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: QuizDoneScreen,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function QuizDoneScreen() {
  const { slug } = Route.useParams();
  const { name: stateName } = Route.useLoaderData();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  // Simple animation trigger
  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleReplay = () => {
    navigate({ to: "/state/$slug/learn", params: { slug } });
  };

  const handleNext = () => {
    const progress = getProgress();
    const states = statesWithProgress(progress);
    const currentIndex = states.findIndex((s) => s.name === stateName);
    const nextState = states.slice(currentIndex + 1).find((s) => s.status !== "done");

    if (nextState) {
      navigate({
        to: "/state/$slug/learn",
        params: { slug: stateSlug(nextState.name) },
      });
    } else {
      navigate({ to: "/journey" });
    }
  };

  const handleHome = () => {
    navigate({ to: "/home" });
  };

  return (
    <div className="h-screen w-full bg-surface-card flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Celebration container */}
      <div
        className={`text-center transition-all duration-700 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Celebration emoji */}
        <div className="text-8xl mb-6 animate-bounce">🎉</div>

        {/* Main heading */}
        <h1 className="text-4xl font-black text-display mb-4">Awesome Work!</h1>

        {/* Subheading */}
        <p className="text-lg text-text-secondary mb-8 max-w-xs">
          You completed {stateName} and earned your passport stamp 🏷️
        </p>

        {/* Buttons container */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {/* Primary: Replay/Review */}
          <button
            onClick={handleReplay}
            className="h-14 rounded-2xl bg-accent-3 text-text-on-accent font-bold text-h4 active:scale-95 transition-transform shadow-md"
          >
            Replay {stateName}
          </button>

          {/* Secondary: Next state */}
          <button
            onClick={handleNext}
            className="h-14 rounded-2xl bg-accent-2 text-text-on-accent font-bold text-h4 active:scale-95 transition-transform shadow-md"
          >
            Continue Journey →
          </button>

          {/* Tertiary: Home */}
          <button
            onClick={handleHome}
            className="h-14 rounded-2xl border-2 border-accent-1 text-accent-1 font-bold text-h4 active:scale-95 transition-transform"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
