import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SplashScreen } from "@/components/screens";
import { useProgress } from "@/lib/progress";
import { appLogger } from "@/lib/logger";

appLogger.info('route_index', 'Index route loaded');

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "India Explorer — Travel Across India, One State at a Time" },
      {
        name: "description",
        content:
          "A playful learning adventure for kids: explore all 28 Indian states and 8 union territories, take quizzes, collect passport stamps and badges.",
      },
      { property: "og:title", content: "India Explorer — Learn India, One State at a Time" },
      {
        property: "og:description",
        content:
          "Explore Indian states and union territories with quizzes, passport stamps, badges and XP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const p = useProgress();

  appLogger.info('splash_screen', 'Splash component rendering', { onboarded: p.onboarded });

  useEffect(() => {
    appLogger.info('splash_screen', 'Splash effect setup', { delay: 1600 });
    const t = setTimeout(() => {
      const destination = p.onboarded ? "/home" : "/welcome";
      appLogger.info('splash_screen', 'Navigating after splash', { destination });
      navigate({ to: destination });
    }, 1600);
    return () => clearTimeout(t);
  }, [navigate, p.onboarded]);

  return <SplashScreen />;
}
