import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { StateCompletedScreen } from "@/components/screens";
import { getStateBySlug } from "@/lib/states";
import { NotFoundPlace, PlaceError } from "@/components/PlaceFallbacks";

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
  const goNext = () => navigate({ to: "/state/$slug/postcard", params: { slug } });

  // Removed auto-advance timer - kids now have agency to continue when ready
  // onContinue button is triggered manually by child/parent

  return <StateCompletedScreen key={slug} stateName={name} onContinue={goNext} />;
}
