import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { StateUnlockScreen } from "@/components/screens";
import { getStateBySlug, nextStateAfter } from "@/lib/states";
import { NotFoundPlace, PlaceError } from "@/components/PlaceFallbacks";

export const Route = createFileRoute("/state/$slug/unlock")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();
    const next = nextStateAfter(state.name);
    return { name: state.name, nextName: next?.name ?? state.name };
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
    const title = `${loaderData.nextName} Unlocked — India Explorer`;
    const description = `A new state is open on your journey map: ${loaderData.nextName}. Pack your bags and keep exploring India!`;
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
  component: Unlock,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function Unlock() {
  const { slug } = Route.useParams();
  const { nextName } = Route.useLoaderData();
  const navigate = useNavigate();
  return (
    <StateUnlockScreen
      key={slug}
      stateName={nextName}
      onContinue={() => navigate({ to: "/home" })}
    />
  );
}
