import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SplashScreen } from "@/components/screens";
import { useProgress, isHydrated } from "@/lib/progress";
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
  const [isReady, setIsReady] = useState(false);

  // Immediate console logging on mount
  console.log("🎬 [Splash] Component MOUNTED");
  console.log("🎬 [Splash] useProgress returned:", { onboarded: p.onboarded, xp: p.xp });
  console.log("🎬 [Splash] isHydrated():", isHydrated());

  // Wait for hydration to complete (with 3s timeout safety limit)
  useEffect(() => {
    console.log("🎬 [Splash] useEffect running - hydration check");
    appLogger.info('splash_screen', 'Splash component rendering', { onboarded: p.onboarded, isHydrated: isHydrated() });
    
    if (isHydrated()) {
      console.log("🎬 [Splash] Hydration already complete - setting isReady=true");
      appLogger.info('splash_screen', 'Hydration already complete');
      setIsReady(true);
      return;
    }

    appLogger.info('splash_screen', 'Waiting for hydration...');
    let isMounted = true;
    const startTime = Date.now();
    const maxWaitMs = 3000; // 3s timeout

    const checkHydration = setInterval(() => {
      if (!isMounted) return;

      const elapsed = Date.now() - startTime;
      if (isHydrated()) {
        appLogger.info('splash_screen', 'Hydration complete', { elapsedMs: elapsed });
        clearInterval(checkHydration);
        setIsReady(true);
      } else if (elapsed > maxWaitMs) {
        appLogger.warn('splash_screen', 'Hydration timeout, proceeding with stale state', { elapsedMs: elapsed });
        clearInterval(checkHydration);
        setIsReady(true);
      }
    }, 50);

    return () => {
      isMounted = false;
      clearInterval(checkHydration);
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      console.log("🎬 [Splash] isReady is false, not navigating yet");
      return;
    }

    console.log("🎬 [Splash] isReady=true, scheduling navigation in 600ms");
    appLogger.info('splash_screen', 'Splash effect setup', { delay: 600 });
    const t = setTimeout(() => {
      const destination = p.onboarded ? "/home" : "/welcome";
      console.log("🎬 [Splash] ⏱️ Navigation timer fired - navigating to:", destination);
      appLogger.info('splash_screen', 'Navigating after splash', { destination, onboarded: p.onboarded, isHydrated: isHydrated() });
      navigate({ to: destination });
    }, 600);
    return () => clearTimeout(t);
  }, [navigate, p.onboarded, isReady]);

  return <SplashScreen />;
}
