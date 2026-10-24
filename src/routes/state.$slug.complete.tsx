import { createFileRoute, notFound, useNavigate, redirect } from "@tanstack/react-router";
import { QuizCelebrationScreen } from "@/components/ceremony/QuizCelebrationScreen";
import { ThemeUnlockCelebration } from "@/components/ThemeUnlockCelebration";
import { getStateBySlug } from "@/lib/states";
import { statesWithProgress, setLastPlayedState, getProgress } from "@/lib/progress";
import { useProgress } from "@/lib/progress";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { PlaceError, NotFoundPlace } from "@/components/PlaceFallbacks";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/state/$slug/complete")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();

    // GUARD: Check that state is actually completed
    const progress = getProgress();
    if (!progress.completed.includes(state.name)) {
      // State not completed - redirect to learn hub
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
    const description = `You cleared ${loaderData.name}, earned badges and a passport stamp. Time for the next state!`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Complete,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function Complete() {
  const { slug } = Route.useParams();
  const { name } = Route.useLoaderData();
  const navigate = useNavigate();
  const progress = useProgress();
  const navigationInProgressRef = useRef(false);

  // Guard: If no pending celebration, redirect to learn
  // BUT: Don't redirect immediately if there ARE pending celebrations
  // This prevents race condition when buttons dismiss celebration while navigating
  useEffect(() => {
    if (!progress.pendingCelebrations?.length && progress.onboarded && !navigationInProgressRef.current) {
      navigationInProgressRef.current = true;
      navigate({ to: "/state/$slug/learn", params: { slug } });
    }
  }, [progress.pendingCelebrations?.length, progress.onboarded, navigate, slug]);

  // Android back button: FIX #3 - Back from celebration goes to /home, not back into quiz
  // This prevents users from going back through quiz navigation history
  useAndroidBackButton(() => {
    navigate({ to: "/home" });
  });

  const goToPostcard = () => navigate({ to: "/state/$slug/postcard", params: { slug } });
  const goToReplay = () => navigate({ to: "/state/$slug/learn", params: { slug } });

  // Navigate to next uncompleted state
  const goToNextState = () => {
    const states = statesWithProgress(progress);
    // Find next uncompleted state after current
    const currentIndex = states.findIndex((s) => s.name === name);
    const nextState = states.slice(currentIndex + 1).find((s) => s.status !== "done");

    if (nextState) {
      setLastPlayedState(nextState.name);
      navigate({
        to: "/state/$slug/learn",
        params: { slug: nextState.name.toLowerCase().replace(/\s+/g, "-") },
      });
    } else {
      // All states completed, go to journey instead of home
      navigate({ to: "/journey" });
    }
  };

  // Dispatch based on celebration type
  const pendingCelebration = progress.pendingCelebrations?.[0];

  if (!pendingCelebration) {
    return null;
  }

  if (pendingCelebration.type === "full" || pendingCelebration.type === "stars-improved") {
    return <QuizCelebrationScreen />;
  }

  if (pendingCelebration.type === "theme-unlock") {
    return (
      <ThemeUnlockCelebration
        themeId={pendingCelebration.themeId}
        themeName={pendingCelebration.themeName}
      />
    );
  }

  return null;
}
