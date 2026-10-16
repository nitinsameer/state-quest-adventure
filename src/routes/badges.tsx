import { createFileRoute } from "@tanstack/react-router";
import { BadgesScreen } from "@/components/screens";

export const Route = createFileRoute("/badges")({
  head: () => ({
    meta: [
      { title: "Badge Collection — India Explorer" },
      {
        name: "description",
        content:
          "Monument, animal and explorer badges earned across India's states and union territories.",
      },
      { property: "og:title", content: "Badge Collection" },
      {
        property: "og:description",
        content: "Earn three badges for every place you explore in India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BadgesScreen,
});
