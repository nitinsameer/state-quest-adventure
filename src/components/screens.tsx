import mascot from "@/assets/mascot.webp";
import airplane from "@/assets/airplane.png";
import welcomeScreenImage from "@/assets/welcome.webp";
import stateHeaderBg from "@/assets/state-header-background.png";
import avatarExplorerHat from "@/assets/avatars/avatar-explorer-hat.png";
import avatarExplorerPink from "@/assets/avatars/avatar-explorer-pink.png";
import avatarGeekGlasses from "@/assets/avatars/avatar-geek-glasses.png";
import avatarGirlPeace from "@/assets/avatars/avatar-girl-peace.png";
import avatarTurbanRed from "@/assets/avatars/avatar-turban-red.png";
import avatarGirlEarring from "@/assets/avatars/avatar-girl-earring.png";
import avatarBoySmi from "@/assets/avatars/avatar-boy-smile.png";
import avatarGirlTikka from "@/assets/avatars/avatar-girl-tikka.png";
import avatarSkiGoggles from "@/assets/avatars/avatar-ski-goggles.png";
import avatarFarmerHat from "@/assets/avatars/avatar-farmer-hat.png";
import avatarSportsCap from "@/assets/avatars/avatar-sports-cap.png";
import avatarGirlFlower from "@/assets/avatars/avatar-girl-flower.png";
import { EMOJI } from "@/constants/emoji";
import { STATE_ART, TONE_GRADIENT, preloadStateArt } from "@/lib/state-art";
import {
  getStateContent,
  getCardContent,
  getCardContentByAge,
  type AgeTaggedContent,
} from "@/lib/state-content";
import { stopTts, playTts, playStateNarration } from "@/lib/tts";
import { getJourneyMotivationalMessage } from "@/lib/journey-messaging";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { PassportSeedling } from "@/components/PassportSeedling";
import { AudioSettingRow } from "@/components/AudioSettingToggle";
import { DebugThemeSelector } from "@/components/DebugThemeSelector";
import { StatePerformanceBadgesView } from "@/components/state-performance-badges-view";
import { LanguageToggle, type LanguageCode } from "@/components/LanguageToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguageFallbackNotice } from "@/components/LanguageFallbackNotice";
import { PostcardModal } from "@/components/PostcardModal";
import { PostcardPreviewModal } from "@/components/PostcardPreviewModal";
import { PostcardFrame } from "@/components/PostcardFrame";
import { CardProgressBar } from "@/components/CardProgressBar";
import { JourneyDestinationCard } from "@/components/JourneyDestinationCard";
import { IndiaProgressMap } from "@/components/IndiaProgressMap";


import { DailyGoalCard } from "@/components/DailyGoalCard";
import { STORAGE_KEYS } from "@/constants/storageKeys";

import { useToastStore } from "@/store/toastStore";
import { showSuccessToast } from "@/hooks/useSuccessToast";
import { AVATAR_CONFIG, type AvatarId } from "@/lib/avatar-config";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouter, Navigate } from "@tanstack/react-router";
import { AvatarScreen, AgeScreen, ConsentScreen } from "@/components/Onboarding";
import { fxCorrect, fxWrong, fxConfetti, fxStamp, fxTap, useSoundOn, setSoundOn } from "@/lib/fx";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { setJourneyBackHandler } from "@/lib/journeyBackHandler";
import { useCelebration } from "@/hooks/useCelebration";
import { appLogger } from "@/lib/logger";
import { firebaseEvents } from "@/lib/firebase-events";
import { isBilingual, getAvailableLanguages, getNativeLanguage } from "@/lib/bilingual-config";
import {
  getNewlyUnlockedBadges,
  markBadgeAsSeen,
  getBadgeNotificationMessage,
} from "@/lib/badge-unlock-tracker";
import {
  INDIA_STATES,
  TOTAL_STATES_ONLY,
  TOTAL_UNION_TERRITORIES,
  getState,
  stateIndex,
  stateSlug,
  nextStateAfter,
} from "@/lib/states";
import { REGIONS, REGION_KEYS } from "@/lib/passport-helpers";
import { randomQuestionsForState, questionCountForAgeBand } from "@/lib/quiz";

import {
  useProgress,
  saveProfile,
  addXP,
  completeState,
  resetProgress,
  levelInfo,
  statesWithProgress,
  setLastPlayedState,
  badgeCount,
  badgesFor,
  STATE_BADGES,
  achievementsFor,
  markCard,
  markCardVisit,
  touchStreak,
  cardsDone,
  cardsRead,
  CARDS_PER_STATE,
  XP_PER_CARD,
  isCardReplaying,
  type BadgeId,
  ALL_BADGE_IDS,
  achievementBadgesFor,
  achievementBadgesForTier,
  unlockedAchievementBadgeCount,
  type AchievementBadge,
  type AchievementBadgeTier,
  getReplayCount,
  type Achievement,
  type PostcardData,
  type PendingCelebration,
  getStreakStatus,
  getStreakMilestone,
  getNextAchievementBadge,
  getPostcardsArray,
  getTotalStampCount,
  getRecentlyCompletedState,
  clearRecentlyCompleted,
  markRecentlyCompleted,
  dismissPendingCelebration,
  finishQuiz,
} from "@/lib/progress";

// Local constant to avoid bundler issues with imported TOTAL_STATES
const TOTAL_STATES = 36;

/* ---------- shared bits ---------- */

/**
 * Map avatar ID to imported image module
 * Used throughout app to display consistent avatar images
 */
const AVATAR_IMAGE_EMOJI_MAP: Record<AvatarId, string> = {
  "explorer-hat": avatarExplorerHat,
  "explorer-pink": avatarExplorerPink,
  "geek-glasses": avatarGeekGlasses,
  "girl-peace": avatarGirlPeace,
  "turban-red": avatarTurbanRed,
  "girl-earring": avatarGirlEarring,
  "boy-smile": avatarBoySmi,
  "girl-tikka": avatarGirlTikka,
  "ski-goggles": avatarSkiGoggles,
  "farmer-hat": avatarFarmerHat,
  "sports-cap": avatarSportsCap,
  "girl-flower": avatarGirlFlower,
};

/**
 * Get avatar image path for a given avatar ID
 * Returns the imported image module or default
 */
function getAvatarImage(avatarId: string): string {
  if (!avatarId) return avatarExplorerHat;
  return AVATAR_IMAGE_EMOJI_MAP[avatarId as AvatarId] || avatarExplorerHat;
}

/**
 * Get avatar name for a given avatar ID
 * Returns the character name from config
 */
function getAvatarName(avatarId: string): string {
  if (!avatarId) return "Explorer";
  return AVATAR_CONFIG[avatarId as AvatarId]?.name || "Explorer";
}

function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className}>
      <g fill="var(--surface-raised)">
        <ellipse cx="30" cy="38" rx="24" ry="18" />
        <ellipse cx="58" cy="28" rx="28" ry="22" />
        <ellipse cx="88" cy="40" rx="22" ry="16" />
        <rect x="18" y="36" width="82" height="18" rx="9" />
      </g>
    </svg>
  );
}

function XPBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="relative h-3 w-full rounded-full bg-text-primary/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${pct}%`, backgroundColor: "var(--accent-4)" }}
      />
      <div
        className="absolute top-0 h-1 rounded-full bg-text-on-header/70 transition-all duration-1000 ease-out"
        style={{ width: `${pct * 0.9}%`, left: "5%" }}
      />
    </div>
  );
}

