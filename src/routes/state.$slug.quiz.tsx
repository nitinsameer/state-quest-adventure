import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { QuizScreen } from "@/components/screens";
import { getStateBySlug } from "@/lib/states";
import { NotFoundPlace, PlaceError } from "@/components/PlaceFallbacks";

export const Route = createFileRoute("/state/$slug/quiz")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();
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
  return (
    <QuizScreen
      key={slug}
      stateName={name}
      onClose={() => navigate({ to: "/state/$slug/learn", params: { slug } })}
      onDone={() => navigate({ to: "/state/$slug/complete", params: { slug } })}
    />
  );
}
