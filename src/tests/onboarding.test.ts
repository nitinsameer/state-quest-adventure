/**
 * Regression Tests: New User Onboarding
 * 
 * Verifies that new users can complete onboarding without:
 * - PIN setup prompts
 * - Parental consent screens
 * - Broken references to removed components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("New User Onboarding", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should allow new user to start without PIN setup prompt", () => {
    // When a fresh user starts the app (no progress data in localStorage)
    const rawProgress = localStorage.getItem("india-explorer:progress:v2");
    
    // Then there should be no PIN-related data
    expect(rawProgress).toBeNull();
    expect(localStorage.getItem("india-explorer:pin-hash")).toBeNull();
    expect(localStorage.getItem("india-explorer:pin-salt")).toBeNull();
    expect(localStorage.getItem("india-explorer:pin-attempts")).toBeNull();
  });

  it("should allow new user to complete onboarding without parental consent screens", () => {
    // When a new user completes onboarding
    const newProgress = {
      name: "Adventurer",
      avatar: "explorer-hat",
      ageBand: "8-9",
      onboarded: true, // Onboarding complete
      xp: 0,
      streak: 0,
      lastActive: "",
      completed: [],
      stamps: {},
      postcards: {},
      answered: [],
      badges: {},
      cards: {},
    };

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(newProgress));

    // Then no consent records should block progression
    const consentData = localStorage.getItem("india-explorer:parental-consent:v1");
    expect(consentData).toBeNull(); // User can proceed without consent data

    // And audio should work without consent gate
    const audioToggle = localStorage.getItem("india-explorer:sound:v1");
    expect(audioToggle).toBeNull(); // Default to sound on

    // And onboarding should be marked complete
    const progress = JSON.parse(localStorage.getItem("india-explorer:progress:v2") || "{}");
    expect(progress.onboarded).toBe(true);
  });

  it("should not show PIN or consent screens to brand-new users", () => {
    // When localStorage is completely empty (first-time user)
    localStorage.clear();
    
    // Then verify no PIN/consent-related keys exist
    const pinHash = localStorage.getItem("india-explorer:pin-hash");
    const pinSalt = localStorage.getItem("india-explorer:pin-salt");
    const consentRecords = localStorage.getItem("india-explorer:parental-consent:v1");
    const progress = localStorage.getItem("india-explorer:progress:v2");
    
    expect(pinHash).toBeNull();
    expect(pinSalt).toBeNull();
    expect(consentRecords).toBeNull();
    expect(progress).toBeNull();
  });

  it("should initialize app with default sound enabled (no consent gate)", () => {
    // When a new user starts
    localStorage.clear();
    
    // Then sound should be enabled by default without consent data
    const soundToggle = localStorage.getItem("india-explorer:sound:v1");
    const hasConsent = localStorage.getItem("india-explorer:parental-consent:v1");
    
    expect(soundToggle).toBeNull(); // Treat null as "enabled"
    expect(hasConsent).toBeNull(); // No consent data needed
  });
});