function Chip({
  icon,
  children,
  tone = "orange",
}: {
  icon: string;
  children: ReactNode;
  tone?: "orange" | "blue" | "green" | "gold";
}) {
  const map = {
    orange: "bg-saffron-soft text-saffron",
    blue: "bg-explorer-soft text-explorer",
    green: "bg-success-soft text-success",
    gold: "bg-gold-soft",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label ${map[tone]}`}
      style={tone === "gold" ? { color: "var(--gold)" } : undefined}
    >
      <span>{icon}</span>
      {children}
    </span>
  );
}

export function BottomNav({ active }: { active: "home" | "map" | "explorer" | "profile" }) {
  const items = [
    { id: "home", icon: EMOJI.nav.home, label: "Home", to: "/home" },
    { id: "map", icon: EMOJI.nav.map, label: "Journey", to: "/journey" },
    { id: "explorer", icon: EMOJI.nav.explorer, label: "Explore", to: "/explorer" },
    { id: "profile", icon: EMOJI.nav.profile, label: "Profile", to: "/me" },
  ] as const;
  return (
    <div className="relative w-full" data-testid="bottom-nav" role="navigation">
      <div className="mx-3 mb-3 ui-nav rounded-3xl px-2 py-2 flex items-center justify-between">
        {items.map((i) => {
          const on = i.id === active;
          return (
            <Link
              key={i.id}
              to={i.to}
              onClick={() => fxTap()}
              aria-label={i.label}
              data-testid={`nav-${i.id}`}
              className={`flex-1 ui-nav-item ${on ? "ui-nav-item-active" : ""}`}
            >
              <span className="text-2xl leading-none">{i.icon}</span>
              <span className={`text-label ${on ? "" : "text-text-secondary"}`}>{i.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Goes back in history, falling back to Home when there is nothing to pop. */
export function useGoBack(fallback = "/home") {
  const router = useRouter();
  const navigate = useNavigate();
  return () => {
    fxTap();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: fallback });
    }
  };
}

function HeaderBar({
  title,
  onBack = true,
  right,
  tone = "white",
}: {
  title: string;
  onBack?: boolean;
  right?: ReactNode;
  tone?: "white" | "transparent";
}) {
  const goBack = useGoBack();
  return (
    <div
      className={`flex items-center justify-between px-5 pt-3 pb-2 ${
        tone === "white" ? "bg-surface-card" : ""
      }`}
    >
      {onBack ? (
        <button
          onClick={goBack}
          aria-label="Go back"
          className="h-12 w-12 rounded-full ui-button ui-accent-1-soft flex items-center justify-center text-xl"
        >
          ‹
        </button>
      ) : (
        <div className="w-10" />
      )}
      <h2 className="text-h4 text-display">{title}</h2>
      <div className="w-10 flex justify-end">{right}</div>
    </div>
  );
}

/* ---------- SCREENS ---------- */

export function SplashScreen() {
  return (
    <div
      className="h-full w-full relative overflow-hidden flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--accent-1)" }}
    >
      <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-accent-1-soft/40 blur-2xl" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-accent-1-soft/30 blur-2xl" />
      <Cloud className="absolute top-16 left-4 w-24 opacity-80" />
      <Cloud className="absolute top-40 right-2 w-16 opacity-70" />
      <Cloud className="absolute bottom-40 left-6 w-20 opacity-60" />

      <img
        src={mascot}
        alt="India Explorer mascot"
        className="w-52 h-52 object-contain drop-shadow-2xl relative z-10"
      />
      <div className="mt-4 text-center relative z-10 px-8">
        <h1 className="text-h1 text-text-on-header leading-relaxed">
          India
          <br />
          Explorer
        </h1>
        <p className="mt-3 text-text-on-header/95 font-bold">
          Travel Across India,
          <br /> One State at a Time
        </p>
      </div>
      <div className="absolute bottom-20 flex items-center gap-2 text-text-on-header/90 text-body">
        <span className="h-2 w-2 rounded-full bg-text-on-header animate-pulse" />
        <span className="h-2 w-2 rounded-full bg-text-on-header/60" />
        <span className="h-2 w-2 rounded-full bg-text-on-header/40" />
        <span className="ml-2">Loading adventure…</span>
      </div>
    </div>
  );
}

export function WelcomeScreen() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    fxTap();
    navigate({ to: "/create" });
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden select-none relative cursor-pointer fixed inset-0 bg-surface-card"
      onClick={handleButtonClick}
    >
      <img
        src={welcomeScreenImage}
        alt="Welcome to India Explorer"
        className="w-full h-full object-cover"
        draggable="false"
      />
    </div>
  );
}

export function CreateProfileScreen() {
  const p = useProgress();
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<"avatar" | "age" | "consent">("avatar");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [parentConsented, setParentConsented] = useState(false);

  // Guard against re-entry post-onboarding
  useEffect(() => {
    if (p.onboarded) {
      navigate({ to: "/home" });
    }
  }, [p.onboarded, navigate]);

  // Initialize audio context on mount
  useEffect(() => {
    import("@/lib/fx").then((mod) => {
      mod.ensureAudioContext();
    });
  }, []);

  const handleAvatarNext = () => {
    if (!selectedAvatar) return;
    fxTap();
    setCurrentScreen("age");
  };

  const handleAvatarSkip = () => {
    fxTap();
    // Skip to consent screen directly, keeping avatar as default
    if (!selectedAvatar) {
      setSelectedAvatar("explorer-hat");
    }
    setCurrentScreen("consent");
  };

  const handleAgeNext = () => {
    fxTap();
    // If age not selected, use default
    const ageToUse = selectedAge || "6-7";
    setSelectedAge(ageToUse);
    setCurrentScreen("consent");
  };

  const handleAgeSkip = () => {
    fxTap();
    // Skip to consent, use default age
    setSelectedAge("6-7");
    setCurrentScreen("consent");
  };

  const handleAgeBack = () => {
    fxTap();
    setCurrentScreen("avatar");
    // Clear age when going back but preserve avatar
    setSelectedAge(null);
  };

  const handleConsentBack = () => {
    fxTap();
    setCurrentScreen("age");
    setParentConsented(false);
  };

  const handleConsentContinue = () => {
    if (!parentConsented) return;
    fxTap();
    fxConfetti();

    // Save profile
    const avatarName = getAvatarName(selectedAvatar || "explorer-hat");
    const ageToSave = selectedAge || "6-7";

    saveProfile({ name: avatarName, avatar: selectedAvatar || "explorer-hat", ageBand: ageToSave });

    // Navigate to home after celebration
    setTimeout(() => navigate({ to: "/home" }), 300);
  };

  if (currentScreen === "avatar") {
    return (
      <AvatarScreen
        selectedAvatar={selectedAvatar}
        onSelectAvatar={setSelectedAvatar}
        onNext={handleAvatarNext}
        onSkip={handleAvatarSkip}
      />
    );
  }

  if (currentScreen === "age") {
    return (
      <AgeScreen
        selectedAvatar={selectedAvatar}
        selectedAge={selectedAge}
        onSelectAge={setSelectedAge}
        onBack={handleAgeBack}
        onNext={handleAgeNext}
        onSkip={handleAgeSkip}
      />
    );
  }

  if (currentScreen === "consent") {
    return (
      <ConsentScreen
        parentConsented={parentConsented}
        onConsent={setParentConsented}
        onBack={handleConsentBack}
        onContinue={handleConsentContinue}
      />
    );
  }

  return null;
}

/**
 * Floating XP Animation Component
 * Displays "+X XP" feedback with animation rising up and fading out
 */
function FloatingXPFeedback({ xp, key: feedbackKey }: { xp: number; key: string }) {
  return (
    <div
      className="fixed pointer-events-none z-50 text-h4 text-accent-2 drop-shadow-lg animate-ping-rise"
      style={{
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        animation: "rise-fade 1.5s ease-out forwards",
      }}
    >
      <style>{`
        @keyframes rise-fade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -150px);
          }
        }
      `}</style>
      +{xp} XP ${EMOJI.action.sparkle}
    </div>
  );
}

/**
 * Recently Completed State Celebration Component
 * Extracted to fix React hooks rule: useEffect cannot be in IIFE
 */
// Session-based storage for shown celebrations (prevents duplicate popups on navigation)
const shownCelebrationsRef = { current: new Set<string>() };

function RecentlyCompletedCelebration({
  p,
  showCelebrationPopup,
  onDismiss,
  navigate,
}: {
  p: ReturnType<typeof useProgress>;
  showCelebrationPopup: boolean;
  onDismiss: () => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  // Read from pending celebrations (persistent, no auto-dismiss, no expiry)
  const pendingCelebration = p.pendingCelebrations?.[0];

  // Use effect to trigger the toast instead of showing a modal
  useEffect(() => {
    if (!showCelebrationPopup || !pendingCelebration) return;

    // Type guard: only "full" type has quizXp/bonusXp
    if (pendingCelebration.type !== "full") return;

    const celebrationId = `${pendingCelebration.stateName}_${pendingCelebration.quizXp + pendingCelebration.bonusXp}`;

    // If already shown in this session, don't show again
    if (shownCelebrationsRef.current.has(celebrationId)) return;

    // Mark as shown
    shownCelebrationsRef.current.add(celebrationId);

    // Play sound
    fxCorrect();

    // Dismiss celebration and navigate to journey
    const { stateName } = pendingCelebration as PendingCelebration & { type: "full" };
    
    onDismiss();
    dismissPendingCelebration();
    navigate({ to: "/journey" });
  }, [pendingCelebration?.type, pendingCelebration?.id || (pendingCelebration as any)?.themeId, showCelebrationPopup]);

  return null;
}

export function HomeDashboardScreen() {
  const p = useProgress();

  // Route guard: redirect to welcome if not onboarded (defensive check)
  if (!p.onboarded) {
    appLogger.warn("home_dashboard", "User attempted to access home without onboarding", {});
    return <Navigate to="/welcome" replace />;
  }

  return <HomeDashboardContent />;
}

function getStateEmoji(stateName: string): string {
  const emojiMap: Record<string, string> = {
    "Andhra Pradesh": "🏛️",
    "Arunachal Pradesh": "🏔️",
    "Assam": "🐘",
    "Bihar": "🙏",
    "Chhattisgarh": "⛰️",
    "Goa": "🏖️",
    "Gujarat": "🦁",
    "Haryana": "🌾",
    "Himachal Pradesh": "⛰️",
    "Jharkhand": "🏔️",
    "Karnataka": "☕",
    "Kerala": "🥥",
    "Madhya Pradesh": "🏛️",
    "Maharashtra": "🏢",
    "Manipur": "🌸",
    "Meghalaya": "☔",
    "Mizoram": "🌲",
    "Nagaland": "🏔️",
    "Odisha": "🏖️",
    "Punjab": "🌾",
    "Rajasthan": "🏜️",
    "Sikkim": "⛰️",
    "Tamil Nadu": "🏛️",
    "Telangana": "🕌",
    "Tripura": "🌿",
    "Uttar Pradesh": "🕌",
    "Uttarakhand": "⛰️",
    "West Bengal": "🎨",
  };
  return emojiMap[stateName] || "🗺️";
}

function HomeDashboardContent() {
  const p = useProgress();
  const navigate = useNavigate();
  const celebration = useCelebration();
  const [statsVisible, setStatsVisible] = useState(false);
  const [dismissStreakWarning, setDismissStreakWarning] = useState(false);
  // Auto-dismiss celebration popup after 3 seconds
  const [showCelebrationPopup, setShowCelebrationPopup] = useState(true);
  const [rippleKey, setRippleKey] = useState(0);

  const { level, toNext, pct } = levelInfo(p.xp);
  const postcards = Object.keys(p.postcards).length;
  const journey = statesWithProgress(p);
  const current = journey.find((s) => s.status === "current") ?? journey[journey.length - 1];
  const currentDone = cardsDone(p, current.name);

  useEffect(() => {
    touchStreak();

    // Check for streak milestone celebrations
    const { reached, message } = getStreakMilestone(p.streak);
    if (reached) {
      const celebrated = localStorage.getItem(`india-explorer:streak-milestone-${p.streak}:v1`);
      if (!celebrated) {
        setTimeout(() => {
          celebration.custom(message, EMOJI.action.fire, {
            subtitle: `Keep up this amazing momentum!`,
            confetti: true,
            duration: 3000,
            type: "success",
            showCloseButton: true,
          });
          localStorage.setItem(`india-explorer:streak-milestone-${p.streak}:v1`, "true");
        }, 500);
      }
    }

    // Trigger animations on mount
    setTimeout(() => setStatsVisible(true), 100);
  }, [p.streak]);

  return (
    <div
      className="h-full w-full bg-bg-page flex flex-col overflow-hidden"
      data-testid="home-screen"
    >
      {/* CSS Keyframes for dopamine animations */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes hero-pop-in {
            0% {
              opacity: 0;
              transform: scale(0.92) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes hero-glow-pulse {
            0%, 100% {
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            }
            50% {
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.20);
            }
          }

          @keyframes stat-slide-in-left {
            0% {
              opacity: 0;
              transform: translateX(-20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes stat-slide-in-bottom {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes stat-slide-in-right {
            0% {
              opacity: 0;
              transform: translateX(20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fire-spin {
            0% {
              transform: rotate(0deg) scale(1);
            }
            50% {
              transform: rotate(180deg) scale(1.2);
            }
            100% {
              transform: rotate(360deg) scale(1);
            }
          }

          @keyframes popIn {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes streak-current-pulse {
            0%, 100% {
              box-shadow: 0 0 0 1px var(--accent-1);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 0 3px var(--accent-1);
              transform: scale(1.15);
            }
          }

          @keyframes explorer-breathing {
            0%, 100% {
              opacity: 0.85;
              transform: scale(1);
              text-shadow: 0 0 0 transparent;
            }
            50% {
              opacity: 1;
              transform: scale(1.04);
              text-shadow: 0 0 8px var(--accent-3);
            }
          }

          @keyframes avatar-ring-pulse {
            0%, 100% {
              box-shadow: 0 0 0 0px var(--accent-1);
              opacity: 0.7;
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 12px 2px var(--accent-1);
              opacity: 0.3;
              transform: scale(1.08);
            }
          }

          @keyframes header-slide-down {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes hero-pulse-border {
            0%, 100% {
              border-color: var(--accent-1);
              box-shadow: 0 0 0 0 var(--accent-1);
            }
            50% {
              border-color: var(--accent-1);
              box-shadow: 0 0 20px 2px var(--accent-1);
            }
          }

          @keyframes tap-ripple {
            0% {
              opacity: 0.5;
              transform: scale(0);
            }
            100% {
              opacity: 0;
              transform: scale(2);
            }
          }

          .animate-hero-pop-in {
            animation: hero-pop-in 600ms ease-out forwards;
          }

          .animate-hero-glow-pulse {
            animation: hero-glow-pulse 1.5s ease-in-out infinite 600ms;
          }

          .animate-stat-slide-in-left {
            animation: stat-slide-in-left 600ms ease-out forwards 200ms;
            opacity: 0;
          }

          .animate-stat-slide-in-bottom {
            animation: stat-slide-in-bottom 600ms ease-out forwards 300ms;
            opacity: 0;
          }

          .animate-stat-slide-in-right {
            animation: stat-slide-in-right 600ms ease-out forwards 400ms;
            opacity: 0;
          }

          .animate-fire-spin {
            animation: fire-spin 600ms ease-out forwards;
          }

          .animate-header-slide-down {
            animation: header-slide-down 300ms ease-out forwards;
          }

          .animate-hero-pulse-border {
            animation: hero-pulse-border 2.5s ease-in-out infinite;
          }

          .animate-streak-current-pulse {
            animation: streak-current-pulse 2s ease-in-out infinite;
          }

          .animate-explorer-breathing {
            animation: explorer-breathing 2s ease-in-out infinite;
          }

          .avatar-container {
            position: relative;
          }

          .avatar-container::before {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: inherit;
            border: 2px solid var(--accent-1);
            opacity: 0.6;
            animation: avatar-ring-pulse 2s ease-in-out infinite;
          }

          .hero-card-ripple::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: rgba(255, 255, 255, 0.3);
            animation: tap-ripple 600ms ease-out forwards;
            pointer-events: none;
          }
        }
      `}</style>

      {/* Header with slide-down animation - Premium spacing */}
      <div
        className={`flex-shrink-0 px-6 pt-4 pb-5 bg-bg-header rounded-b-[32px] relative overflow-hidden transition-opacity duration-500 ${statsVisible ? "animate-header-slide-down" : ""}`}
      >
        <Cloud className="absolute top-2 right-4 w-14 opacity-40" />
        <div className="flex items-center gap-4 relative mb-3">
          {/* Avatar - Larger and more prominent */}
          <div
            className="avatar-container h-20 w-20 rounded-2xl ui-card ui-accent-1-soft p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0"
            data-testid="profile-avatar"
          >
            <img
              src={getAvatarImage(p.avatar)}
              alt={getAvatarName(p.avatar)}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Greeting - Namaste and name on one line, Explorer below */}
            <div className="text-text-on-header">
              <div className="text-h4 text-display leading-tight whitespace-nowrap">
                Namaste, {p?.name?.split(" ")[0] || "Explorer"}!
              </div>
              <div className="text-h4 font-extrabold text-accent-3-ink animate-explorer-breathing">
                Explorer
              </div>
            </div>
          </div>

          {/* Right side: Level badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                fxTap();
                navigate({ to: "/me" });
              }}
              className={`flex items-center gap-1.5 ui-chip ui-accent-3-soft transition-transform duration-1000 hover:shadow-md active:scale-95 cursor-pointer`}
            >
              <span className="text-2xl">{EMOJI.action.star}</span>
              <div className="flex flex-col items-start">
                <span className="text-ink text-h5 font-black leading-none">{level}</span>
                <span className="text-ink text-xs font-bold opacity-90 leading-none">Level</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
        {/* Recently Completed State Celebration - Premium Popup */}
        <RecentlyCompletedCelebration
          p={p}
          showCelebrationPopup={showCelebrationPopup}
          onDismiss={() => setShowCelebrationPopup(false)}
          navigate={navigate}
        />

        {/* Stamp Collection Display - HIDDEN: Breaking home screen layout */}
        {(() => {
          // Disabled: Green popup breaking home screen UX
          return null;
        })()}

        {/* Streak Protection Alert */}
        {(() => {
          const streakStatus = getStreakStatus(p);
          if (!streakStatus.isAtRisk || dismissStreakWarning) return null;

          return (
            <div className="absolute top-0 left-0 right-0 z-40 px-5 pt-5 animate-fade-in pointer-events-none">
              <div className="rounded-2xl bg-warning-soft text-warning p-4 shadow-elevated-2 transition-all hover:shadow-elevated-3 border border-warning pointer-events-auto">
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{EMOJI.utility.warning}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-body font-bold">Your streak is at risk!</div>
                    <div className="text-caption mt-1 opacity-90">
                      Last played {streakStatus.hoursSinceActive} hours ago
                    </div>
                    <div className="text-caption mt-1">
                      Come back within 12 hours to keep your {EMOJI.feedback.trophy} {p.streak} day
                      streak!
                    </div>
                  </div>
                  <button
                    onClick={() => setDismissStreakWarning(true)}
                    className="text-warning opacity-70 hover:opacity-100 text-xl flex-shrink-0 transition-all duration-200"
                  >
                    {EMOJI.ui.close}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* HERO CARD: Next State - Attractive Layout with Location Pin and CTA Button */}
        <div
          className="flex-1 min-h-0 flex flex-col"
          style={{ padding: "var(--space-1-5) var(--space-1-5) var(--space-1-5)" }}
        >
          <div
            className={`flex-1 min-h-0 flex flex-col rounded-3xl overflow-hidden shadow-elevated-3 relative text-white transition-all duration-300 hover:shadow-elevated-hover active:scale-95 cursor-pointer border-2 border-accent-1 animate-hero-pulse-border ${
              rippleKey > 0 ? "hero-card-ripple" : ""
            } animate-hero-pop-in`}
            onMouseDown={() => {
              setRippleKey((k) => k + 1);
              setTimeout(() => setRippleKey(0), 700);
            }}
          >
            {/* Background Image Layer */}
            <img
              src={STATE_ART[current.name]}
              alt={current.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              decoding="auto"
            />

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 30%, var(--scrim) 100%)" }}
            />

            {/* State Name at Top - Location Pin + State Name */}
            <div className="absolute top-0 left-0 right-0 p-5 flex items-center gap-2">
              <div className="text-xl">📍</div>
              <div className="text-body font-bold text-white">{current.name}</div>
            </div>

            {/* Explore State Button - Bottom CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-center">
              <Link
                to="/state/$slug/learn"
                params={{ slug: stateSlug(current.name) }}
                onClick={() => fxTap()}
                className="px-6 py-3 rounded-full bg-accent-2 text-text-on-primary font-bold text-body flex items-center gap-2 no-underline transition-all hover:shadow-lg active:scale-95 cursor-pointer hover:-translate-y-0.5"
              >
                <span>▶</span>
                <span>Explore State</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Card: Your progress - Row style with emoji, title, count, and progress bar */}
        <div
          className="flex-shrink-0"
          style={{ padding: "0 var(--space-1-5) var(--space-1-5)" }}
        >
          <div className="rounded-2xl bg-surface-card shadow-sm p-4">
            {/* Top row: Emoji + Title + Count */}
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl flex-shrink-0">📊</div>
              <div className="flex-1">
                <div className="text-h4 text-text-primary font-extrabold">
                  Your progress
                </div>
              </div>
              <div className="text-body font-bold text-text-primary flex-shrink-0">
                {currentDone} / {CARDS_PER_STATE}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-progress-track rounded-full overflow-hidden">
              <div
                className="h-full bg-progress-fill rounded-full transition-all duration-300"
                style={{ width: `${(currentDone / CARDS_PER_STATE) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Statistics Cards Row: Badges + States Explored - Horizontal layout */}
        <div
          className="flex-shrink-0 flex gap-3"
          style={{ padding: "0 var(--space-1-5) var(--space-1-5)" }}
        >
          {/* Badges Card */}
          <button
            onClick={() => {
              fxTap();
              navigate({ to: "/badges" });
            }}
            className="flex-1 rounded-2xl bg-surface-card shadow-sm p-4 text-left hover:shadow-md transition-all active:scale-95 cursor-pointer border border-transparent hover:border-accent-3/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl">🏅</div>
              <div className="flex-1">
                <div className="text-display text-h2 font-black leading-none">
                  {unlockedAchievementBadgeCount(p)}
                </div>
                <div className="text-caption text-text-secondary font-bold">
                  Badges
                </div>
              </div>
            </div>
          </button>

          {/* States Explored Card */}
          <button
            onClick={() => {
              fxTap();
              navigate({ to: "/journey" });
            }}
            className="flex-1 rounded-2xl bg-surface-card shadow-sm p-4 text-left hover:shadow-md transition-all active:scale-95 cursor-pointer border border-transparent hover:border-accent-3/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl">🗺️</div>
              <div className="flex-1">
                <div className="text-display text-h2 font-black leading-none">
                  {p.completed.length} / {TOTAL_STATES}
                </div>
                <div className="text-caption text-text-secondary font-bold">
                  States explored
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* First Session Tutorial removed from onboarding flow */}
      </div>
      {/* End scrollable content area */}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: string;
  value: string;
  label: string;
  tone: "orange" | "gold" | "green";
}) {
  const borderColorMap = {
    orange: "border-accent-1-soft",
    gold: "border-accent-4-soft",
    green: "border-accent-3-soft",
  };
  return (
    <div className={`rounded-2xl ui-card ui-accent-1-soft border ${borderColorMap[tone]} p-3`}>
      <div className="text-lg">{icon}</div>
      <div className="text-display text-h2 leading-snug mt-1">{value}</div>
      <div className="text-label text-text-secondary">{label}</div>
    </div>
  );
}

/**
 * Premium stats card - minimal, impactful design
 * Just icon, number, and label - no encouragement text clutter
 */
function StatCardEnhanced({
  icon,
  value,
  label,
  tone,
}: {
  icon: string;
  value: string;
  label: string;
  tone: "orange" | "gold" | "green";
}) {
  const bgGradient = {
    orange: "bg-action-primary/10",
    gold: "bg-accent-2-soft/20",
    green: "bg-success/10",
  }[tone];

  const borderColor = {
    orange: "border-saffron/30",
    gold: "border-warning/40",
    green: "border-success/30",
  }[tone];

  const numberColor = {
    orange: "text-saffron",
    gold: "text-accent-2",
    green: "text-success",
  }[tone];

  return (
    <div
      className={`rounded-2xl ${bgGradient} border ${borderColor} p-2 shadow-soft hover:shadow-md transition-all`}
    >
      <div className="flex flex-col gap-1">
        {/* Icon and Number - Horizontal */}
        <div className="flex items-center gap-1.5 pl-1">
          <div className="text-2xl flex-shrink-0">{icon}</div>
          <div className={`text-h1 font-black ${numberColor} leading-none`}>{value}</div>
        </div>

        {/* Label */}
        <div className="text-label text-text-primary px-1">{label}</div>
      </div>
    </div>
  );
}

function MiniStateCard({
  name,
  img,
  locked,
}: {
  name: string;
  img: string;
  locked?: boolean;
  tone?: "orange" | "blue";
}) {
  return (
    <div className="relative rounded-3xl bg-surface-card border border-border-subtle shadow-soft p-3">
      <div
        className="h-20 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: locked ? "var(--color-muted-bg)" : "var(--accent-2)" }}
      >
        <img
          src={img}
          alt=""
          className={`h-full object-contain ${locked ? "grayscale opacity-60" : ""}`}
        />
      </div>
      <div className="mt-2 text-display font-extrabold text-sm">{name}</div>
      <div className="text-xs font-bold text-text-secondary">
        {locked ? `${EMOJI.milestone.hundred} Locked` : "Unlocked"}
      </div>
    </div>
  );
}

function StateDetailModal({
  stateName,
  states,
  onClose,
  onPlay,
}: {
  stateName: string;
  states: Array<{
    name: string;
    short: string;
    status: string;
    isUT: boolean;
  }>;
  onClose: () => void;
  onPlay: () => void;
}) {
  const state = states.find((s) => s.name === stateName);
  const stateData = INDIA_STATES.find((s) => s.name === stateName);
  if (!state || !stateData) return null;

  const isLocked = state.status === "locked";
  const isDone = state.status === "done";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end animate-fade-in"
      style={{ backgroundColor: "var(--scrim)" }}
      onClick={onClose}
    >
      <div
        className="w-full bg-surface-card rounded-t-3xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-text-secondary hover:bg-muted"
        >
          {EMOJI.ui.close}
        </button>

        {/* State Display */}
        <div className="flex flex-col items-center pt-2">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center text-5xl mb-4 ${
              isLocked ? "opacity-60" : "shadow-lg"
            }`}
            style={{
              backgroundColor: isLocked ? "var(--surface-sunken)" : "var(--accent-1)",
              color: isLocked ? "var(--text-secondary)" : "var(--accent-1-ink)",
            }}
          >
            {stateData.emoji}
          </div>

          <h2 className="text-h2 text-ink">{stateName}</h2>
          <p className="text-sm text-text-secondary mt-1">
            {state.isUT ? "Union Territory" : "State"} · {stateData.capital}
          </p>
        </div>

        {/* Sneak Peek Preview for Locked States */}
        {isLocked && (
          <div className="rounded-2xl bg-action-primary/5 border-2 border-warning p-4 space-y-3">
            <p className="text-h5 text-warning flex items-center gap-2">
              {EMOJI.action.lock} Sneak Peek Preview
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-2xl flex-shrink-0">{stateData.animal}</span>
                <div>
                  <p className="text-body font-bold text-text-primary">State Animal</p>
                  <p className="text-text-secondary">{stateData.animalName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl flex-shrink-0">{stateData.monument}</span>
                <div>
                  <p className="text-body font-bold text-text-primary">Famous Monument</p>
                  <p className="text-text-secondary">{stateData.monumentName}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-warning">
                <p className="text-xs font-bold text-warning mb-1">Fun Fact</p>
                <p className="text-text-secondary italic">{stateData.funFact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Information */}
        {isLocked ? (
          <div className="rounded-2xl bg-warning-soft border-2 border-warning p-4">
            <p className="text-h5 text-warning mb-2">{EMOJI.action.lock} Locked</p>
            <p className="text-body text-action-primary">
              Complete the previous state to unlock this adventure!
            </p>
          </div>
        ) : isDone ? (
          <div className="rounded-2xl bg-success-soft border-2 border-success p-4">
            <p className="text-h5 text-success mb-2">✓ Completed</p>
            <p className="text-body text-success">You've earned all badges for this state!</p>
          </div>
        ) : (
          <div className="roundepppd-2xl bg-info-soft border-2 border-info p-4">
            <p className="text-h5 text-info mb-2">{`${EMOJI.action.play} In Progress`}</p>
            <p className="text-body text-accent-1">
              Complete 3 cards and take the quiz to unlock the next state!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl bg-muted text-display font-extrabold text-text-secondary hover:bg-muted transition"
          >
            Close
          </button>
          {!isLocked && (
            <button
              onClick={() => {
                fxTap();
                onPlay();
              }}
              className="flex-1 h-12 rounded-2xl bg-accent-1 text-display font-extrabold text-text-on-primary shadow-lg hover:shadow-xl transition"
            >
              {isDone ? `${EMOJI.achievement.explorer} Review` : `${EMOJI.action.play} Play`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function JourneyMapScreen() {
  const navigate = useNavigate();
  const p = useProgress();
  const goBack = useGoBack();
  const states = statesWithProgress(p);
  const [view, setView] = useState<{
    screen: "intro" | "hub" | "card" | "quiz";
    name: string;
    cardIndex?: number;
  } | null>(null);
  const celebration = useCelebration();
  const [showQuizDecisionModal, setShowQuizDecisionModal] = useState(false);
  const [pendingStateName, setPendingStateName] = useState<string | null>(null);

  // Detect and celebrate milestones
  useEffect(() => {
    const totalStates = TOTAL_STATES;
    const completed = p.completed.length;
    const percentage = Math.round((completed / totalStates) * 100);

    const milestones = [
      {
        threshold: 25,
        emoji: EMOJI.milestone.twentyFive,
        message: "Quarter Way There! 25% Complete!",
      },
      {
        threshold: 50,
        emoji: EMOJI.utility.worldMap,
        message: "Halfway Around India! 50% Complete!",
      },
      {
        threshold: 75,
        emoji: EMOJI.feedback.trophy,
        message: "Almost Complete! 75% Explored!",
      },
      {
        threshold: 100,
        emoji: EMOJI.milestone.hundred,
        message: "India Master! 100% Complete!",
      },
    ];

    const celebratedKey = STORAGE_KEYS.celebratedMilestones;
    const celebrated =
      typeof window !== "undefined" ? JSON.parse(localStorage.getItem(celebratedKey) || "[]") : [];

    milestones.forEach((m) => {
      if (percentage >= m.threshold && !celebrated.includes(m.threshold)) {
        showSuccessToast(`${m.message} 🎉`, {
          duration: 4000,
          icon: m.emoji,
        });

        celebrated.push(m.threshold);
        if (typeof window !== "undefined") {
          localStorage.setItem(celebratedKey, JSON.stringify(celebrated));
        }
      }
    });
  }, [p.completed.length, celebration]);

  // Register the back handler for this screen
  useEffect(() => {
    const handleBack = () => {
      if (view?.screen === "card" || view?.screen === "quiz") {
        setView({ screen: "hub", name: view.name });
        return;
      } else if (view?.screen === "hub") {
        setView({ screen: "intro", name: view.name });
        return;
      } else if (view?.screen === "intro") {
        setView(null);
        return;
      }
    };

    setJourneyBackHandler(handleBack);
    return () => {
      setJourneyBackHandler(null);
    };
  }, [view]);

  // Preload all state images for smooth rendering
  useEffect(() => {
    const stateNames = states.map((s) => s.name);
    preloadStateArt(...stateNames);
  }, [states]);

  // Safety check: ensure we have states data
  if (!states || states.length === 0) {
    return <LoadingScreen />;
  }

  const totalStates = TOTAL_STATES;
  const completedStates = states.filter((s) => s.status === "done").length;
  const currentDest = states.find((s) => s.status === "current");

  // If showing internal view, render it
  if (view?.screen === "intro") {
    return (
      <StateIntroScreen
        stateName={view.name}
        onBack={() => setView(null)}
        onContinue={() => {
          setLastPlayedState(view.name);
          setView({ screen: "hub", name: view.name });
        }}
      />
    );
  }
  if (view?.screen === "hub") {
    return (
      <LearningHubScreen
        stateName={view.name}
        onBack={() => {
          setView({ screen: "intro", name: view.name });
        }}
        onCard={(index) => {
          setView({ screen: "card", name: view.name, cardIndex: index });
        }}
        onQuiz={() => {
          setView({ screen: "quiz", name: view.name });
        }}
        allowReplay={true}
      />
    );
  }
  if (view?.screen === "card") {
    return (
      <LearningCardScreen
        stateName={view.name}
        cardIndex={view.cardIndex}
        onClose={() => {
          setView({ screen: "hub", name: view.name });
        }}
        onNext={(index) => {
          if (index === null) {
            setPendingStateName(view.name);
            setTimeout(() => {
              setShowQuizDecisionModal(true);
            }, 400);
          } else {
            setView({ screen: "card", name: view.name, cardIndex: index });
          }
        }}
      />
    );
  }
  if (view?.screen === "quiz") {
    return (
      <QuizScreen
        stateName={view.name}
        onClose={() => {
          setView({ screen: "hub", name: view.name });
        }}
        onDone={() => {
          const slug = view.name.toLowerCase().replace(/\s+/g, "-");
          navigate({ to: "/state/$slug/complete", params: { slug } });
        }}
      />
    );
  }

  return (
    <div className="h-full w-full bg-bg-page relative overflow-hidden flex flex-col">
      {/* CSS Keyframes for Journey animations */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes journey-destination-fade-in {
            0% {
              opacity: 0;
              transform: translateY(8px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes journey-path-draw {
            0% {
              opacity: 0;
              transform: scaleY(0);
              transform-origin: top;
            }
            100% {
              opacity: 1;
              transform: scaleY(1);
              transform-origin: top;
            }
          }

          @keyframes journey-current-pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 var(--accent-5);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-5) 30%, transparent);
              transform: scale(1.02);
            }
          }

          @keyframes journey-completed-glow {
            0%, 100% {
              text-shadow: 0 0 0 transparent;
            }
            50% {
              text-shadow: 0 0 8px var(--accent-3);
            }
          }

          .animate-journey-destination {
            animation: journey-destination-fade-in 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            opacity: 0;
          }

          .animate-journey-path {
            animation: journey-path-draw 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            opacity: 0;
          }

          .animate-journey-current-pulse {
            animation: journey-current-pulse 2000ms ease-in-out infinite;
          }

          .animate-journey-completed-glow {
            animation: journey-completed-glow 2500ms ease-in-out infinite;
          }
        }
      `}</style>

      {/* Scenic Header with Background Image - Increased Height */}
      <div className="relative h-44 overflow-hidden shadow-elevated-1">
        {/* Background image - scenic backdrop */}
        <img
          src={stateHeaderBg}
          alt="Header background"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        
        {/* Header content overlay - back button, title, star counter */}
        <div className="relative z-10 h-full flex items-center justify-between px-5">
          {/* Back button - left side */}
          <button
            onClick={goBack}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-surface-card flex items-center justify-center text-text-primary flex-shrink-0 transition-all active:scale-95 shadow-soft"
          >
            <span className="text-label">‹</span>
          </button>

          {/* Center: India Journey title */}
          <h1 className="flex-1 text-center text-h2 font-extrabold text-text-on-header leading-tight px-4">
            India Journey
          </h1>

          {/* Star counter - right side */}
          <div className="h-10 px-3 rounded-full bg-surface-card flex items-center justify-center gap-1 text-text-primary flex-shrink-0 transition-all active:scale-95 shadow-soft">
            <span className="text-label">{EMOJI.action.star}</span>
            <span className="text-caption font-extrabold">{p.xp}</span>
          </div>
        </div>
      </div>

      {/* Progress Section - White Card with Overlap */}
      <div className="relative px-5 -mt-6 z-20 mb-6">
        <div className="bg-surface-card rounded-2xl shadow-elevated-1 p-5">
          {/* Top row: Label and count */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-body font-semibold text-text-secondary">
              Your India adventure
            </div>
            <div className="text-h5 font-extrabold text-text-primary">
              {completedStates}/{totalStates}
            </div>
          </div>
          
          {/* Bottom row: Progress bar */}
          <div className="flex-1 h-2.5 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedStates / totalStates) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main: Vertical Destination Journey Path */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-5 pt-4 relative"
        style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}
      >
        {/* Vertical path connecting all destinations */}
        <div className="absolute left-8 top-0 bottom-0 w-1 pointer-events-none">
          {/* Background line - all destinations */}
          {/* Note: Gradient uses accent-3 (completed) → accent-5 (current) → surface-muted (locked). */}
          {/* Accent-5 color varies by theme; verify sufficient contrast between states in all themes. */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent-3 via-accent-5 to-surface-muted" />
        </div>

        {/* Destination cards in horizontal layout */}
        <div className="relative space-y-3">
          {states.map((state, index) => {
            const isDone = state.status === "done";
            const isCurrent = state.status === "current";
            const isLocked = state.status === "locked" || state.status === "available";
            const artSrc = STATE_ART[state.name];

            return (
              <div
                key={state.name}
                className="animate-journey-destination ml-6 relative"
                style={{ "--animation-delay": `${index * 50}ms` } as React.CSSProperties}
              >
                {/* Vertical line node indicator - centered vertically on card */}
                <div
                  className="absolute -left-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                  style={{
                    borderColor: isDone ? "var(--accent-3)" : isCurrent ? "var(--accent-5)" : "var(--surface-muted)",
                    backgroundColor: isDone ? "var(--accent-3)" : isCurrent ? "var(--accent-5)" : "var(--surface-card)",
                  }}
                >
                  {/* Checkmark for completed */}
                  {isDone && (
                    <span className="text-xs text-on-header font-bold">✓</span>
                  )}
                  {/* Number for current and locked */}
                  {!isDone && (
                    <span className="text-xs text-on-header font-bold">{index + 1}</span>
                  )}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full animate-journey-current-pulse" />
                  )}
                </div>

                {/* Destination Card - Horizontal Layout */}
                <button
                  onClick={() => {
                    if (!isLocked) {
                      fxTap();
                      setView({ screen: "intro", name: state.name });
                    }
                  }}
                  disabled={isLocked}
                  className="w-full text-left transition-all active:scale-98"
                >
                  <div
                    className="flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300 h-20"
                    style={{
                      borderColor: isCurrent ? "var(--accent-5)" : isDone ? "var(--accent-3)" : "transparent",
                      backgroundColor: isDone
                        ? "var(--accent-3-soft)"
                        : isCurrent
                          ? "var(--accent-5-soft)"
                          : "var(--surface-muted)",
                    }}
                  >
                    {/* Destination Image - Left, fixed size */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-surface-card flex items-center justify-center">
                      <img
                        src={artSrc}
                        alt={state.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    {/* Destination Name and Status - Middle */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-body font-extrabold leading-tight line-clamp-1"
                        style={{
                          color: isDone
                            ? "var(--accent-3-ink)"
                            : isCurrent
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                        }}
                      >
                        {state.name}
                      </h3>
                      {/* Status label - smaller, secondary color */}
                      <div
                        className="text-xs font-semibold mt-0.5"
                        style={{
                          color: isDone
                            ? "var(--accent-3-ink)"
                            : isCurrent
                              ? "var(--accent-5)"
                              : "var(--text-secondary)",
                        }}
                      >
                        {isDone && "Completed ✓"}
                        {isCurrent && "Next destination"}
                        {isLocked && "Locked"}
                      </div>
                    </div>

                    {/* Action Button/Icon - Right, inline */}
                    <div className="flex-shrink-0">
                      {isDone && (
                        <div className="text-accent-3 text-lg font-bold animate-journey-completed-glow">
                          ✓
                        </div>
                      )}
                      {isCurrent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fxTap();
                            setView({ screen: "intro", name: state.name });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-accent-5 text-on-header font-bold text-sm transition-all active:scale-95 flex items-center justify-center"
                        >
                          {EMOJI.action.play}
                        </button>
                      )}
                      {isLocked && (
                        <div className="text-text-secondary text-lg">
                          🔒
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz Decision Modal */}
      {showQuizDecisionModal && pendingStateName && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          style={{ backgroundColor: "var(--scrim)" }}
        >
          <div className="bg-action-primary rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 flex flex-col">
            <div className="p-5 text-center">
              <div className="text-5xl mb-4">{EMOJI.action.celebrate}</div>
              <div className="text-caption text-ink font-black uppercase tracking-widest mb-2">
                All Done!
              </div>
              <h2 className="text-h2 text-ink font-extrabold">All 6 Cards Explored!</h2>
              <p className="text-body text-ink font-bold mt-3">Ready to test your knowledge?</p>
            </div>

            <div className="p-5 space-y-3 flex flex-col">
              <button
                onClick={() => {
                  fxTap();
                  setShowQuizDecisionModal(false);
                  setView({ screen: "quiz", name: pendingStateName });
                }}
                className="w-full h-12 ui-button ui-accent-3 text-body font-extrabold active:scale-95 transition-all"
              >
                {EMOJI.action.sparkle} Start Quiz Now
              </button>

              <button
                onClick={() => {
                  fxTap();
                  setShowQuizDecisionModal(false);
                  setPendingStateName(null);
                }}
                className="w-full h-12 ui-button ui-accent-1-soft text-body font-bold active:scale-95 transition-all"
              >
                ⏰ Ask Me Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StateIntroScreen({
  stateName,
  onBack,
  onContinue,
}: { stateName?: string; onBack?: () => void; onContinue?: () => void } = {}) {
  appLogger.info("state_intro_screen", "Mounted with stateName: " + stateName);

  const state = getState(stateName);
  const goBack = useGoBack();
  const art = STATE_ART[state.name];
  const grad = TONE_GRADIENT[state.tone] ?? "var(--accent-1)";

  // Determine current region for breadcrumb navigation
  const currentRegion = useMemo(() => {
    for (const regionKey of REGION_KEYS) {
      const region = REGIONS[regionKey];
      if (region.states.some((s) => s.name === state.name)) {
        return region;
      }
    }
    return null;
  }, [state.name]);

  appLogger.info(
    "state_intro_screen",
    "Rendered with stateName: " + stateName + ", state.name: " + state?.name,
  );

  useEffect(() => {
    appLogger.info("state_intro_screen", "useEffect - preloading art");
    preloadStateArt(state.name, nextStateAfter(state.name)?.name);
  }, [state.name]);

  return (
    <div className="h-full w-full flex flex-col bg-surface-card">
      <div className={`relative py-12 ${grad} overflow-hidden`}>
        <Cloud className="absolute top-6 left-2 w-20 opacity-80" />
        <Cloud className="absolute top-14 right-2 w-16 opacity-70" />


        <button
          onClick={() => {
            if (onBack) {
              fxTap();
              onBack();
            } else {
              goBack();
            }
          }}
          className="absolute top-3 left-4 h-12 w-12 rounded-full bg-text-on-header/25 backdrop-blur flex items-center justify-center text-text-on-header text-xl"
        >
          ‹
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-text-on-header/25 backdrop-blur rounded-full px-3 py-1.5 text-text-on-header text-xs font-extrabold">
          State {stateIndex(state.name) + 1} of {TOTAL_STATES}
        </div>
        {art ? (
          <img src={art} alt={`${stateName} state illustration`} />
        ) : (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-48 aspect-square flex items-center justify-center drop-shadow-2xl">
            <img
              src={STATE_ART[state.name]}
              alt={state.name}
              className="w-48 h-48 object-cover rounded-lg"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
      </div>

      <div className="-mt-8 rounded-t-[36px] bg-surface-card flex-1 px-5 pt-6 pb-5 relative z-10">
        <div className="text-xs font-black uppercase tracking-widest text-saffron">Welcome to</div>
        <h1 className="text-h1 leading-snug mt-1">{state.name}</h1>
        <div className="text-body text-text-secondary mt-1">
          <img
            src={STATE_ART[state.name]}
            alt={state.name}
            className="w-4 h-4 object-cover rounded inline-block mr-1"
            loading="lazy"
            decoding="async"
          />
          {state.nickname}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <IntroFact label="Capital" value={state.capital} icon={EMOJI.utility.capital} />
          <IntroFact label="Language" value={state.language} icon={EMOJI.utility.language} />
          <IntroFact label="Population" value={state.population} icon={EMOJI.utility.population} />
          <IntroFact label="Animal" value={state.animalName} icon={state.animal} />
        </div>

        <button
          onClick={() => {
            appLogger.info("state_intro_screen", "Start Exploring clicked, calling onContinue");
            fxTap();
            onContinue?.();
          }}
          className="mt-6 w-full h-14 ui-button ui-accent-1 text-h4 text-display"
        >
          Start Exploring! ✈️
        </button>
      </div>
    </div>
  );
}

function IntroFact({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="ui-card ui-accent-1-soft p-3">
      <div className="text-2xl">{icon}</div>
      <div className="text-label text-ink">{label}</div>
      <div className="text-h5 font-bold text-ink leading-tight">{value}</div>
    </div>
  );
}

export function LearningHubScreen({
  stateName,
  onBack,
  onQuiz,
  onCard,
  allowReplay,
}: {
  stateName?: string;
  onBack?: () => void;
  onQuiz?: () => void;
  onCard?: (index: number) => void;
  allowReplay?: boolean;
} = {}) {
  appLogger.info(
    "learning_hub_screen",
    "Mounted with stateName: " + stateName + ", allowReplay: " + allowReplay,
  );

  const progress = useProgress();
  const goBack = useGoBack();
  const celebration = useCelebration();
  const state = getState(stateName);
  const live = statesWithProgress(progress).find((s) => s.name === state.name);
  let status = live?.status ?? state.status;
  // If allowReplay is true, treat locked states as "current" so cards are playable
  if (allowReplay && status === "locked") {
    appLogger.info(
      "learning_hub_screen",
      "allowReplay is true and status was locked, changing to current",
    );
    status = "current";
  }

  appLogger.info(
    "learning_hub_screen",
    "Rendered with stateName: " +
      stateName +
      ", allowReplay: " +
      allowReplay +
      ", status: " +
      status,
  );
  const read = cardsRead(progress, state.name);

  // P2: Track unlock animation trigger - only trigger once when unlocking
  const [hasSeenUnlock, setHasSeenUnlock] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  // QUIZ BUTTON FIX: Compute whether all 6 main cards have been marked
  // This is independent of cardCounts calculation to ensure persistence across navigation/replay
  const allMainCardsMarked = useMemo(() => {
    const mainCardsInProgress = cardsRead(progress, state.name);
    const hasAll = mainCardsInProgress.length === 6 &&
      mainCardsInProgress.includes(0) &&
      mainCardsInProgress.includes(1) &&
      mainCardsInProgress.includes(2) &&
      mainCardsInProgress.includes(3) &&
      mainCardsInProgress.includes(4) &&
      mainCardsInProgress.includes(5);
    
    console.log(
      `[LearningHubScreen] allMainCardsMarked check: progress.cards[${state.name}]=${mainCardsInProgress}, hasAll=${hasAll}`,
    );
    
    return hasAll;
  }, [progress.cards, state.name]);

  // Category progress tracking - calculate card counts using cardVisits
  const allCards = useMemo(() => {
    return learningCardsFor(state.name, "en", progress.ageBand);
  }, [state.name, progress.ageBand]);

  const cardCounts = useMemo(() => {
    console.log(`[LearningHubScreen] cardCounts calculation for ${state.name}`);
    console.log(`[LearningHubScreen] allCards.length: ${allCards.length}`);

    // Get completed card indices for this state
    // Progress.cards[state.name] should contain: [0, 1, 2, 3, 4, 5] for completed categories
    const completedCardIndices = cardsRead(progress, state.name);
    console.log(`[LearningHubScreen] cardsRead for ${state.name}:`, completedCardIndices);
    console.log(
      `[LearningHubScreen] QUIZ BUTTON DEBUG: progress.cards[${state.name}] =`,
      progress.cards?.[state.name],
    );
    console.log(
      `[LearningHubScreen] QUIZ BUTTON DEBUG: completedCardIndices length = ${completedCardIndices.length}`,
    );

    // Calculate card counts per category
    // NOTE: We only count categories where the MAIN card (index 0-5) has been marked complete
    return Array.from({ length: 6 }).map((_, i) => {
      // Get all cards (main + enriched) for this category
      const allCategoryCards = allCards.filter((card) => card.mainCardIndex === i);

      // A category is complete ONLY if its main card index has been marked
      // Main cards are stored with indices 0-5 in progress.cards[state.name]
      const isCategoryComplete = completedCardIndices.includes(i);

      console.log(
        `[LearningHubScreen] Category ${i}: total cards: ${allCategoryCards.length}, main card (idx ${i}) completed: ${isCategoryComplete}`,
      );

      return {
        total: allCategoryCards.length,
        // If main card is complete, count all cards in category as "read"
        // Otherwise, count is 0 (partial reads don't count toward progress)
        read: isCategoryComplete ? allCategoryCards.length : 0,
      };
    });
  }, [allCards, progress.cards, state.name]);

  // Count completed categories (where ALL cards in that category are read)
  const completedCategories = useMemo(() => {
    const result = cardCounts.filter(
      (count) => count.total > 0 && count.read === count.total,
    ).length;
    console.log(`[LearningHubScreen] completedCategories: ${result}`);
    console.log(
      `[LearningHubScreen] cardCounts breakdown:`,
      cardCounts.map((c, i) => `Cat${i}: ${c.read}/${c.total}`).join(", "),
    );
    
    // QUIZ BUTTON FIX: Verify that we have all 6 main cards marked
    // This is the definitive source of truth - not a calculated count
    const mainCardsMarked = cardsRead(progress, state.name);
    const hasAllMainCards = mainCardsMarked.length === 6 &&
      mainCardsMarked.includes(0) &&
      mainCardsMarked.includes(1) &&
      mainCardsMarked.includes(2) &&
      mainCardsMarked.includes(3) &&
      mainCardsMarked.includes(4) &&
      mainCardsMarked.includes(5);
    
    console.log(
      `[LearningHubScreen] QUIZ BUTTON FINAL CHECK: result=${result}, hasAllMainCards=${hasAllMainCards}, mainCardsMarked=${mainCardsMarked.length}`,
    );
    
    // Return the calculated result, but log if it doesn't match direct check
    if (result === 6 && !hasAllMainCards) {
      console.warn(
        `[LearningHubScreen] QUIZ BUTTON MISMATCH: completedCategories=6 but main cards don't match!`,
      );
    }
    
    return result;
  }, [cardCounts, progress.cards, state.name]);

  // P2: Trigger unlock animation when quiz becomes available for first time
  useEffect(() => {
    if ((completedCategories === 6 || allMainCardsMarked) && !hasSeenUnlock) {
      setHasSeenUnlock(true);
      setShowUnlockAnimation(true);
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setShowUnlockAnimation(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [completedCategories, allMainCardsMarked, hasSeenUnlock]);

  // Track completion per category - all cards must be read
  const cards = [
    { icon: EMOJI.utility.capital, title: "Capital", sub: state.capital, tone: "orange" as const },
    { icon: EMOJI.utility.language, title: "Language", sub: state.language, tone: "blue" as const },
    { icon: EMOJI.utility.food, title: "Famous Food", sub: state.food, tone: "gold" as const },
    { icon: state.monument, title: "Places", sub: state.monumentName, tone: "green" as const },
    { icon: state.animal, title: "State Animal", sub: state.animalName, tone: "orange" as const },
    { icon: EMOJI.learning.funFact, title: "Fun Fact", sub: state.funFact, tone: "blue" as const },
  ].map((c, i) => {
    // Category is complete only if ALL cards in it are read
    const isCategoryComplete =
      cardCounts[i].total > 0 && cardCounts[i].read === cardCounts[i].total;

    return {
      ...c,
      index: i,
      categoryCardsTotal: cardCounts[i].total,
      categoryCardsRead: cardCounts[i].read,
      done: isCategoryComplete,
      active: i === completedCategories && status !== "locked",
      locked: status === "locked",
      canClick: status !== "locked",
      onOpen: () => onCard?.(i),
    };
  });

  // Get landscape background for this state
  const landscapeBg = STATE_ART[state.name];

  return (
    <div className="w-full bg-bg-page flex flex-col relative overflow-hidden">
      {/* CSS Keyframes for quiz button unlock animation and progress complete glow */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes quiz-unlock-bounce {
            0% {
              transform: scale(1) rotate(0deg);
              filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0));
            }
            25% {
              transform: scale(1.3) rotate(10deg);
              filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8));
            }
            50% {
              transform: scale(1.15) rotate(-5deg);
              filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
            }
            75% {
              transform: scale(1.25) rotate(8deg);
              filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.7));
            }
            100% {
              transform: scale(1) rotate(0deg);
              filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0));
            }
          }

          .animate-quiz-unlock-bounce {
            animation: quiz-unlock-bounce 1s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        }
      `}</style>

      {/* Landscape background layer - positioned absolutely, behind all content */}
      {landscapeBg && (
        <div
          className="absolute inset-0 opacity-10 blur-sm pointer-events-none"
          style={{
            backgroundImage: `url(${landscapeBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      )}

      {/* Content wrapper with z-index to sit above landscape */}
      <div className="relative z-10 flex flex-col w-full h-full">
        {/* HEADER SECTION - Simplified, clean header with background image and centered state name */}
        <div className="relative h-32 flex-shrink-0">
          {/* Background image - covers full header */}
          <img
            src={stateHeaderBg}
            alt="Header background"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          
          {/* Header content overlay - back button, title, star counter */}
          <div className="relative z-10 h-full flex items-center justify-between px-5">
            {/* Back button - left side, solid white circle */}
            <button
              onClick={() => {
                if (onBack) {
                  fxTap();
                  onBack();
                } else {
                  goBack();
                }
              }}
              className="h-10 w-10 rounded-full bg-surface-card flex items-center justify-center text-text-primary flex-shrink-0 transition-all active:scale-95 shadow-soft"
              aria-label="Go back"
            >
              <span className="text-label">‹</span>
            </button>

            {/* Center: State name - flex-grow to push star to right */}
            <h1 className="flex-1 text-center text-h2 font-extrabold text-text-on-header leading-tight px-4 truncate">
              {state.name}
            </h1>

            {/* Star counter - right side, solid white pill */}
            <div className="h-10 px-3 rounded-full bg-surface-card flex items-center justify-center gap-1 text-text-primary flex-shrink-0 shadow-soft">
              <span className="text-label">⭐</span>
              <span className="text-caption font-extrabold">{completedCategories * XP_PER_CARD}</span>
            </div>
          </div>
        </div>

        {/* PROGRESS CARD - Outside scroll container, overlaps header */}
        <div className="px-5 -mt-6 relative z-20 mb-6">
          <div className="bg-surface-card rounded-2xl shadow-elevated-1 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-label font-bold text-text-primary">Your state adventure</div>
              <div className="text-body font-extrabold text-text-primary">{completedCategories} / 6</div>
            </div>
            <div className="w-full h-2.5 bg-accent-5-soft rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${(completedCategories / 6) * 100}%`,
                  backgroundColor: "var(--accent-5)"
                }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable content area - allows all cards and quiz panel to be visible */}
        <div className="flex-1 overflow-y-auto">
          {/* SECTION HEADING & SUBTITLE */}
          <div className="px-5 mb-4">
            <h2 className="text-h2 text-text-primary font-extrabold mb-2">Explore the state</h2>
            <p className="text-body text-text-secondary">Complete all 6 challenges to unlock your quiz.</p>
          </div>

          {/* CHALLENGE CARDS GRID - 2 columns, natural flow, no fixed heights */}
          <div className="px-4 mb-6 grid grid-cols-2 gap-3">
            {cards.map((c, idx) => (
              <HubCard key={c.title} {...c} stateName={state.name} />
            ))}
          </div>

          {/* QUIZ PANEL - Full-width card with lock and sparkles */}
          <div className="px-4 pb-6">
            <button
              onClick={() => {
                // Use BOTH checks: completedCategories AND allMainCardsMarked
                // This ensures the quiz remains unlocked even after replay or navigation
                const shouldQuizBeUnlocked = completedCategories === 6 || allMainCardsMarked;
                
                if (shouldQuizBeUnlocked) {
                  fxTap();
                  onQuiz?.();
                }
              }}
              disabled={completedCategories < 6 && !allMainCardsMarked}
              className={`w-full rounded-2xl p-4 transition-all active:scale-95 flex items-center gap-3 ${
                (completedCategories === 6 || allMainCardsMarked)
                  ? "bg-accent-5-soft hover:shadow-md"
                  : "bg-accent-5-soft/50"
              }`}
            >
              {/* Lock/Unlock icon in circular background - P2: Animated emoji */}
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-h4 ${
                (completedCategories === 6 || allMainCardsMarked) ? "bg-accent-5/20" : "bg-accent-5/10"
              } ${showUnlockAnimation ? "animate-quiz-unlock-bounce" : ""}`}>
                {(completedCategories === 6 || allMainCardsMarked) ? "🔓" : "🔒"}
              </div>

              {/* Heading and subtitle - P3: Show counter when locked, progress dots when unlocked */}
              <div className="flex-1 text-left">
                <div className="text-label font-extrabold text-text-primary">
                  {(completedCategories === 6 || allMainCardsMarked) ? "State Quiz" : "State Quiz Locked"}
                </div>
                <div className="text-caption text-text-secondary">
                  {(completedCategories === 6 || allMainCardsMarked) 
                    ? "Test your knowledge"
                    : `${completedCategories} of 6 challenges complete`}
                </div>
                
                {/* P3: Progress dots - show when locked (not when unlocked) */}
                {(completedCategories < 6 && !allMainCardsMarked) && (
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                          i < completedCategories
                            ? "bg-accent-5"
                            : "bg-accent-5/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Decorative sparkles */}
              <div className="text-h4 flex-shrink-0">✨</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HubCard({
  icon,
  title,
  sub,
  tone,
  done,
  active,
  locked,
  canClick,
  stateName,
  categoryCardsTotal,
  categoryCardsRead,
  index,
  onOpen,
}: {
  icon: string;
  title: string;
  sub: string;
  tone: "orange" | "blue" | "green" | "gold";
  done?: boolean;
  active?: boolean;
  locked?: boolean;
  canClick?: boolean;
  index?: number;
  stateName?: string;
  categoryCardsTotal?: number;
  categoryCardsRead?: number;
  onOpen?: () => void;
}) {
  // Border styling based on index - use theme tokens
  // All cards use white background (no pastels)
  let borderColor = "var(--border-subtle)"; // Default subtle gray
  let borderWidth = "2px";
  let arrowBg = "bg-text-secondary/50";
  let arrowText = "text-text-primary";

  if (index === 0) {
    // Capital card - ORANGE accent border
    borderColor = "var(--accent-2)";
    borderWidth = "3px";
    arrowBg = "bg-accent-2";
    arrowText = "text-text-on-primary";
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (locked || !canClick) return;
        fxTap();
        onOpen?.();
      }}
      className="relative text-left transition active:scale-95 p-3 rounded-2xl flex flex-col h-full"
      style={{
        backgroundColor: "var(--surface-card)", // White for all cards
        borderColor: borderColor,
        borderWidth: borderWidth,
        borderStyle: "solid",
        opacity: locked ? 0.6 : 1,
        pointerEvents: locked || !canClick ? "none" : "auto",
        cursor: locked || !canClick ? "not-allowed" : "pointer",
      }}
    >
      {/* Top row: Number badge (left) + Icon (middle) + Checkmark badge (right) */}
      <div className="flex items-start justify-between mb-2">
        {/* Numbered badge in top-left */}
        {index !== undefined && !done && (
          <div className="h-6 w-6 rounded-full bg-surface-card flex items-center justify-center text-caption font-black text-text-primary shadow-soft flex-shrink-0">
            {String(index + 1).padStart(2, "0")}
          </div>
        )}
        
        {/* Empty space when done (so checkmark aligns right) */}
        {done && (
          <div className="h-6 w-6" />
        )}

        {/* Icon - center */}
        <div className="text-h3 mx-auto flex-shrink-0">{icon}</div>

        {/* Checkmark badge for completed - top right, green with white checkmark */}
        {done && (
          <div className="h-8 w-8 rounded-full bg-action-success text-text-on-primary flex items-center justify-center text-base font-black shadow-lg flex-shrink-0 border-2 border-white">
            ✓
          </div>
        )}
      </div>

      {/* Title - grows to fill space */}
      <div className="text-h5 text-text-primary font-extrabold leading-tight mb-1 flex-grow">{title}</div>

      {/* Subtitle */}
      <div className="text-body text-text-secondary font-medium mb-2 line-clamp-2">{sub}</div>

      {/* Bottom row: Question count (left) + Arrow button (right) */}
      <div className="flex items-center justify-between mt-auto">
        {/* Question count */}
        {categoryCardsTotal !== undefined && categoryCardsRead !== undefined && (
          <div className={`text-body font-bold ${done ? "text-action-success" : "text-text-secondary"}`}>
            {categoryCardsRead}/{categoryCardsTotal}
          </div>
        )}
        
        {/* Arrow button - bottom right */}
        {!done && !locked && (
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-caption font-bold ml-auto flex-shrink-0 ${arrowBg} ${arrowText}`}>
            →
          </div>
        )}
        
        {/* Locked icon - bottom right */}
        {locked && (
          <div className="h-6 w-6 rounded-full bg-text-secondary/70 text-text-on-primary flex items-center justify-center text-caption flex-shrink-0 ml-auto">
            🔒
          </div>
        )}
      </div>
    </button>
  );
}

