import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { QuizScreen, learningCardsFor } from "@/components/screens";
import { getStateBySlug } from "@/lib/states";
import { NotFoundPlace, PlaceError } from "@/components/PlaceFallbacks";
import { getProgress, completedCategoriesCount } from "@/lib/progress";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";

export const Route = createFileRoute("/state/$slug/quiz")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();

    const progress = getProgress();
    // Use the same strict, per-sub-card completion signal the Learn Hub UI
    // shows (completedCategoriesCount / cardVisits), not the older
    // cardsDone/p.cards check - that one only required each category's
    // *main* card to have been opened once, not every sub-card in it, so
    // it could be satisfied without the state actually being complete.
    const allCards = learningCardsFor(state.name, "en", progress.ageBand);
    const alreadyCompleted = progress.completed.includes(state.name);
    if (!alreadyCompleted && completedCategoriesCount(progress, state.name, allCards) < 6) {
      // Not all categories completed yet - redirect to learn hub
      throw redirect({ to: "/state/$slug/learn", params: { slug: params.slug } });
    }

    return { name: state.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Quiz unavailable — India Explorer" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} Quiz — India Explorer`;
    const description = `Answer three fun questions about ${loaderData.name} and earn XP, badges and a passport stamp.`;
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
  component: Quiz,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function Quiz() {
  const { slug } = Route.useParams();
  const { name } = Route.useLoaderData();
  const navigate = useNavigate();

  // FIX #4: Hardware back button in quiz - back cancels quiz and goes to learn hub
  // Quiz progress is NOT saved when back is pressed
  useAndroidBackButton(() => {
    navigate({ to: "/state/$slug/learn", params: { slug } });
  });

  return (
    <QuizScreen
      key={slug}
      stateName={name}
      onClose={() => navigate({ to: "/state/$slug/learn", params: { slug } })}
      onDone={(quizMetrics) => {
        // finishQuiz is already called in QuizScreenContent.tsx
        // Simply navigate back to learn hub - celebration is in progress store
        navigate({ to: "/state/$slug/learn", params: { slug } });
      }}
    />
  );
}
