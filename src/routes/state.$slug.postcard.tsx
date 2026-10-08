import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { StatePostcardScreen } from "@/components/PostcardScreen";
import { getStateBySlug } from "@/lib/states";
import { NotFoundPlace, PlaceError } from "@/components/PlaceFallbacks";
import { getProgress } from "@/lib/progress";

export const Route = createFileRoute("/state/$slug/postcard")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();

    const progress = getProgress();
    if (!progress.completed.includes(state.name)) {
      console.warn("[PostcardRoute] Guard check failed, redirecting — state not completed");
      throw redirect({ to: "/state/$slug/", params: { slug: params.slug } });
    }

    return { name: state.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Postcard unavailable — India Explorer" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} Postcard — India Explorer`;
    const description = `Save and share your ${loaderData.name} explorer postcard with the badge you just earned and a fun fact.`;
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
  component: Postcard,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function Postcard() {
  const { slug } = Route.useParams();
  const { name } = Route.useLoaderData();
  const navigate = useNavigate();
  return (
    <StatePostcardScreen
      key={slug}
      stateName={name}
      onHome={() => navigate({ to: "/home" })}
      onNextState={() => navigate({ to: "/state/$slug/unlock", params: { slug } })}
    />
  );
}
