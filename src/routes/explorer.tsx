import { createFileRoute } from "@tanstack/react-router";
import { PassportScreen } from "@/components/screens";

export const Route = createFileRoute("/explorer")({
  head: () => ({
    meta: [
      { title: "My Stamps — India Explorer" },
      {
        name: "description",
        content: "Every state and union territory you have completed, collected as stamps.",
      },
      { property: "og:title", content: "My Stamps" },
      { property: "og:description", content: "Collect stamps for every Indian state you master." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassportScreen,
});
