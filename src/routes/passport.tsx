import { createFileRoute } from "@tanstack/react-router";
import { PassportScreen } from "@/components/screens";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "My Passport — India Explorer" },
      {
        name: "description",
        content: "Every state and union territory you have completed, stamped into your explorer passport.",
      },
      { property: "og:title", content: "Explorer Passport" },
      { property: "og:description", content: "Collect a passport stamp for every Indian state you master." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassportScreen,
});
