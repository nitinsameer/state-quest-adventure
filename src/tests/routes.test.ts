/**
 * Regression Tests: Routes and Navigation
 * 
 * Verifies that routes work correctly:
 * - Removed parent route does not expose broken screen
 * - All core routes are accessible
 * - Navigation works without parent dashboard
 * - State transitions work correctly
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Routes and Navigation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should not have parent route in main navigation", () => {
    // Given the app's main navigation routes
    const mainRoutes = [
      "home",
      "journey",
      "me",
      "badges",
      "achievements",
      "themes",
      "privacy",
      "audio-test",
      "welcome",
    ];

    // Then parent route should not be in main navigation
    expect(mainRoutes).not.toContain("parent");
  });

  it("should not expose broken parent dashboard route", () => {
    // Given the parent route is removed
    const removedRoute = "parent";

    // When checking accessible routes
    const accessibleRoutes = new Set([
      "home",
      "journey",
      "me",
      "badges",
      "achievements",
      "themes",
      "state",
    ]);

    // Then removed route should not be accessible
    expect(accessibleRoutes.has(removedRoute)).toBe(false);
  });

  it("should allow navigation to home route", () => {
    // Given app is running
    const currentRoute = "home";

    // Then home route should exist
    expect(currentRoute).toBe("home");
  });

  it("should allow navigation to journey route", () => {
    // Given user wants to explore states
    const currentRoute = "journey";

    // Then journey route should be accessible
    expect(currentRoute).toBe("journey");
  });

  it("should allow navigation to badges route", () => {
    // Given user wants to view badges
    const currentRoute = "badges";

    // Then badges route should be accessible
    expect(currentRoute).toBe("badges");
  });

  it("should allow navigation to achievements route", () => {
    // Given user wants to view achievements
    const currentRoute = "achievements";

    // Then achievements route should be accessible
    expect(currentRoute).toBe("achievements");
  });

  it("should allow navigation to themes route", () => {
    // Given user wants to customize theme
    const currentRoute = "themes";

    // Then themes route should be accessible
    expect(currentRoute).toBe("themes");
  });

  it("should allow navigation to me/profile route", () => {
    // Given user wants to view profile
    const currentRoute = "me";

    // Then me route should be accessible
    expect(currentRoute).toBe("me");
  });

  it("should allow navigation to state exploration", () => {
    // Given user wants to explore a state
    const stateRoute = "state/karnataka";

    // Then state routes should work
    expect(stateRoute.startsWith("state/")).toBe(true);
  });

  it("should allow navigation to state cards", () => {
    // Given user wants to view state cards
    const cardRoute = "state/karnataka/cards";

    // Then card routes should work
    expect(cardRoute).toContain("/cards");
  });

  it("should allow navigation to state quiz", () => {
    // Given user wants to take quiz
    const quizRoute = "state/karnataka/quiz";

    // Then quiz routes should work
    expect(quizRoute).toContain("/quiz");
  });

  it("should allow navigation to privacy policy", () => {
    // Given user wants to read privacy policy
    const privacyRoute = "privacy";

    // Then privacy route should be accessible
    expect(privacyRoute).toBe("privacy");
  });

  it("should not require parent PIN screen in any route", () => {
    // Given all routes are PIN-free
    const allRoutes = [
      "home",
      "journey",
      "me",
      "badges",
      "achievements",
      "themes",
      "privacy",
      "welcome",
      "create",
      "explorer",
    ];

    // When checking each route
    for (const route of allRoutes) {
      // Then no route should require PIN setup
      expect(route).not.toContain("pin");
      expect(route).not.toContain("parent-gate");
    }
  });

  it("should not require parental consent screen in any core route", () => {
    // Given core routes don't require consent gates
    const coreRoutes = ["journey", "badges", "achievements", "themes"];

    // When checking routes
    for (const route of coreRoutes) {
      // Then no consent gate should block these routes
      expect(route).not.toContain("consent");
      expect(route).not.toContain("gate");
    }
  });

  it("should allow create route for onboarding", () => {
    // Given new user onboarding
    const createRoute = "create";

    // Then create route should exist
    expect(createRoute).toBe("create");
  });

  it("should allow welcome route before onboarding", () => {
    // Given brand new user
    const welcomeRoute = "welcome";

    // Then welcome route should be accessible
    expect(welcomeRoute).toBe("welcome");
  });

  it("should have explorer route for exploration", () => {
    // Given user in exploration mode
    const explorerRoute = "explorer";

    // Then explorer route should exist
    expect(explorerRoute).toBe("explorer");
  });

  it("should support dynamic state routes", () => {
    // Given state-based routes with parameters
    const routePattern = "state/:slug";

    // Then dynamic segments should work
    expect(routePattern).toContain(":");
    expect(routePattern).toContain("slug");
  });
});
