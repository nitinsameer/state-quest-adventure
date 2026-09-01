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

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useAndroidBackButton } from "../hooks/useAndroidBackButton";
import { Toaster } from "@/components/ui/sonner";
import { UnlockCelebration } from "@/components/UnlockCelebration";
import { DebugScreen } from "@/components/DebugScreen";
import { BottomNav } from "@/components/screens";
import { appLogger } from "@/lib/logger";

// React Error Boundary for catching runtime errors
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
    appLogger.info('root_error_boundary', 'RootErrorBoundary mounted');
  }

  static getDerivedStateFromError(error: Error) {
    appLogger.error('root_error_boundary', 'getDerivedStateFromError called', { errorMessage: error.message }, error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    appLogger.error('root_error_boundary', 'componentDidCatch called', { errorInfo }, error);
    console.error("RootErrorBoundary caught error:", error, errorInfo);
    reportLovableError(error, { boundary: "root_error_boundary", errorInfo });
  }

  render() {
    appLogger.debug('root_error_boundary', 'render called', { hasError: this.state.hasError });
    
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              App Error
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs text-foreground">
                {this.state.error?.stack}
              </pre>
            </details>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Reload App
              </button>
            </div>
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
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
  useAndroidBackButton();
  
  appLogger.info('root_component', 'RootComponent rendering', { pathname: location.pathname });

  // Pre-auth routes that should NOT show BottomNav
  const preAuthRoutes = ['/', '/welcome', '/create'];
  const shouldShowBottomNav = !preAuthRoutes.includes(location.pathname);
  
  // Pre-auth routes should use pb-safe only (no extra padding)
  // Authenticated routes need pb-[120px] to ensure content scrolls above BottomNav
  const isPreAuthRoute = preAuthRoutes.includes(location.pathname);
  const scrollContainerPadding = isPreAuthRoute ? 'pb-safe' : 'pb-[120px]';

  const innerComponent = (
    <QueryClientProvider client={queryClient}>
      <div className="h-full w-full flex flex-col bg-[#F7F5F0] relative">
        {/* Scrollable content area - conditional padding: pb-safe for pre-auth, pb-[120px] for authenticated */}
        <div className={`flex-1 overflow-auto pt-safe px-safe ${scrollContainerPadding}`}>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </div>
      </div>
      
      {/* Global BottomNav - positioned fixed OUTSIDE flex container to prevent flex layout interference */}
      {shouldShowBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-20 pb-safe">
          <BottomNav active="home" />
        </div>
      )}
      
      <UnlockCelebration />
      <Toaster position="top-center" richColors />
      <DebugScreen />
    </QueryClientProvider>
  );

  return (
    <RootErrorBoundary>
      {innerComponent}
    </RootErrorBoundary>
  );
}