export type EnhancedCard = {
  kicker: string;
  title: string;
  icon: string;
  chip: string;
  body: string;
  type: "main" | "coolFact" | "didYouKnow" | "tryThis";
  gradient: string;
  chipTone: "orange" | "amber" | "purple" | "green";
  mainCardIndex: number; // Track which main card this belongs to (0-5)
};

export function learningCardsFor(
  stateName?: string,
  displayLanguage: string = "en",
  ageBand: string = "8-9",
): EnhancedCard[] {
  const state = getState(stateName);
  const enrichedContent = getStateContent(state.name);

  // Helper to extract text from string | AgeTaggedContent
  const getText = (value: string | AgeTaggedContent | undefined): string => {
    if (!value) return "";
    return typeof value === "string" ? value : value.text;
  };

  // Map of main card definitions
  const mainCardDefinitions = [
    {
      kicker: "Capital",
      title: state.capital,
      icon: EMOJI.utility.capital,
      chip: "Capital City",
      body: `${state.capital} is the capital city of ${state.name}. It is where the state's government works from.`,
      enrichedKey: "capital" as const,
    },
    {
      kicker: "Language",
      title: state.language,
      icon: EMOJI.utility.language,
      chip: "Language",
      body: `People in ${state.name} mostly speak ${state.language}. Try saying hello in it!`,
      enrichedKey: "language" as const,
    },
    {
      kicker: "Famous Food",
      title: state.food,
      icon: EMOJI.utility.food,
      chip: "Food",
      body: `${state.food} is a favourite dish of ${state.name}. Yum!`,
      enrichedKey: "food" as const,
    },
    {
      kicker: "Places",
      title: state.monumentName,
      icon: state.monument,
      chip: "Monument",
      body: `${state.monumentName} is a treasure of ${state.name}, ${state.nickname.toLowerCase()}.`,
      enrichedKey: "places" as const,
    },
    {
      kicker: "State Animal",
      title: state.animalName,
      icon: state.animal,
      chip: "Animal",
      body: `The ${state.animalName} is a special animal you can find in ${state.name}.`,
      enrichedKey: "animal" as const,
    },
    {
      kicker: "Fun Fact",
      title: "Did you know?",
      icon: EMOJI.learning.funFact,
      chip: "Fun Fact",
      body: state.funFact,
      enrichedKey: "funFact" as const,
    },
  ];

  // Build all cards with their enriched layers
  const allCards: EnhancedCard[] = [];

  mainCardDefinitions.forEach((def, mainIndex) => {
    // Get the correct card content based on selected language AND age band
    const enrichedCard = enrichedContent ? enrichedContent[def.enrichedKey] : undefined;

    // If enriched content exists and has language variants, get the language-specific version
    // Also filter by age band for age-appropriate content
    const cardContent = enrichedCard
      ? getCardContentByAge(state.name, def.enrichedKey, displayLanguage, ageBand)
      : null;

    // Use enriched content if available and in selected language, otherwise fall back to default
    const body = cardContent?.mainText || def.body;
    const title = cardContent?.title || def.title;

    // Add main card
    allCards.push({
      kicker: def.kicker,
      title: title,
      icon: def.icon,
      chip: def.chip,
      body: body,
      type: "main",
      gradient: "var(--accent-2)",
      chipTone: "orange",
      mainCardIndex: mainIndex,
    });

    // Add enriched content layers if available
    if (cardContent) {
      // Add Cool Facts
      if (cardContent.coolFacts && cardContent.coolFacts.length > 0) {
        cardContent.coolFacts.forEach((fact, idx) => {
          allCards.push({
            kicker: "Cool Fact",
            title: `Cool Fact #${idx + 1}`,
            icon: EMOJI.action.star,
            chip: "Cool Fact",
            body: getText(fact),
            type: "coolFact",
            gradient: "var(--accent-6)",
            chipTone: "amber",
            mainCardIndex: mainIndex,
          });
        });
      }

      // Add Did You Know
      if (cardContent.didYouKnow) {
        allCards.push({
          kicker: "Trivia",
          title: "Did You Know?",
          icon: EMOJI.learning.brain,
          chip: "Did You Know?",
          body: getText(cardContent.didYouKnow),
          type: "didYouKnow",
          gradient: "var(--accent-5)",
          chipTone: "purple",
          mainCardIndex: mainIndex,
        });
      }

      // Add Try This Activity
      if (cardContent.tryThis) {
        allCards.push({
          kicker: "Activity",
          title: "Try This Activity",
          icon: EMOJI.learning.game,
          chip: "Try This Activity",
          body: getText(cardContent.tryThis),
          type: "tryThis",
          gradient: "var(--accent-3)",
          chipTone: "green",
          mainCardIndex: mainIndex,
        });
      }
    }
  });

  return allCards;
}

