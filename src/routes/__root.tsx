import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import React from "react";
import { App } from "@capacitor/app";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useAndroidBackButton } from "../hooks/useAndroidBackButton";
import { getJourneyBackHandler } from "../lib/journeyBackHandler";
import { Toaster } from "@/components/ui/sonner";
import { UnlockCelebration } from "@/components/UnlockCelebration";
import { CelebrationPopupProvider } from "@/components/CelebrationPopup";
import { BottomToastProvider } from "@/components/BottomToast";
import { DebugScreen } from "@/components/DebugScreen";
import { BottomNav } from "@/components/screens";
import { appLogger } from "@/lib/logger";
import { firebaseEvents } from "@/lib/firebase-events";
import { useProgress, isHydrated } from "@/lib/progress";
import { pauseTts, resumeTts } from "@/lib/tts";
import { ensureAudioConsentGranted, hasFeatureConsent, subscribeConsentChanges } from "@/lib/parental-consent";
import { cleanupAudioContext } from "@/lib/fx";
import { enableAnalyticsAfterConsent, disableAnalyticsAfterConsentRevoked } from "@/lib/firebase-init";
import { Capacitor } from "@capacitor/core";

// React Error Boundary for catching runtime errors
// FIX #2: Enhanced error boundary with better error recovery and logging
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorCount: number }
> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
    appLogger.info('root_error_boundary', 'RootErrorBoundary mounted');
  }

  static getDerivedStateFromError(error: Error) {
    appLogger.error('root_error_boundary', 'getDerivedStateFromError called', { errorMessage: error.message }, error);
    return (prevState: any) => ({
      hasError: true,
      error,
      errorCount: (prevState?.errorCount || 0) + 1,
    });
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    appLogger.error('root_error_boundary', 'componentDidCatch called', { errorInfo }, error);
    console.error("RootErrorBoundary caught error:", error, errorInfo);
    
    // Report to error tracking service
    reportLovableError(error, { boundary: "root_error_boundary", errorInfo });
    
    // Try to report to Firebase if available
    try {
      firebaseEvents.crash({
        errorType: 'RootErrorBoundary',
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    } catch {
      // Firebase not available
    }
    
    // Auto-recover after 5 seconds if error count is low (transient errors)
    if (this.state.errorCount < 3) {
      this.resetTimeoutId = setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 5000);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    appLogger.debug('root_error_boundary', 'render called', { hasError: this.state.hasError });
    
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
          <div className="max-w-md text-center">
            {/* Error Icon */}
            <div className="text-6xl mb-4">💥</div>
            
            <h1 className="text-2xl font-bold text-ink">
              App encountered an error
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Something unexpected happened. Let's try reloading the app!
            </p>

            {/* Error Details */}
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Error details (for debugging)
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs text-foreground font-mono max-h-[150px]">
                {this.state.error?.stack}
              </pre>
            </details>

            {/* Error Recovery Status */}
            {this.state.errorCount < 3 && (
              <p className="mt-4 text-xs text-muted-foreground animate-pulse">
                ⏳ Auto-recovering in a few seconds...
              </p>
            )}

            {/* Action Button */}
            <div className="mt-8">
              <button
                onClick={() => window.location.reload()}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold text-lg shadow-lg transition-all hover:shadow-xl active:scale-95"
              >
                🔄 Reload App
              </button>
            </div>

            {/* Reassuring message */}
            <p className="mt-6 text-xs text-muted-foreground">
              Your progress is saved! 💾
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-md text-center">
        {/* Error Icon */}
        <div className="text-6xl mb-4">⚠️</div>
        
        <h1 className="text-2xl font-bold text-ink">
          Oops! Something went wrong
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          The page didn't load properly. Don't worry—just try again or go back home!
        </p>
        
        {/* Debug info (small, for parents/developers) */}
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Error details (for debugging)
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs text-foreground font-mono max-h-[150px]">
            {error?.message}
          </pre>
        </details>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold text-lg shadow-lg transition-all hover:shadow-xl active:scale-95"
          >
            🔄 Try Again
          </button>
          <a
            href="/"
            className="w-full h-14 rounded-2xl bg-white border-2 border-blue-200 text-blue-600 font-bold text-lg flex items-center justify-center transition-all hover:bg-blue-50 active:scale-95"
          >
            🏠 Go Home
          </a>
        </div>

        {/* Reassuring message */}
        <p className="mt-6 text-xs text-muted-foreground">
          If this keeps happening, talk to an adult about what's going on! 👋
        </p>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "India Explorer — Travel Across India, One State at a Time" },
      { name: "description", content: "A kids adventure app that teaches Indian states through exploration, quizzes, passport stamps and badges." },
      { name: "author", content: "India Explorer" },
      { property: "og:title", content: "India Explorer — Travel Across India, One State at a Time" },
      { property: "og:description", content: "A kids adventure app that teaches Indian states through exploration, quizzes, passport stamps and badges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "India Explorer — Travel Across India, One State at a Time" },
      { name: "twitter:description", content: "A kids adventure app that teaches Indian states through exploration, quizzes, passport stamps and badges." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/023f343d-c8a3-4545-965b-70c6731973fa/id-preview-55bc3492--e756e1b4-32bb-4081-85f6-698df446f49e.lovable.app-1784188463257.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/023f343d-c8a3-4545-965b-70c6731973fa/id-preview-55bc3492--e756e1b4-32bb-4081-85f6-698df446f49e.lovable.app-1784188463257.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap",
      },
    ],
  }),
  // SPA mode: no shellComponent (no SSR HTML wrapper)
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const progress = useProgress();

  // Pre-auth routes that should NOT show BottomNav
  const preAuthRoutes = ['/', '/welcome', '/create'];

  // Immediate logging on component mount
  console.log("🚀 [RootComponent] MOUNTED - location.pathname:", location.pathname);
  console.log("🚀 [RootComponent] progress.onboarded:", progress.onboarded);
  console.log("🚀 [RootComponent] document.readyState:", typeof document !== "undefined" ? document.readyState : "N/A");
  console.log("🚀 [RootComponent] window.location:", typeof window !== "undefined" ? window.location.href : "N/A");

  // Initialize and verify Sound toggle state on app load
  useEffect(() => {
    const SOUND_KEY = "india-explorer:sound:v1";
    const soundState = localStorage.getItem(SOUND_KEY);
    const isSoundOn = soundState === "1";

    // If not set, ensure default is initialized to ON (sound enabled by default)
    if (soundState === null) {
      localStorage.setItem(SOUND_KEY, "1");
    }
  }, []);

  // Initialize audio consent on app startup
  // Note: Don't check isHydrated() - audio consent is independent of progress hydration
  // Audio consent lives in parental-consent system, progress hydration shouldn't block it
  useEffect(() => {
    ensureAudioConsentGranted();
  }, []);

  // COPPA-compliant: Log Firebase events after user is onboarded
  // Permissions are now deferred (requested when features are used)
  useEffect(() => {
    if (!progress.onboarded) {
      return;
    }

    // User is onboarded - log session/analytics (delay to not block initial render)
    const isReturningUser = true; // If onboarded, they're returning

    // Defer Firebase events until after initial render completes
    setTimeout(() => {
      firebaseEvents.sessionStart({
        ageBand: progress.ageBand,
        isReturningUser,
      });

      // Track daily visit and streak
      firebaseEvents.dailyVisit({
        ageBand: progress.ageBand,
        streak: progress.streak,
        daysActive: Object.keys(progress.stamps ?? {}).length,
        totalXp: progress.xp,
      });

      // Track streak milestones
      const milestonesToCheck = [3, 7, 14, 30];
      if (milestonesToCheck.includes(progress.streak)) {
        firebaseEvents.streakMilestone(progress.streak);
      }
    }, 500); // Defer by 500ms to avoid blocking initial render
  }, [progress.onboarded, progress]);
  
  // Get the journey back handler dynamically so it always calls the current one
  const handleAndroidBack = () => {
    const handler = getJourneyBackHandler();
    if (handler) {
      handler();
    }
  };

  useAndroidBackButton(handleAndroidBack);
  
  appLogger.info('root_component', 'RootComponent rendering', { pathname: location.pathname });

  const shouldShowBottomNav = !preAuthRoutes.includes(location.pathname);

  // Determine which tab is active based on current pathname
  const getActiveTab = (): "home" | "map" | "passport" | "badges" | "profile" => {
    const path = location.pathname;
    if (path.startsWith("/journey")) return "map";
    if (path.startsWith("/explorer")) return "explorer";
    if (path.startsWith("/badges")) return "badges";
    if (path.startsWith("/me")) return "profile";
    return "home"; // Default for /home or root
  };
  
  // Pre-auth routes should use pb-safe only (no extra padding)
  // Authenticated routes need pb-[120px] to ensure content scrolls above BottomNav
  const isPreAuthRoute = preAuthRoutes.includes(location.pathname);
  const scrollContainerPadding = isPreAuthRoute ? 'pb-safe' : 'pb-[80px]';

  // Monitor localStorage for consent changes (from dialog)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Consent changes handled by parental-consent system
      // No action needed here - component will re-render automatically
    };
    
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [location.pathname]);

  // Start ambient music only on home/authenticated routes after user consents
  // Do NOT start on splash/welcome/create screens
  // Also set up app lifecycle listeners for pause/resume
  useEffect(() => {
    // Only start ambient on authenticated routes (home, state exploration, etc.)
    // Pre-auth routes should remain silent
    const isAuthenticatedRoute = !preAuthRoutes.includes(location.pathname);
    
    // Ambient audio disabled - background music removed

    // Listen for app pause (minimized)
    const pauseListener = App.addListener('pause', () => {
      appLogger.info('app_lifecycle', 'App paused');
      pauseTts();
      // FIX #4: Clean up audio context when app pauses to prevent memory leaks
      cleanupAudioContext();
    });

    // Listen for app resume (brought to foreground)
    const resumeListener = App.addListener('resume', () => {
      appLogger.info('app_lifecycle', 'App resumed');
      resumeTts();
    });

    // Cleanup listeners on unmount or route change
    return () => {
      pauseListener.remove();
      resumeListener.remove();
      // FIX #4: Clean up audio on component unmount
      cleanupAudioContext();
    };
  }, [location.pathname]);

  // FIX #27: Monitor analytics consent changes and enable/disable Firebase accordingly
  useEffect(() => {
    // Check if analytics consent is already granted
    if (hasFeatureConsent('analytics')) {
      enableAnalyticsAfterConsent();
    }
    
    // Subscribe to analytics consent changes
    const unsubscribe = subscribeConsentChanges('analytics', () => {
      if (hasFeatureConsent('analytics')) {
        enableAnalyticsAfterConsent();
      } else {
        disableAnalyticsAfterConsentRevoked();
      }
    });
    
    return () => unsubscribe();
  }, []);

  const innerComponent = (
    <QueryClientProvider client={queryClient}>
      <div className="h-full w-full flex flex-col bg-[#F7F5F0] relative" suppressHydrationWarning>
        {/* Scrollable content area - conditional padding: pb-safe for pre-auth, pb-[120px] for authenticated */}
        <div className={`flex-1 overflow-auto pt-safe px-safe ${scrollContainerPadding}`} suppressHydrationWarning>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </div>
      </div>
      
      {/* Global BottomNav - positioned fixed OUTSIDE flex container to prevent flex layout interference */}
      {shouldShowBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-20 pb-safe">
          <BottomNav active={getActiveTab()} />
        </div>
      )}
      
      <UnlockCelebration />
      <CelebrationPopupProvider />
      <BottomToastProvider />
      {/* FIX #19: Debug screen only in development mode */}
      {import.meta.env.DEV && <DebugScreen />}
    </QueryClientProvider>
  );

  return (
    <RootErrorBoundary>
      {innerComponent}
    </RootErrorBoundary>
  );
}