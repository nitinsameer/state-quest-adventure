import { createFileRoute } from "@tanstack/react-router";
import { CreateProfileScreen } from "@/components/screens";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create Your Explorer — India Explorer" },
      {
        name: "description",
        content:
          "Pick an avatar, choose your explorer name and age, and start travelling across India.",
      },
      { property: "og:title", content: "Create Your Explorer" },
      {
        property: "og:description",
        content: "Set up your young explorer profile in India Explorer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateProfileScreen,
});
