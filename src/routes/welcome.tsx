import { createFileRoute } from "@tanstack/react-router";
import { WelcomeScreen } from "@/components/screens";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome, Explorer! — India Explorer" },
      {
        name: "description",
        content:
          "Start your journey across India: collect stamps, earn badges and become the ultimate young explorer.",
      },
      { property: "og:title", content: "Welcome to India Explorer" },
      {
        property: "og:description",
        content: "Begin an epic kid-friendly journey across India's states and union territories.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomeScreen,
});
