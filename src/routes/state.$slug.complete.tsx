import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { StateCompletedScreen } from "@/components/screens";
import { getStateBySlug } from "@/lib/states";
import { statesWithProgress, setLastPlayedState } from "@/lib/progress";
import { useProgress } from "@/lib/progress";
import { PlaceError, NotFoundPlace } from "@/components/PlaceFallbacks";

export const Route = createFileRoute("/state/$slug/complete")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();
    return { name: state.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Unavailable — India Explorer" },
          { name: "robots", content: "noindex" },
        ],
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
  
  const goToPostcard = () => navigate({ to: "/state/$slug/postcard", params: { slug } });
  const goToReplay = () => navigate({ to: "/state/$slug/learn", params: { slug } });
  
  // Navigate to next uncompleted state
  const goToNextState = () => {
    const states = statesWithProgress(progress);
    // Find next uncompleted state after current
    const currentIndex = states.findIndex(s => s.name === name);
    const nextState = states.slice(currentIndex + 1).find(s => s.status !== "done");
    
    if (nextState) {
      setLastPlayedState(nextState.name);
      navigate({ to: "/state/$slug/learn", params: { slug: nextState.name.toLowerCase().replace(/\s+/g, "-") } });
    } else {
      // All states completed, go to home
      navigate({ to: "/home" });
    }
  };

  return (
    <StateCompletedScreen 
      key={slug} 
      stateName={name} 
      onContinue={goToNextState}
      onCreatePostcard={goToPostcard}
      onReplay={goToReplay}
    />
  );
}
