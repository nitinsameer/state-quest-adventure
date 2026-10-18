import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useRouter } from "@tanstack/react-router";

/**
 * Hook to handle Android hardware back button.
 *
 * Navigation behavior (in priority order):
 * 1. On home/welcome/root: exit the app
 * 2. For routes with custom back handlers (like /journey, /complete): use provided callback
 * 3. For state-based routes (/state/:slug/*): use smart route-aware navigation (FIX #2)
 * 4. For all other routes: use router.history.back() as fallback
 *
 * FIX #2: Smart back navigation prevents confusing history-based back in branching routes.
 * Example: /state/delhi/quiz → back should go to /state/delhi (state intro), not quiz history.
 */
export function useAndroidBackButton(onJourneyBack?: () => void) {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let unlistener: (() => void) | null = null;

    const setupListener = async () => {
      const listenerHandle = await App.addListener("backButton", async () => {
        const currentPath = router.state.location.pathname;

        // Exit app on home/welcome/root screens
        if (currentPath === "/" || currentPath === "/home" || currentPath === "/welcome") {
          await App.exitApp();
          return;
        }

        // Journey-specific: handle internal state navigation before route history
        if (currentPath === "/journey" && onJourneyBack) {
          onJourneyBack();
          return; // Exit here - let onJourneyBack decide what to do
        }

        // FIX #2: Smart route-aware back navigation
        // Prevents confusing history-based back in branching state routes

        // If on a completion/celebration screen: go home
        if (currentPath.includes("/state/") && currentPath.endsWith("/complete")) {
          router.navigate({ to: "/home" });
          return;
        }

        // If in any state sub-route (quiz, learn, cards, postcard, etc.): go to state intro
        if (currentPath.includes("/state/")) {
          const segments = currentPath.split("/");
          const slug = segments[2]; // e.g. '/state/delhi/quiz' → 'delhi'
          if (slug) {
            router.navigate({ to: "/state/$slug", params: { slug } });
            return;
          }
        }

        // Fallback: browser history or home
        if (router.history.length > 1) {
          router.history.back();
        } else {
          router.navigate({ to: "/home" });
        }
      });

      unlistener = () => listenerHandle.remove();
    };

    setupListener();

    return () => {
      unlistener?.();
    };
  }, [router, onJourneyBack]);
}
