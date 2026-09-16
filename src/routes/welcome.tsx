import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { WelcomeScreen } from "@/components/screens";
import { useProgress } from "@/lib/progress";

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
  component: WelcomeRoute,
});

function WelcomeRoute() {
  const navigate = useNavigate();
  const p = useProgress();

  // Redirect returning customers to home
  useEffect(() => {
    if (p.onboarded) {
      navigate({ to: "/home" });
    }
  }, [p.onboarded, navigate]);

  return <WelcomeScreen />;
}
