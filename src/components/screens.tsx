﻿import mascot from "@/assets/mascot.webp";
import airplane from "@/assets/airplane.png";
import welcomeScreenImage from "@/assets/welcome.webp";
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
import { STATE_ART, TONE_GRADIENT, preloadStateArt } from "@/lib/state-art";
import { getStateContent, getCardContent, getCardContentByAge, type AgeTaggedContent } from "@/lib/state-content";
import { stopTts, playTts, playStateNarration } from "@/lib/tts";
import { getJourneyMotivationalMessage } from "@/lib/journey-messaging";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { PassportSeedling } from "@/components/PassportSeedling";
import { AudioSettingRow } from "@/components/AudioSettingToggle";
import { ResetPINDialog } from "@/components/ResetPINDialog";
import { StatePerformanceBadgesView } from "@/components/state-performance-badges-view";
import { 
  grantFeatureConsent, 
  revokeFeatureConsent, 
  hasFeatureConsent,
  subscribeConsentChanges 
} from "@/lib/parental-consent";
import { LanguageToggle, type LanguageCode } from "@/components/LanguageToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PostcardModal } from "@/components/PostcardModal";
import { PostcardPreviewModal } from "@/components/PostcardPreviewModal";
import { PostcardFrame } from "@/components/PostcardFrame";
import { CardProgressBar } from "@/components/CardProgressBar";
import { JourneyDestinationCard } from "@/components/JourneyDestinationCard";

import { DailyGoalCard } from "@/components/DailyGoalCard";
import { lazy, Suspense } from "react";

const IndiaProgressMapLazy = lazy(() =>
  import("@/components/IndiaProgressMap").then(m => ({
    default: m.IndiaProgressMap,
  }))
);
import { useToastStore } from "@/store/toastStore";
import { AVATAR_CONFIG, type AvatarId } from "@/lib/avatar-config";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouter, Navigate } from "@tanstack/react-router";
import { fxCorrect, fxWrong, fxConfetti, fxStamp, fxTap, useSoundOn, setSoundOn } from "@/lib/fx";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { setJourneyBackHandler } from "@/lib/journeyBackHandler";
import { useCelebration } from "@/hooks/useCelebration";
import { appLogger } from "@/lib/logger";
import { firebaseEvents } from "@/lib/firebase-events";
import { isBilingual, getAvailableLanguages } from "@/lib/bilingual-config";
import { getNewlyUnlockedBadges, markBadgeAsSeen, getBadgeNotificationMessage } from "@/lib/badge-unlock-tracker";
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
      <g fill="#ffffff">
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
    <div className="relative h-3 w-full rounded-full bg-black/10 overflow-hidden">
      <div
        className="h-full rounded-full gradient-gold transition-all duration-1000 ease-out"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-0 h-1 rounded-full bg-white/70 transition-all duration-1000 ease-out"
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
    gold: "bg-gold-soft text-[color:var(--gold)]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label ${map[tone]}`}
    >
      <span>{icon}</span>
      {children}
    </span>
  );
}