// Helper function to get the starting index of a main card (0-5) in the flattened card array
function getMainCardStartIndex(mainCardIndex: number, cards: EnhancedCard[]): number {
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].mainCardIndex === mainCardIndex) {
      return i;
    }
  }
  return 0;
}

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
  gu: "Gujarati",
  mr: "Marathi",
  kn: "Kannada",
  ml: "Malayalam",
  or: "Odia",
  bn: "Bengali",
  pa: "Punjabi",
  kok: "Konkani",
  as: "Assamese",
  mni: "Manipuri",
  kha: "Khasi",
  miz: "Mizoram",
  hne: "Chhattisgarhi",
  ks: "Kashmiri",
  lbj: "Ladakhi",
  ne: "Nepali",
};

export function LearningCardScreen({
  stateName,
  cardIndex = 0,
  onNext,
  onClose,
}: {
  stateName?: string;
  cardIndex?: number;
  onNext?: (nextIndex: number | null) => void;
  onClose?: () => void;
} = {}) {
  const progress = useProgress();
  const state = getState(stateName);
  const art = STATE_ART[state.name];
  const grad = TONE_GRADIENT[state.tone] ?? "var(--accent-1)";
  const celebration = useCelebration();
  const level = levelInfo(progress.xp);

  // Learning Card Screen - State and Navigation
  // mainCardIndex tracks which category (0-5)
  // cardIndexInCategory tracks position within category (0-4 or more)
  const [displayLanguage, setDisplayLanguage] = useState<LanguageCode>(() => {
    // Start with English, will validate based on available languages
    const available = getAvailableLanguages(state.name);
    return (available.includes("en") ? "en" : (available[0] ?? "en")) as LanguageCode;
  });
  const [mainCardIndex, setMainCardIndex] = useState(cardIndex ?? 0); // Which category (0-5)
  const [cardIndexInCategory, setCardIndexInCategory] = useState(0); // Position within category (0-4 usually)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);

  // Detect unsupported language and show fallback notification
  const nativeLanguageCode = getNativeLanguage(state.name);
  useLanguageFallbackNotice(state.name, nativeLanguageCode);

  // Now compute cards using displayLanguage and ageBand (which are now declared)
  const cards = useMemo(() => {
    const loadedCards = learningCardsFor(state.name, displayLanguage, progress.ageBand);
    // Validate we got cards back
    if (!Array.isArray(loadedCards) || loadedCards.length === 0) {
      // Fallback to English if current language failed
      const fallbackCards = learningCardsFor(state.name, "en", progress.ageBand);
      if (displayLanguage !== "en" && Array.isArray(fallbackCards) && fallbackCards.length > 0) {
        setDisplayLanguage("en");
        return fallbackCards;
      }
      return [];
    }
    return loadedCards;
  }, [state.name, displayLanguage, progress.ageBand]);

  // Get cards for current category only
  const cardsInCurrentCategory = useMemo(() => {
    if (!Array.isArray(cards)) return [];
    return cards.filter((c) => c && c.mainCardIndex === mainCardIndex);
  }, [cards, mainCardIndex]);

  // Get current card object with validation
  const currentCard = useMemo(() => {
    if (
      !Array.isArray(cardsInCurrentCategory) ||
      cardIndexInCategory >= cardsInCurrentCategory.length
    ) {
      return undefined;
    }
    return cardsInCurrentCategory[cardIndexInCategory];
  }, [cardsInCurrentCategory, cardIndexInCategory]);

  // Get global index for progress tracking with validation
  // FIXED: Instead of loose matching (mainCardIndex + kicker + title), calculate directly from structure
  // Cards are organized as: mainCard[0], enriched[0-4], mainCard[1], enriched[0-4], etc.
  // This avoids false matches when multiple cards share the same properties
  const currentCardIndex = useMemo(() => {
    if (!currentCard || !Array.isArray(cards) || cards.length === 0) return -1;
    
    // Calculate the start index of the current main card section
    let sectionStartIndex = 0;
    for (let i = 0; i < currentCard.mainCardIndex; i++) {
      // Count how many cards belong to each main card section (main + enriched)
      const cardsInMainCard = cards.filter((c) => c && c.mainCardIndex === i).length;
      sectionStartIndex += cardsInMainCard;
    }
    
    // Global index is: section start + position within the category
    const globalIndex = sectionStartIndex + cardIndexInCategory;
    
    // Validate the index points to the expected card
    if (globalIndex >= 0 && globalIndex < cards.length && cards[globalIndex]) {
      const cardAtIndex = cards[globalIndex];
      // Sanity check: verify this is the card we expect
      if (
        cardAtIndex.mainCardIndex === currentCard.mainCardIndex &&
        cardAtIndex.kicker === currentCard.kicker &&
        cardAtIndex.title === currentCard.title
      ) {
        return globalIndex;
      }
    }
    
    // Fallback: if structural calculation failed, use loose findIndex as last resort
    // This maintains backward compatibility but logs the issue
    const fallbackIndex = cards.findIndex(
      (c) =>
        c &&
        c.mainCardIndex === currentCard.mainCardIndex &&
        c.kicker === currentCard.kicker &&
        c.title === currentCard.title,
    );
    
    if (fallbackIndex >= 0) {
      console.warn(
        `[LearningCardScreen] Structural index calculation failed for card "${currentCard.kicker}". Fell back to findIndex. This may indicate a data structure mismatch.`,
      );
    }
    
    return fallbackIndex;
  }, [currentCard, cards, cardIndexInCategory, mainCardIndex]);

  const enrichedContent = getStateContent(state.name);

  useEffect(() => {
    preloadStateArt(state.name, nextStateAfter(state.name)?.name);
  }, [state.name]);

  // Track card visit when a new card is displayed
  useEffect(() => {
    if (currentCard && state) {
      // Get the main category this card belongs to
      const mainCategoryIndex = currentCard.mainCardIndex;
      const mainCategories = ["capital", "language", "food", "places", "animal", "fact"];
      const mainCategoryKey = mainCategories[mainCategoryIndex];

      if (mainCategoryKey !== undefined) {
        console.log(
          `[LearningCardScreen] Marking card visit: state="${state.name}", kicker="${currentCard.kicker}", type="${currentCard.type}", mainCategory="${mainCategoryKey}", cardIndexInCategory=${cardIndexInCategory}`,
        );
        // Mark visit under the main category, regardless of whether it's a main or sub-card
        // This way, all cards (main + sub-cards) are counted toward the category total
        markCardVisit(state.name, mainCategoryKey, cardIndexInCategory);
      }
    }
  }, [cardIndexInCategory, state?.name]);

  // When cardIndex prop changes, update mainCardIndex
  useEffect(() => {
    setMainCardIndex(cardIndex ?? 0);
    setCardIndexInCategory(0);
  }, [cardIndex]);

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      stopTts();
    };
  }, []);

  const card = currentCard; // Use validated currentCard from useMemo
  const isLast = currentCardIndex >= 0 && currentCardIndex === cards.length - 1;
  const isReplaying =
    currentCardIndex >= 0 && currentCard
      ? isCardReplaying(progress, state.name, currentCardIndex)
      : false;
  const replayCount =
    currentCardIndex >= 0 ? getReplayCount(progress, state.name, currentCardIndex) : 0;

  // Safety check: ensure card exists and currentCardIndex is valid
  if (!card || currentCardIndex < 0 || !Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-info-soft">
        <div className="text-center">
          <div className="text-5xl mb-3">{EMOJI.utility.warning}</div>
          <h1 className="text-h4 text-ink mb-2">Card content unavailable</h1>
          <p className="text-sm text-text-secondary mb-4">Please try again or go back</p>
          <button
            onClick={() => window.history.back()}
            className="ui-button ui-accent-2 px-4 py-2 font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Find the main card index for the current card
  const currentMainCardIndex = card?.mainCardIndex ?? -1;

  // Find where the current main card section ends
  let mainCardSectionEnd = currentCardIndex;
  while (
    mainCardSectionEnd < cards.length - 1 &&
    cards[mainCardSectionEnd + 1]?.mainCardIndex === currentMainCardIndex
  ) {
    mainCardSectionEnd++;
  }

  const isLastInMainCardSection = currentCardIndex === mainCardSectionEnd;

  // Swipe gesture detection
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    if (touchStart !== null) {
      const swipeThreshold = 50;
      const diff = touchStart - e.changedTouches[0].clientX;

      // Swipe left (show next card)
      if (diff > swipeThreshold && cardIndexInCategory < cardsInCurrentCategory.length - 1) {
        fxTap();
        setCardIndexInCategory(cardIndexInCategory + 1);
      }
      // Swipe right (show previous card)
      else if (diff < -swipeThreshold && cardIndexInCategory > 0) {
        fxTap();
        setCardIndexInCategory(cardIndexInCategory - 1);
      }
    }
  };

  const handlePrevious = () => {
    if (cardIndexInCategory > 0) {
      fxTap();
      setCardIndexInCategory(cardIndexInCategory - 1);
    }
  };

  const handleNext = () => {
    if (cardIndexInCategory < cardsInCurrentCategory.length - 1) {
      // Moving to next card in same category - mark the main card (only once per category)
      const currentCard = cardsInCurrentCategory[cardIndexInCategory];
      
      // FIX #24: Only mark the MAIN card (type="main"), not enriched sub-cards
      // Sub-cards should not trigger progress marking
      if (currentCard.type === "main") {
        // Check if main card was already marked
        const mainCardIndex = currentCard.mainCardIndex;
        const mainCardAlreadyRead = progress.cards?.[state.name]?.includes(mainCardIndex) ?? false;
        const isReplaying = mainCardAlreadyRead;

        console.log(
          `[LearningCardScreen] handleNext (moving within category): Marking main card: state="${state.name}", mainCardIndex=${mainCardIndex}, kicker="${currentCard.kicker}", replay=${isReplaying}`,
        );
        // Mark main card (use mainCardIndex 0-5, not global card index)
        markCard(state.name, mainCardIndex, isReplaying);
      } else {
        console.log(
          `[LearningCardScreen] handleNext: Skipping mark for sub-card type="${currentCard.type}", kicker="${currentCard.kicker}" (not a main card)`,
        );
      }

      // Show immediate celebration only on first read of main card (not replay)
      if (currentCard.type === "main") {
        const mainCardAlreadyRead = progress.cards?.[state.name]?.includes(currentCard.mainCardIndex) ?? false;
        
        if (!mainCardAlreadyRead) {
          fxCorrect();
          // DISABLED FOR NOW - PHASE 2: Card learning celebration
          // celebration.custom(
          //   `${currentCard.kicker} card learned!`,
          //   "{EMOJI.feedback.trophy}",
          //   {
          //     subtitle: `+${XP_PER_CARD} XP earned ›¢ ${cardIndexInCategory + 1}/${cardsInCurrentCategory.length} cards in ${currentCard.kicker}`,
          //     confetti: true,
          //     duration: 2000,
          //     type: "success",
          //   }
          // );
        }
      }

      // Auto-advance to next card
      fxTap();
      setCardIndexInCategory(cardIndexInCategory + 1);
    } else {
      // Last card in this category - mark main card and move to next category or exit
      const currentCard = cardsInCurrentCategory[cardIndexInCategory];
      
      // FIX #24: Only mark the MAIN card (type="main"), not enriched sub-cards
      if (currentCard.type === "main") {
        // Check if main card was already marked
        const mainCardIndex = currentCard.mainCardIndex;
        const mainCardAlreadyRead = progress.cards?.[state.name]?.includes(mainCardIndex) ?? false;
        const isReplaying = mainCardAlreadyRead;

        console.log(
          `[LearningCardScreen] handleNext (last card): Marking main card: state="${state.name}", mainCardIndex=${mainCardIndex}, kicker="${currentCard.kicker}", replay=${isReplaying}`,
        );
        // Mark main card (use mainCardIndex 0-5, not global card index)
        markCard(state.name, mainCardIndex, isReplaying);
      } else {
        console.log(
          `[LearningCardScreen] handleNext (last): Skipping mark for sub-card type="${currentCard.type}", kicker="${currentCard.kicker}" (not a main card)`,
        );
      }

      // Show category completion celebration
      if (currentCard.type === "main") {
        const mainCardAlreadyRead = progress.cards?.[state.name]?.includes(currentCard.mainCardIndex) ?? false;
        
        if (!mainCardAlreadyRead) {
          fxCorrect();
          // DISABLED FOR NOW - PHASE 2: Card learning celebration
          // celebration.custom(
          //   `${currentCard.kicker} card learned!`,
          //   "{EMOJI.feedback.trophy}",
          //   {
          //     subtitle: `+${XP_PER_CARD} XP earned ›¢ ${currentCard.kicker} category complete! {EMOJI.audio.stories}`,
          //     confetti: true,
          //     duration: 2000,
          //     type: "success",
          //   }
          // );
        }
      }

      // Move to next category or exit
      fxTap();
      onNext?.(null);
    }
  };

  const handleMainCardDone = () => {
    fxTap();

    // Get the main card index for the current card
    const mainCardIdx = currentMainCardIndex;
    
    // FIX #24: Check if MAIN CARD INDEX has been marked (indices 0-5 only)
    // Progress array stores main card indices [0, 1, 2, 3, 4, 5], not global card positions
    const mainCardAlreadyRead = progress.cards?.[state.name]?.includes(mainCardIdx) ?? false;

    // Mark the main card as learned (only once)
    const wasFirstRead = !mainCardAlreadyRead;

    // Show immediate celebration when completing main card for the first time
    if (wasFirstRead) {
      fxCorrect(); // Rising chime sound

      const mainCardNames = [
        "Capital",
        "Language",
        "Famous Food",
        "Places",
        "State Animal",
        "Fun Fact",
      ];
      const categoryName = mainCardNames[mainCardIdx] ?? `Category ${mainCardIdx + 1}`;

      showSuccessToast(`${categoryName} mastered! 🎉`, {
        duration: 2500,
        icon: "🏆",
      });
    }

    // VALIDATION: Ensure we're marking the main card index (0-5), not a derived index
    console.log(
      `[LearningCardScreen] handleMainCardDone: Marking main card: state="${state.name}", mainCardIdx=${mainCardIdx}, firstRead=${wasFirstRead}`,
    );
    
    // Mark the main card (use mainCardIdx as the index - must be 0-5)
    markCard(state.name, mainCardIdx, !wasFirstRead);

    // If this is the last main card, go to quiz
    if (currentMainCardIndex === 5) {
      onNext?.(null);
    } else {
      // Go back to card selection screen (pass null to signal back to hub)
      onClose?.();
    }
  };

  return (
    <div className="h-full w-full bg-surface-card flex flex-col">
      {/* Top Bar: Close + Progress + Language + Listen */}
      <div className="px-5 pt-3 pb-3 flex items-center gap-2 bg-surface-overlay/40 backdrop-blur-sm">
        <button
          onClick={() => {
            fxTap();
            onClose?.();
          }}
          aria-label="Close learning card"
          className="h-12 w-12 rounded-full bg-surface-card shadow-soft flex items-center justify-center text-h4"
        >
          {EMOJI.ui.close}
        </button>

        {/* Card counter and progress bar */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="text-display font-extrabold text-saffron whitespace-nowrap">
            {cardIndexInCategory + 1}/{cardsInCurrentCategory.length}
          </div>
          <div className="h-2 rounded-full bg-surface-card overflow-hidden shadow-inner flex-1">
            <div
              className={`h-full ${grad} transition-all`}
              style={{
                width: `${((cardIndexInCategory + 1) / cardsInCurrentCategory.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Language Toggle - Compact flag-based selector */}
        {getAvailableLanguages(state.name).length > 1 && (
          <LanguageSwitcher
            language={displayLanguage === "en" ? "en" : "native"}
            onChange={(newLang) => {
              fxTap();
              const availableLangs = getAvailableLanguages(state.name);
              const langCode =
                newLang === "en" ? "en" : (availableLangs.find((l) => l !== "en") ?? "en");
              setDisplayLanguage(langCode);
            }}
          />
        )}

        {/* Listen Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();

            const isPlaying = playingCardIndex === currentCardIndex;

            if (isPlaying) {
              // Stop playing
              stopTts();
              setPlayingCardIndex(null);
            } else {
              // Start playing current card content - strip emojis, read body only
              const textToRead = card.body
                .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
                .replace(/\s+/g, " ")
                .trim();
              playStateNarration(
                `card-${state.name}-${currentCardIndex}`,
                state.name,
                textToRead,
                {
                  speed: 0.85,
                  pitch: 1.05,
                },
                displayLanguage,
              );
              setPlayingCardIndex(currentCardIndex);
            }
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
          className={`h-9 px-3 rounded-full shadow-soft flex items-center justify-center gap-2 text-label transition-all active:scale-95 whitespace-nowrap ${
            playingCardIndex === currentCardIndex
              ? "bg-action-primary text-text-on-primary shadow-lg animate-pulse"
              : "bg-accent-1-soft text-accent-1 hover:shadow-md border border-accent-1"
          }`}
          title="Play card content"
        >
          {playingCardIndex === currentCardIndex ? EMOJI.ui.pause : EMOJI.action.play} Listen
        </button>
      </div>

      <div className="px-5 mt-3">
        <div className="text-xs font-black uppercase tracking-wider text-saffron">
          {state.name} · {card.kicker}
        </div>
        <h2 className="text-display text-2xl font-extrabold leading-tight mt-1">{card.title}</h2>
      </div>

      <div
        className="mx-5 mt-4 ui-card ui-accent-1-soft p-4 flex-1 flex flex-col relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Replay indicator - shown when user is replaying a card */}
        {isReplaying && (
          <div className="mb-3 p-3 bg-accent-2-soft rounded-xl flex items-center gap-2 shadow-sm border border-accent-2">
            <span className="text-lg">{EMOJI.action.replay}</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-accent-5">Replaying this card</p>
              <p className="text-xs text-accent-5 font-medium">
                You've mastered this! Keep practicing {EMOJI.action.sparkle}
              </p>
            </div>
            <span className="text-2xl">{EMOJI.action.sparkle}</span>
          </div>
        )}

        <div
          className={`flex-1 rounded-2xl flex items-center justify-center overflow-hidden bg-surface-card ${!art || card.type !== "main" || card.kicker !== "Places" ? "py-8" : ""}`}
        >
          {art && card.type === "main" && card.kicker === "Places" ? (
            <img
              src={art}
              alt={`${state.name} learning card`}
              loading="lazy"
              decoding="async"
              className="h-full object-contain drop-shadow-xl"
            />
          ) : (
            <div className="text-[72px] drop-shadow-xl">{card.icon}</div>
          )}
        </div>
        <div className="mt-3 bg-surface-raised rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Chip
              icon={card.icon}
              tone={
                card.chipTone === "purple"
                  ? "blue"
                  : (card.chipTone as "orange" | "blue" | "green" | "gold")
              }
            >
              {card.chip}
            </Chip>
            <Chip icon={EMOJI.learning.state} tone="blue">
              {state.name}
            </Chip>
          </div>
          <p className="mt-2 font-semibold text-ink/85 text-[15px] leading-snug">{card.body}</p>
        </div>

        {/* Swipe hint for non-last cards */}
        {!isLast && !isLastInMainCardSection && (
          <div className="mt-3 text-center text-xs font-semibold text-ink/50">
            ← Swipe or tap Next →
          </div>
        )}

        {/* Mastery badge for replayed cards */}
        {isReplaying && replayCount > 0 && (
          <div className="mt-3 px-3 py-2 bg-accent-2-soft rounded-lg text-center border border-accent-2">
            <p className="text-xs font-bold text-warning">
              {EMOJI.action.star} Mastered! Replayed {replayCount}x
            </p>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-2">
        <button
          onClick={() => {
            if (isLastInMainCardSection) {
              handleMainCardDone();
            } else {
              handleNext();
            }
          }}
          className="w-full h-14 ui-button ui-accent-1 text-h4 text-display"
        >
          {isLastInMainCardSection
            ? currentMainCardIndex === 5
              ? `Take the Quiz! ${EMOJI.milestone.twentyFive}`
              : "Done! Back to Cards"
            : isReplaying
              ? `Replay Complete ${EMOJI.action.sparkle}`
              : "Got it! Next →"}
        </button>
      </div>

    </div>
  );
}

export function QuizScreen({
  stateName,
  onDone,
  onClose,
}: {
  stateName?: string;
  onDone?: (quizMetrics?: {
    timeToComplete: number;
    quizAttempts: number;
    quizScore: number;
    correctCount?: number;
  }) => void;
  onClose?: () => void;
} = {}) {
  const progress = useProgress();
  const states = statesWithProgress(progress);

  // Safety check: ensure states data is loaded
  if (!states || states.length === 0) {
    return <LoadingScreen />;
  }

  return <QuizScreenContent stateName={stateName} onDone={onDone} onClose={onClose} />;
}

function QuizScreenContent({
  stateName,
  onDone,
  onClose,
}: {
  stateName?: string;
  onDone?: (quizMetrics?: {
    timeToComplete: number;
    quizAttempts: number;
    quizScore: number;
    correctCount?: number;
  }) => void;
  onClose?: () => void;
}) {
  const progress = useProgress();
  const states = statesWithProgress(progress);
  const level = levelInfo(progress.xp);

  const activeName =
    stateName ??
    states.find((s) => s.status === "current")?.name ??
    states.find((s) => s.status !== "done")?.name ??
    states[0].name;

  const questions = useMemo(() => {
    const qCount = questionCountForAgeBand(progress.ageBand);
    return randomQuestionsForState(activeName, qCount);
  }, [activeName, progress.ageBand]);

  // Track quiz start on first render
  useEffect(() => {
    firebaseEvents.quizStart({
      stateName: activeName,
      ageBand: progress.ageBand,
      questionCount: questions.length,
    });
  }, [activeName, progress.ageBand, questions.length]);

  const [index, setIndex] = useState(0);
  const question = questions[Math.min(index, questions.length - 1)];

  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [burst, setBurst] = useState(0);
  const [navigationStarted, setNavigationStarted] = useState(false); // Prevent double navigation
  const [quizStartTime] = useState(Date.now());
  // Track answers: array of { id, correct } for accurate score calculation
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Array<{ id: string; correct: boolean }>
  >([]);

  const answers = question.options;
  const correct = question.correct;

  const onSelect = (label: string) => {
    if (result) return;
    fxTap();
    setSelected(label);
  };

  const onCheck = () => {
    if (!selected || result) return;
    const isCorrect = selected === correct;

    if (isCorrect) {
      fxCorrect();
      addXP(question.xp, question.id);
      setResult("correct");
      setBurst((n) => n + 1);

      // Track correct answer
      firebaseEvents.quizAnswer({
        stateName: activeName,
        questionId: question.id,
        isCorrect: true,
      });
    } else {
      fxWrong();
      setResult("wrong");

      // Track wrong answer
      firebaseEvents.quizAnswer({
        stateName: activeName,
        questionId: question.id,
        isCorrect: false,
      });
    }
  };

  const isLastQuestion = index === questions.length - 1;
  const onReset = () => {
    fxTap();
    // Prevent double navigation on last question
    if (navigationStarted) return;

    // Record this answer
    const isCorrect = selected === correct;
    const newAnsweredQuestions = [...answeredQuestions, { id: question.id, correct: isCorrect }];

    // Always move to next question (or finish if last)
    if (isLastQuestion) {
      setNavigationStarted(true);

      // Calculate accurate score from stored answers
      const totalCorrect = newAnsweredQuestions.filter((a) => a.correct).length;
      const scorePercentage = (totalCorrect / questions.length) * 100;

      const quizDuration = Date.now() - quizStartTime;

      // Track quiz completion with accurate metrics
      firebaseEvents.quizComplete({
        stateName: activeName,
        questionsAnswered: questions.length,
        correctAnswers: totalCorrect,
        scorePercentage,
        timeSpentSeconds: quizDuration / 1000,
      });

      // Check if this is a replay (state already completed)
      const isReplay = progress.completed.includes(activeName);

      // Pass quiz metrics to completion screen for badge tracking
      const quizMetrics = {
        timeToComplete: quizDuration,
        quizAttempts: isReplay ? 2 : 1, // Track real attempt number
        quizScore: scorePercentage,
        correctCount: totalCorrect, // NEW: pass correct answer count for star calculation
      };

      // ATOMIC: Call finishQuiz to complete state, award XP/stars, and queue celebration
      // This happens before navigation to ensure state is consistent
      finishQuiz(activeName, quizMetrics);

      // Use setTimeout to ensure state is settled before navigation
      // CRITICAL FIX: Increased delay from 50ms to 200ms to guarantee progress persists
      setTimeout(() => {
        onDone?.(quizMetrics);
      }, 200);
      return;
    }

    // Move to next question
    setIndex((i) => i + 1);
    setResult(null);
    setSelected(null);
    setAnsweredQuestions(newAnsweredQuestions);
  };

  return (
    <div className="h-full w-full bg-surface-card flex flex-col relative">
      <ConfettiBurst trigger={burst} size="small" />

      {/* REDESIGNED TOP BAR - Clean & Minimal */}
      <div className="px-5 pt-3 pb-2 flex items-center gap-2">
        {/* Close Button - Goes back to category page */}
        <button
          onClick={() => {
            fxTap();
            // Back to hub/category page instead of quiz screen
            onClose?.();
          }}
          aria-label="Back to categories"
          className="h-12 w-12 rounded-full ui-button ui-accent-1-soft flex items-center justify-center text-xl flex-shrink-0"
        >
          ←
        </button>

        {/* Progress Blocks - Color coded (Green=Correct, Red=Wrong, Blue=Current) */}
        <div className="flex-1 flex items-center gap-1 ml-1">
          {questions.map((q, i) => {
            let bgColor = "bg-surface-raised"; // Not answered yet
            if (i < index) {
              bgColor = "bg-fb-success-bg"; // Correct answer
            } else if (i === index) {
              bgColor = "bg-accent-2"; // Current question
            }
            return (
              <div
                key={q.id}
                className={`h-2.5 flex-1 rounded-full transition-colors ${bgColor}`}
              />
            );
          })}
        </div>

        {/* Question counter */}
        <div className="text-display font-extrabold text-explorer text-sm flex-shrink-0">
          Q{index + 1}/{questions.length}
        </div>
      </div>

      {/* Status Bar with XP Info - Clean */}
      <div className="px-5 py-2 mx-5 ui-card ui-accent-1-soft flex items-center justify-between text-xs">
        <div className="font-bold text-text-secondary">
          Total: {answeredQuestions.filter((a) => a.correct).length * 20} XP
        </div>
        <div className="font-bold text-success">+20 per answer</div>
      </div>

      <div className="px-5 mt-3 flex items-center gap-3">
        <img
          key={result === "correct" ? `cheer-${burst}` : "idle"}
          src={mascot}
          alt=""
          className={`w-16 h-16 object-contain ${result === "correct" ? "mascot-cheer" : ""}`}
        />
        <div className="relative ui-card ui-accent-1-soft px-3 py-2 text-label font-bold">
          {result === "correct"
            ? `Nailed it! ${EMOJI.feedback.success}`
            : result === "wrong"
              ? `Good try! Let's move on! ${EMOJI.feedback.encouragement}`
              : `You've got this! ${EMOJI.feedback.encouragement}`}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-3 h-3 rotate-45 ui-card ui-accent-1-soft" />
        </div>
        {result === "correct" && (
          <div className="ml-auto flex items-center gap-1 ui-card ui-accent-3 px-3 py-1">
            <span>{EMOJI.action.star}</span>
            <span className="text-display font-extrabold text-sm text-ink">+20 XP</span>
          </div>
        )}
      </div>

      <div className="px-5 mt-4">
        <div className="text-[11px] font-black uppercase tracking-widest text-explorer">
          {question.kicker}
        </div>
        <h2 className="text-display text-2xl font-bold leading-tight mt-1">{question.prompt}</h2>
      </div>

      <div className="p-5 mt-2 flex-1 flex flex-col gap-3">
        {answers.map((label) => {
          const isSelected = selected === label;
          const isCorrectPick = result && label === correct;
          const isWrongPick = result === "wrong" && isSelected;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`h-16 rounded-2xl px-5 flex items-center justify-between text-h4 text-display transition-all active:scale-[0.99] hover:scale-[1.02] ${
                isCorrectPick
                  ? "ui-button ui-accent-3"
                  : isWrongPick
                    ? "ui-button ui-accent-1-soft opacity-60"
                    : isSelected
                      ? "ui-button ui-accent-2"
                      : "ui-button ui-accent-1-soft"
              }`}
            >
              {label}
              <span
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                  isCorrectPick
                    ? "bg-fb-success-bg text-text-on-primary"
                    : isWrongPick
                      ? "bg-fb-error-bg text-text-on-primary"
                      : isSelected
                        ? "text-text-on-header"
                        : "bg-muted text-text-secondary"
                }`}
                style={isSelected ? { backgroundColor: "var(--accent-5)" } : undefined}
              >
                {isCorrectPick
                  ? EMOJI.action.done
                  : isWrongPick
                    ? EMOJI.ui.close
                    : isSelected
                      ? EMOJI.action.done
                      : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-5">
        <button
          onClick={result ? onReset : onCheck}
          disabled={!selected}
          className={`w-full h-14 rounded-2xl text-h4 text-display disabled:opacity-50 ${
            result === "correct"
              ? "ui-button ui-accent-3"
              : result === "wrong"
                ? "ui-button ui-accent-2"
                : "ui-button ui-accent-1"
          }`}
        >
          {result === "correct"
            ? isLastQuestion
              ? `Finish Quiz ${EMOJI.feedback.success}`
              : "Next Question →"
            : result === "wrong"
              ? isLastQuestion
                ? "Finish Quiz {EMOJI.feedback.success}"
                : "Next Question →"
              : "Check Answer"}
        </button>
      </div>
    </div>
  );
}

export function CorrectAnswerScreen({
  stateName,
  onDismiss,
}: { stateName?: string; onDismiss?: () => void } = {}) {
  const state = getState(stateName);
  useEffect(() => {
    fxCorrect();
  }, []);
  return (
    <div
      className="h-full w-full relative overflow-hidden flex flex-col"
      style={{ backgroundColor: "var(--accent-3)" }}
    >
      {/* Premium Close Button - Top Right */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 ui-button ui-accent-1-soft w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-200 z-10"
        aria-label="Close"
      >
        {EMOJI.ui.close}
      </button>

      {/* confetti dots */}
      {Array.from({ length: 22 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 80}%`,
            background: [
              "var(--accent-4)",
              "var(--accent-1)",
              "var(--background)",
              "var(--accent-2)",
            ][i % 4],
            transform: `rotate(${i * 20}deg)`,
            opacity: 0.9,
          }}
        />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-accent-3-soft rounded-full" />
          <div className="relative h-32 w-32 rounded-full ui-card ui-accent-3 flex items-center justify-center shadow-2xl">
            <div className="text-6xl">{EMOJI.action.checkButton}</div>
          </div>
        </div>
        <h1 className="mt-6 text-h1 text-text-on-primary text-center leading-relaxed">Awesome!</h1>
        <p className="mt-2 text-text-on-primary/95 font-bold text-center">
          You got it right ›” {state.capital} is the capital of {state.name}!
        </p>

        <div className="mt-6 ui-card ui-accent-4 px-5 py-3 flex items-center gap-3">
          <span className="text-3xl">{EMOJI.action.star}</span>
          <div>
            <div className="text-xs font-bold opacity-90 text-ink">You earned</div>
            <div className="text-display text-2xl font-extrabold leading-snug text-ink">+20 XP</div>
          </div>
        </div>
      </div>

      <div className="p-6 relative">
        <button className="w-full h-14 ui-button ui-accent-1 text-display text-lg font-extrabold animate-pulse active:scale-95 transition-transform">
          Next Question →
        </button>
      </div>
    </div>
  );
}

