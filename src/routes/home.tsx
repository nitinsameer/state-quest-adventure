import { createFileRoute } from "@tanstack/react-router";
import { HomeDashboardScreen } from "@/components/screens";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — India Explorer" },
      {
        name: "description",
        content: "Your explorer dashboard: XP, level, streak, badges, stamps and the next state to explore.",
      },
      { property: "og:title", content: "Explorer Dashboard — India Explorer" },
      { property: "og:description", content: "Track XP, streaks, badges and stamps as you explore India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeDashboardScreen,
});
