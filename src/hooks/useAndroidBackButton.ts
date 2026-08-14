import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useRouter } from "@tanstack/react-router";

/**
 * Hook to handle Android hardware back button.
 * Navigates back through the app's route history on non-home screens.
 * On home screen (/), exits the app.
 */
export function useAndroidBackButton() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const backButtonListener = App.addListener("backButton", async () => {
      const currentPath = router.state.location.pathname;

      // Home screen: close the app
      if (currentPath === "/" || currentPath === "/home" || currentPath === "/welcome") {
        await App.exitApp();
        return;
      }

      // Non-home: navigate back
      router.history.back();
    });

    return () => {
      backButtonListener.remove();
    };
  }, [router]);
}