export function BottomNav({
  active,
}: {
  active: "home" | "map" | "explorer" | "badges" | "profile";
}) {
  const items = [
    { id: "home", icon: "🏠", label: "Home", to: "/home" },
    { id: "map", icon: "🗺️", label: "Journey", to: "/journey" },
    { id: "explorer", icon: "🗺️", label: "Explore", to: "/explorer" },
    { id: "badges", icon: "🏅", label: "Badges", to: "/badges" },
    { id: "profile", icon: "👤", label: "Me", to: "/me" },
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
              className={`flex-1 ui-nav-item ${
                on ? "ui-nav-item-active" : ""
              }`}
            >
              <span className="text-2xl leading-none">{i.icon}</span>
              <span
                className={`text-label ${
                  on ? "" : "text-text-secondary"
                }`}
              >
                {i.label}
              </span>
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
        tone === "white" ? "bg-white" : ""
      }`}
    >
      {onBack ? (
        <button
          onClick={goBack}
          aria-label="Go back"
          className="h-12 w-12 rounded-full ui-button ui-accent-1-soft flex items-center justify-center text-xl text-ink"
        >
          â€¹
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
    <div className="h-full w-full gradient-saffron relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
      <Cloud className="absolute top-16 left-4 w-24 opacity-80" />
      <Cloud className="absolute top-40 right-2 w-16 opacity-70" />
      <Cloud className="absolute bottom-40 left-6 w-20 opacity-60" />

      <img
        src={mascot}
        alt="India Explorer mascot"
        className="w-52 h-52 object-contain drop-shadow-2xl relative z-10"
      />
      <div className="mt-4 text-center relative z-10 px-8">
        <h1 className="text-h1 text-white leading-relaxed">
          India
          <br />
          Explorer
        </h1>
        <p className="mt-3 text-white/95 font-bold">
          Travel Across India,
          <br /> One State at a Time
        </p>
      </div>
      <div className="absolute bottom-20 flex items-center gap-2 text-white/90 text-body">
        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
        <span className="h-2 w-2 rounded-full bg-white/60" />
        <span className="h-2 w-2 rounded-full bg-white/40" />
        <span className="ml-2">Loading adventureâ€¦</span>
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
    <div className="w-screen h-screen overflow-hidden select-none relative cursor-pointer fixed inset-0 bg-white" onClick={handleButtonClick}>
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
  
  const p = useProgress();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<AvatarId>(p.avatar as AvatarId || avatarImages[0].id);
  const [ageBand, setAgeBand] = useState(p.ageBand);
  const [saved, setSaved] = useState(false);
  const [selectedAgeIndex, setSelectedAgeIndex] = useState(0);
  const [burst, setBurst] = useState(0);

  // Age bands with milestone emoji and vibrant gradient
  const ageBands = [
    { value: "3-5", emoji: "🌱", label: "Sprout", gradient: "bg-accent-2" },
    { value: "6-7", emoji: "🌿", label: "Seedling", gradient: "bg-accent-1" },
    { value: "8-9", emoji: "🌳", label: "Sapling", gradient: "bg-success" },
    { value: "10-12", emoji: "🌲", label: "Mighty Tree", gradient: "bg-action-primary" },
  ];

  const handleAgeSelect = (value: string, index: number) => {
    fxTap();
    setAgeBand(value);
    setSelectedAgeIndex(index);
    setBurst((n) => n + 1);
    setSaved(false);
  };

  const handleProfileSave = () => {
    fxTap();
    fxConfetti();
    
    const avatarName = getAvatarName(avatar);
    saveProfile({ name: avatarName, avatar, ageBand });
    
    // Navigate directly to home - no audio dialog here
    // Audio consent will be requested in Profile settings instead
    setSaved(true);
    setTimeout(() => navigate({ to: "/home" }), 300);
  };

  return (
    <div className="w-full bg-accent-1-soft flex flex-col select-none touch-none" style={{ touchAction: 'pan-y' }}>
      <div className="px-5 flex-1 overflow-auto">
        {/* Step 1: Avatar Selection */}
        <div className="rounded-3xl bg-accent-1 p-7 text-white relative overflow-hidden shadow-elevated-2 min-h-[140px] flex flex-col justify-center">
          <Cloud className="absolute -top-5 right-3 w-20 opacity-25" />
          <div className="relative z-10">
            <div className="text-3xl font-black leading-normal">
              Pick your avatar
            </div>
            <div className="text-base opacity-90 mt-3 leading-normal">
              Choose the explorer who will travel with you
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {avatarImages.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                fxTap();
                setAvatar(a.id);
                setSaved(false);
              }}
              className={`aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 transform ${
                a.id === avatar
                  ? "ring-3 ring-accent-4 shadow-elevated-2 scale-105"
                  : "ring-2 ring-border-color shadow-sm hover:ring-border-strong hover:scale-103"
              }`}
            >
              <img
                src={a.image}
                alt={getAvatarName(a.id)}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Selected Avatar Preview with Avatar Name */}
        {avatar && (() => {
          const selectedAvatar = avatarImages.find(a => a.id === avatar);
          const avatarName = getAvatarName(avatar);
          return selectedAvatar ? (
            <div className="mt-4 rounded-2xl bg-action-primary p-4 text-white animate-fade-in flex items-center gap-4 shadow-elevated-2">
              <img src={selectedAvatar.image} alt={avatarName} className="w-20 h-20 rounded-full border-3 border-white shadow-elevated-2 flex-shrink-0" />
              <div>
                <div className="text-xs opacity-90 font-semibold">Your explorer!</div>
                <div className="text-lg font-black">{avatarName}</div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Age Selection with Vibrant Colors & Emojis */}
        <div className="mt-6 mb-1">
          <label className="text-base font-black text-text-primary">
            🎂 How old are you?
          </label>
          <div className="mt-3 space-y-2">
            {ageBands.map((band, idx) => {
              const isSelected = band.value === ageBand;
              return (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => handleAgeSelect(band.value, idx)}
                  className={`w-full h-14 rounded-xl flex items-center justify-between px-4 font-bold transition-all duration-300 transform ${
                    isSelected
                      ? `${band.gradient} text-white shadow-elevated-2 scale-100 border-2 border-white`
                      : "bg-surface-card border-2 border-surface-sunken text-text-primary hover:border-surface-sunken hover:shadow-elevated-1"
                  }`}
                >
                  <span className="text-3xl">{band.emoji}</span>
                  <div className="flex-1 text-center">
                    <div className="text-sm font-black">{band.value}</div>
                    <div className={`text-xs transition-colors ${isSelected ? "text-white/90" : "text-text-secondary"}`}>
                      {band.label}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-2xl">⭐</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Age Selection Feedback */}
          {ageBand && (
            <ConfettiBurst key={`age-${burst}`} trigger={burst} size="big" />
          )}
        </div>
      </div>

      <div className="p-4 pb-safe bg-surface-card border-t border-border-color">
        <button
          onClick={handleProfileSave}
          className={`w-full h-12 rounded-xl bg-success text-white text-sm font-black shadow-elevated-2 transition-all duration-300 transform ${
            saved ? "scale-95 opacity-80" : "hover:shadow-elevated-3 hover:scale-102 active:scale-95"
          }`}
        >
          {saved ? "🎉 Saved âœ“" : "Continue â†’ Let's Explore!"}
        </button>
      </div>

      {/* Audio Permission Dialog removed from onboarding - moved to profile settings */}
    </div>
  );
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
      +{xp} XP ✨
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
  
  // Play celebration sound on mount
  useEffect(() => {
    if (pendingCelebration) {
      fxCorrect();
    }
  }, [pendingCelebration]);
  
  // Check if this celebration has already been shown in this session
  if (!showCelebrationPopup || !pendingCelebration) return null;

  // Type guard: only "full" type has quizXp/bonusXp
  if (pendingCelebration.type !== 'full') return null;

  const totalXp = pendingCelebration.quizXp + pendingCelebration.bonusXp;
  const celebrationId = `${pendingCelebration.stateName}_${totalXp}`;
  
  // If already shown in this session, don't show again
  if (shownCelebrationsRef.current.has(celebrationId)) return null;

  const { stateName, quizXp, bonusXp, earnedBadgeIds } = pendingCelebration;
  const state = INDIA_STATES.find(s => s.name === stateName);
  if (!state) return null;

  const handleDismiss = () => {
    fxTap();
    // Mark as shown in session to prevent duplicate displays
    shownCelebrationsRef.current.add(celebrationId);
    onDismiss();
    // Remove from pending celebrations when dismissed
    dismissPendingCelebration();
  };

  const handleNextState = () => {
    fxTap();
    // Mark as shown in session to prevent duplicate displays
    shownCelebrationsRef.current.add(celebrationId);
    onDismiss();
    // Remove from pending celebrations when proceeding
    dismissPendingCelebration();
    navigate({ to: "/journey" });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0"
        onClick={handleDismiss}
        aria-label="Close celebration"
      />
      
      {/* Celebration Card */}
      <div className="relative bg-action-primary text-white rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-scale-in border-2 border-action-primary">
        {/* Prominent Close Button - Top Right */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center text-white text-lg transition-all duration-200 z-10"
          aria-label="Close"
        >
          âœ•
        </button>

        <div className="relative z-10 flex flex-col gap-4">
          {/* Title - Celebration message */}
          <div className="text-center">
            <div className="text-lg font-bold opacity-95 text-ink">ðŸ† STATE MASTERED! ðŸ†</div>
            <div className="text-3xl font-black mt-2 drop-shadow-lg text-ink">
              {stateName}
            </div>
          </div>

          {/* Stats Grid - Show earned rewards (real values) */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {earnedBadgeIds.length > 0 && (
              <div className="bg-white/90 backdrop-blur rounded-xl p-3">
                <div className="text-sm opacity-90 font-semibold text-ink">Badges</div>
                <div className="text-2xl font-bold mt-1 text-ink">+{earnedBadgeIds.length}</div>
              </div>
            )}
            <div className="bg-white/90 backdrop-blur rounded-xl p-3">
              <div className="text-sm opacity-90 font-semibold text-ink">XP</div>
              <div className="text-2xl font-bold mt-1 text-ink">+{totalXp}</div>
            </div>
            <div className="bg-white/90 backdrop-blur rounded-xl p-3">
              <div className="text-sm opacity-90 font-semibold text-ink">Stamp</div>
              <img
                src={STATE_ART[stateName]}
                alt={stateName}
                className="w-10 h-10 object-cover rounded mx-auto mt-1"
                loading="eager"
                decoding="auto"
              />
            </div>
          </div>

          {/* Action buttons - Clear hierarchy */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleDismiss}
              className="flex-1 h-11 rounded-xl ui-button ui-accent-1-soft border border-white/40 text-ink text-sm font-bold hover:bg-white/30 transition-all duration-200"
            >
              Dismiss
            </button>
            <button
              onClick={handleNextState}
              className="flex-1 h-11 rounded-xl bg-surface-card text-action-primary text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95"
            >
              Next State â†’
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeDashboardScreen() {
  const p = useProgress();
  
  // Route guard: redirect to welcome if not onboarded (defensive check)
  if (!p.onboarded) {
    appLogger.warn('home_dashboard', 'User attempted to access home without onboarding', {});
    return <Navigate to="/welcome" replace />;
  }
  
  return <HomeDashboardContent />;
}

function HomeDashboardContent() {
  const p = useProgress();
  const navigate = useNavigate();
  const celebration = useCelebration();
  const [statsVisible, setStatsVisible] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [showLockedPreview, setShowLockedPreview] = useState<string | null>(null);
  const [dismissStreakWarning, setDismissStreakWarning] = useState(false);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState<string | null>(null);
  // Auto-show tutorial on first session, allow dismiss
  const [showTutorial, setShowTutorial] = useState(false);
  // Auto-dismiss celebration popup after 3 seconds
  const [showCelebrationPopup, setShowCelebrationPopup] = useState(true);

  const { level, toNext, pct } = levelInfo(p.xp);
  const postcards = Object.keys(p.postcards).length;
  const journey = statesWithProgress(p);
  const current = journey.find((s) => s.status === "current") ?? journey[journey.length - 1];
  const currentDone = cardsDone(p, current.name);
  const upNext = journey.filter((s) => s.name !== current.name && s.status !== "done" && s.status !== "current").slice(0, 2);

  useEffect(() => {
    touchStreak();
    
    // Check for streak milestone celebrations
    const { reached, message } = getStreakMilestone(p.streak);
    if (reached) {
      const celebrated = localStorage.getItem(`india-explorer:streak-milestone-${p.streak}:v1`);
      if (!celebrated) {
        setTimeout(() => {
          celebration.custom(
            message,
            "ðŸ”¥",
            {
              subtitle: `Keep up this amazing momentum!`,
              confetti: true,
              duration: 3000,
              type: "success",
              showCloseButton: true,
            }
          );
          localStorage.setItem(`india-explorer:streak-milestone-${p.streak}:v1`, "true");
        }, 500);
      }
    }
    
    // Trigger animations on mount
    setTimeout(() => setStatsVisible(true), 100);
    setTimeout(() => setAnimateStats(true), 500);
  }, [p.streak]);

  const handleLockedCardTap = (stateName: string) => {
    fxTap();
    setShowLockedPreview(stateName);
  };

  const handleTutorialToggle = () => {
    fxTap();
    setShowTutorial(true);
  };

  const handleTutorialClose = () => {
    fxTap();
    // Mark tutorial as seen so it doesn't auto-show again
    localStorage.setItem("india-explorer:tutorial-seen:v1", "true");
    setShowTutorial(false);
  };

  const getUnlockRequirement = (stateName: string): string => {
    // All states unlocked from day 1 - free exploration mode
    return "🌍 All states open - explore freely!";
  };

  return (
    <div className="h-full w-full bg-bg-page flex flex-col overflow-hidden" data-testid="home-screen">

      {/* Header with fade-in animation - Premium spacing */}
      <div className={`flex-shrink-0 px-6 pt-4 pb-5 bg-bg-header rounded-b-[32px] relative overflow-hidden transition-opacity duration-500 ${statsVisible ? "opacity-100" : "opacity-0"}`}>
        <Cloud className="absolute top-2 right-4 w-14 opacity-40" />
        <div className="flex items-center gap-4 relative mb-3">
          {/* Avatar - Larger and more prominent */}
          <div className="h-20 w-20 rounded-2xl ui-card ui-accent-1-soft p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0" data-testid="profile-avatar">
            <img src={getAvatarImage(p.avatar)} alt={getAvatarName(p.avatar)} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Greeting - Single line, cleaner */}
            <div className="text-text-on-header">
              <div className="text-h4 text-display leading-tight">
                Namaste, {(p?.name?.split(" ")[0] || "Explorer")}! ðŸ‘‹
              </div>
              <div className="text-body-sm opacity-95 mt-1">Level {level} · Explorer</div>
            </div>
          </div>
          
          {/* Right side: Streak badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 ui-chip ui-accent-1-soft transition-transform duration-1000`}>
              <span className="text-2xl">ðŸ”¥</span>
              <div className="flex flex-col items-start">
                <span className="text-ink text-h5 font-black leading-none">{p.streak}</span>
                <span className="text-ink text-xs font-bold opacity-90 leading-none">day streak</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Scrollable content area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
      {/* India Journey Meta-Game Card - Separate featured section */}
      <div className={`px-6 pt-5 pb-4 transition-opacity duration-700 ${statsVisible ? "opacity-100" : "opacity-0"}`}>
        <Suspense fallback={
          <div className="w-full ui-card ui-accent-1-soft rounded-3xl p-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-3 bg-muted rounded" />)}
            </div>
          </div>
        }>
          <IndiaProgressMapLazy />
        </Suspense>
      </div>



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
          <div className="px-5 mt-5 animate-fade-in">
            <div className="rounded-2xl bg-warning-soft text-warning p-4 shadow-elevated-2 transition-all hover:shadow-elevated-3 border border-warning">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">🚨</div>
                <div className="flex-1 min-w-0">
                  <div className="text-body font-bold">Your streak is at risk!</div>
                  <div className="text-caption mt-1 opacity-90">Last played {streakStatus.hoursSinceActive} hours ago</div>
                  <div className="text-caption mt-1">Come back within 12 hours to keep your ðŸ”¥ {p.streak} day streak!</div>
                </div>
                <button
                  onClick={() => setDismissStreakWarning(true)}
                  className="text-warning opacity-70 hover:opacity-100 text-xl flex-shrink-0 transition-all duration-200"
                >
                  âœ•
                </button>
              </div>
            </div>
          </div>
        );
      })()}



      {/* Continue journey - with pulse on play button */}
      <div className="px-5 mt-5 mb-4 flex-shrink-0">
        <h2 className="text-display font-bold text-sm text-text-secondary mb-2">
          Continue your journey
        </h2>
        <div className="mt-2 rounded-3xl ui-card ui-accent-1-soft p-4 flex items-center gap-3">
          <div className="h-16 w-16 rounded-2xl overflow-hidden flex-shrink-0">
            <img 
              src={STATE_ART[current.name]} 
              alt={current.name}
              className="w-full h-full object-cover"
              loading="eager"
              decoding="auto"
            />
          </div>
          <div className="flex-1">
            <div className="text-label text-saffron">
              {current.kind === "ut" ? "Union Territory" : "Currently Exploring"}
            </div>
            <div className="text-h4 font-bold leading-tight">
              {current.name}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full gradient-saffron transition-all duration-1000 ease-out"
                  style={{ width: `${(currentDone / CARDS_PER_STATE) * 100}%` }}
                />
              </div>
              <span className="text-label text-text-secondary">
                {currentDone}/{CARDS_PER_STATE}
              </span>
            </div>
          </div>
          <Link
            to="/state/$slug/learn"
            params={{ slug: stateSlug(current.name) }}
            onClick={() => fxTap()}
            className="h-12 px-4 rounded-2xl ui-button ui-accent-1 text-ink text-display font-bold text-sm flex items-center transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Play •¶
          </Link>
        </div>
      </div>



      {/* Up next - with interactive locked cards */}
      <div className="px-5 mt-5 mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-display font-bold text-sm text-text-secondary">
            Up next
          </h2>
          <Link to="/journey" className="text-xs font-extrabold text-explorer" aria-label="View all states">
            View all
          </Link>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {upNext.map((s, idx) => (
            <button
              key={s.name}
              onClick={() => handleLockedCardTap(s.name)}
              className={`rounded-3xl ui-card ui-accent-1-soft p-3 flex flex-col items-center gap-2 transition-all duration-300 overflow-hidden hover:scale-105 ${
                animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
              aria-label={`Next state to explore: ${s.name}`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleLockedCardTap(s.name);
                }
              }}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <img 
                  src={STATE_ART[s.name]} 
                  alt={s.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="text-display font-bold text-sm text-center leading-tight line-clamp-ellipsis-2">
                {s.name}
              </div>
              <Link
                to="/state/$slug/learn"
                params={{ slug: stateSlug(s.name) }}
                onClick={(e) => {
                  e.stopPropagation();
                  fxTap();
                }}
                className="mt-1 px-4 py-2 rounded-lg ui-button ui-accent-1 text-ink text-label font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label={`Start exploring ${s.name}`}
              >
                Start exploring
              </Link>
            </button>
          ))}
        </div>
      </div>

      {/* Locked Card Preview Modal */}
      {showLockedPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-surface-card rounded-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            {(() => {
              const state = journey.find((s) => s.name === showLockedPreview);
              if (!state) return null;

              return (
                <div>
                  {/* Close button */}
                  <button
                    onClick={() => setShowLockedPreview(null)}
                    className="absolute top-4 right-4 text-muted-light hover:text-text-secondary text-xl"
                  >
                    âœ•
                  </button>

                  {/* State preview */}
                  <div className={`rounded-2xl gradient-saffron text-text-on-primary p-4 text-center mb-4`}>
                    <div className="w-20 h-20 mx-auto mb-2 rounded-lg overflow-hidden">
                      <img 
                        src={STATE_ART[state.name]} 
                        alt={state.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-display text-xl font-extrabold">{state.name}</div>
                    <div className="text-sm opacity-90 mt-1">{state.nickname}</div>
                  </div>

                  {/* State facts */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-orange-soft border-l-4 border-orange shadow-elevated-1 hover:shadow-elevated-2 transition-all">
                      <div className="text-label text-orange uppercase tracking-wider font-bold">ðŸ›️ Monument</div>
                      <div className="text-body text-orange mt-2 font-semibold">{state.monumentName}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-success-soft border-l-4 border-success shadow-elevated-1 hover:shadow-elevated-2 transition-all">
                      <div className="text-label text-success uppercase tracking-wider font-bold">ðŸ¦ Wildlife</div>
                      <div className="text-body text-success mt-2 font-semibold">{state.animalName}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-info-soft border-l-4 border-info shadow-elevated-1 hover:shadow-elevated-2 transition-all">
                      <div className="text-label text-info uppercase tracking-wider font-bold">ðŸ’¡ Fun Fact</div>
                      <div className="text-body text-info mt-2 font-semibold">{state.funFact}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-soft border-l-4 border-purple shadow-elevated-1 hover:shadow-elevated-2 transition-all">
                      <div className="text-label text-muted-dark uppercase tracking-wider font-bold">ðŸ”“ Unlock Path</div>
                      <div className="text-body text-muted-dark mt-2 font-semibold">{getUnlockRequirement(state.name)}</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 space-y-2">
                    <Link
                      to="/journey"
                      className="w-full h-12 rounded-2xl ui-button ui-accent-1 text-ink font-extrabold flex items-center justify-center hover:scale-105 transition-all active:scale-95"
                      onClick={() => fxTap()}
                    >
                      View Journey Map
                    </Link>
                    <button
                      onClick={() => setShowLockedPreview(null)}
                      className="w-full h-11 rounded-2xl ui-button ui-accent-1-soft text-ink font-bold hover:scale-105 transition-all active:scale-95"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

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
  const border = {
    orange: "border-saffron/25",
    gold: "border-[color:var(--gold)]/30",
    green: "border-success/25",
  }[tone];
  return (
    <div className={`rounded-2xl ui-card ui-accent-1-soft border ${border} p-3`}>
      <div className="text-lg">{icon}</div>
      <div className="text-display text-h2 leading-snug mt-1">
        {value}
      </div>
      <div className="text-label text-text-secondary">
        {label}
      </div>
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
    <div className={`rounded-2xl ${bgGradient} border ${borderColor} p-2 shadow-soft hover:shadow-md transition-all`}>
      <div className="flex flex-col gap-1">
        {/* Icon and Number - Horizontal */}
        <div className="flex items-center gap-1.5 pl-1">
          <div className="text-2xl flex-shrink-0">{icon}</div>
          <div className={`text-h1 font-black ${numberColor} leading-none`}>
            {value}
          </div>
        </div>
        
        {/* Label */}
        <div className="text-label text-text-primary px-1">
          {label}
        </div>
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
    <div className="relative rounded-3xl bg-white border border-black/5 shadow-soft p-3">
      <div
        className={`h-20 rounded-2xl flex items-center justify-center overflow-hidden ${
          locked ? "bg-muted" : "gradient-sky"
        }`}
      >
        <img
          src={img}
          alt=""
          className={`h-full object-contain ${locked ? "grayscale opacity-60" : ""}`}
        />
      </div>
      <div className="mt-2 text-display font-extrabold text-sm">{name}</div>
      <div className="text-[10px] font-bold text-text-secondary">
        {locked ? "ðŸ”’ Locked" : "Unlocked"}
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
      className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-text-secondary hover:bg-muted"
        >
          âœ•
        </button>

        {/* State Display */}
        <div className="flex flex-col items-center pt-2">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center text-5xl mb-4 ${
              isDone
                ? "gradient-saffron shadow-lg"
                : isLocked
                ? "bg-surface-sunken opacity-60"
                : "gradient-saffron shadow-lg"
            }`}
          >
            {stateData.emoji}
          </div>

          <h2 className="text-h2 text-ink">
            {stateName}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {state.isUT ? "Union Territory" : "State"} · {stateData.capital}
          </p>
        </div>

        {/* Sneak Peek Preview for Locked States */}
        {isLocked && (
          <div className="rounded-2xl bg-action-primary/5 border-2 border-warning p-4 space-y-3">
            <p className="text-h5 text-warning flex items-center gap-2">
              ðŸ‘€ Sneak Peek Preview
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
            <p className="text-h5 text-warning mb-2">
              ðŸ” Locked
            </p>
            <p className="text-body text-action-primary">
              Complete the previous state to unlock this adventure!
            </p>
          </div>
        ) : isDone ? (
          <div className="rounded-2xl bg-success-soft border-2 border-success p-4">
            <p className="text-h5 text-success mb-2">
              âœ“ Completed
            </p>
            <p className="text-body text-success">
              You've earned all badges for this state!
            </p>
          </div>
        ) : (
          <div className="roundepppd-2xl bg-info-soft border-2 border-info p-4">
            <p className="text-h5 text-info mb-2">
              •¶ In Progress
            </p>
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
              className="flex-1 h-12 rounded-2xl bg-accent-1 text-display font-extrabold text-white shadow-lg hover:shadow-xl transition"
            >
              {isDone ? "🎖️ Review" : "•¶ Play"}
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
  const states = statesWithProgress(p);
  const [view, setView] = useState<{ screen: "intro" | "hub" | "card" | "quiz"; name: string; cardIndex?: number } | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<keyof typeof REGIONS>("north");
  const celebration = useCelebration();

  // Detect and celebrate milestones
  useEffect(() => {
    const totalStates = TOTAL_STATES;
    const completed = p.completed.length;
    const percentage = Math.round((completed / totalStates) * 100);

    // Check for milestone achievements
    const milestones = [
      { threshold: 25, emoji: "ðŸŽ¯", message: "Quarter Way There! 25% Complete!" },
      { threshold: 50, emoji: "🌍Ž", message: "Halfway Around India! 50% Complete!" },
      { threshold: 75, emoji: "ðŸ", message: "Almost Complete! 75% Explored!" },
      { threshold: 100, emoji: "ðŸ‘‘", message: "India Master! 100% Complete!" },
    ];

    // Track which milestones have been celebrated in localStorage
    const celebratedKey = "india-explorer:milestones-celebrated:v1";
    const celebrated = typeof window !== "undefined" 
      ? JSON.parse(localStorage.getItem(celebratedKey) || "[]")
      : [];

    milestones.forEach((m) => {
      if (percentage >= m.threshold && !celebrated.includes(m.threshold)) {
        // New milestone reached!
        celebration.custom(
          m.message,
          m.emoji,
          {
            subtitle: `You've explored ${completed}/${totalStates} regions!`,
            confetti: true,
            duration: 4000,
            type: "success",
          }
        );
        
        // Mark as celebrated
        celebrated.push(m.threshold);
        if (typeof window !== "undefined") {
          localStorage.setItem(celebratedKey, JSON.stringify(celebrated));
        }
      }
    });
  }, [p.completed.length, celebration]);

  // Register the back handler for this screen with the global journey back handler
  useEffect(() => {
    const handleBack = () => {
      appLogger.info('journey_map_screen', 'handleJourneyBack called, current view:', view?.screen);
      
      // Navigate back within internal views: card â†’ hub â†’ intro â†’ map
      if (view?.screen === "card" || view?.screen === "quiz") {
        // From card or quiz, go back to hub
        appLogger.info('journey_map_screen', 'Back from card/quiz to hub');
        setView({ screen: "hub", name: view.name });
        return;
      } else if (view?.screen === "hub") {
        // From hub, go back to intro
        appLogger.info('journey_map_screen', 'Back from hub to intro');
        setView({ screen: "intro", name: view.name });
        return;
      } else if (view?.screen === "intro") {
        // From intro, go back to journey map
        appLogger.info('journey_map_screen', 'Back from intro to map');
        setView(null);
        return;
      }
      // If already at journey map (view === null), don't handle - let default back behavior occur
      appLogger.info('journey_map_screen', 'At journey map, allowing default back behavior');
    };
    
    // Register this handler when component mounts or view changes
    setJourneyBackHandler(handleBack);
    
    // Cleanup: remove handler when component unmounts
    return () => {
      setJourneyBackHandler(null);
    };
  }, [view]);

  useEffect(() => {
    appLogger.info('journey_map_screen', 'view state changed', view);
  }, [view]);

  // Preload all state images for smooth rendering
  useEffect(() => {
    const stateNames = states.map((s) => s.name);
    preloadStateArt(...stateNames);
  }, [states]);

  appLogger.info('journey_map_screen', 'Rendering with states.length=' + (states ? states.length : 'undefined') + ', states=' + (states ? JSON.stringify(states.slice(0, 2)) : 'null'));

  // Organize states by region for color-coded grouping
  const statesByRegion = useMemo(() => {
    const result: Record<string, typeof states> = {};
    REGION_KEYS.forEach((key) => {
      const region = REGIONS[key];
      result[key] = states.filter((s) => region.states.some((rs) => rs.name === s.name));
    });
    return result;
  }, [states]);

  // Safety check: ensure we have states data
  if (!states || states.length === 0) {
    appLogger.info('journey_map_screen', 'No states data available (states=' + (states ? 'empty' : 'null') + '), showing loading state');
    return <LoadingScreen />;
  }

  type MapNode = {
    name: string;
    short: string;
    status: (typeof states)[number]["status"];
    isUT: boolean;
    x: number;
    y: number;
  };

  // Build nodes from regional data (not from old routes)
  const nodes: MapNode[] = [];
  
  // Add nodes from all regions
  REGION_KEYS.forEach((regionKey) => {
    // Skip union territories - they'll be added separately
    if (regionKey === "unionTerritories") return;
    
    const regionStates = statesByRegion[regionKey] || [];
    regionStates.forEach((state) => {
      nodes.push({
        name: state.name,
        short: state.short,
        status: state.status,
        isUT: false,
        x: 0, // Not used in new rendering
        y: 0, // Not used in new rendering
      });
    });
  });
  
  // Add union territory nodes
  const utStates = statesByRegion["unionTerritories"] || [];
  utStates.forEach((state) => {
    nodes.push({
      name: state.name,
      short: state.short,
      status: state.status,
      isUT: true,
      x: 0, // Not used in new rendering
      y: 0, // Not used in new rendering
    });
  });

  const totalStates = TOTAL_STATES;
  const completedStates = nodes.filter((n) => n.status === "done").length;

  appLogger.info('journey_map_screen', 'nodes count: ' + nodes.length, nodes.map(n => ({ name: n.name, status: n.status })));

  if (view?.screen === "intro") {
    appLogger.info('journey_map_screen', 'Rendering StateIntroScreen with: ' + view.name);
    return (
      <StateIntroScreen
        stateName={view.name}
        onBack={() => {
          appLogger.info('journey_map_screen', 'StateIntroScreen onBack clicked');
          setView(null);
        }}
        onContinue={() => {
          appLogger.info('journey_map_screen', 'StateIntroScreen onContinue clicked');
          setLastPlayedState(view.name);
          setView({ screen: "hub", name: view.name });
        }}
      />
    );
  }
  if (view?.screen === "hub") {
    appLogger.info('journey_map_screen', 'Rendering LearningHubScreen with: ' + view.name);
    return (
      <LearningHubScreen
        stateName={view.name}
        onBack={() => {
          appLogger.info('journey_map_screen', 'LearningHubScreen onBack clicked');
          setView({ screen: "intro", name: view.name });
        }}
        onCard={(index) => {
          appLogger.info('journey_map_screen', 'LearningHubScreen onCard clicked with index: ' + index);
          setView({ screen: "card", name: view.name, cardIndex: index });
        }}
        onQuiz={() => {
          appLogger.info('journey_map_screen', 'LearningHubScreen onQuiz clicked');
          setView({ screen: "quiz", name: view.name });
        }}
        allowReplay={true}
      />
    );
  }
  if (view?.screen === "card") {
    appLogger.info('journey_map_screen', 'Rendering LearningCardScreen with: ' + view.name + ', cardIndex: ' + view.cardIndex);
    return (
      <LearningCardScreen
        stateName={view.name}
        cardIndex={view.cardIndex}
        onClose={() => {
          appLogger.info('journey_map_screen', 'LearningCardScreen onClose clicked');
          setView({ screen: "hub", name: view.name });
        }}
        onNext={(index) => {
          appLogger.info('journey_map_screen', 'LearningCardScreen onNext clicked with index: ' + index);
          if (index === null) {
            // Move to quiz
            setView({ screen: "quiz", name: view.name });
          } else {
            // Move to next card
            setView({ screen: "card", name: view.name, cardIndex: index });
          }
        }}
      />
    );
  }
  if (view?.screen === "quiz") {
    appLogger.info('journey_map_screen', 'Rendering QuizScreen with: ' + view.name);
    return (
      <QuizScreen
        stateName={view.name}
        onClose={() => {
          appLogger.info('journey_map_screen', 'QuizScreen onClose clicked');
          setView({ screen: "hub", name: view.name });
        }}
        onDone={() => {
          appLogger.info('journey_map_screen', 'QuizScreen onDone clicked');
          // Navigate to completion screen which will show postcard â†’ unlock â†’ explorer
          const slug = view.name.toLowerCase().replace(/\s+/g, "-");
          navigate({ to: "/state/$slug/complete", params: { slug } });
        }}
      />
    );
  }

  return (
    <div className="h-full w-full gradient-sky relative overflow-hidden flex flex-col">
      {/* Header with orange gradient - matching Home screen with sticky positioning */}
      <div className="sticky top-0 z-40 px-6 pt-3 pb-4 gradient-saffron rounded-b-3xl relative overflow-hidden animate-fade-in shadow-elevated-2">
        <Cloud className="absolute top-2 right-4 w-14 opacity-40 pointer-events-none" />
        
        {/* Journey Info */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-11 w-11 rounded-2xl ui-card ui-accent-1-soft p-1 flex items-center justify-center overflow-hidden">
            <img src={getAvatarImage(p.avatar)} alt={getAvatarName(p.avatar)} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="text-display font-extrabold text-white">India Journey</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              {p.streak > 0 && (
                <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-white/30 rounded-full">
                  <span>ðŸ”¥</span>
                  <span className="font-extrabold">{p.streak}-day streak!</span>
                </span>
              )}
              <span>
                {completedStates}/{totalStates} states
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar - inside header */}
        <div className="mt-3 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <div className="h-3 bg-white/30 rounded-full overflow-hidden shadow-inner mb-2">
            <div
              className="h-full bg-accent-2-soft rounded-full transition-all duration-500"
              style={{ width: `${(completedStates / totalStates) * 100}%` }}
            />
          </div>
          {/* Single line milestone hint */}
          <div className="text-sm font-bold text-white">
            {(() => {
              const msg = getJourneyMotivationalMessage(completedStates);
              const milestoneCount = 36 - completedStates;
              return milestoneCount > 0 ? `${milestoneCount} more to grow your tree` : "🌳 You grew the tree!";
            })()}
          </div>
        </div>
      </div>

      {/* Clouds decoration below header */}
      <Cloud className="absolute top-96 left-2 w-24 opacity-90 pointer-events-none animate-fade-in" />
      <Cloud className="absolute top-[500px] right-1 w-20 opacity-85 pointer-events-none animate-fade-in" />

      {/* Explorable States Map with Regional Organization */}
      <div className="relative flex-1 flex flex-col overflow-hidden animate-fade-in" style={{ animationDelay: "200ms" }}>
        {/* Region Chips - Horizontal Scrollable */}
        <div className="px-4 pt-4 pb-2 overflow-x-auto sticky top-0 z-20 bg-bg-page">
          <div className="flex gap-2 pb-2 min-w-min">
            {REGION_KEYS.map((regionKey) => {
              const region = REGIONS[regionKey];
              const regionStates = statesByRegion[regionKey] || [];
              const regionDone = regionStates.filter((s) => s.status === "done").length;
              const isSelected = regionKey === expandedRegion;
              
              return (
                <button
                  key={regionKey}
                  onClick={() => {
                    fxTap();
                    setExpandedRegion(regionKey);
                  }}
                  className={`px-4 py-3 rounded-full font-extrabold whitespace-nowrap transition active:scale-95 ${
                    isSelected
                      ? "ui-button ui-accent-1 text-ink"
                      : "ui-button ui-accent-1-soft text-ink"
                  }`}
                  style={{ fontSize: 'var(--type-body)', fontWeight: 'var(--type-body-weight)' }}
                  title={`${regionDone}/${regionStates.length} explored`}
                >
                  {region.emoji} {region.name.split(" ")[0]} {isSelected && regionDone === regionStates.length && "âœ“"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expanded Region Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-4" style={{ paddingBottom: 'calc(64px + 16px + env(safe-area-inset-bottom))' }}>
          {/* Region Info Header */}
          {(() => {
            const region = REGIONS[expandedRegion];
            const regionStates = statesByRegion[expandedRegion] || [];
            const regionDone = regionStates.filter((s) => s.status === "done").length;
            
            return (
              <div className="mb-4 animate-fade-in">
                <div style={{ fontSize: 'var(--type-section-heading)', fontWeight: 'var(--type-section-heading-weight)' }} className="text-text-primary">
                  {region.name}
                </div>
                <div className="text-base font-semibold text-text-secondary mt-1">
                  {regionDone}/{regionStates.length} explored {regionDone === regionStates.length && "✨ Region Complete!"}
                </div>
                <div className="mt-2 h-2 bg-[oklch(0.9_0.02_260)] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-accent-1 transition-all duration-300`}
                    style={{ width: `${(regionDone / regionStates.length) * 100}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* States in selected region - 2-Column Grid */}
          {(() => {
            const regionStates = statesByRegion[expandedRegion] || [];
            
            return (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-in">
                {regionStates.map((state, stateIndex) => {
                  const isLocked = state.status === "locked";
                  const isDone = state.status === "done";
                  const isCurrent = state.status === "current";
                  const isAvailable = state.status === "available";
                  
                  // Detect in-progress state (partially completed cards)
                  const cardsRead = cardsDone(p, state.name);
                  const totalCards = 6; // IndiaState doesn't have cards property, default to 6
                  const isInProgress = !isDone && cardsRead > 0 && cardsRead < totalCards;
                  
                  // Determine card status
                  let cardStatus: "available" | "completed" | "locked" = "available";
                  if (isDone) {
                    cardStatus = "completed";
                  } else if (isLocked) {
                    cardStatus = "locked";
                  } else if (isAvailable || isCurrent || isInProgress) {
                    cardStatus = "available";
                  }
                  
                  return (
                    <JourneyDestinationCard
                      key={state.name}
                      stateName={state.name}
                      status={cardStatus}
                      cardIndex={stateIndex}
                      isInProgress={isInProgress}
                      cardsDone={cardsRead}
                      totalCards={totalCards}
                      onStart={() => {
                        fxTap();
                        if (!isLocked) {
                          setView({ screen: "intro", name: state.name });
                        }
                      }}
                      onReplay={() => {
                        fxTap();
                        setView({ screen: "intro", name: state.name });
                      }}
                    />
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* State Detail Modal */}
      {selectedState && (
        <StateDetailModal
          stateName={selectedState}
          states={nodes}
          onClose={() => setSelectedState(null)}
          onPlay={() => {
            setSelectedState(null);
            setView({ screen: "intro", name: selectedState });
          }}
        />
      )}

      {/* BottomNav moved to root layout for consistency */}
    </div>
  );
}



export function StateIntroScreen({
  stateName,
  onBack,
  onContinue,
}: { stateName?: string; onBack?: () => void; onContinue?: () => void } = {}) {
  appLogger.info('state_intro_screen', 'Mounted with stateName: ' + stateName);
  
  const state = getState(stateName);
  const goBack = useGoBack();
  const art = STATE_ART[state.name];
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";

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

  appLogger.info('state_intro_screen', 'Rendered with stateName: ' + stateName + ', state.name: ' + state?.name);

  useEffect(() => {
    appLogger.info('state_intro_screen', 'useEffect - preloading art');
    preloadStateArt(state.name, nextStateAfter(state.name)?.name);
  }, [state.name]);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className={`relative py-12 ${grad} overflow-hidden`}>
        <Cloud className="absolute top-6 left-2 w-20 opacity-80" />
        <Cloud className="absolute top-14 right-2 w-16 opacity-70" />
        
        {/* Breadcrumb Navigation */}
        <div className="absolute top-3 left-16 flex items-center gap-1 text-white text-xs font-bold">
          <span className="opacity-75">Journey</span>
          <span className="opacity-50">â€º</span>
          {currentRegion && (
            <>
              <img
                src={STATE_ART[currentRegion.name]}
                alt={currentRegion.name}
                className="w-3 h-3 object-cover rounded inline-block"
                loading="lazy"
                decoding="async"
              />
              <span className="opacity-75">{currentRegion.name}</span>
              <span className="opacity-50">â€º</span>
            </>
          )}
          <img
            src={STATE_ART[state.name]}
            alt={state.name}
            className="w-3 h-3 object-cover rounded inline-block"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <button
          onClick={() => {
            if (onBack) {
              fxTap();
              onBack();
            } else {
              goBack();
            }
          }}
          className="absolute top-3 left-4 h-12 w-12 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-white text-xl"
        >
          â€¹
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/25 backdrop-blur rounded-full px-3 py-1.5 text-white text-xs font-extrabold">
          State {stateIndex(state.name) + 1} of {TOTAL_STATES}
        </div>
        {art ? (
          <img
            src={art}
            alt={`${stateName} state illustration`}
          />
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

      <div className="-mt-8 rounded-t-[36px] bg-white flex-1 px-5 pt-6 pb-5 relative z-10">
        <div className="text-xs font-black uppercase tracking-widest text-saffron">
          Welcome to
        </div>
        <h1 className="text-h1 leading-snug mt-1">
          {state.name}
        </h1>
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
          <IntroFact label="Capital" value={state.capital} icon="ðŸ›️" />
          <IntroFact label="Language" value={state.language} icon="ðŸ—£️" />
          <IntroFact label="Population" value={state.population} icon="ðŸ‘¥" />
          <IntroFact label="Animal" value={state.animalName} icon={state.animal} />
        </div>

        <button
          onClick={() => {
            appLogger.info('state_intro_screen', 'Start Exploring clicked, calling onContinue');
            fxTap();
            onContinue?.();
          }}
          className="mt-6 w-full h-14 ui-button ui-accent-1 text-ink text-h4 text-display"
        >
          Start Exploring! âœˆ️
        </button>
      </div>
    </div>
  );
}


function IntroFact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="ui-card ui-accent-1-soft p-3">
      <div className="text-2xl">{icon}</div>
      <div className="text-label text-ink">
        {label}
      </div>
      <div className="text-h5 font-bold text-ink leading-tight">
        {value}
      </div>
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
  appLogger.info('learning_hub_screen', 'Mounted with stateName: ' + stateName + ', allowReplay: ' + allowReplay);
  
  const progress = useProgress();
  const goBack = useGoBack();
  const celebration = useCelebration();
  const state = getState(stateName);
  const live = statesWithProgress(progress).find((s) => s.name === state.name);
  let status = live?.status ?? state.status;
  // If allowReplay is true, treat locked states as "current" so cards are playable
  if (allowReplay && status === "locked") {
    appLogger.info('learning_hub_screen', 'allowReplay is true and status was locked, changing to current');
    status = "current";
  }

  appLogger.info('learning_hub_screen', 'Rendered with stateName: ' + stateName + ', allowReplay: ' + allowReplay + ', status: ' + status);
  const read = cardsRead(progress, state.name);
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";

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

  // Track which categories have been celebrated to avoid duplicate celebrations
  const [celebratedCategories, setCelebratedCategories] = useState<Set<number>>(new Set());
  
  // State for showing the "All 6 cards done" decision modal
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  // Category progress tracking - calculate card counts using cardVisits
  const allCards = useMemo(() => {
    return learningCardsFor(state.name, "en", progress.ageBand);
  }, [state.name, progress.ageBand]);

  const cardCounts = useMemo(() => {
    console.log(`[LearningHubScreen] cardCounts calculation for ${state.name}`);
    console.log(`[LearningHubScreen] allCards.length: ${allCards.length}`);
    
    // Category names matching how they're stored in cardVisits
    const categoryNames = ['Capital', 'Language', 'Food', 'Places', 'Animal', 'Fact'];
    const cardVisits = progress.cardVisits?.[state.name];
    
    console.log(`[LearningHubScreen] cardVisits structure for ${state.name}:`, cardVisits);
    
    return Array.from({ length: 6 }).map((_, i) => {
      const categoryName = categoryNames[i];
      
      // Count ALL cards for each category (main + sub-cards like Activity, Trivia, Cool Facts)
      const allCategoryCards = allCards.filter(card => card.mainCardIndex === i);
      
      // Get visited cards from cardVisits structure
      const visitedKey = categoryName.toLowerCase().replace(/\s+/g, '-');
      const visitedIndices = cardVisits?.[visitedKey] ?? [];
      
      console.log(`[LearningHubScreen] Category ${i} (${categoryName}): found ${allCategoryCards.length} total cards, visited ${visitedIndices.length}`);

      return {
        total: allCategoryCards.length,  // ALL cards including sub-cards
        read: visitedIndices.length,     // How many visited
      };
    });
  }, [allCards, progress.cardVisits, state.name]);

  // Count completed categories (where ALL cards in that category are read)
  const completedCategories = useMemo(() => {
    const result = cardCounts.filter(count => count.total > 0 && count.read === count.total).length;
    console.log(`[LearningHubScreen] completedCategories: ${result}`);
    console.log(`[LearningHubScreen] cardCounts breakdown:`, cardCounts.map((c, i) => `Cat${i}: ${c.read}/${c.total}`).join(', '));
    return result;
  }, [cardCounts]);

  // Detect intermediate and full category completions and celebrate
  useEffect(() => {
    // Celebrate at 3/6 (halfway milestone)
    if (completedCategories === 3 && !celebratedCategories.has(3)) {
      celebration.custom(
        `Halfway there! ⭐`,
        "ðŸƒâ€♂️",
        {
          subtitle: `3/6 categories explored! Keep up the momentum ðŸ’¨`,
          confetti: true,
          duration: 2500,
          type: "success",
        }
      );
      
      setCelebratedCategories(prev => new Set([...prev, 3]));
    }
    
    // At 6/6 (full completion, before quiz): show decision modal instead of auto-celebrating
    if (completedCategories === 6 && !celebratedCategories.has(6)) {
      // Show the "All 6 cards done! Start quiz / Later" decision modal
      setShowDecisionModal(true);
      
      // Mark as celebrated so we don't show this again
      setCelebratedCategories(prev => new Set([...prev, 6]));
    }
  }, [completedCategories, celebratedCategories, celebration, state.name]);

  // Track completion per category - all cards must be read
  const cards = [
    { icon: "ðŸ›️", title: "Capital", sub: state.capital, tone: "orange" as const },
    { icon: "ðŸ—£️", title: "Language", sub: state.language, tone: "blue" as const },
    { icon: "ðŸ›", title: "Famous Food", sub: state.food, tone: "gold" as const },
    { icon: state.monument, title: "Places", sub: state.monumentName, tone: "green" as const },
    { icon: state.animal, title: "State Animal", sub: state.animalName, tone: "orange" as const },
    { icon: "ðŸ’¡", title: "Fun Fact", sub: state.funFact, tone: "blue" as const },
  ].map((c, i) => {
    // Category is complete only if ALL cards in it are read
    const isCategoryComplete = cardCounts[i].total > 0 && 
      cardCounts[i].read === cardCounts[i].total;

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

  return (
    <div className="h-full w-full bg-surface-card flex flex-col">
      <div className={`px-5 pt-3 pb-4 ${grad} rounded-b-[32px] relative`}>
        {/* Breadcrumb Navigation Context */}
        <div className="mb-2 flex items-center gap-1 text-white text-xs font-bold px-12">
          <span className="opacity-75">Journey</span>
          <span className="opacity-50">â€º</span>
          {currentRegion && (
            <>
              <img
                src={STATE_ART[currentRegion.name]}
                alt={currentRegion.name}
                className="w-3 h-3 object-cover rounded inline-block"
                loading="lazy"
                decoding="async"
              />
              <span className="opacity-75">{currentRegion.name}</span>
              <span className="opacity-50">â€º</span>
            </>
          )}
          <img
            src={STATE_ART[state.name]}
            alt={state.name}
            className="w-3 h-3 object-cover rounded inline-block"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBack) {
                fxTap();
                onBack();
              } else {
                goBack();
              }
            }}
            className="h-12 w-12 rounded-full bg-white/25 flex items-center justify-center text-white text-xl"
          >
            â€¹
          </button>
          <div className="flex-1 text-white">
            <div className="text-xs font-bold text-white/90">
              Learning Hub
            </div>
            <div className="text-display text-xl font-extrabold">{state.name}</div>
            {progress.streak > 0 && (
              <div className="text-xs font-bold text-white/80 mt-0.5">
                ðŸ”¥ Day {progress.streak} streak
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-white text-display font-extrabold">
            <span>⭐</span> {completedCategories * XP_PER_CARD}
          </div>
        </div>

        {/* Journey Progress Bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${(completedCategories / 6) * 100}%` }}
            />
          </div>
          <div className="text-sm font-extrabold text-white whitespace-nowrap">{completedCategories} / 6</div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 flex-1 overflow-auto">
        {cards.map((c) => (
          <HubCard key={c.title} {...c} stateName={state.name} />
        ))}
      </div>
      <div className="p-4">
        {/* Quiz Button with Completion Guard */}
        <button
          onClick={() => {
            fxTap();
            // If modal was dismissed with "Later", this will trigger onQuiz when user is ready
            if (completedCategories === 6 && !showDecisionModal) {
              onQuiz?.();
            } else if (completedCategories === 6 && showDecisionModal) {
              // If modal is showing, the button should be disabled until user makes a choice
              return;
            } else {
              onQuiz?.();
            }
          }}
          disabled={completedCategories < 6 || showDecisionModal}
          className={`w-full h-14 ui-button text-h4 text-display font-extrabold transition-all active:scale-95 ${
            completedCategories === 6 && !showDecisionModal
              ? "ui-accent-3 text-ink hover:shadow-lg hover:scale-105 animate-pulse"
              : "ui-accent-1-soft text-ink opacity-40 cursor-not-allowed"
          }`}
        >
          {completedCategories === 6 && !showDecisionModal
            ? "✨ Take the Quiz! ðŸŽ¯" 
            : `ðŸ”’ Quiz Locked (${completedCategories}/6 done)`
          }
        </button>
      </div>
      
      {/* "All 6 cards done!" Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-action-primary rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 flex flex-col">
            {/* Header */}
            <div className="p-6 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <div className="text-ink text-xs font-black uppercase tracking-[0.3em] mb-2">
                All Done!
              </div>
              <h2 className="text-h2 text-ink font-extrabold">
                All 6 Cards Explored!
              </h2>
              <p className="text-ink font-bold mt-3 text-sm">
                Ready to test your knowledge?
              </p>
            </div>

            {/* Buttons */}
            <div className="p-6 space-y-3 flex flex-col">
              {/* Start Quiz button */}
              <button
                onClick={() => {
                  fxTap();
                  setShowDecisionModal(false);
                  onQuiz?.();
                }}
                className="w-full h-14 ui-button ui-accent-3 text-ink text-display font-extrabold active:scale-95 transition-all"
              >
                ✨ Start Quiz Now
              </button>

              {/* Later button - with pulsing indicator */}
              <button
                onClick={() => {
                  fxTap();
                  setShowDecisionModal(false);
                }}
                className="w-full h-14 ui-button ui-accent-1-soft text-ink text-display font-bold active:scale-95 transition-all"
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
  const bg = {
    orange: "bg-saffron-soft",
    blue: "bg-explorer-soft",
    green: "bg-success-soft",
    gold: "bg-gold-soft",
  }[tone];
  const ring = {
    orange: "border-saffron",
    blue: "border-explorer",
    green: "border-success",
    gold: "border-[color:var(--gold)]",
  }[tone];
  return (
    <button
      type="button"
      onClick={() => {
        if (locked || !canClick) return;
        fxTap();
        onOpen?.();
      }}
      className={`relative text-left ui-card ${locked ? "ui-accent-1-soft opacity-70 pointer-events-none cursor-not-allowed" : done ? "ui-accent-3" : "ui-accent-1-soft"} p-4 border-2 transition active:scale-[0.98] ${
        active ? ring : "border-transparent"
      }`}
    >
      <div className="text-h1">{icon}</div>
      <div className="text-h5 text-display mt-1 leading-tight">
        {title}
      </div>
      <div className="text-xs font-bold text-text-secondary">{sub}</div>
      {/* Category-scoped progress counter */}
      {categoryCardsTotal !== undefined && categoryCardsRead !== undefined && (
        <div className={`mt-2 text-xs font-bold ${
          done ? "text-success" : "text-text-secondary"
        }`}>
          {categoryCardsRead}/{categoryCardsTotal}{done && " âœ“"}
        </div>
      )}
      {done && (
        <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-success text-white flex items-center justify-center text-h5 font-black shadow-lg animate-bounce">
          âœ“
        </div>
      )}
      {locked && (
        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center text-xs">
          ðŸ”’
        </div>
      )}
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

export function learningCardsFor(stateName?: string, displayLanguage: string = "en", ageBand: string = "8-9"): EnhancedCard[] {
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
      icon: "ðŸ›️",
      chip: "Capital City",
      body: `${state.capital} is the capital city of ${state.name}. It is where the state's government works from.`,
      enrichedKey: "capital" as const,
    },
    {
      kicker: "Language",
      title: state.language,
      icon: "ðŸ—£️",
      chip: "Language",
      body: `People in ${state.name} mostly speak ${state.language}. Try saying hello in it!`,
      enrichedKey: "language" as const,
    },
    {
      kicker: "Famous Food",
      title: state.food,
      icon: "ðŸ›",
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
      icon: "ðŸ’¡",
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
    let cardContent = enrichedCard ? getCardContentByAge(state.name, def.enrichedKey, displayLanguage, ageBand) : null;
    
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
      gradient: "gradient-sky",
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
            icon: "⭐",
            chip: "Cool Fact",
            body: getText(fact),
            type: "coolFact",
            gradient: "gradient-amber",
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
          icon: "ðŸ¤”",
          chip: "Did You Know?",
          body: getText(cardContent.didYouKnow),
          type: "didYouKnow",
          gradient: "gradient-purple",
          chipTone: "purple",
          mainCardIndex: mainIndex,
        });
      }

      // Add Try This Activity
      if (cardContent.tryThis) {
        allCards.push({
          kicker: "Activity",
          title: "Try This Activity",
          icon: "ðŸŽ®",
          chip: "Try This Activity",
          body: getText(cardContent.tryThis),
          type: "tryThis",
          gradient: "gradient-green",
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
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";
  const celebration = useCelebration();
  const level = levelInfo(progress.xp);
  
  // Learning Card Screen - State and Navigation
  // mainCardIndex tracks which category (0-5)
  // cardIndexInCategory tracks position within category (0-4 or more)
  const [displayLanguage, setDisplayLanguage] = useState<LanguageCode>(() => {
    // Start with English, will validate based on available languages
    const available = getAvailableLanguages(state.name);
    return (available.includes("en") ? "en" : available[0] ?? "en") as LanguageCode;
  });
  const [mainCardIndex, setMainCardIndex] = useState(cardIndex ?? 0); // Which category (0-5)
  const [cardIndexInCategory, setCardIndexInCategory] = useState(0); // Position within category (0-4 usually)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);
  const [showAudioPermissionPrompt, setShowAudioPermissionPrompt] = useState(false);
  
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
    return cards.filter(c => c && c.mainCardIndex === mainCardIndex);
  }, [cards, mainCardIndex]);
  
  // Get current card object with validation
  const currentCard = useMemo(() => {
    if (!Array.isArray(cardsInCurrentCategory) || cardIndexInCategory >= cardsInCurrentCategory.length) {
      return undefined;
    }
    return cardsInCurrentCategory[cardIndexInCategory];
  }, [cardsInCurrentCategory, cardIndexInCategory]);
  
  // Get global index for progress tracking with validation
  const currentCardIndex = useMemo(() => {
    if (!currentCard || !Array.isArray(cards)) return -1;
    return cards.findIndex(c => c && c.mainCardIndex === currentCard.mainCardIndex && c.kicker === currentCard.kicker && c.title === currentCard.title);
  }, [currentCard, cards]);
  
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
        console.log(`[LearningCardScreen] Marking card visit: state="${state.name}", kicker="${currentCard.kicker}", type="${currentCard.type}", mainCategory="${mainCategoryKey}", cardIndexInCategory=${cardIndexInCategory}`);
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
  const isReplaying = currentCardIndex >= 0 && currentCard ? isCardReplaying(progress, state.name, currentCardIndex) : false;
  const replayCount = currentCardIndex >= 0 ? getReplayCount(progress, state.name, currentCardIndex) : 0;

  // Safety check: ensure card exists and currentCardIndex is valid
  if (!card || currentCardIndex < 0 || !Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-info-soft">
        <div className="text-center">
          <div className="text-5xl mb-3">âš ️</div>
          <h1 className="text-h4 text-ink mb-2">Card content unavailable</h1>
          <p className="text-sm text-text-secondary mb-4">Please try again or go back</p>
          <button
            onClick={() => window.history.back()}
            className="ui-button ui-accent-2 text-ink px-4 py-2 font-bold"
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
  while (mainCardSectionEnd < cards.length - 1 && cards[mainCardSectionEnd + 1]?.mainCardIndex === currentMainCardIndex) {
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
      // Moving to next card in same category - show immediate celebration
      const currentCard = cardsInCurrentCategory[cardIndexInCategory];
      const isReplaying = progress.cards?.[state.name]?.includes(currentCardIndex) ?? false;
      
      // Mark current card as learned BEFORE showing celebration
      markCard(state.name, currentCardIndex, isReplaying);
      
      // Show immediate celebration only on first read (not replay)
      if (!isReplaying) {
        fxCorrect();
        
        // Trigger floating XP animation
        const feedbackId = `xp-${Date.now()}-${Math.random()}`;
        
        // DISABLED FOR NOW - PHASE 2: Card learning celebration
        // celebration.custom(
        //   `${currentCard.kicker} card learned!`,
        //   "ðŸ“š",
        //   {
        //     subtitle: `+${XP_PER_CARD} XP earned â€¢ ${cardIndexInCategory + 1}/${cardsInCurrentCategory.length} cards in ${currentCard.kicker}`,
        //     confetti: true,
        //     duration: 2000,
        //     type: "success",
        //   }
        // );
        
        // Auto-advance to next card immediately (celebration disabled in PHASE 2)
        setCardIndexInCategory(cardIndexInCategory + 1);
      } else {
        // Replay: advance immediately without celebration
        fxTap();
        setCardIndexInCategory(cardIndexInCategory + 1);
      }
    } else {
      // Last card in this category - mark and move to next category or exit
      const currentCard = cardsInCurrentCategory[cardIndexInCategory];
      const isReplaying = progress.cards?.[state.name]?.includes(currentCardIndex) ?? false;
      
      // Mark final card as learned
      markCard(state.name, currentCardIndex, isReplaying);
      
      // Show category completion celebration
      if (!isReplaying) {
        fxCorrect();
        // DISABLED FOR NOW - PHASE 2: Card learning celebration
        // celebration.custom(
        //   `${currentCard.kicker} card learned!`,
        //   "ðŸ“š",
        //   {
        //     subtitle: `+${XP_PER_CARD} XP earned â€¢ ${currentCard.kicker} category complete! ðŸŽ“`,
        //     confetti: true,
        //     duration: 2000,
        //     type: "success",
        //   }
        // );
        
        // Auto-advance to next category immediately (celebration disabled in PHASE 2)
        onNext?.(null);
      } else {
        // Replay: advance immediately
        fxTap();
        onNext?.(null);
      }
    }
  };

  const handleMainCardDone = () => {
    fxTap();
    
    // Get the main card index and calculate completedCards for this main card
    const mainCardIdx = currentMainCardIndex;
    const mainCardSectionCards = cards.filter(c => c.mainCardIndex === mainCardIdx);
    const allCardsInMainCardRead = mainCardSectionCards.every(c => 
      progress.cards?.[state.name]?.includes(cards.indexOf(c)) ?? false
    );
    
    // Mark the main card as learned
    const wasFirstRead = !allCardsInMainCardRead;
    
    // Show immediate celebration when completing main card
    if (wasFirstRead) {
      fxCorrect(); // Rising chime sound
      
      const mainCardNames = ["Capital", "Language", "Famous Food", "Places", "State Animal", "Fun Fact"];
      const categoryName = mainCardNames[mainCardIdx] ?? `Category ${mainCardIdx + 1}`;
      
      // FIX: Only main card gives XP (25 XP), not all sub-cards in the category
      // Previously showed: +75 XP for 3 sub-cards, but only 25 was awarded
      celebration.custom(
        `${categoryName} mastered!`,
        "⭐",
        {
          subtitle: `+${XP_PER_CARD} XP earned â€¢ ${mainCardIdx + 1}/6 categories mastered`,
          confetti: true,
          duration: 2500,
          type: "success",
          showCloseButton: true,
        }
      );
    }
    
    markCard(state.name, currentMainCardIndex, !wasFirstRead);
    
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
          âœ•
        </button>

        {/* Card counter and progress bar */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="text-display font-extrabold text-saffron whitespace-nowrap">
            {cardIndexInCategory + 1}/{cardsInCurrentCategory.length}
          </div>
          <div className="h-2 rounded-full bg-surface-card overflow-hidden shadow-inner flex-1">
            <div
              className={`h-full ${grad} transition-all`}
              style={{ width: `${((cardIndexInCategory + 1) / cardsInCurrentCategory.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Language Toggle - Left aligned pill style */}
        {getAvailableLanguages(state.name).length > 1 && (
          <div className="flex items-center gap-2 bg-surface-raised backdrop-blur-sm rounded-full p-1.5 border border-surface-raised/50">
            {getAvailableLanguages(state.name).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  fxTap();
                  setDisplayLanguage(lang);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                  displayLanguage === lang
                    ? "ui-button ui-accent-2 text-ink shadow-md"
                    : "bg-surface-card text-ink"
                }`}
              >
                {LANGUAGE_NAMES[lang]}
              </button>
            ))}
          </div>
        )}

        {/* Listen Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            
            // Check if audio is enabled
            if (!hasFeatureConsent('audio')) {
              setShowAudioPermissionPrompt(true);
              fxTap();
              return;
            }
            
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
              playStateNarration(`card-${state.name}-${currentCardIndex}`, state.name, textToRead, {
                speed: 0.85,
                pitch: 1.05,
              }, displayLanguage);
              setPlayingCardIndex(currentCardIndex);
            }
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
          className={`h-9 px-3 rounded-full shadow-soft flex items-center justify-center gap-2 text-label transition-all active:scale-95 whitespace-nowrap ${
            playingCardIndex === currentCardIndex
              ? "bg-action-primary text-white shadow-lg animate-pulse"
              : hasFeatureConsent('audio')
                ? "bg-accent-1-soft text-accent-1 hover:shadow-md border border-accent-1"
                : "bg-muted text-muted-light border border-muted cursor-not-allowed"
          }`}
          title={hasFeatureConsent('audio') ? "Play card content" : "Enable audio in settings to listen"}
        >
          {playingCardIndex === currentCardIndex ? "⏸" : "ðŸ”Š"} Listen
        </button>
      </div>

      <div className="px-5 mt-3">
        <div className="text-xs font-black uppercase tracking-wider text-saffron">
          {state.name} · {card.kicker}
        </div>
        <h2 className="text-display text-2xl font-extrabold leading-tight mt-1">
          {card.title}
        </h2>
      </div>

      <div 
        className="mx-5 mt-4 ui-card ui-accent-1-soft p-4 flex-1 flex flex-col relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >

        {/* Replay indicator - shown when user is replaying a card */}
        {isReplaying && (
          <div className="mb-3 p-3 bg-accent-2-soft rounded-xl flex items-center gap-2 shadow-sm border border-accent-2">
            <span className="text-lg">ðŸ“–</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-accent-5">Replaying this card</p>
              <p className="text-xs text-accent-5 font-medium">
                You've mastered this! Keep practicing ✨
              </p>
            </div>
            <span className="text-2xl">✨</span>
          </div>
        )}
        
        <div className={`flex-1 rounded-2xl flex items-center justify-center overflow-hidden bg-surface-card ${!art || card.type !== "main" || card.kicker !== "Places" ? "py-8" : ""}`}>
          {art && card.type === "main" && card.kicker === "Places" ? (
            <img src={art} alt={`${state.name} learning card`} loading="lazy" decoding="async" className="h-full object-contain drop-shadow-xl" />
          ) : (
            <div className="text-[72px] drop-shadow-xl">{card.icon}</div>
          )}
        </div>
        <div className="mt-3 bg-surface-raised rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Chip icon={card.icon} tone={card.chipTone === "purple" ? "blue" : card.chipTone as any}>
              {card.chip}
            </Chip>
            <Chip icon="ðŸ“" tone="blue">
              {state.name}
            </Chip>
          </div>
          <p className="mt-2 font-semibold text-ink/85 text-[15px] leading-snug">
            {card.body}
          </p>
        </div>

        {/* Swipe hint for non-last cards */}
        {!isLast && !isLastInMainCardSection && (
          <div className="mt-3 text-center text-xs font-semibold text-ink/50">
            â† Swipe or tap Next â†’
          </div>
        )}

        {/* Mastery badge for replayed cards */}
        {isReplaying && replayCount > 0 && (
          <div className="mt-3 px-3 py-2 bg-accent-2-soft rounded-lg text-center border border-accent-2">
            <p className="text-xs font-bold text-warning">⭐ Mastered! Replayed {replayCount}x</p>
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
          className="w-full h-14 ui-button ui-accent-1 text-ink text-h4 text-display"
        >
          {isLastInMainCardSection ? (currentMainCardIndex === 5 ? "Take the Quiz! ðŸŽ¯" : "Done! Back to Cards") : isReplaying ? "Replay Complete ✨" : "Got it! Next â†’"}
        </button>
      </div>

      {/* Audio Permission Prompt */}
      {showAudioPermissionPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface-card rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="text-center">
              <div className="text-5xl mb-3">ðŸŽ§</div>
              <h3 className="text-display text-xl font-extrabold text-ink">Enable Audio?</h3>
              <p className="text-sm text-text-secondary mt-2">
                Turn on audio to hear the stories read aloud! ðŸŽµ
              </p>
            </div>

            <div className="bg-info-soft rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <span>ðŸŽ§</span>
                <span className="font-semibold text-info">Stories read aloud</span>
              </div>
              <div className="flex gap-2">
                <span>🌍</span>
                <span className="font-semibold text-info">Available in multiple languages</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  fxTap();
                  setShowAudioPermissionPrompt(false);
                }}
                className="flex-1 h-12 rounded-xl bg-surface-sunken text-text-primary font-bold text-sm"
              >
                Maybe Later
              </button>
              <Link
                to="/me"
                onClick={() => {
                  fxTap();
                  setShowAudioPermissionPrompt(false);
                }}
                className="flex-1 h-12 rounded-xl bg-accent-1 text-white font-bold text-sm flex items-center justify-center"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export function QuizScreen({
  stateName,
  onDone,
  onClose,
}: { 
  stateName?: string
  onDone?: (quizMetrics?: { timeToComplete: number; quizAttempts: number; quizScore: number; correctCount?: number }) => void
  onClose?: () => void
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
  stateName?: string
  onDone?: (quizMetrics?: { timeToComplete: number; quizAttempts: number; quizScore: number; correctCount?: number }) => void
  onClose?: () => void
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
    })
  }, [activeName, progress.ageBand, questions.length])
  
  const [index, setIndex] = useState(0);
  const question = questions[Math.min(index, questions.length - 1)];

  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [burst, setBurst] = useState(0);
  const [navigationStarted, setNavigationStarted] = useState(false); // Prevent double navigation
  const [quizStartTime] = useState(Date.now());
  // Track answers: array of { id, correct } for accurate score calculation
  const [answeredQuestions, setAnsweredQuestions] = useState<Array<{ id: string; correct: boolean }>>([]);

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
      })
    } else {
      fxWrong();
      setResult("wrong");
      
      // Track wrong answer
      firebaseEvents.quizAnswer({
        stateName: activeName,
        questionId: question.id,
        isCorrect: false,
      })
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
      const totalCorrect = newAnsweredQuestions.filter(a => a.correct).length;
      const scorePercentage = (totalCorrect / questions.length) * 100;
      
      const quizDuration = Date.now() - quizStartTime;
      
      // Track quiz completion with accurate metrics
      firebaseEvents.quizComplete({
        stateName: activeName,
        questionsAnswered: questions.length,
        correctAnswers: totalCorrect,
        scorePercentage,
        timeSpentSeconds: quizDuration / 1000,
      })
      
      // Check if this is a replay (state already completed)
      const isReplay = progress.completed.includes(activeName);
      
      // Pass quiz metrics to completion screen for badge tracking
      const quizMetrics = {
        timeToComplete: quizDuration,
        quizAttempts: isReplay ? 2 : 1,  // Track real attempt number
        quizScore: scorePercentage,
        correctCount: totalCorrect,  // NEW: pass correct answer count for star calculation
      };
      
      // ATOMIC: Call finishQuiz to complete state, award XP/stars, and queue celebration
      // This happens before navigation to ensure state is consistent
      finishQuiz(activeName, quizMetrics);
      
      // Use setTimeout to ensure state is settled before navigation
      setTimeout(() => {
        onDone?.(quizMetrics);
      }, 50);
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
          className="h-12 w-12 rounded-full ui-button ui-accent-1-soft text-ink flex items-center justify-center text-xl flex-shrink-0"
        >
          â†
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
          Total: {answeredQuestions.filter(a => a.correct).length * 20} XP
        </div>
        <div className="font-bold text-success">
          +20 per answer
        </div>
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
            ? "Nailed it! 🎉"
            : result === "wrong"
            ? "Good try! Let's move on! ðŸ‘‰"
            : "You've got this! ðŸ’ª"}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-3 h-3 rotate-45 ui-card ui-accent-1-soft" />
        </div>
        {result === "correct" && (
          <div className="ml-auto flex items-center gap-1 ui-card ui-accent-3 px-3 py-1">
            <span>⭐</span>
            <span className="text-display font-extrabold text-sm text-ink">+20 XP</span>
          </div>
        )}
      </div>

      <div className="px-5 mt-4">
        <div className="text-[11px] font-black uppercase tracking-widest text-explorer">
          {question.kicker}
        </div>
        <h2 className="text-display text-2xl font-bold leading-tight mt-1">
          {question.prompt}
        </h2>
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
                  ? "ui-button ui-accent-3 text-ink"
                  : isWrongPick
                  ? "ui-button ui-accent-1-soft text-ink opacity-60"
                  : isSelected
                  ? "ui-button ui-accent-2 text-ink"
                  : "ui-button ui-accent-1-soft text-ink"
              }`}
            >
              {label}
              <span
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                  isCorrectPick
                    ? "bg-fb-success-bg text-white"
                    : isWrongPick
                    ? "bg-fb-error-bg text-white"
                    : isSelected
                    ? "gradient-explorer text-white"
                    : "bg-muted text-text-secondary"
                }`}
              >
                {isCorrectPick ? "âœ“" : isWrongPick ? "âœ•" : isSelected ? "âœ“" : ""}
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
              ? "ui-button ui-accent-3 text-ink"
              : result === "wrong"
              ? "ui-button ui-accent-2 text-ink"
              : "ui-button ui-accent-1 text-ink"
          }`}
        >
          {result === "correct"
            ? isLastQuestion
              ? "Finish Quiz 🎉"
              : "Next Question â†’"
            : result === "wrong"
            ? isLastQuestion
              ? "Finish Quiz 🎉"
              : "Next Question â†’"
            : "Check Answer"}
        </button>
      </div>
    </div>
  );
}

export function CorrectAnswerScreen({ stateName, onDismiss }: { stateName?: string; onDismiss?: () => void } = {}) {
  const state = getState(stateName);
  useEffect(() => { fxCorrect(); }, []);
  return (
    <div className="h-full w-full gradient-success relative overflow-hidden flex flex-col">
      {/* Premium Close Button - Top Right */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 ui-button ui-accent-1-soft text-ink w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-200 z-10"
        aria-label="Close"
      >
        âœ•
      </button>

      {/* confetti dots */}
      {Array.from({ length: 22 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 80}%`,
            background: ["#FFD84D", "#FF7A1A", "#fff", "#2E7DFF"][i % 4],
            transform: `rotate(${i * 20}deg)`,
            opacity: 0.9,
          }}
        />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-white/40 rounded-full" />
          <div className="relative h-32 w-32 rounded-full ui-card ui-accent-3 flex items-center justify-center shadow-2xl">
            <div className="text-6xl">âœ…</div>
          </div>
        </div>
        <h1 className="mt-6 text-h1 text-white text-center leading-relaxed">
          Awesome!
        </h1>
        <p className="mt-2 text-white/95 font-bold text-center">
          You got it right â€” {state.capital} is the capital of {state.name}!
        </p>

        <div className="mt-6 ui-card ui-accent-4 px-5 py-3 flex items-center gap-3">
          <span className="text-3xl">⭐</span>
          <div>
            <div className="text-xs font-bold opacity-90 text-ink">You earned</div>
            <div className="text-display text-2xl font-extrabold leading-snug text-ink">
              +20 XP
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 relative">
        <button className="w-full h-14 ui-button ui-accent-1 text-ink text-display text-lg font-extrabold animate-pulse active:scale-95 transition-transform">
          Next Question â†’
        </button>
      </div>
    </div>
  );
}


export function StateUnlockScreen({
  stateName,
  onContinue,
}: { stateName?: string; onContinue?: () => void } = {}) {
  const state = stateName ? getState(stateName) : (INDIA_STATES && INDIA_STATES.length > 1 ? INDIA_STATES[1] : INDIA_STATES[0] || { name: "India", emoji: "ðŸ‡®ðŸ‡³", nickname: "Incredible India" });
  const art = STATE_ART[state.name];

  // PHASE 1b: Play sound effect when state unlocks
  useEffect(() => {
    // Play celebratory sound on mount
    fxCorrect();
  }, []);
  return (
    <div className="h-full w-full gradient-explorer relative overflow-hidden flex flex-col">
      {/* Premium Close Button - Top Right */}
      <button
        onClick={() => {
          fxTap();
          onContinue?.();
        }}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center text-lg transition-all duration-200 z-10"
        aria-label="Close"
      >
        âœ•
      </button>

      <Cloud className="absolute top-10 left-2 w-28 opacity-90" />
      <Cloud className="absolute top-20 right-0 w-24 opacity-85" />
      <Cloud className="absolute bottom-56 left-0 w-32 opacity-80" />

      <div className="text-center pt-8 relative z-10 px-6">
        <div className="text-white/90 text-xs font-black uppercase tracking-[0.3em]">
          New State Unlocked
        </div>
        <h1 className="text-h1 text-white mt-1 drop-shadow leading-relaxed">
          {state.name}!
        </h1>
        <p className="text-white/90 font-bold mt-1">{state.nickname}</p>
      </div>

      <div className="relative flex-1 flex items-center justify-center">
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-72 rounded-[40px] bg-white/10 backdrop-blur border border-white/20" />
        <div className="absolute inset-x-16 bottom-24 h-8 rounded-full bg-black/20 blur-xl" />
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
          className="w-full h-14 ui-button ui-accent-1 text-ink text-display text-lg font-extrabold"
        >
          Continue Adventure âœˆ️
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
  const color = {
    orange: "#FF7A1A",
    blue: "#2E7DFF",
    green: "#22C55E",
    gold: "#F5B301",
  }[tone];
  if (!filled) {
    return (
      <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-text-secondary">
        <div className="text-3xl opacity-40">ðŸ”’</div>
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
          appLogger.info('passport_stamp', 'Viewing achievement: ' + stateName);
          onSelect(stateName);
        }
      }}
      className="relative aspect-square rounded-2xl bg-accent-2-soft flex flex-col items-center justify-center active:scale-95 transition-transform cursor-pointer"
      style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}
    >
      <div
        className="h-20 w-20 rounded-full border-[3px] flex flex-col items-center justify-center"
        style={{ borderColor: color, color }}
      >
        <div className="text-[9px] font-black tracking-widest opacity-80">
          VISITED
        </div>
        <div className="text-display font-extrabold text-[11px] leading-tight text-center px-1">
          {name}
        </div>
        <div className="text-[8px] font-bold opacity-80">{date}</div>
      </div>
      <div
        className="absolute -top-1 -right-1 text-xs font-bold rotate-12 px-1.5 py-0.5 rounded"
        style={{ background: color, color: "white" }}
      >
        âœ“
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
      className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl p-6 flex flex-col gap-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-text-secondary hover:bg-muted"
        >
          âœ•
        </button>

        {/* Badge Display */}
        <div className="flex flex-col items-center pt-2">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center text-5xl mb-4 ${
              badge.done
                ? "gradient-saffron shadow-lg"
                : "bg-surface-sunken opacity-60"
            }`}
          >
            {badge.done ? badge.icon : "ðŸ”’"}
          </div>

          <h2 className="text-display text-2xl font-extrabold text-ink">
            {badge.name}
          </h2>
          <p className="text-sm text-text-secondary mt-1">{state}</p>
        </div>

        {/* Unlock Information */}
        {!badge.done && (
          <div className="rounded-2xl bg-warning-soft border-2 border-warning p-4">
            <p className="text-h5 text-warning mb-2">
              How to Unlock
            </p>
            <p className="text-body text-warning-light">{unlockText}</p>
          </div>
        )}

        {/* Badge Info */}
        <div className="rounded-2xl bg-info-soft border border-info p-4">
          <p className="text-h5 text-info mb-1">
            Badge Type
          </p>
          <p className="text-body text-accent-1">
            {badge.name === "Monument" && "ðŸ›️ Learn about famous landmarks"}
            {badge.name === "Animal" && "ðŸ¦ Discover local wildlife"}
            {badge.name === "Explorer" && "🎖️ Master all cards in this state"}
          </p>
        </div>

        {/* Status */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl bg-muted text-display font-extrabold text-text-secondary hover:bg-muted transition"
          >
            Close
          </button>
          {badge.done && (
            <button
              onClick={() => {
                fxConfetti();
                onClose();
              }}
              className="flex-1 h-12 rounded-2xl bg-success text-display font-extrabold text-white shadow-lg hover:shadow-xl transition"
            >
              🎉 Celebrate!
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
        celebration.custom(
          notification.title,
          notification.emoji,
          {
            subtitle: notification.subtitle,
            confetti: true,
            duration: 3000,
            type: "success",
          }
        );
        
        // Mark badge as seen so we don't show notification again
        markBadgeAsSeen(badge.id);
      }, idx * 1500); // Stagger multiple badge notifications by 1.5s
    });
  }, [progress, celebration]);

  const allBadges = achievementBadgesFor(progress);
  const unlockedCount = allBadges.filter((b) => b.unlocked).length;

  // Helper to generate progress stars (e.g. ⭐⭐â˜†)
  const getProgressStars = (progress: number, max: number): string => {
    const filledCount = Math.min(Math.ceil((progress / max) * 3), 3);
    const stars = "⭐".repeat(filledCount) + "â˜†".repeat(3 - filledCount);
    return stars;
  };

  return (
    <div className="h-full w-full bg-surface-card flex flex-col">
      {/* Tab Switcher - Before Header */}
      <div className="px-5 pt-4 pb-0 flex gap-2 border-b border-muted bg-white z-10">
        <button
          onClick={() => {
            fxTap();
            setActiveTab("achievements");
          }}
          className={`px-4 py-3 rounded-t-lg font-bold text-sm transition ${
            activeTab === "achievements"
              ? "bg-transparent border-b-2 border-orange text-orange"
              : "text-text-secondary hover:text-muted-dark"
          }`}
        >
          ðŸ† Achievement Badges
        </button>
        <button
          onClick={() => {
            fxTap();
            setActiveTab("states");
          }}
          className={`px-4 py-3 rounded-t-lg font-bold text-sm transition ${
            activeTab === "states"
              ? "bg-transparent border-b-2 border-orange text-orange"
              : "text-text-secondary hover:text-muted-dark"
          }`}
        >
          🎖️ State Badges
        </button>
      </div>

      {/* Achievement Badges View */}
      {activeTab === "achievements" && (
        <>
          {/* Header with Avatar + Celebration Tone */}
          <div className="px-5 pt-3 pb-4 gradient-gold rounded-b-[32px] relative overflow-hidden animate-fade-in">
            <Cloud className="absolute top-2 right-4 w-14 opacity-40 pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-14 w-14 rounded-2xl ui-card ui-accent-1-soft p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={getAvatarImage(progress.avatar)} alt={getAvatarName(progress.avatar)} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-white">
                <div className="text-h4 text-display leading-tight">
                  {progress.name}
                </div>
                <div className="text-xs font-bold text-white/80">
                  🎉 {unlockedCount} Amazing Badges Collected!
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
                    badge.unlocked
                      ? "ui-accent-4 shadow-md"
                      : "ui-accent-1-soft opacity-60"
                  }`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Badge Emoji - Large and Prominent */}
                  <div className={`text-6xl ${badge.unlocked ? "" : "opacity-50"}`}>
                    {badge.icon}
                  </div>

                  {/* Badge Name - Bold Uppercase */}
                  <div className={`text-sm font-extrabold uppercase leading-tight tracking-wide ${
                    badge.unlocked ? "text-ink" : "text-text-secondary"
                  }`}>
                    {badge.name}
                  </div>

                  {/* Badge Description - Simple 1-2 lines */}
                  <div className={`text-xs leading-snug ${
                    badge.unlocked ? "text-ink/80" : "text-text-secondary"
                  }`}>
                    {badge.description}
                  </div>

                  {/* Status - Kid Friendly */}
                  <div className="mt-1 pt-3 border-t border-white/20 w-full">
                    {badge.unlocked ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-lg font-extrabold">âœ“ You Did It!</div>
                        <div className="text-[11px] font-bold text-ink/70">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="text-xl">{getProgressStars(badge.progress, badge.achievementMax)}</div>
                        <div className="text-[11px] font-bold text-text-secondary">
                          Keep going! ⭐
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
      {activeTab === "states" && (
        <StatePerformanceBadgesView />
      )}
    </div>
  );
}