export function StateUnlockScreen({
  stateName,
  onContinue,
}: { stateName?: string; onContinue?: () => void } = {}) {
  const state = stateName
    ? getState(stateName)
    : INDIA_STATES && INDIA_STATES.length > 1
      ? INDIA_STATES[1]
      : INDIA_STATES[0] || {
          name: "India",
          emoji: EMOJI.language.indFlag,
          nickname: "Incredible India",
        };
  const art = STATE_ART[state.name];

  // PHASE 1b: Play sound effect when state unlocks
  useEffect(() => {
    // Play celebratory sound on mount
    fxCorrect();
  }, []);
  return (
    <div
      className="h-full w-full relative overflow-hidden flex flex-col"
      style={{ backgroundColor: "var(--accent-5)" }}
    >
      {/* Premium Close Button - Top Right */}
      <button
        onClick={() => {
          fxTap();
          onContinue?.();
        }}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-text-on-primary/20 hover:bg-text-on-primary/30 text-text-on-primary flex items-center justify-center text-lg transition-all duration-200 z-10"
        aria-label="Close"
      >
        {EMOJI.ui.close}
      </button>

      <Cloud className="absolute top-10 left-2 w-28 opacity-90" />
      <Cloud className="absolute top-20 right-0 w-24 opacity-85" />
      <Cloud className="absolute bottom-56 left-0 w-32 opacity-80" />

      <div className="text-center pt-8 relative z-10 px-6">
        <div className="text-text-on-primary/90 text-xs font-black uppercase tracking-[0.3em]">
          New State Unlocked
        </div>
        <h1 className="text-h1 text-text-on-primary mt-1 drop-shadow leading-relaxed">
          {state.name}!
        </h1>
        <p className="text-text-on-primary/90 font-bold mt-1">{state.nickname}</p>
      </div>

      <div className="relative flex-1 flex items-center justify-center">
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-72 rounded-[40px] bg-text-on-primary/10 backdrop-blur border border-text-on-primary/20" />
        <div className="absolute inset-x-16 bottom-24 h-8 rounded-full bg-text-primary/20 blur-xl" />
        {art ? (
          <img
            src={art}
            alt=""
            decoding="async"
            className="relative h-72 object-contain drop-shadow-2xl animate-fade-in"
          />
        ) : (
          <img
            src={STATE_ART[state.name]}
            alt={state.name}
            className="relative h-72 object-contain drop-shadow-2xl animate-fade-in rounded-lg"
            loading="lazy"
            decoding="async"
          />
        )}
        <img
          src={airplane}
          alt=""
          className="absolute top-16 right-6 w-16 object-contain drop-shadow-xl"
          style={{ transform: "rotate(15deg)" }}
        />
      </div>

      <div className="p-6 relative z-10">
        <button
          onClick={() => {
            fxTap();
            onContinue?.();
          }}
          className="w-full h-14 ui-button ui-accent-1 text-display text-lg font-extrabold"
        >
          Continue Adventure ✈️
        </button>
      </div>
    </div>
  );
}

