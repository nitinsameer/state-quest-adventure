import { createFileRoute } from "@tanstack/react-router";
import { CreateProfileScreen } from "@/components/screens";
import { getProgress } from "@/lib/progress";

export const Route = createFileRoute("/create")({
  beforeLoad: async ({ navigate }) => {
    // CRITICAL FIX #1: Prevent re-entry to age selection after onboarding
    // If user is already onboarded, they shouldn't be able to re-access /create
    const progress = getProgress();
    if (progress.onboarded) {
      navigate({ to: "/home" });
    }
  },
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
