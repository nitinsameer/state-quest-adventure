import { useState, useEffect } from "react";

export type OnboardingStep = "avatar" | "age" | "consent";

export interface OnboardingState {
  currentScreen: OnboardingStep;
  selectedAvatar: string | null;
  selectedAge: string | null;
  parentConsented: boolean;
}

const STORAGE_KEY = "onboarding-step";

/**
 * Hook for managing multi-screen onboarding flow state
 * Persists to sessionStorage for temporary state during onboarding
 */
export function useOnboardingStep() {
  const [state, setState] = useState<OnboardingState>(() => {
    // Hydrate from sessionStorage on first render
    if (typeof window === "undefined") {
      return {
        currentScreen: "avatar",
        selectedAvatar: null,
        selectedAge: null,
        parentConsented: false,
      };
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback to defaults on parse error
    }

    return {
      currentScreen: "avatar",
      selectedAvatar: null,
      selectedAge: null,
      parentConsented: false,
    };
  });

  // Persist to sessionStorage whenever state changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore sessionStorage errors
    }
  }, [state]);

  const nextScreen = () => {
    setState((prev) => {
      let nextScreen: OnboardingStep = prev.currentScreen;
      if (prev.currentScreen === "avatar") {
        nextScreen = "age";
      } else if (prev.currentScreen === "age") {
        nextScreen = "consent";
      }
      return { ...prev, currentScreen: nextScreen };
    });
  };

  const prevScreen = () => {
    setState((prev) => {
      let prevScreen: OnboardingStep = prev.currentScreen;
      if (prev.currentScreen === "age") {
        prevScreen = "avatar";
      } else if (prev.currentScreen === "consent") {
        prevScreen = "age";
        // Clear consent when going back
        return { ...prev, currentScreen: prevScreen, parentConsented: false };
      }
      return { ...prev, currentScreen: prevScreen };
    });
  };

  const setAvatar = (avatar: string) => {
    setState((prev) => ({ ...prev, selectedAvatar: avatar }));
  };

  const setAge = (age: string) => {
    setState((prev) => ({ ...prev, selectedAge: age }));
  };

  const setConsented = (consented: boolean) => {
    setState((prev) => ({ ...prev, parentConsented: consented }));
  };

  const resetFlow = () => {
    setState({
      currentScreen: "avatar",
      selectedAvatar: null,
      selectedAge: null,
      parentConsented: false,
    });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore sessionStorage errors
    }
  };

  return {
    ...state,
    nextScreen,
    prevScreen,
    setAvatar,
    setAge,
    setConsented,
    resetFlow,
  };
}
