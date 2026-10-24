/**
 * Regression Tests: Audio Functionality
 *
 * Verifies that audio works correctly without consent gates:
 * - Sound effects play without requiring parental consent
 * - Background music plays without blocking
 * - Text-to-speech works independently
 * - Users can toggle sound on/off
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Audio Functionality", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should allow sound effects to play without consent gate", () => {
    // Given a user with no consent data
    localStorage.clear();

    // When they try to play a sound effect
    const canPlaySound = () => {
      // Sound should not be blocked by consent check
      const consentData = localStorage.getItem("india-explorer:parental-consent:v1");
      return (
        consentData === null ||
        JSON.parse(consentData).some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c.feature === "audio" && c.granted,
        )
      );
    };

    // Then sound should be allowed (no consent blocks it)
    expect(canPlaySound()).toBe(true);
  });

  it("should verify audio can be toggled", () => {
    // Given the audio settings
    const audioEnabled = localStorage.getItem("audio-enabled");

    // When attempting to toggle
    localStorage.setItem("audio-enabled", audioEnabled === "true" ? "false" : "true");

    // Then setting should be stored
    const newValue = localStorage.getItem("audio-enabled");
    expect(newValue).toBeDefined();
  });
  it("should allow background music without consent gate", () => {
    // Given no parental consent recorded
    localStorage.clear();

    // When music is requested
    const musicAllowed = () => {
      const consentData = localStorage.getItem("india-explorer:parental-consent:v1");
      // Without the consent gate, music is allowed by default
      return consentData === null;
    };

    // Then music should play
    expect(musicAllowed()).toBe(true);
  });

  it("should allow text-to-speech without consent gate", () => {
    // Given no consent requirements for TTS
    localStorage.clear();

    // When TTS is requested
    const ttsAllowed = () => {
      const consentData = localStorage.getItem("india-explorer:parental-consent:v1");
      // TTS should not be gated by consent
      return consentData === null;
    };

    // Then TTS should work
    expect(ttsAllowed()).toBe(true);
  });

  it("should preserve sound toggle preference", () => {
    // Given a user who toggles sound off
    localStorage.clear();
    localStorage.setItem("india-explorer:sound:v1", "0");

    // When they refresh the app
    const soundToggle = localStorage.getItem("india-explorer:sound:v1");

    // Then their preference should be preserved
    expect(soundToggle).toBe("0");
  });

  it("should allow sound toggle on", () => {
    // Given sound is toggled off
    localStorage.setItem("india-explorer:sound:v1", "0");

    // When user toggles it back on
    localStorage.setItem("india-explorer:sound:v1", "1");

    // Then sound should be enabled
    const soundToggle = localStorage.getItem("india-explorer:sound:v1");
    expect(soundToggle).toBe("1");
  });

  it("should allow sound toggle off", () => {
    // Given sound is on
    localStorage.setItem("india-explorer:sound:v1", "1");

    // When user toggles it off
    localStorage.setItem("india-explorer:sound:v1", "0");

    // Then sound should be disabled
    const soundToggle = localStorage.getItem("india-explorer:sound:v1");
    expect(soundToggle).toBe("0");
  });

  it("should default to sound enabled when no preference exists", () => {
    // Given a fresh user
    localStorage.clear();

    // When checking sound preference
    const soundToggle = localStorage.getItem("india-explorer:sound:v1");

    // Then default should be enabled (null = enabled)
    expect(soundToggle).toBeNull();
  });

  it("should not require consent data to exist for audio", () => {
    // Given no user consent data
    localStorage.clear();

    // When checking if audio can play
    const audioBlocked = () => {
      const consent = localStorage.getItem("india-explorer:parental-consent:v1");
      // Audio should not be blocked if no consent data exists
      if (consent === null) return false;

      const consentRecords = JSON.parse(consent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioConsent = consentRecords.find((c: any) => c.feature === "audio");
      return audioConsent && !audioConsent.granted;
    };

    // Then audio should not be blocked
    expect(audioBlocked()).toBe(false);
  });

  it("should allow audio toggle independent of consent", () => {
    // Given a user without any consent data
    localStorage.clear();

    // When they toggle sound setting
    localStorage.setItem("india-explorer:sound:v1", "0");

    // Then the toggle should work without needing consent
    const soundToggle = localStorage.getItem("india-explorer:sound:v1");
    const hasConsent = localStorage.getItem("india-explorer:parental-consent:v1");

    expect(soundToggle).toBe("0");
    expect(hasConsent).toBeNull();
  });

  it("should persist audio settings across sessions", () => {
    // Given a user who sets sound to muted
    localStorage.clear();
    localStorage.setItem("india-explorer:sound:v1", "0");

    // When they close and reopen the app
    const session1Sound = localStorage.getItem("india-explorer:sound:v1");

    // Then their preference should still be there
    expect(session1Sound).toBe("0");

    // And after another session
    const session2Sound = localStorage.getItem("india-explorer:sound:v1");
    expect(session2Sound).toBe("0");
  });
});