export function ProfileScreen() {
  const p = useProgress();
  
  // Route guard: redirect to welcome if not onboarded (defensive check)
  if (!p.onboarded) {
    appLogger.warn('profile_screen', 'User attempted to access profile without onboarding', {});
    return <Navigate to="/welcome" replace />;
  }
  
  return <ProfileScreenContent />;
}

function ThemePickerNavButton() {
  const navigate = useNavigate();
  const handleClick = () => {
    fxTap();
    navigate({ to: '/themes' });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
    >
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-1 via-accent-2 to-accent-5 flex items-center justify-center text-2xl">
        🎨
      </div>
      <div className="flex-1 text-left">
        <div className="text-display font-extrabold text-[15px] leading-tight">
          My Style 🎨
        </div>
        <div className="text-[11px] font-bold text-text-secondary">
          Tap to change theme
        </div>
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
  const [showResetPINDialog, setShowResetPINDialog] = useState(false);
  const [hasFileConsent, setHasFileConsent] = useState(() => {
    if (typeof window === "undefined") return false;
    return hasFeatureConsent('file');
  });
  const [hasAudioConsent, setHasAudioConsent] = useState(() => {
    if (typeof window === "undefined") return false;
    return hasFeatureConsent('audio');
  });
  
  // Subscribe to file consent changes
  useEffect(() => {
    const unsubscribe = subscribeConsentChanges('file', () => {
      setHasFileConsent(hasFeatureConsent('file'));
    });
    return unsubscribe;
  }, []);

  // Subscribe to audio consent changes
  useEffect(() => {
    const unsubscribe = subscribeConsentChanges('audio', () => {
      setHasAudioConsent(hasFeatureConsent('audio'));
    });
    return unsubscribe;
  }, []);
  
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

  const handleSaveName = () => {
    const trimmedName = tempName.trim();
    if (!trimmedName || trimmedName.length === 0) {
      setTempName(p.name); // Reset to original
      setIsEditing(false);
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
      <div className="relative gradient-explorer px-5 pt-4 pb-14 rounded-b-[36px] animate-fade-in">
        <Cloud className="absolute top-2 right-2 w-16 opacity-40" />
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center"
          >
            â€¹
          </button>
          <div className="text-display font-extrabold text-white">Profile</div>
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
            <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full gradient-gold text-white flex items-center justify-center text-display text-h5 border-4 border-white">
              {level}
            </div>
          </div>
          
          {/* Name Section - Edit Mode or Display Mode */}
          {isEditing ? (
            <div className="mt-4 w-full max-w-xs flex flex-col gap-2">
              <input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value.slice(0, 20))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                placeholder="Enter name"
                maxLength={20}
                className="h-12 rounded-xl bg-surface-card text-center text-display text-lg font-extrabold text-text-primary outline-none border-2 border-border-color"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  disabled={saveStatus === "saving"}
                  className={`flex-1 h-10 rounded-lg text-display font-extrabold text-white text-sm transition ${
                    saveStatus === "saved"
                      ? "bg-success"
                      : saveStatus === "saving"
                        ? "bg-white/50"
                        : "bg-white/80 hover:bg-white"
                  }`}
                >
                  {saveStatus === "saved" ? "âœ“ Saved" : saveStatus === "saving" ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 h-10 rounded-lg text-display font-extrabold text-white text-sm bg-white/30 hover:bg-white/40 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-col items-center gap-1 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2">
                <div className="text-display text-2xl font-extrabold text-white">
                  {p.name}
                </div>
                <button
                  onClick={() => {
                    fxTap();
                    setTempName(p.name);
                    setIsEditing(true);
                  }}
                  className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm transition"
                  title="Edit name"
                >
                  âœ️
                </button>
              </div>
              <div className="text-white/90 text-xs font-extrabold uppercase tracking-widest">
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
            <div className="h-12 w-12 rounded-2xl gradient-saffron flex items-center justify-center text-2xl">
              ðŸŽ­
            </div>
            <div className="flex-1 text-left">
              <div className="text-display font-extrabold text-[15px] leading-tight">
                Change Avatar
              </div>
              <div className="text-[11px] font-bold text-text-secondary">
                {getAvatarName(p.avatar)} · Tap to select
              </div>
            </div>
            <div className="text-text-secondary text-xl">{isSelectingAvatar ? 'âœ•' : 'â€º'}</div>
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

        {/* âš™️ Settings Section Header */}
        <div className="animate-fade-in pt-2" style={{ animationDelay: "195ms" }}>
          <h3 className="text-sm font-extrabold text-text-secondary uppercase tracking-wider px-1 mb-2">
            âš™️ Settings
          </h3>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <SoundToggleRow />
        </div>

        {/* File Permission Card - Simple Toggle */}
        <div className="animate-fade-in" style={{ animationDelay: "210ms" }}>
          <button
            type="button"
            role="switch"
            aria-checked={hasFileConsent}
            aria-label="Save pictures permission"
            onClick={() => {
              if (hasFileConsent) {
                // Revoke consent
                revokeFeatureConsent('file');
                fxTap();
              } else {
                // Grant consent directly (no dialog)
                grantFeatureConsent('file');
                fxTap();
              }
            }}
            className="w-full ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
          >
            <div className="h-12 w-12 rounded-2xl bg-accent-5 flex items-center justify-center text-2xl">
              ðŸ“¸
            </div>
            <div className="flex-1 text-left">
              <div className="text-display font-extrabold text-[15px] leading-tight">Save Pictures</div>
              <div className="text-[11px] font-bold">
                {hasFileConsent ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success border border-success">
                    Active âœ“
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-sunken text-text-secondary border border-surface-sunken">
                    Tap to enable
                  </span>
                )}
              </div>
            </div>
            <span className={`h-7 w-12 rounded-full flex items-center px-1 transition ${hasFileConsent ? "gradient-success" : "bg-muted"}`}>
              <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${hasFileConsent ? "translate-x-5" : "translate-x-0"}`} />
            </span>
          </button>
        </div>
        {/* Daily Goals Section */}
        <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
          {(() => {
            const dailyGoalText = p.completed.length === 0 
              ? "Complete your first state" 
              : "Explore a new state today";
            const nextMilestone = Math.ceil((p.streak + 1) / 5) * 5;
            const daysUntilNext = nextMilestone - p.streak;

            return (
              <div className="ui-card ui-accent-1-soft p-3 flex flex-col gap-2 transition">
                {/* Header Row */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl gradient-success flex items-center justify-center text-2xl">
                    ðŸŽ¯
                  </div>
                  <div className="flex-1">
                    <div className="text-display font-extrabold text-[15px] leading-tight">
                      Daily Goals
                    </div>
                    <div className="text-[11px] font-bold text-text-secondary">
                      ðŸ”¥ {p.streak} day streak
                    </div>
                  </div>
                </div>

                {/* Daily Challenge */}
                <div className="ml-15 text-[13px] font-extrabold text-ink">
                  ðŸ“ {dailyGoalText}
                </div>

                {/* Next Reward */}
                <div className="ml-15 text-[11px] font-bold text-warning">
                  {daysUntilNext === 0 
                    ? "ðŸŽ Claim your milestone reward!" 
                    : `ðŸŽ ${daysUntilNext} day${daysUntilNext !== 1 ? 's' : ''} until ${nextMilestone}-day bonus!`}
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
            <div className="h-12 w-12 rounded-2xl gradient-explorer flex items-center justify-center text-2xl">
              ðŸ”’
            </div>
            <div className="flex-1">
              <div className="text-display font-extrabold text-[15px] leading-tight">
                Privacy Policy
              </div>
              <div className="text-[11px] font-bold text-text-secondary">How we handle your data</div>
            </div>
            <div className="text-text-secondary text-xl">â€º</div>
          </Link>
        </div>
      </div>

      {/* Reset PIN Dialog - requires parental PIN to reset progress */}
      <ResetPINDialog
        open={showResetPINDialog}
        onConfirm={() => {
          setShowResetPINDialog(false);
          resetProgress();
        }}
        onCancel={() => {
          setShowResetPINDialog(false);
        }}
      />
    </div>
  );
}

function SoundToggleRow() {
  const soundOn = useSoundOn();
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return hasFeatureConsent('audio');
  });

  // Subscribe to consent changes
  useEffect(() => {
    const unsubscribe = subscribeConsentChanges('audio', () => {
      setAudioEnabled(hasFeatureConsent('audio'));
    });
    return unsubscribe;
  }, []);

  const toggleSound = () => {
    setSoundOn(!soundOn);
    // Play tap sound only if sound is being enabled
    if (!soundOn) {
      setTimeout(() => fxTap(), 100);
    }
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    if (newState) {
      grantFeatureConsent('audio');
      setAudioEnabled(true);
      setTimeout(() => fxTap(), 100);
    } else {
      revokeFeatureConsent('audio');
      setAudioEnabled(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Sound Effects Toggle - Controls volume/output, not initialization */}
      <button
        type="button"
        role="switch"
        aria-checked={soundOn}
        aria-label="Sound effects volume"
        onClick={toggleSound}
        className="w-full ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
      >
        <div className="h-12 w-12 rounded-2xl bg-accent-5 flex items-center justify-center text-2xl">
          ðŸ”Š
        </div>
        <div className="flex-1 text-left">
          <div className="text-display font-extrabold text-[15px] leading-tight">Sound Effects</div>
          <div className="text-[11px] font-bold text-text-secondary">
            {soundOn ? "Sound & vibrations enabled" : "Sound & vibrations muted"}
          </div>
        </div>
        <span
          className={`h-7 w-12 rounded-full flex items-center px-1 transition ${soundOn ? "gradient-success" : "bg-muted"}`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${soundOn ? "translate-x-5" : "translate-x-0"}`}
          />
        </span>
      </button>

      {/* Audio Narration Permission Card - Unified Style */}
      <button
        type="button"
        role="switch"
        aria-checked={audioEnabled}
        aria-label="Audio narration permission"
        onClick={toggleAudio}
        className="w-full ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
      >
        <div className="h-12 w-12 rounded-2xl bg-accent-5 flex items-center justify-center text-2xl">
          ðŸŽ§
        </div>
        <div className="flex-1 text-left">
          <div className="text-display font-extrabold text-[15px] leading-tight">Audio Narration</div>
          <div className="text-[11px] font-bold">
            {audioEnabled ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
                Active âœ“
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-sunken text-text-secondary border border-border-color">
                Tap to enable
              </span>
            )}
          </div>
        </div>
        <span
          className={`h-7 w-12 rounded-full flex items-center px-1 transition ${audioEnabled ? "gradient-success" : "bg-muted"}`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${audioEnabled ? "translate-x-5" : "translate-x-0"}`}
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
      <div className="text-xs font-bold text-text-secondary">
        {label}
      </div>
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
      const { setPin } = await import("@/lib/parent-gate");
      const success = await setPin(newPIN);
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
          ðŸ‘¨â€ðŸ‘©â€ðŸ‘§
        </div>
        <div className="flex-1 text-left">
          <div className="text-display font-extrabold text-[15px] leading-tight text-info">
            Parent Zone
          </div>
          <div className="text-[11px] font-bold text-accent-1">
            Tap to configure PIN & parental settings
          </div>
        </div>
        <div className="text-info text-lg">{showSettings ? '▼' : 'â€º'}</div>
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
            <div className="text-[10px] text-accent-1 mt-1">
              ðŸ’¡ Used to reset progress. Default: 1234
            </div>
          </div>
          <button
            onClick={handleSavePIN}
            disabled={newPIN.length !== 4 || pinSaveStatus === "saving"}
            className={`w-full h-10 rounded-lg font-bold text-sm transition text-white ${
              pinSaveStatus === "saved"
                ? "bg-success-soft0"
                : "bg-accent-1 disabled:opacity-50 hover:bg-accent-1/90"
            }`}
          >
            {pinSaveStatus === "saved" ? "âœ“ PIN Saved" : pinSaveStatus === "saving" ? "Saving..." : "Save PIN"}
          </button>
          <button
            onClick={() => {
              fxTap();
              setShowSettings(false);
              setNewPIN("");
              setPinSaveStatus("idle");
            }}
            className="w-full h-10 rounded-lg font-bold text-sm bg-white text-info hover:bg-info-soft border border-info"
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
  to: "/explorer" | "/achievements" | "/parent" | "/badges" | "/journey";
}) {
  const bg = {
    orange: "gradient-saffron",
    blue: "gradient-explorer",
    green: "gradient-success",
    gold: "gradient-gold",
  }[tone];
  return (
    <Link
      to={to}
      onClick={() => fxTap()}
      className="ui-card ui-accent-1-soft p-3 flex items-center gap-3 transition active:scale-[0.99]"
    >
      <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-display font-extrabold text-[15px] leading-tight">
          {title}
        </div>
        <div className="text-[11px] font-bold text-text-secondary">{sub}</div>
      </div>
      <div className="text-text-secondary text-xl">â€º</div>
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
              className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl ${
                a.done
                  ? "gradient-gold"
                  : a.tone === "orange"
                  ? "bg-saffron-soft"
                  : a.tone === "blue"
                  ? "bg-explorer-soft"
                  : a.tone === "green"
                  ? "bg-success-soft"
                  : "bg-gold-soft"
              }`}
            >
              {a.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-display font-extrabold text-[16px]">
                  {a.title}
                </div>
                {a.done && (
                  <span className="text-xs font-bold tracking-wider bg-gold-soft text-[color:var(--gold)] px-1.5 py-0.5 rounded-full">
                    Unlocked
                  </span>
                )}
              </div>
              <div className="text-[11px] font-bold text-text-secondary">
                {a.sub}
              </div>
              {!a.done && "prog" in a && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${
                        a.tone === "orange"
                          ? "gradient-saffron"
                          : a.tone === "blue"
                          ? "gradient-explorer"
                          : a.tone === "green"
                          ? "gradient-success"
                          : "gradient-gold"
                      }`}
                      style={{ width: `${(a.prog / a.max) * 100}%` }}
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
    <div className="h-full w-full gradient-sky relative overflow-hidden flex flex-col items-center justify-center">
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
        <div className="text-display text-h2 font-bold">Flying to Gujaratâ€¦</div>
        <div className="text-body text-text-secondary mt-1">
          Packing camel snacks ðŸª
        </div>
      </div>
      <div className="mt-6 w-56 h-2 rounded-full bg-white/70 overflow-hidden">
        <div className="h-full w-2/3 gradient-explorer animate-pulse" />
      </div>
    </div>
  );
}

export function EmptyStateScreen() {
  return (
    <div className="h-full w-full bg-white flex flex-col">
      <HeaderBar title="Friends" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-saffron/25 rounded-full" />
          <img src={mascot} alt="" className="relative w-52 h-52 object-contain" />
        </div>
        <h2 className="text-display text-2xl font-extrabold mt-4">
          No explorer friends yet!
        </h2>
        <p className="mt-2 text-body text-text-secondary max-w-[260px]">
          Invite a friend to join your adventure and travel across India
          together.
        </p>
        <button className="mt-6 h-14 px-6 rounded-2xl gradient-saffron text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-orange)]">
          Invite a Friend ✨
        </button>
        <button className="mt-2 h-12 px-6 rounded-2xl bg-muted text-ink text-display font-extrabold">
          Maybe later
        </button>
      </div>
    </div>
  );
}



