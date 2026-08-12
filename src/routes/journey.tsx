import { createFileRoute } from "@tanstack/react-router";
import { JourneyMapScreen } from "@/components/screens";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "India Journey Map — India Explorer" },
      {
        name: "description",
        content:
          "Follow the journey path through all 28 Indian states and 8 union territories, unlocking one place at a time.",
      },
      { property: "og:title", content: "India Journey Map" },
      { property: "og:description", content: "A Duolingo-style path across every Indian state and union territory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JourneyMapScreen,
});
