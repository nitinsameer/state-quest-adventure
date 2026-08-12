import { createFileRoute, notFound } from "@tanstack/react-router";
import { LearningHubScreen } from "@/components/screens";
import { getStateBySlug } from "@/lib/states";
import { NotFoundPlace, PlaceError } from "@/components/PlaceFallbacks";

export const Route = createFileRoute("/state/$slug/learn")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();
    return { name: state.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Lesson unavailable — India Explorer" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} Learning Hub — India Explorer`;
    const description = `Learn about ${loaderData.name}: capital, language, food, famous places, animals and fun facts.`;
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
  component: Hub,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function Hub() {
  const { slug } = Route.useParams();
  const { name } = Route.useLoaderData();
  return <LearningHubScreen key={slug} stateName={name} />;
}
