import { createFileRoute } from "@tanstack/react-router";
import { AchievementsScreen } from "@/components/screens";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — India Explorer" },
      {
        name: "description",
        content:
          "Milestones for states explored, badges earned, stamps collected and quiz mastery.",
      },
      { property: "og:title", content: "Achievements" },
      { property: "og:description", content: "Unlock milestones as you explore more of India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AchievementsScreen,
});
