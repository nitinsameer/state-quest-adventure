import { createFileRoute } from "@tanstack/react-router";
import { PassportScreen } from "@/components/screens";

export const Route = createFileRoute("/explorer")({
  head: () => ({
    meta: [
      { title: "My Explorer — India Explorer" },
      {
        name: "description",
        content: "Collect postcards for every state and union territory you have completed.",
      },
      { property: "og:title", content: "My Explorer" },
      { property: "og:description", content: "Collect postcards for every Indian state and union territory you master." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassportScreen,
});