export function PassportScreen() {
  const p = useProgress();
  // All ages use Seedling design (region-based tabs)
  return <PassportSeedling />;
}

function Stamp({
  stateName,
  name,
  date,
  tone,
  filled,
  onSelect,
}: {
  stateName?: string;
  name: string;
  date: string;
  tone: "orange" | "blue" | "green" | "gold";
  filled?: boolean;
  onSelect?: (stateName: string) => void;
}) {
  // NOTE: color map contains CSS variable references like var(--accent-1), not hardcoded values.
  // These are theme-aware token references.
  const color = {
    orange: "var(--accent-1)",
    blue: "var(--accent-2)",
    green: "var(--accent-3)",
    gold: "var(--accent-4)",
  }[tone];
  if (!filled) {
    return (
      <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-text-secondary">
        <div className="text-3xl opacity-40">{EMOJI.milestone.hundred}</div>
        <div className="text-[11px] font-extrabold mt-1">{name}</div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        fxStamp();
        if (stateName && onSelect) {
          appLogger.info("passport_stamp", "Viewing achievement: " + stateName);
          onSelect(stateName);
        }
      }}
      className="relative aspect-square rounded-2xl bg-accent-2-soft flex flex-col items-center justify-center active:scale-95 transition-transform cursor-pointer shadow-inset-subtle"
    >
      <div
        className="h-20 w-20 rounded-full border-[3px] flex flex-col items-center justify-center"
        style={{ borderColor: color, color }}
      >
        <div className="text-xs font-black tracking-widest opacity-80">VISITED</div>
        <div className="text-display font-extrabold text-[11px] leading-tight text-center px-1">
          {name}
        </div>
        <div className="text-[8px] font-bold opacity-80">{date}</div>
      </div>
      <div
        className="absolute -top-1 -right-1 text-xs font-bold rotate-12 px-1.5 py-0.5 rounded"
        style={{ background: color, color: "var(--color-text-inverted)" }}
      >
        ✓
      </div>
    </button>
  );
}

