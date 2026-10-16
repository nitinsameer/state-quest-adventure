import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "@/components/screens";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "My Explorer Profile — India Explorer" },
      {
        name: "description",
        content: "Your explorer profile: level, XP, streak, collections and parent controls.",
      },
      { property: "og:title", content: "My Explorer Profile" },
      {
        property: "og:description",
        content: "See your level, XP and collections in India Explorer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfileScreen,
});
