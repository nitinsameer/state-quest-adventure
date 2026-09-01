/**
 * Enriched Learning Cards Route
 * Shows all 6 enhanced cards for a state with TTS narration
 */

import { createFileRoute, notFound } from "@tanstack/react-router";
import { EnrichedCardScreen } from "@/components/EnrichedCardScreen";
import { getStateBySlug } from "@/lib/states";
import { NotFoundPlace, PlaceError } from "@/components/PlaceFallbacks";

interface EnrichedCardsLoaderData {
  name: string;
  slug: string;
}

export const Route = createFileRoute("/state/$slug/cards")({
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const data = loaderData as EnrichedCardsLoaderData;
    const title = `${data.name} Learning Cards — India Explorer`;
    const description = `Explore interactive learning cards for ${data.name} with fun facts, TTS narration, and games.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
      ],
    };
  },
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) {
      throw notFound();
    }
    return {
      name: state.name,
      slug: params.slug,
    } as EnrichedCardsLoaderData;
  },
  component: EnrichedCardsPage,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function EnrichedCardsPage() {
  const data = Route.useLoaderData() as EnrichedCardsLoaderData;
  return <EnrichedCardScreen stateName={data.name} />;
}