function BadgeDetailModal({
  state,
  badge,
  onClose,
}: {
  state: string;
  badge: {
    icon: string;
    name: string;
    done: boolean;
    index: number;
  };
  onClose: () => void;
}) {
  const unlockTexts: Record<string, Record<number, string>> = {
    monument: {
      0: "Complete the Monument card in this state",
      1: "Unlock the Animal badge first",
      2: "Earn both Monument and Animal badges",
    },
    animal: {
      0: "Complete the Animal card in this state",
      1: "Learn about local wildlife",
      2: "Earn both Monument and Animal badges",
    },
    explorer: {
      0: "Complete all cards in this state",
      1: "Explore every attraction",
      2: "Master this state!",
    },
  };

  const badgeTypes = ["monument", "animal", "explorer"];
  const badgeType = badgeTypes[badge.index];
  const unlockText = unlockTexts[badgeType]?.[badge.index] || "Complete this state";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end animate-fade-in"
      style={{ backgroundColor: "var(--scrim)" }}
      onClick={onClose}
    >
      <div
        className="w-full bg-surface-card rounded-t-3xl shadow-elevated-4 p-6 flex flex-col gap-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-text-secondary hover:shadow-elevated-1 transition"
          style={{ backgroundColor: "var(--surface-raised)" }}
          title="Close"
        >
          {EMOJI.ui.close}
        </button>

        {/* Badge Display */}
        <div className="flex flex-col items-center pt-2">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center text-5xl mb-4 shadow-elevated-2 ${
              badge.done ? "" : "opacity-60"
            }`}
            style={
              badge.done
                ? { backgroundColor: "var(--accent-1)", color: "var(--accent-1-ink)" }
                : { backgroundColor: "var(--surface-muted)" }
            }
          >
            {badge.done ? badge.icon : EMOJI.feedback.trophy}
          </div>

          <h2
            className="text-display text-2xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            {badge.name}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {state}
          </p>
        </div>

        {/* Unlock Information */}
        {!badge.done && (
          <div
            className="rounded-2xl p-4 border-l-4"
            style={{
              backgroundColor: "var(--fb-warning-bg)",
              borderColor: "var(--fb-warning-border)",
            }}
          >
            <p className="text-h5 font-bold mb-2" style={{ color: "var(--fb-warning-fg)" }}>
              How to Unlock
            </p>
            <p className="text-body" style={{ color: "var(--fb-warning-fg)" }}>
              {unlockText}
            </p>
          </div>
        )}

        {/* Badge Info */}
        <div
          className="rounded-2xl p-4 border-l-4 shadow-elevated-1"
          style={{
            backgroundColor: "var(--fb-info-bg)",
            borderColor: "var(--fb-info-border)",
          }}
        >
          <p className="text-h5 font-bold mb-1" style={{ color: "var(--fb-info-fg)" }}>
            Badge Type
          </p>
          <p className="text-body" style={{ color: "var(--text-primary)" }}>
            {badge.name === "Monument" && <>{EMOJI.utility.capital} Learn about famous landmarks</>}
            {badge.name === "Animal" && <>{EMOJI.achievement.animal} Discover local wildlife</>}
            {badge.name === "Explorer" &&
              `${EMOJI.achievement.explorer} Master all cards in this state`}
          </p>
        </div>

        {/* Status */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl font-extrabold transition shadow-elevated-1 hover:shadow-elevated-2 active:shadow-elevated-0"
            style={{ backgroundColor: "var(--surface-raised)", color: "var(--text-primary)" }}
          >
            Close
          </button>
          {badge.done && (
            <button
              onClick={() => {
                fxConfetti();
                onClose();
              }}
              className="flex-1 h-12 rounded-2xl text-display font-extrabold text-text-on-primary shadow-elevated-2 hover:shadow-elevated-3 transition active:shadow-elevated-1"
              style={{ backgroundColor: "var(--accent-3)" }}
            >
              {EMOJI.feedback.success} Celebrate!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function BadgesScreen() {
  const progress = useProgress();
  const [activeTab, setActiveTab] = useState<"achievements" | "states">("achievements");
  const celebration = useCelebration();
  const toastStore = useToastStore();

  // Detect newly unlocked badges and show notifications
  useEffect(() => {
    const allBadges = achievementBadgesFor(progress);
    const newBadges = getNewlyUnlockedBadges(allBadges);

    // Show notification for each new badge
    newBadges.forEach((badge, idx) => {
      setTimeout(() => {
        const notification = getBadgeNotificationMessage(badge);

        // Show celebration with confetti
        showSuccessToast(notification.title, {
          duration: 3000,
          icon: notification.emoji,
        });

        // Mark badge as seen so we don't show notification again
        markBadgeAsSeen(badge.id);
      }, idx * 1500); // Stagger multiple badge notifications by 1.5s
    });
  }, [progress, celebration]);

  const allBadges = achievementBadgesFor(progress);
  const unlockedCount = allBadges.filter((b) => b.unlocked).length;

  // Helper to generate progress stars
  const getProgressStars = (progress: number, max: number): string => {
    const filledCount = Math.min(Math.ceil((progress / max) * 3), 3);
    const stars =
      EMOJI.action.star.repeat(filledCount) + EMOJI.action.emptyStar.repeat(3 - filledCount);
    return stars;
  };

  return (
    <div className="h-full w-full bg-surface-card flex flex-col">
      {/* Tab Switcher - Before Header */}
      <div className="px-5 pt-4 pb-0 flex gap-2 border-b border-muted bg-surface-card z-10">
        <button
          onClick={() => {
            fxTap();
            setActiveTab("achievements");
          }}
          className={`px-4 py-3 rounded-t-lg font-bold text-sm transition ${
            activeTab === "achievements"
              ? "bg-transparent border-b-2 border-warning text-warning"
              : "text-text-secondary hover:text-muted-dark"
          }`}
        >
          {EMOJI.milestone.hundred} Achievement Badges
        </button>
        <button
          onClick={() => {
            fxTap();
            setActiveTab("states");
          }}
          className={`px-4 py-3 rounded-t-lg font-bold text-sm transition ${
            activeTab === "states"
              ? "bg-transparent border-b-2 border-warning text-warning"
              : "text-text-secondary hover:text-muted-dark"
          }`}
        >
          {EMOJI.achievement.explorer} State Badges
        </button>
      </div>

      {/* Achievement Badges View */}
      {activeTab === "achievements" && (
        <>
          {/* Header with Avatar + Celebration Tone */}
          <div
            className="px-5 pt-3 pb-4 bg-accent-4 rounded-b-[32px] relative overflow-hidden animate-fade-in"
            style={{ backgroundColor: "var(--accent-4)", color: "var(--accent-4-ink)" }}
          >
            <Cloud className="absolute top-2 right-4 w-14 opacity-40 pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="h-14 w-14 rounded-2xl ui-card ui-accent-1-soft p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={getAvatarImage(progress.avatar)}
                  alt={getAvatarName(progress.avatar)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1" style={{ color: "var(--accent-4-ink)" }}>
                <div className="text-h4 text-display leading-tight">{progress.name}</div>
                <div className="text-xs font-bold opacity-80">
                  {EMOJI.action.celebrate} {unlockedCount} Amazing Badges Collected!
                </div>
              </div>
            </div>
          </div>

          {/* Badges Grid - Kid-friendly celebration layout */}
          <div className="px-5 flex-1 overflow-auto pb-4 pt-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {allBadges.map((badge, idx) => (
                <div
                  key={badge.id}
                  className={`rounded-3xl p-4 flex flex-col items-center gap-3 text-center transition-transform active:scale-95 animate-fade-in ${
                    badge.unlocked ? "ui-accent-4 shadow-md" : "ui-accent-1-soft opacity-60"
                  }`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Badge Emoji - Large and Prominent */}
                  <div className={`text-6xl ${badge.unlocked ? "" : "opacity-50"}`}>
                    {badge.icon}
                  </div>

                  {/* Badge Name - Bold Uppercase */}
                  <div
                    className={`text-sm font-extrabold uppercase leading-tight tracking-wide ${
                      badge.unlocked ? "text-ink" : "text-text-secondary"
                    }`}
                  >
                    {badge.name}
                  </div>

                  {/* Badge Description - Simple 1-2 lines */}
                  <div
                    className={`text-xs leading-snug ${
                      badge.unlocked ? "text-ink/80" : "text-text-secondary"
                    }`}
                  >
                    {badge.description}
                  </div>

                  {/* Status - Kid Friendly */}
                  <div className="mt-1 pt-3 border-t border-text-on-header/20 w-full">
                    {badge.unlocked ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-lg font-extrabold">✓ You Did It!</div>
                        <div className="text-[11px] font-bold text-ink/70">
                          {new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="text-xl">
                          {getProgressStars(badge.progress, badge.achievementMax)}
                        </div>
                        <div className="text-[11px] font-bold text-text-secondary">
                          Keep going! {EMOJI.action.star}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* State Badges View */}
      {activeTab === "states" && <StatePerformanceBadgesView />}
    </div>
  );
}

export function ProfileScreen() {
  const p = useProgress();

  // Route guard: redirect to welcome if not onboarded (defensive check)
  if (!p.onboarded) {
    appLogger.warn("profile_screen", "User attempted to access profile without onboarding", {});
    return <Navigate to="/welcome" replace />;
  }

  return <ProfileScreenContent />;
}

function ThemePickerNavButton() {
  const navigate = useNavigate();
  const handleClick = () => {
    fxTap();
    navigate({ to: "/themes" });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
    >
      <div className="h-12 w-12 rounded-2xl bg-accent-1 flex items-center justify-center text-2xl">
        {EMOJI.theme.painter}
      </div>
      <div className="flex-1 text-left">
        <div className="text-display font-extrabold text-[15px] leading-tight">
          My Style {EMOJI.theme.painter}
        </div>
        <div className="text-[11px] font-bold text-text-secondary">Tap to change theme</div>
      </div>
      <div className="text-text-secondary text-xl">›</div>
    </button>
  );
}

function ProfileScreenContent() {
  const p = useProgress();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(p.name);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(p.avatar as AvatarId);

  // Avatar images list for ProfileScreen
  const avatarImages = [
    { id: "explorer-hat" as AvatarId, image: avatarExplorerHat },
    { id: "explorer-pink" as AvatarId, image: avatarExplorerPink },
    { id: "geek-glasses" as AvatarId, image: avatarGeekGlasses },
    { id: "girl-peace" as AvatarId, image: avatarGirlPeace },
    { id: "turban-red" as AvatarId, image: avatarTurbanRed },
    { id: "girl-earring" as AvatarId, image: avatarGirlEarring },
    { id: "boy-smile" as AvatarId, image: avatarBoySmi },
    { id: "girl-tikka" as AvatarId, image: avatarGirlTikka },
    { id: "ski-goggles" as AvatarId, image: avatarSkiGoggles },
    { id: "farmer-hat" as AvatarId, image: avatarFarmerHat },
    { id: "sports-cap" as AvatarId, image: avatarSportsCap },
    { id: "girl-flower" as AvatarId, image: avatarGirlFlower },
  ];

  const { level } = levelInfo(p.xp);
  const goBack = useGoBack();
  const stampsCollected = Object.keys(p.stamps ?? {}).length;

  const isValidName = (name: string): boolean => {
    // Only alphabets allowed, max 6 characters, no spaces or special chars
    return /^[a-zA-Z]{1,6}$/.test(name.trim());
  };

  const handleSaveName = () => {
    const trimmedName = tempName.trim();
    if (!trimmedName || trimmedName.length === 0) {
      setTempName(p.name); // Reset to original
      setIsEditing(false);
      return;
    }

    // Validate name format
    if (!isValidName(trimmedName)) {
      return;
    }

    setSaveStatus("saving");
    fxTap();

    // Save the profile with new name
    saveProfile({ name: trimmedName, avatar: p.avatar, ageBand: p.ageBand });

    setSaveStatus("saved");
    setTimeout(() => {
      setIsEditing(false);
      setSaveStatus("idle");
    }, 500);
  };

  const handleCancelEdit = () => {
    fxTap();
    setTempName(p.name); // Reset to original
    setIsEditing(false);
    setSaveStatus("idle");
  };

  const handleChangeAvatar = (avatarId: AvatarId) => {
    fxTap();
    setSelectedAvatar(avatarId);
    // Automatically save the new avatar with its corresponding name
    const newName = getAvatarName(avatarId);
    saveProfile({ name: newName, avatar: avatarId, ageBand: p.ageBand });
    setIsSelectingAvatar(false);
  };

  return (
    <div className="h-full w-full bg-bg-page flex flex-col">
      <div
        className="relative px-5 pt-4 pb-14 rounded-b-[36px] animate-fade-in"
        style={{ backgroundColor: "var(--accent-5)", color: "var(--accent-5-ink)" }}
      >
        <Cloud className="absolute top-2 right-2 w-16 opacity-40" />
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-text-on-primary/20 text-text-on-primary flex items-center justify-center"
          >
            ‹
          </button>
          <div className="text-display font-extrabold text-text-on-primary">Profile</div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
        <div className="flex flex-col items-center mt-4">
          <div className="relative animate-bounce" style={{ animationDelay: "0ms" }}>
            <div className="h-24 w-24 rounded-3xl bg-surface-card p-2 shadow-xl flex items-center justify-center text-5xl overflow-hidden">
              <img
                src={getAvatarImage(p.avatar)}
                alt={getAvatarName(p.avatar)}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full flex items-center justify-center text-display text-h5 border-4"
              style={{
                backgroundColor: "var(--accent-4)",
                color: "var(--accent-4-ink)",
                borderColor: "var(--accent-4-ink)",
              }}
            >
              {level}
            </div>
          </div>

          {/* Name Section - Edit Mode or Display Mode */}
          {isEditing ? (
            <div className="mt-4 w-full max-w-xs flex flex-col gap-2">
              <div>
                <input
                  autoFocus
                  value={tempName}
                  onChange={(e) => {
                    // Only allow alphabets, limit to 6 characters
                    const filtered = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 6);
                    setTempName(filtered);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValidName(tempName)) handleSaveName();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  placeholder="Enter name (max 6 letters)"
                  maxLength={6}
                  className={`h-12 rounded-xl bg-surface-card text-center text-display text-lg font-extrabold outline-none border-2 transition ${
                    tempName.length > 0 && !isValidName(tempName)
                      ? "border-warning text-warning"
                      : "border-border-color text-text-primary"
                  }`}
                />
              </div>
              
              {/* Validation feedback */}
              {tempName.length > 0 && !isValidName(tempName) && (
                <div className="text-caption text-warning text-center font-bold">
                  Only letters allowed, max 6 characters
                </div>
              )}
              {tempName.length === 6 && isValidName(tempName) && (
                <div className="text-caption text-success text-center font-bold">
                  ✓ Name is valid
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  disabled={saveStatus === "saving" || !isValidName(tempName)}
                  className={`flex-1 h-10 rounded-lg text-display font-extrabold text-text-on-primary text-sm transition ${
                    !isValidName(tempName)
                      ? "bg-surface-raised/30 opacity-50 cursor-not-allowed"
                      : saveStatus === "saved"
                        ? "bg-success"
                        : saveStatus === "saving"
                          ? "bg-surface-raised/50"
                          : "bg-surface-raised/80 hover:bg-surface-raised"
                  }`}
                >
                  {saveStatus === "saved"
                    ? "✓ Saved"
                    : saveStatus === "saving"
                      ? "Saving..."
                      : "Save"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 h-10 rounded-lg text-display font-extrabold text-text-on-primary text-sm bg-text-on-primary/20 hover:bg-text-on-primary/30 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className="mt-3 flex flex-col items-center gap-1 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center gap-2">
                <div className="text-display text-2xl font-extrabold text-text-on-primary">
                  {p.name}
                </div>
                <button
                  onClick={() => {
                    fxTap();
                    setTempName(p.name);
                    setIsEditing(true);
                  }}
                  className="h-8 w-8 rounded-lg bg-text-on-primary/20 hover:bg-text-on-primary/30 text-text-on-primary flex items-center justify-center text-sm transition"
                  title="Edit name"
                >
                  ✏️
                </button>
              </div>
              <div className="text-text-on-primary/90 text-xs font-extrabold uppercase tracking-widest">
                Junior Explorer · Age {p.ageBand}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 animate-fade-in" style={{ animationDelay: "150ms" }}>
        <div className="ui-card ui-accent-1-soft p-4 grid grid-cols-3 divide-x divide-black/5">
          <ProfileStat value={p.xp.toLocaleString()} label="XP" />
          <ProfileStat value={String(p.completed.length)} label="States" />
          <ProfileStat value={String(badgeCount(p))} label="Badges" />
        </div>
      </div>

      <div className="px-5 mt-4 space-y-3 flex-1 overflow-auto">
        {/* Avatar Selector Section */}
        <div className="animate-fade-in" style={{ animationDelay: "175ms" }}>
          <button
            onClick={() => {
              fxTap();
              setIsSelectingAvatar(!isSelectingAvatar);
            }}
            className="w-full ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
          >
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: "var(--accent-1)", color: "var(--accent-1-ink)" }}
            >
              {EMOJI.audio.stories}
            </div>
            <div className="flex-1 text-left">
              <div className="text-display font-extrabold text-[15px] leading-tight">
                Change Avatar
              </div>
              <div className="text-[11px] font-bold text-text-secondary">
                {getAvatarName(p.avatar)} · Tap to select
              </div>
            </div>
            <div className="text-text-secondary text-xl">
              {isSelectingAvatar ? EMOJI.ui.close : EMOJI.action.chevron}
            </div>
          </button>

          {/* Avatar Selection Grid */}
          {isSelectingAvatar && (
            <div className="mt-3 ui-card ui-accent-1-soft p-4 animate-fade-in">
              <div className="grid grid-cols-4 gap-2">
                {avatarImages.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleChangeAvatar(a.id)}
                    className={`aspect-square rounded-2xl flex items-center justify-center border-4 transition transform overflow-hidden ${
                      a.id === p.avatar
                        ? "border-saffron shadow-[var(--shadow-glow-orange)] scale-110"
                        : "border-muted hover:scale-105"
                    }`}
                    title={getAvatarName(a.id)}
                  >
                    <img
                      src={a.image}
                      alt={getAvatarName(a.id)}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* My Style Theme Picker */}
        <div className="animate-fade-in" style={{ animationDelay: "185ms" }}>
          <ThemePickerNavButton />
        </div>

        {/* Badges */}
        <div className="animate-fade-in" style={{ animationDelay: "190ms" }}>
          <Link
            to="/badges"
            onClick={() => fxTap()}
            className="ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
          >
            <div className="h-12 w-12 rounded-2xl bg-accent-4 flex items-center justify-center text-2xl">
              {EMOJI.achievement.badge}
            </div>
            <div className="flex-1 text-left">
              <div className="text-display font-extrabold text-[15px] leading-tight">
                Badges
              </div>
              <div className="text-[11px] font-bold text-text-secondary">
                View your earned badges
              </div>
            </div>
            <div className="text-text-secondary text-xl">›</div>
          </Link>
        </div>

        {/* Debug Theme Selector - Development Only */}
        <DebugThemeSelector />

        {/* ⚙️ Settings Section Header */}
        <div className="animate-fade-in pt-2" style={{ animationDelay: "195ms" }}>
          <h3 className="text-sm font-extrabold text-text-secondary uppercase tracking-wider px-1 mb-2">
            ⚙️ Settings
          </h3>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <SoundToggleRow />
        </div>

        {/* Streak Section */}
        <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
          {(() => {
            const nextMilestone = Math.ceil((p.streak + 1) / 5) * 5;
            const daysUntilNext = nextMilestone - p.streak;

            return (
              <div className="ui-card ui-accent-1-soft p-3 flex flex-col gap-2 transition">
                {/* Header Row */}
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: "var(--accent-3)", color: "var(--accent-3-ink)" }}
                  >
                    {EMOJI.action.fire}
                  </div>
                  <div className="flex-1">
                    <div className="text-display font-extrabold text-[15px] leading-tight">
                      Streak
                    </div>
                    <div className="text-[11px] font-bold text-text-secondary">
                      Keep exploring to build your streak
                    </div>
                  </div>
                </div>

                {/* Streak Count */}
                <div className="ml-15 text-[24px] font-extrabold text-accent-3">
                  {p.streak} days
                </div>

                {/* Next Milestone */}
                <div className="ml-15 text-[13px] font-extrabold text-accent-3">
                  {daysUntilNext === 0
                    ? `${EMOJI.action.fire} Claim your ${nextMilestone}-day milestone!`
                    : `${EMOJI.action.fire} ${daysUntilNext} day${daysUntilNext !== 1 ? "s" : ""} until ${nextMilestone}-day bonus!`}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <Link
            to="/privacy"
            onClick={() => fxTap()}
            className="ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
          >
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: "var(--accent-5)", color: "var(--accent-5-ink)" }}
            >
              {EMOJI.milestone.hundred}
            </div>
            <div className="flex-1">
              <div className="text-display font-extrabold text-[15px] leading-tight">
                Privacy Policy
              </div>
              <div className="text-[11px] font-bold text-text-secondary">
                How we handle your data
              </div>
            </div>
            <div className="text-text-secondary text-xl">›</div>
          </Link>
        </div>
      </div>

    </div>
  );
}

function SoundToggleRow() {
  const soundOn = useSoundOn();

  const toggleSound = () => {
    setSoundOn(!soundOn);
    // Play tap sound only if sound is being enabled
    if (!soundOn) {
      setTimeout(() => fxTap(), 100);
    }
  };

  return (
    <div className="space-y-3">
      {/* Unified Sound & Audio Toggle - Controls both effects and narration */}
      <button
        type="button"
        role="switch"
        aria-checked={soundOn}
        aria-label="Sound effects and audio narration"
        onClick={toggleSound}
        className="w-full ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
      >
        <div className="h-12 w-12 rounded-2xl bg-accent-5 flex items-center justify-center text-2xl">
          {EMOJI.audio.music}
        </div>
        <div className="flex-1 text-left">
          <div className="text-display font-extrabold text-[15px] leading-tight">Sound & Audio</div>
          <div className="text-[11px] font-bold text-text-secondary">
            {soundOn ? "Effects & stories enabled" : "Sound & stories muted"}
          </div>
        </div>
        <span
          className="h-7 w-12 rounded-full flex items-center px-1 transition"
          style={
            soundOn
              ? { backgroundColor: "var(--accent-3)" }
              : { backgroundColor: "var(--color-muted-bg)" }
          }
        >
          <span
            className={`h-5 w-5 rounded-full bg-text-on-header shadow transition-transform ${soundOn ? "translate-x-5" : "translate-x-0"}`}
          />
        </span>
      </button>
    </div>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="text-display text-xl font-extrabold">{value}</div>
      <div className="text-xs font-bold text-text-secondary">{label}</div>
    </div>
  );
}

function ParentZonePlaceholder() {
  const [showSettings, setShowSettings] = useState(false);
  const [newPIN, setNewPIN] = useState("");
  const [pinSaveStatus, setPinSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleSavePIN = async () => {
    if (newPIN.length !== 4) {
      alert("PIN must be 4 digits");
      return;
    }

    setPinSaveStatus("saving");
    try {
      // REMOVED: const { setPin } = await import("@/lib/parent-gate");
      // REMOVED: Parent PIN feature removed
      const success = false;
      if (success) {
        setPinSaveStatus("saved");
        setTimeout(() => {
          setShowSettings(false);
          setNewPIN("");
          setPinSaveStatus("idle");
        }, 1500);
      } else {
        alert("Failed to save PIN");
        setPinSaveStatus("idle");
      }
    } catch (e) {
      alert("Failed to save PIN");
      setPinSaveStatus("idle");
    }
  };

  return (
    <div className="rounded-2xl bg-info-soft border-2 border-info p-3 transition">
      <button
        onClick={() => {
          fxTap();
          setShowSettings(!showSettings);
        }}
        className="w-full flex items-center gap-3 hover:opacity-80 transition"
      >
        <div className="h-12 w-12 rounded-2xl bg-accent-1 flex items-center justify-center text-2xl flex-shrink-0">
          {EMOJI.feedback.encouragement}›{EMOJI.feedback.encouragement}›
          {EMOJI.feedback.encouragement}
        </div>
        <div className="flex-1 text-left">
          <div className="text-display font-extrabold text-[15px] leading-tight text-info">
            Parent Zone
          </div>
          <div className="text-[11px] font-bold text-accent-1">
            Tap to configure PIN & parental settings
          </div>
        </div>
        <div className="text-info text-lg">
          {showSettings ? EMOJI.ui.chevronDown : EMOJI.action.chevron}
        </div>
      </button>

      {/* PIN Settings Panel */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t-2 border-info space-y-3 animate-fade-in">
          <div>
            <label className="text-xs font-bold text-info block mb-1">
              Parental PIN (4 digits)
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPIN}
              onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 4-digit PIN"
              className="w-full h-10 rounded-lg border-2 border-info px-3 font-extrabold text-center text-lg tracking-widest text-info"
            />
            <div className="text-xs text-accent-1 mt-1">
              {EMOJI.milestone.twentyFive} Used to reset progress. Default: 1234
            </div>
          </div>
          <button
            onClick={handleSavePIN}
            disabled={newPIN.length !== 4 || pinSaveStatus === "saving"}
            className={`w-full h-10 rounded-lg font-bold text-sm transition text-text-on-primary ${
              pinSaveStatus === "saved"
                ? "bg-success-soft0"
                : "bg-accent-1 disabled:opacity-50 hover:bg-accent-1/90"
            }`}
          >
            {pinSaveStatus === "saved"
              ? "✓ PIN Saved"
              : pinSaveStatus === "saving"
                ? "Saving..."
                : "Save PIN"}
          </button>
          <button
            onClick={() => {
              fxTap();
              setShowSettings(false);
              setNewPIN("");
              setPinSaveStatus("idle");
            }}
            className="w-full h-10 rounded-lg font-bold text-sm bg-surface-card text-info hover:bg-info-soft border border-info"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function RowLink({
  icon,
  tone,
  title,
  sub,
  to,
}: {
  icon: string;
  tone: "orange" | "blue" | "green" | "gold";
  title: string;
  sub: string;
  to: "/explorer" | "/achievements" | "/parent" | "/journey";
}) {
  // NOTE: bgMap and inkMap contain CSS variable references like var(--accent-1), not hardcoded hex values.
  // These are theme-aware token references that resolve to the current theme's accent colors at runtime.
  const bgMap = {
    orange: "var(--accent-1)",
    blue: "var(--accent-5)",
    green: "var(--accent-3)",
    gold: "var(--accent-4)",
  };
  const inkMap = {
    orange: "var(--accent-1-ink)",
    blue: "var(--accent-5-ink)",
    green: "var(--accent-3-ink)",
    gold: "var(--accent-4-ink)",
  };
  return (
    <Link
      to={to}
      onClick={() => fxTap()}
      className="ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
    >
      <div
        className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: bgMap[tone], color: inkMap[tone] }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-display font-extrabold text-[15px] leading-tight">{title}</div>
        <div className="text-[11px] font-bold text-text-secondary">{sub}</div>
      </div>
      <div className="text-text-secondary text-xl">›</div>
    </Link>
  );
}

export function AchievementsScreen() {
  const progress = useProgress();
  const items = achievementsFor(progress);
  const unlocked = items.filter((a) => a.done).length;

  return (
    <div className="h-full w-full bg-bg-page flex flex-col">
      <HeaderBar title="Achievements" />
      <div className="px-5 pb-3">
        <div className="ui-card ui-accent-1-soft px-4 py-3 flex items-center justify-between">
          <div className="text-[12px] font-extrabold text-text-secondary uppercase tracking-wider">
            Unlocked
          </div>
          <div className="text-display font-extrabold text-[16px]">
            {unlocked}/{items.length}
          </div>
        </div>
      </div>
      <div className="px-5 flex-1 overflow-auto space-y-3">
        {items.map((a) => (
          <div
            key={a.title}
            className={`ui-card p-4 flex items-center gap-3 ${
              a.done ? "ui-accent-4" : "ui-accent-1-soft"
            }`}
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                backgroundColor: a.done
                  ? "var(--accent-4)"
                  : a.tone === "orange"
                    ? "var(--accent-1-soft)"
                    : a.tone === "blue"
                      ? "var(--accent-5-soft)"
                      : a.tone === "green"
                        ? "var(--accent-3-soft)"
                        : "var(--accent-4-soft)",
                color: a.done ? "var(--accent-4-ink)" : "inherit",
              }}
            >
              {a.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-display font-extrabold text-[16px]">{a.title}</div>
                {a.done && (
                  <span
                    className="text-xs font-bold tracking-wider bg-gold-soft px-1.5 py-0.5 rounded-full"
                    style={{ color: "var(--gold)" }}
                  >
                    Unlocked
                  </span>
                )}
              </div>
              <div className="text-[11px] font-bold text-text-secondary">{a.sub}</div>
              {!a.done && "prog" in a && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      style={{
                        width: `${(a.prog / a.max) * 100}%`,
                        backgroundColor:
                          a.tone === "orange"
                            ? "var(--accent-1)"
                            : a.tone === "blue"
                              ? "var(--accent-5)"
                              : a.tone === "green"
                                ? "var(--accent-3)"
                                : "var(--accent-4)",
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-extrabold text-text-secondary">
                    {a.prog}/{a.max}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div
      className="h-full w-full relative overflow-hidden flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--accent-2)" }}
    >
      <Cloud className="absolute top-14 left-2 w-24 opacity-90 animate-pulse" />
      <Cloud className="absolute top-32 right-4 w-20 opacity-80" />
      <Cloud className="absolute bottom-40 left-6 w-28 opacity-85 animate-pulse" />
      <Cloud className="absolute bottom-56 right-2 w-16 opacity-70" />

      <div className="relative">
        <div className="absolute -inset-6 rounded-full border-2 border-dashed border-explorer/30 animate-spin" />
        <img
          src={airplane}
          alt=""
          className="relative w-40 h-40 object-contain drop-shadow-2xl"
          style={{ transform: "rotate(-10deg)" }}
        />
      </div>
      <div className="mt-8 text-center">
        <div className="text-display text-h2 font-bold">Flying to Gujarat…</div>
        <div className="text-body text-text-secondary mt-1">
          Packing camel snacks {EMOJI.feedback.trophy}
        </div>
      </div>
      <div className="mt-6 w-56 h-2 rounded-full bg-text-on-header/70 overflow-hidden">
        <div
          className="h-full w-2/3 animate-pulse"
          style={{ backgroundColor: "var(--accent-5)" }}
        />
      </div>
    </div>
  );
}

export function EmptyStateScreen() {
  return (
    <div className="h-full w-full bg-surface-card flex flex-col">
      <HeaderBar title="Friends" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-saffron/25 rounded-full" />
          <img src={mascot} alt="" className="relative w-52 h-52 object-contain" />
        </div>
        <h2 className="text-display text-2xl font-extrabold mt-4">No explorer friends yet!</h2>
        <p className="mt-2 text-body text-text-secondary max-w-[260px]">
          Invite a friend to join your adventure and travel across India together.
        </p>
        <button
          className="mt-6 h-14 px-6 rounded-2xl text-text-on-header text-display text-lg font-extrabold shadow-[var(--shadow-glow-orange)]"
          style={{ backgroundColor: "var(--accent-1)", color: "var(--accent-1-ink)" }}
        >
          Invite a Friend {EMOJI.action.sparkle}
        </button>
        <button className="mt-2 h-12 px-6 rounded-2xl bg-muted text-ink text-display font-extrabold">
          Maybe later
        </button>
      </div>
    </div>
  );
}

