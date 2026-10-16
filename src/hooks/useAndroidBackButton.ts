import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useRouter } from "@tanstack/react-router";

/**
 * Hook to handle Android hardware back button.
 *
 * Navigation behavior:
 * 1. On home/welcome/root: exit the app
 * 2. For routes with internal state (like /journey): use onJourneyBack callback to handle internal navigation
 * 3. For all other routes: use router.history.back() to navigate to previous route
 *
 * The onJourneyBack callback allows screens to manage their own back behavior before falling back to route history.
 * Example: Journey map screen with card → hub → intro → map internal states.
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

        // For all other routes: navigate back through browser history
        // This works because TanStack Router tracks history for all route changes
        if (router.history.length > 1) {
          router.history.back();
        } else {
          // Fallback: if no history, go to home
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
