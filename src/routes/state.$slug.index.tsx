import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { StateIntroScreen } from "@/components/screens";
import { getStateBySlug } from "@/lib/states";
import { NotFoundPlace, PlaceError } from "@/components/PlaceFallbacks";

export const Route = createFileRoute("/state/$slug/")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();
    return { name: state.name, capital: state.capital };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Place unavailable — India Explorer" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — India Explorer`;
    const description = `Meet ${loaderData.name}, capital ${loaderData.capital}. Learn its language, food, animals and landmarks, then take the quiz.`;
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
  component: Intro,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function Intro() {
  const { slug } = Route.useParams();
  const { name } = Route.useLoaderData();
  const navigate = useNavigate();
  return (
    <StateIntroScreen
      key={slug}
      stateName={name}
      onBack={() => navigate({ to: "/journey" })}
      onContinue={() => navigate({ to: "/state/$slug/learn", params: { slug } })}
    />
  );
}
