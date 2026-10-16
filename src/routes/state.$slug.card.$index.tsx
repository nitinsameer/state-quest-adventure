import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { LearningCardScreen } from "@/components/screens";
import { getStateBySlug } from "@/lib/states";
import { NotFoundPlace, PlaceError } from "@/components/PlaceFallbacks";

export const Route = createFileRoute("/state/$slug/card/$index")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    const index = Number(params.index);
    if (!state || !Number.isInteger(index) || index < 0 || index > 5) throw notFound();
    return { name: state.name, index };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Card unavailable — India Explorer" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} Learning Card ${loaderData.index + 1} — India Explorer`;
    const description = `Learning card ${loaderData.index + 1} of 6 about ${loaderData.name}: read it, tap next and get quiz-ready.`;
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
  component: Card,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function Card() {
  const { slug } = Route.useParams();
  const { name, index } = Route.useLoaderData();
  const navigate = useNavigate();
  console.log("[CardRoute] Card component rendering with:", { slug, name, index });
  return (
    <LearningCardScreen
      key={`${slug}-${index}`}
      stateName={name}
      cardIndex={index}
      onClose={() => {
        console.log("[CardRoute] onClose - navigating back to learn hub");
        navigate({ to: "/state/$slug/learn", params: { slug } });
      }}
      onNext={(next) => {
        if (next === null) {
          console.log("[CardRoute] onNext with null - going to quiz");
          navigate({ to: "/state/$slug/quiz", params: { slug } });
        } else {
          console.log("[CardRoute] onNext with index:", next, "- going to next card");
          navigate({ to: "/state/$slug/card/$index", params: { slug, index: String(next) } });
        }
      }}
    />
  );
}
