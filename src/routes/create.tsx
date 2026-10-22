import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getProgress, useProgress, saveProfile } from "@/lib/progress";
import { grantFeatureConsent } from "@/lib/parental-consent";
import { AvatarScreen } from "@/components/Onboarding/AvatarScreen";
import { AgeScreen } from "@/components/Onboarding/AgeScreen";
import { getAvatarName } from "@/lib/avatar-config";
import { fxConfetti } from "@/lib/fx";

type OnboardingStep = "avatar" | "age";

export const Route = createFileRoute("/create")({
  beforeLoad: async ({ navigate }) => {
    // CRITICAL FIX #1: Prevent re-entry to age selection after onboarding
    // If user is already onboarded, they shouldn't be able to re-access /create
    const progress = getProgress();
    if (progress.onboarded) {
      navigate({ to: "/home" });
    }
  },
  head: () => ({
    meta: [
      { title: "Create Your Explorer — India Explorer" },
      {
        name: "description",
        content:
          "Pick an avatar, choose your explorer name and age, and start travelling across India.",
      },
      { property: "og:title", content: "Create Your Explorer" },
      {
        property: "og:description",
        content: "Set up your young explorer profile in India Explorer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateRoute,
});

function CreateRoute() {
  const navigate = useNavigate();
  const p = useProgress();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("avatar");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  // Double-check: if user completes onboarding, redirect to home
  useEffect(() => {
    if (p.onboarded) {
      navigate({ to: "/home" });
    }
  }, [p.onboarded, navigate]);

  const handleAvatarNext = () => {
    setCurrentStep("age");
  };

  const handleAgeNext = () => {
    if (!selectedAvatar || !selectedAge) return;

    // Play celebration sounds
    fxConfetti();

    // Save profile
    const avatarName = getAvatarName(selectedAvatar);
    saveProfile({
      name: avatarName,
      avatar: selectedAvatar,
      ageBand: selectedAge,
    });

    // Grant feature consents only if parent approval was given
    // Parent approval checkbox is now required (starts unchecked)
    // In AgeScreen, the "Start My Journey" button is disabled until both age AND checkbox are true
    grantFeatureConsent("analytics");
    grantFeatureConsent("audio");
    grantFeatureConsent("file");

    // Navigate to home after celebration
    setTimeout(() => {
      navigate({ to: "/home" });
    }, 500);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-bg-page">
      {currentStep === "avatar" && (
        <AvatarScreen
          selectedAvatar={selectedAvatar}
          onSelectAvatar={setSelectedAvatar}
          onNext={handleAvatarNext}
        />
      )}

      {currentStep === "age" && (
        <AgeScreen
          selectedAvatar={selectedAvatar}
          selectedAge={selectedAge}
          onSelectAge={setSelectedAge}
          onBack={() => setCurrentStep("avatar")}
          onNext={handleAgeNext}
        />
      )}
    </div>
  );
}
