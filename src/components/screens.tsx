import mascot from "@/assets/mascot.png";
import airplane from "@/assets/airplane.png";
import welcomeScreenImage from "@/assets/welcome.png";
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
import { getStateContent, getCardContent, getCardContentByAge } from "@/lib/state-content";
import { stopTts, playTts, playStateNarration } from "@/lib/tts";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { PassportSeedling } from "@/components/PassportSeedling";
import { AudioSettingRow } from "@/components/AudioSettingToggle";
import { AudioPermissionDialog } from "@/components/AudioPermissionDialog";
import { FilePermissionDialog } from "@/components/FilePermissionDialog";
import { ResetPINDialog } from "@/components/ResetPINDialog";
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
import { CardProgressBar } from "@/components/CardProgressBar";
import { FirstSessionTutorial } from "@/components/FirstSessionTutorial";
import { DailyGoalCard } from "@/components/DailyGoalCard";
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
  TOTAL_STATES,
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
} from "@/lib/progress";


/* ---------- shared bits ---------- */

/**
 * Map avatar ID to imported image module
 * Used throughout app to display consistent avatar images
 */
const AVATAR_IMAGE_MAP: Record<AvatarId, string> = {
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
  return AVATAR_IMAGE_MAP[avatarId as AvatarId] || avatarExplorerHat;
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
        className="h-full rounded-full gradient-gold"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-0 h-1 rounded-full bg-white/70"
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${map[tone]}`}
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
    { id: "explorer", icon: "�", label: "Explorer", to: "/explorer" },
    { id: "badges", icon: "🏅", label: "Badges", to: "/badges" },
    { id: "profile", icon: "👤", label: "Me", to: "/me" },
  ] as const;
  return (
    <div className="fixed bottom-0 inset-x-0 z-20">
      <div className="mx-3 mb-3 rounded-3xl bg-white shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18)] border border-black/5 px-2 py-2 flex items-center justify-between">
        {items.map((i) => {
          const on = i.id === active;
          return (
            <Link
              key={i.id}
              to={i.to}
              onClick={() => fxTap()}
              aria-label={i.label}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition active:scale-95 ${
                on ? "bg-saffron-soft" : ""
              }`}
            >
              <span className="text-lg leading-none">{i.icon}</span>
              <span
                className={`text-xs font-bold ${
                  on ? "text-saffron" : "text-muted-foreground"
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
          className="h-12 w-12 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
        >
          ‹
        </button>
      ) : (
        <div className="w-10" />
      )}
      <h2 className="text-display text-lg font-extrabold">{title}</h2>
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
        <h1 className="text-display text-4xl font-extrabold text-white leading-relaxed">
          India
          <br />
          Explorer
        </h1>
        <p className="mt-3 text-white/95 font-bold">
          Travel Across India,
          <br /> One State at a Time
        </p>
      </div>
      <div className="absolute bottom-20 flex items-center gap-2 text-white/90 text-sm font-bold">
        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
        <span className="h-2 w-2 rounded-full bg-white/60" />
        <span className="h-2 w-2 rounded-full bg-white/40" />
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
  const [showAudioPermission, setShowAudioPermission] = useState(false);

  // Age bands with milestone emoji and vibrant gradient
  const ageBands = [
    { value: "3-5", emoji: "🌱", label: "Sprout", gradient: "from-pink-400 to-rose-500" },
    { value: "6-7", emoji: "🌿", label: "Seedling", gradient: "from-violet-400 to-purple-500" },
    { value: "8-9", emoji: "🌳", label: "Sapling", gradient: "from-emerald-400 to-teal-500" },
    { value: "10-12", emoji: "🌲", label: "Mighty Tree", gradient: "from-amber-400 to-orange-500" },
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
    
    // Show audio permission dialog for profile creation
    setShowAudioPermission(true);
    setSaved(true);
  };

  const handleAudioPermissionAccept = () => {
    // User clicked "Yes, enable!" - audio consent already granted by dialog
    // Close dialog and navigate to home
    setShowAudioPermission(false);
    setSaved(false);
    
    // Navigate after a brief delay to let dialog close
    setTimeout(() => navigate({ to: "/home" }), 300);
  };

  const handleAudioPermissionReject = () => {
    // User clicked "Not now" - no audio consent, but still proceed to home
    // They can enable audio later in profile settings
    // Close dialog and navigate to home
    setShowAudioPermission(false);
    setSaved(false);
    
    // Navigate after a brief delay to let dialog close
    setTimeout(() => navigate({ to: "/home" }), 300);
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white flex flex-col select-none touch-none" style={{ touchAction: 'pan-y' }}>
      <div className="px-5 flex-1 overflow-auto">
        {/* Step 1: Avatar Selection */}
        <div className="rounded-3xl gradient-explorer p-5 text-white relative overflow-hidden">
          <Cloud className="absolute -top-3 right-2 w-16 opacity-40" />
          <div className="text-display text-2xl font-bold mt-1">
            Pick your avatar
          </div>
          <div className="text-sm opacity-90 font-semibold">
            Choose the explorer who will travel with you
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-6">
          {avatarImages.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                fxTap();
                setAvatar(a.id);
                setSaved(false);
              }}
              className={`aspect-square rounded-2xl flex items-center justify-center border-4 transition transform overflow-hidden ${
                a.id === avatar
                  ? "border-saffron shadow-[var(--shadow-glow-orange)] scale-110"
                  : "border-gray-200 hover:scale-105"
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
            <div className="mt-6 rounded-2xl gradient-saffron p-4 text-center text-white animate-fade-in flex items-center justify-center gap-4">
              <img src={selectedAvatar.image} alt={avatarName} className="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
              <div>
                <div className="text-sm font-bold opacity-90">Your explorer!</div>
                <div className="text-display text-lg font-extrabold">{avatarName}</div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Age Selection with Vibrant Colors & Emojis */}
        <div className="mt-8 mb-2">
          <label className="text-display text-sm font-bold text-gray-700">
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
                  className={`w-full h-16 rounded-2xl flex items-center justify-between px-5 font-extrabold transition transform ${
                    isSelected
                      ? `bg-gradient-to-r ${band.gradient} text-white shadow-xl scale-105 border-4 border-white animate-pulse`
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:scale-102"
                  }`}
                >
                  <span className="text-3xl">{band.emoji}</span>
                  <div className="flex-1 text-center">
                    <div className="text-lg">{band.value}</div>
                    <div className={`text-xs font-bold ${isSelected ? "text-white/90" : "text-gray-500"}`}>
                      {band.label}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-2xl animate-bounce">⭐</div>
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

      <div className="p-5 pb-safe bg-white border-t border-gray-100">
        <button
          onClick={handleProfileSave}
          className={`w-full h-14 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white text-display text-lg font-bold shadow-xl transition transform ${
            saved ? "scale-95 opacity-80" : "hover:shadow-2xl active:scale-95"
          }`}
        >
          {saved ? "🎉 Saved ✓" : "Continue → Let's Explore!"}
        </button>
      </div>

      {/* Audio Permission Dialog - shown after profile creation */}
      <AudioPermissionDialog
        open={showAudioPermission}
        forceShow={true}
        context="profile-creation"
        onAccept={handleAudioPermissionAccept}
        onReject={handleAudioPermissionReject}
      />
    </div>
  );
}

export function HomeDashboardScreen() {
  const p = useProgress();
  const navigate = useNavigate();
  const [statsVisible, setStatsVisible] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [showLockedPreview, setShowLockedPreview] = useState<string | null>(null);
  // Auto-show tutorial on first session, allow dismiss
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("india-explorer:tutorial-seen:v1");
      return !seen; // Show tutorial if not seen before
    }
    return false;
  });

  // Route guard: redirect to welcome if not onboarded (defensive check)
  if (!p.onboarded) {
    appLogger.warn('home_dashboard', 'User attempted to access home without onboarding', {});
    return <Navigate to="/welcome" replace />;
  }

  const { level, toNext, pct } = levelInfo(p.xp);
  const postcards = Object.keys(p.postcards).length;
  const journey = statesWithProgress(p);
  const current = journey.find((s) => s.status === "current") ?? journey[journey.length - 1];
  const currentDone = cardsDone(p, current.name);
  const upNext = journey.filter((s) => s.name !== current.name && s.status === "locked").slice(0, 2);

  useEffect(() => {
    touchStreak();
    // Trigger animations on mount
    setTimeout(() => setStatsVisible(true), 100);
    setTimeout(() => setAnimateStats(true), 500);
  }, []);

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
    const completed = p.completed.length;
    const stateIndex = journey.findIndex((s) => s.name === stateName);
    const requiredStates = stateIndex + 1;
    const needed = Math.max(0, requiredStates - completed);
    if (needed === 0) return "Ready to play!";
    return `Complete ${needed} more state${needed > 1 ? "s" : ""} to unlock`;
  };

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col overflow-hidden">

      {/* Header with fade-in animation */}
      <div className={`px-5 pt-3 pb-3 gradient-saffron rounded-b-[32px] relative overflow-hidden transition-opacity duration-500 ${statsVisible ? "opacity-100" : "opacity-0"}`}>
        <Cloud className="absolute top-2 right-4 w-14 opacity-40" />
        <div className="flex items-center gap-3 relative">
          <div className="h-14 w-14 rounded-2xl bg-white p-1 shadow-soft flex items-center justify-center overflow-hidden">
            <img src={getAvatarImage(p.avatar)} alt={getAvatarName(p.avatar)} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-white">
            <div className="text-xs font-bold opacity-90">Namaste,</div>
            <div className="text-display text-lg font-bold leading-tight">
              {(p?.name?.split(" ")[0] || "Explorer")}! 👋
            </div>
          </div>
          <div className={`flex items-center gap-1.5 bg-white/60 rounded-full px-3 py-1.5 backdrop-blur transition-transform duration-1000 ${p.streak > 0 ? "animate-bounce" : ""}`}>
            <span>🔥</span>
            <span className="text-white text-display font-extrabold">{p.streak}</span>
          </div>
          
          {/* Help button - Tutorial trigger - More visible */}
          <button
            onClick={handleTutorialToggle}
            className="h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-saffron font-extrabold text-xl hover:bg-white active:scale-95 transition-all shadow-lg hover:shadow-xl"
            title="How to play - Tap to learn"
          >
            ?
          </button>
        </div>

        {/* XP Card with pulse animation */}
        <div className={`mt-4 rounded-2xl bg-white/15 backdrop-blur p-3 relative transition-all duration-700 ${statsVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="text-xs font-bold opacity-90">Level {level} · Explorer</div>
              <div className="text-display text-xl font-extrabold">
                {p.xp.toLocaleString()} XP
              </div>
            </div>
            <div className="text-right text-xs font-bold opacity-90">
              {toNext} XP to
              <br />
              Level {level + 1}
            </div>
          </div>
          <div className="mt-2">
            <XPBar value={pct} />
          </div>
        </div>
      </div>

      {/* Stats with encouraging messages + count-up animation */}
      <div className={`px-5 mt-3 relative z-10 grid grid-cols-3 gap-2 transition-all duration-700 ${animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        <StatCardEnhanced 
          tone="orange" 
          icon="🗺️" 
          value={String(p.completed.length)} 
          label="States"
          encouragement={p.completed.length === 0 ? "Ready to go!" : "Keep exploring!"}
        />
        <StatCardEnhanced 
          tone="gold" 
          icon="🏅" 
          value={String(badgeCount(p))} 
          label="Badges"
          encouragement={badgeCount(p) === 0 ? "Earn in quizzes!" : "Great job!"}
        />
        <StatCardEnhanced 
          tone="green" 
          icon="🎫" 
          value={String(postcards)} 
          label="Stamps"
          encouragement={postcards === 0 ? "Complete states!" : "Keep collecting!"}
        />
      </div>

      {/* Daily Goal Card - Compact inline version */}
      <DailyGoalCard />

      {/* Continue journey - with pulse on play button */}
      <div className="px-5 mt-3 mb-3 flex-shrink-0">
        <div className="text-display font-bold text-sm text-muted-foreground">
          Continue your journey
        </div>
        <div className="mt-2 rounded-3xl bg-white p-4 shadow-soft border border-black/5 flex items-center gap-3">
          <div className="h-16 w-16 rounded-2xl gradient-saffron p-2 flex items-center justify-center text-3xl animate-bounce">
            {current.emoji}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-saffron">
              {current.kind === "ut" ? "Union Territory" : "Currently Exploring"}
            </div>
            <div className="text-display text-lg font-bold leading-tight">
              {current.name}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full gradient-saffron transition-all duration-500"
                  style={{ width: `${(currentDone / CARDS_PER_STATE) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {currentDone}/{CARDS_PER_STATE}
              </span>
            </div>
          </div>
          <Link
            to="/state/$slug/learn"
            params={{ slug: stateSlug(current.name) }}
            onClick={() => fxTap()}
            className="h-11 px-3 rounded-2xl gradient-saffron text-white text-display font-bold text-sm shadow-[var(--shadow-glow-orange)] flex items-center transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
          >
            Play ▶
          </Link>
        </div>
      </div>



      {/* Up next - with interactive locked cards */}
      <div className="px-5 mt-4 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-display font-bold text-sm text-muted-foreground">
            Up next
          </div>
          <Link to="/journey" className="text-xs font-extrabold text-explorer">
            View all
          </Link>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {upNext.map((s, idx) => (
            <button
              key={s.name}
              onClick={() => handleLockedCardTap(s.name)}
              className={`rounded-3xl bg-white p-3 shadow-soft border border-black/5 flex flex-col items-center gap-1 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="text-3xl">{s.emoji}</div>
              <div className="text-display font-bold text-sm text-center leading-tight line-clamp-ellipsis-2">
                {s.name}
              </div>
              <div className="text-xs font-bold text-muted-foreground">🔒 Locked</div>
              <div className="text-[9px] font-semibold text-saffron mt-1">
                Tap to see preview
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Locked Card Preview Modal */}
      {showLockedPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            {(() => {
              const state = journey.find((s) => s.name === showLockedPreview);
              if (!state) return null;

              return (
                <div>
                  {/* Close button */}
                  <button
                    onClick={() => setShowLockedPreview(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ✕
                  </button>

                  {/* State preview */}
                  <div className={`rounded-2xl gradient-saffron text-white p-4 text-center mb-4`}>
                    <div className="text-5xl mb-2">{state.emoji}</div>
                    <div className="text-display text-xl font-extrabold">{state.name}</div>
                    <div className="text-sm opacity-90 mt-1">{state.nickname}</div>
                  </div>

                  {/* State facts */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-orange-50 border-l-4 border-orange-400">
                      <div className="text-xs font-bold text-orange-900 uppercase tracking-wider">Monument</div>
                      <div className="text-sm font-semibold text-orange-800 mt-1">{state.monumentName}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-green-50 border-l-4 border-green-400">
                      <div className="text-xs font-bold text-green-900 uppercase tracking-wider">Wildlife</div>
                      <div className="text-sm font-semibold text-green-800 mt-1">{state.animalName}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50 border-l-4 border-blue-400">
                      <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">Fun Fact</div>
                      <div className="text-sm font-semibold text-blue-800 mt-1">{state.funFact}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50 border-l-4 border-purple-400">
                      <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">Unlock Path</div>
                      <div className="text-sm font-semibold text-purple-800 mt-1">{getUnlockRequirement(state.name)}</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => setShowLockedPreview(null)}
                      className="w-full h-12 rounded-2xl bg-gray-100 text-gray-800 font-extrabold"
                    >
                      Close
                    </button>
                    <Link
                      to="/journey"
                      className="w-full h-12 rounded-2xl gradient-saffron text-white font-extrabold flex items-center justify-center"
                      onClick={() => fxTap()}
                    >
                      View Journey Map
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* First Session Tutorial - Auto-show on first session with dismiss option */}
      <FirstSessionTutorial 
        isVisible={showTutorial}
        onComplete={handleTutorialClose}
      />
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
    <div className={`rounded-2xl bg-white border ${border} p-3 shadow-soft`}>
      <div className="text-lg">{icon}</div>
      <div className="text-display text-xl font-extrabold leading-snug mt-1">
        {value}
      </div>
      <div className="text-xs font-bold text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/**
 * Enhanced stat card with encouraging messages for kids
 * Shows encouragement text instead of bare numbers
 */
function StatCardEnhanced({
  icon,
  value,
  label,
  tone,
  encouragement,
}: {
  icon: string;
  value: string;
  label: string;
  tone: "orange" | "gold" | "green";
  encouragement: string;
}) {
  const border = {
    orange: "border-saffron/25",
    gold: "border-[color:var(--gold)]/30",
    green: "border-success/25",
  }[tone];

  const bgColor = {
    orange: "bg-saffron/5",
    gold: "bg-yellow/5",
    green: "bg-success/5",
  }[tone];

  return (
    <div className={`rounded-2xl bg-white border ${border} p-3 shadow-soft hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg">{icon}</div>
          <div className="text-display text-xl font-extrabold leading-snug mt-1">
            {value}
          </div>
          <div className="text-xs font-bold text-muted-foreground mt-0.5">
            {label}
          </div>
        </div>
      </div>
      {/* Encouragement message */}
      <div className={`mt-2 px-2 py-1 rounded-lg ${bgColor} text-[9px] font-bold text-center leading-tight`}>
        {encouragement}
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
      <div className="text-[10px] font-bold text-muted-foreground">
        {locked ? "🔒 Locked" : "Unlocked"}
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
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
        >
          ✕
        </button>

        {/* State Display */}
        <div className="flex flex-col items-center pt-2">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center text-5xl mb-4 ${
              isDone
                ? "gradient-saffron shadow-lg"
                : isLocked
                ? "bg-gradient-to-br from-gray-200 to-gray-300 opacity-60"
                : "gradient-saffron shadow-lg"
            }`}
          >
            {stateData.emoji}
          </div>

          <h2 className="text-display text-2xl font-extrabold text-ink">
            {stateName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {state.isUT ? "Union Territory" : "State"} · {stateData.capital}
          </p>
        </div>

        {/* Gap #3: Sneak Peek Preview for Locked States */}
        {isLocked && (
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-4 space-y-3">
            <p className="text-display text-sm font-extrabold text-amber-900 flex items-center gap-2">
              👀 Sneak Peek Preview
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{stateData.animal}</span>
                <div>
                  <p className="font-bold text-gray-900">State Animal</p>
                  <p className="text-gray-700">{stateData.animalName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{stateData.monument}</span>
                <div>
                  <p className="font-bold text-gray-900">Famous Monument</p>
                  <p className="text-gray-700">{stateData.monumentName}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200">
                <p className="text-xs font-bold text-amber-900 mb-1">Fun Fact</p>
                <p className="text-gray-700 italic">{stateData.funFact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Information */}
        {isLocked ? (
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
            <p className="text-display text-sm font-extrabold text-amber-900 mb-2">
              🔐 Locked
            </p>
            <p className="text-sm font-semibold text-amber-800">
              Complete the previous state to unlock this adventure!
            </p>
          </div>
        ) : isDone ? (
          <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
            <p className="text-display text-sm font-extrabold text-green-900 mb-2">
              ✓ Completed
            </p>
            <p className="text-sm font-semibold text-green-800">
              You've earned all badges for this state!
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-blue-50 border-2 border-blue-200 p-4">
            <p className="text-display text-sm font-extrabold text-blue-900 mb-2">
              ▶ In Progress
            </p>
            <p className="text-sm font-semibold text-blue-800">
              Complete 3 cards and take the quiz to unlock the next state!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl bg-gray-100 text-display font-extrabold text-gray-700 hover:bg-gray-200 transition"
          >
            Close
          </button>
          {!isLocked && (
            <button
              onClick={() => {
                fxTap();
                onPlay();
              }}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-saffron-400 to-saffron-500 text-display font-extrabold text-white shadow-lg hover:shadow-xl transition"
            >
              {isDone ? "🎖️ Review" : "▶ Play"}
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
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const celebration = useCelebration();

  // Gap #2: Detect and celebrate milestones
  useEffect(() => {
    const totalStates = TOTAL_STATES;
    const completed = p.completed.length;
    const percentage = Math.round((completed / totalStates) * 100);

    // Check for milestone achievements
    const milestones = [
      { threshold: 25, emoji: "🎯", message: "Quarter Way There! 25% Complete!" },
      { threshold: 50, emoji: "🌎", message: "Halfway Around India! 50% Complete!" },
      { threshold: 75, emoji: "🏁", message: "Almost Complete! 75% Explored!" },
      { threshold: 100, emoji: "👑", message: "India Master! 100% Complete!" },
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
      
      // Navigate back within internal views: card → hub → intro → map
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

  // Two collectible routes: the 28 states, then the 8 union territories.
  const routes = [
    { key: "states", label: "Route 1 · States", icon: "🗺️", items: states.filter((s) => s.kind !== "ut") },
    { key: "ut", label: "Route 2 · Union Territories", icon: "🏝️", items: states.filter((s) => s.kind === "ut") },
  ];

  // Gap #1: Organize states by region for color-coded grouping
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
  const nodes: MapNode[] = [];
  const banners: { key: string; label: string; icon: string; y: number; done: number; total: number }[] = [];

  let y =50;
  let idx = 0;
  
  // Show all states for all age bands (removed age-based filtering)
  // All states are available regardless of age band for equal access
  const filteredRoutes = routes;

  for (const route of filteredRoutes) {
    const done = route.items.filter((s) => s.status === "done").length;
    banners.push({ key: route.key, label: route.label, icon: route.icon, y, done, total: route.items.length });
    y += BANNER_GAP;
    for (const s of route.items) {
      nodes.push({
        name: s.name,
        short: s.short,
        status: s.status,
        isUT: s.kind === "ut",
        x: idx % 2 === 0 ? 26 : 72,
        y,
      });
      y += STEP;
      idx += 1;
    }
  }

  const height = y + 20;
  const currentIndex = nodes.findIndex((n) => n.status === "current");
  const totalStates = filteredRoutes.reduce((acc, r) => acc + r.items.length, 0);
  const completedStates = nodes.filter((n) => n.status === "done").length;

  // Validate banners were created
  if (banners.length < 1) {
    appLogger.info('journey_map_screen', 'Banners not properly initialized, count: ' + banners.length);
    return <LoadingScreen />;
  }

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
          // Navigate to completion screen which will show postcard → unlock → explorer
          const slug = view.name.toLowerCase().replace(/\s+/g, "-");
          navigate({ to: "/state/$slug/complete", params: { slug } });
        }}
      />
    );
  }

  return (
    <div className="h-full w-full gradient-sky relative overflow-hidden flex flex-col">
      {/* Header with orange gradient - matching Home screen */}
      <div className="px-5 pt-3 pb-4 gradient-saffron rounded-b-[32px] relative overflow-hidden animate-fade-in">
        <Cloud className="absolute top-2 right-4 w-14 opacity-40 pointer-events-none" />
        
        {/* Journey Info */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-11 w-11 rounded-2xl bg-white shadow-soft p-1 flex items-center justify-center overflow-hidden">
            <img src={getAvatarImage(p.avatar)} alt={getAvatarName(p.avatar)} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="text-display font-extrabold text-white">India Journey</div>
            <div className="text-xs font-bold text-white/90 flex items-center gap-2">
              {p.streak > 0 && (
                <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-white/30 rounded-full">
                  <span>🔥</span>
                  <span className="font-extrabold">{p.streak}-day streak!</span>
                </span>
              )}
              <span>
                {banners.length >= 2 
                  ? `${banners[0].done}/${banners[0].total} · ${banners[1].done}/${banners[1].total}`
                  : banners.length >= 1
                  ? `${banners[0].done}/${banners[0].total}`
                  : 'Loading...'
                }
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/60 rounded-full px-3 py-1.5 backdrop-blur flex-shrink-0">
            <span>🪙</span>
            <span className="text-display font-extrabold text-saffron text-sm">{p.xp.toLocaleString()}</span>
          </div>
        </div>

        {/* Progress Bar - inside header */}
        <div className="mt-4 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white/90">Your Journey Progress</span>
            <span className="text-xs font-extrabold text-white bg-white/30 px-2 py-0.5 rounded-full">{Math.round((completedStates / totalStates) * 100)}%</span>
          </div>
          <div className="h-3 bg-white/30 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-yellow-200 via-yellow-100 to-white rounded-full transition-all duration-500"
              style={{ width: `${(completedStates / totalStates) * 100}%` }}
            />
          </div>
          {/* Gap #2: Show next milestone target */}
          <div className="text-xs font-bold text-white/80 mt-2">
            {completedStates < 9 && `🎯 25% milestone: ${Math.max(0, 9 - completedStates)} more states`}
            {completedStates >= 9 && completedStates < 18 && `🌎 50% milestone: ${Math.max(0, 18 - completedStates)} more states`}
            {completedStates >= 18 && completedStates < 27 && `🏁 75% milestone: ${Math.max(0, 27 - completedStates)} more states`}
            {completedStates >= 27 && `👑 Explore the final states to become India Master!`}
          </div>
        </div>
      </div>

      {/* Clouds decoration below header */}
      <Cloud className="absolute top-40 left-2 w-24 opacity-90 pointer-events-none animate-fade-in" style={{ animationDelay: "100ms" }} />
      <Cloud className="absolute top-80 right-1 w-20 opacity-85 pointer-events-none animate-fade-in" style={{ animationDelay: "150ms" }} />

      {/* Map - Gap #1: Regional grouping with visual separators */}
      <div className="relative flex-1 mx-3 mt-2 rounded-[28px] overflow-y-auto overflow-x-hidden animate-fade-in" style={{ animationDelay: "200ms" }}>
        {/* Regional sections with color-coded headers - Gap #1 */}
        <div className="relative w-full px-4 space-y-6 py-6">
          {REGION_KEYS.map((regionKey, regionIdx) => {
            const region = REGIONS[regionKey];
            const regionStates = statesByRegion[regionKey] || [];
            const regionDone = regionStates.filter((s) => s.status === "done").length;
            
            return (
              <div key={regionKey} className="animate-fade-in" style={{ animationDelay: `${300 + regionIdx * 100}ms` }}>
                {/* Regional Header - Gap #1 */}
                <div className={`rounded-2xl bg-gradient-to-r ${region.gradient} text-white p-3 mb-3 shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{region.emoji}</span>
                      <div>
                        <div className="text-sm font-extrabold">{region.name}</div>
                        <div className="text-xs font-bold opacity-90">{regionDone}/{regionStates.length} explored</div>
                      </div>
                    </div>
                    {/* Regional milestone indicator */}
                    {regionDone === regionStates.length && regionStates.length > 0 && (
                      <div className="text-lg">✨ Complete!</div>
                    )}
                  </div>
                  {/* Regional progress bar */}
                  <div className="mt-2 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${(regionDone / Math.max(regionStates.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* States in this region - Grid layout */}
                <div className="grid grid-cols-2 gap-3">
                  {regionStates.map((state) => {
                    const isLocked = state.status === "locked";
                    const isDone = state.status === "done";
                    const isCurrent = state.status === "current";
                    
                    return (
                      <button
                        key={state.name}
                        onClick={() => {
                          fxTap();
                          if (!isLocked) {
                            setView({ screen: "intro", name: state.name });
                          }
                        }}
                        className={`p-3 rounded-2xl transition transform active:scale-95 ${
                          isDone
                            ? `bg-gradient-to-br ${region.gradient} text-white shadow-lg`
                            : isCurrent
                            ? `bg-gradient-to-br from-yellow-300 to-orange-400 text-white shadow-lg scale-105 animate-pulse`
                            : `bg-gray-100 text-gray-700 ${isLocked ? "opacity-60" : ""}`
                        }`}
                      >
                        <div className="text-3xl mb-1">{state.emoji}</div>
                        <div className="text-xs font-extrabold leading-tight">{state.short}</div>
                        {isDone && (
                          <div className="text-[10px] font-bold mt-1 opacity-90">✓ Done</div>
                        )}
                        {isCurrent && (
                          <div className="text-[10px] font-bold mt-1">▶ Play</div>
                        )}
                        {isDone && !isCurrent && (
                          <div className="text-[10px] font-bold mt-1 opacity-90">↻ Replay</div>
                        )}
                        {isLocked && (
                          <div className="text-[10px] font-bold mt-1">🔒 Locked</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Union Territories section */}
          <div className="animate-fade-in" style={{ animationDelay: "800ms" }}>
            <div className="rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 text-white p-3 mb-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏝️</span>
                  <div>
                    <div className="text-sm font-extrabold">Union Territories</div>
                    <div className="text-xs font-bold opacity-90">{nodes.filter(n => n.isUT && n.status === "done").length}/8 explored</div>
                  </div>
                </div>
                {nodes.filter(n => n.isUT && n.status === "done").length === 8 && (
                  <div className="text-lg">✨ Complete!</div>
                )}
              </div>
              <div className="mt-2 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(nodes.filter(n => n.isUT && n.status === "done").length / 8) * 100}%` }}
                />
              </div>
            </div>

            {/* UTs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {nodes.filter(n => n.isUT).map((utNode) => {
                const utState = states.find(s => s.name === utNode.name);
                if (!utState) return null;
                const isLocked = utNode.status === "locked";
                const isDone = utNode.status === "done";
                const isCurrent = utNode.status === "current";
                
                return (
                  <button
                    key={utNode.name}
                    onClick={() => {
                      fxTap();
                      if (!isLocked) {
                        setView({ screen: "intro", name: utNode.name });
                      }
                    }}
                    className={`p-3 rounded-2xl transition transform active:scale-95 ${
                      isDone
                        ? "bg-gradient-to-br from-blue-400 to-purple-500 text-white shadow-lg"
                        : isCurrent
                        ? "bg-gradient-to-br from-yellow-300 to-orange-400 text-white shadow-lg scale-105 animate-pulse"
                        : `bg-gray-100 text-gray-700 ${isLocked ? "opacity-60" : ""}`
                    }`}
                  >
                    <div className="text-3xl mb-1">{utState.emoji}</div>
                    <div className="text-xs font-extrabold leading-tight">{utState.short}</div>
                    {isDone && (
                      <div className="text-[10px] font-bold mt-1 opacity-90">✓ Done</div>
                    )}
                    {isCurrent && (
                      <div className="text-[10px] font-bold mt-1">▶ Play</div>
                    )}
                    {isDone && !isCurrent && (
                      <div className="text-[10px] font-bold mt-1 opacity-90">↻ Replay</div>
                    )}
                    {isLocked && (
                      <div className="text-[10px] font-bold mt-1">🔒 Locked</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
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

  // Gap #4: Determine current region for breadcrumb
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
        
        {/* Gap #4: Breadcrumb Navigation */}
        <div className="absolute top-3 left-16 flex items-center gap-1 text-white text-xs font-bold">
          <span className="opacity-75">Journey</span>
          <span className="opacity-50">›</span>
          {currentRegion && (
            <>
              <span className="opacity-75">{currentRegion.emoji} {currentRegion.name}</span>
              <span className="opacity-50">›</span>
            </>
          )}
          <span>{state.emoji}</span>
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
          ‹
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-48 aspect-square rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-[68px] drop-shadow-2xl">
            {state.emoji}
          </div>
        )}
      </div>

      <div className="-mt-8 rounded-t-[36px] bg-white flex-1 px-5 pt-6 pb-5 relative z-10">
        <div className="text-xs font-black uppercase tracking-widest text-saffron">
          Welcome to
        </div>
        <h1 className="text-display text-4xl font-extrabold leading-snug mt-1">
          {state.name}
        </h1>
        <div className="text-sm font-bold text-muted-foreground mt-1">
          {state.emoji} {state.nickname}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <IntroFact label="Capital" value={state.capital} icon="🏛️" />
          <IntroFact label="Language" value={state.language} icon="🗣️" />
          <IntroFact label="Population" value={state.population} icon="👥" />
          <IntroFact label="Animal" value={state.animalName} icon={state.animal} />
        </div>

        <button
          onClick={() => {
            appLogger.info('state_intro_screen', 'Start Exploring clicked, calling onContinue');
            fxTap();
            onContinue?.();
          }}
          className={`mt-6 w-full h-14 rounded-2xl ${grad} text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-orange)]`}
        >
          Start Exploring! ✈️
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
    <div className="rounded-2xl bg-saffron-soft/60 p-3 border border-saffron/15">
      <div className="text-lg">{icon}</div>
      <div className="text-xs font-bold text-saffron">
        {label}
      </div>
      <div className="text-display font-extrabold text-lg leading-tight">
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
  const completedCards = cardsDone(progress, state.name);
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";

  // Gap #4: Determine current region for breadcrumb
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

  // Detect full category completion and celebrate (when all 6 cards are done)
  useEffect(() => {
    if (completedCards === 6 && celebratedCategories.size === 0) {
      // All 6 categories completed - celebrate!
      const categoryNames = ["Capital", "Language", "Famous Food", "Places", "State Animal", "Fun Fact"];
      
      celebration.custom(
        `${state.name.toUpperCase()} MASTERED!`,
        "�",
        {
          subtitle: `You've explored all 6 categories! Ready for the quiz?`,
          confetti: true,
          duration: 3500,
          type: "success",
        }
      );
      
      // Mark as celebrated
      setCelebratedCategories(new Set([0, 1, 2, 3, 4, 5]));
    }
  }, [completedCards, celebratedCategories, celebration, state.name]);

  const cards = [
    { icon: "🏛️", title: "Capital", sub: state.capital, tone: "orange" as const },
    { icon: "🗣️", title: "Language", sub: state.language, tone: "blue" as const },
    { icon: "🍛", title: "Famous Food", sub: state.food, tone: "gold" as const },
    { icon: state.monument, title: "Places", sub: state.monumentName, tone: "green" as const },
    { icon: state.animal, title: "State Animal", sub: state.animalName, tone: "orange" as const },
    { icon: "💡", title: "Fun Fact", sub: state.funFact, tone: "blue" as const },
  ].map((c, i) => ({
    ...c,
    index: i,
    done: read.includes(i) || completedCards >= CARDS_PER_STATE,
    active: i === completedCards && status !== "locked",
    locked: status === "locked",
    canClick: status !== "locked", // Allow all unlocked cards to be clicked (replay anytime)
    onOpen: () => onCard?.(i),
  }));

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      <div className={`px-5 pt-3 pb-4 ${grad} rounded-b-[32px] relative`}>
        {/* Gap #4: Breadcrumb Navigation */}
        <div className="mb-2 flex items-center gap-1 text-white text-xs font-bold px-12">
          <span className="opacity-75">Journey</span>
          <span className="opacity-50">›</span>
          {currentRegion && (
            <>
              <span className="opacity-75">{currentRegion.emoji} {currentRegion.name}</span>
              <span className="opacity-50">›</span>
            </>
          )}
          <span>{state.emoji}</span>
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
            ‹
          </button>
          <div className="flex-1 text-white">
            <div className="text-xs font-bold text-white/90">
              Learning Hub
            </div>
            <div className="text-display text-xl font-extrabold">{state.name}</div>
            {progress.streak > 0 && (
              <div className="text-xs font-bold text-white/80 mt-0.5">
                🔥 Day {progress.streak} streak
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-white text-display font-extrabold">
            <span>⭐</span> {completedCards * XP_PER_CARD}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-white">
          <div className="flex-1 h-2.5 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(completedCards / 6) * 100}%` }}
            />
          </div>
          <span className="text-xs font-extrabold">{completedCards} / 6</span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 flex-1 overflow-auto">
        {cards.map((c) => (
          <HubCard key={c.title} {...c} stateName={state.name} />
        ))}
      </div>
      <div className="p-4">
        <button
          onClick={() => {
            fxTap();
            onQuiz?.();
          }}
          className="w-full h-14 rounded-2xl gradient-success text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-green)]"
        >
          Take the Quiz! 🎯
        </button>
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
      className={`relative text-left rounded-3xl p-4 shadow-soft border-2 transition active:scale-[0.98] ${
        active ? ring : "border-transparent"
      } ${locked ? "bg-muted opacity-70 pointer-events-none cursor-not-allowed" : `${bg}`}`}
    >
      <div className="text-3xl">{icon}</div>
      <div className="text-display text-base font-extrabold mt-1 leading-tight">
        {title}
      </div>
      <div className="text-xs font-bold text-muted-foreground">{sub}</div>
      {stateName && <CardProgressBar stateName={stateName} cardCategory={title.toLowerCase().replace(/\s+/g, "-")} />}
      {done && (
        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-success text-white flex items-center justify-center text-xs font-black">
          ✓
        </div>
      )}
      {locked && (
        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center text-xs">
          🔒
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
  mainCardIndex?: number; // Track which main card this belongs to (0-5)
};

function learningCardsFor(stateName?: string, displayLanguage: string = "en", ageBand: string = "8-9"): EnhancedCard[] {
  const state = getState(stateName);
  const enrichedContent = getStateContent(stateName);
  
  // Map of main card definitions
  const mainCardDefinitions = [
    {
      kicker: "Capital",
      title: state.capital,
      icon: "🏛️",
      chip: "Capital City",
      body: `${state.capital} is the capital city of ${state.name}. It is where the state's government works from.`,
      enrichedKey: "capital" as const,
    },
    {
      kicker: "Language",
      title: state.language,
      icon: "🗣️",
      chip: "Language",
      body: `People in ${state.name} mostly speak ${state.language}. Try saying hello in it!`,
      enrichedKey: "language" as const,
    },
    {
      kicker: "Famous Food",
      title: state.food,
      icon: "🍛",
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
      icon: "💡",
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
    let cardContent = enrichedCard ? getCardContentByAge(stateName, def.enrichedKey, displayLanguage, ageBand) : null;
    
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
            body: fact,
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
          icon: "🤔",
          chip: "Did You Know?",
          body: cardContent.didYouKnow,
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
          icon: "🎮",
          chip: "Try This Activity",
          body: cardContent.tryThis,
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
  
  // Declare ALL state hooks FIRST, before any computations
  const [displayLanguage, setDisplayLanguage] = useState<LanguageCode>("en");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null);
  const [showAudioPermissionPrompt, setShowAudioPermissionPrompt] = useState(false);
  
  // Now compute cards using displayLanguage and ageBand (which are now declared)
  const cards = useMemo(() => {
    return learningCardsFor(state.name, displayLanguage, progress.ageBand);
  }, [state.name, displayLanguage, progress.ageBand]);
  
  const enrichedContent = getStateContent(stateName);
  
  // Now compute derived values from cards
  const startIndexForMainCard = getMainCardStartIndex(cardIndex, cards);
  const i = Math.min(Math.max(startIndexForMainCard, 0), cards.length - 1);
  const isReplaying = progress.cards?.[state.name]?.includes(i) ?? false;
  const replayCount = getReplayCount(progress, state.name, i);
  
  useEffect(() => {
    preloadStateArt(state.name, nextStateAfter(state.name)?.name);
  }, [state.name]);

  // Track card visit when a new card is displayed
  useEffect(() => {
    if (card && state) {
      const cardCategory = card.kicker.toLowerCase().replace(/\s+/g, "-");
      markCardVisit(state.name, cardCategory, currentCardIndex);
    }
  }, [currentCardIndex, state?.name]);

  // Reset card index when cardIndex prop changes (for replay scenarios)
  useEffect(() => {
    const startIndexForMainCard = getMainCardStartIndex(cardIndex, cards);
    const newI = Math.min(Math.max(startIndexForMainCard, 0), cards.length - 1);
    setCurrentCardIndex(newI);
  }, [cardIndex, stateName]); // Don't include 'cards' - language changes shouldn't reset position

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      stopTts();
    };
  }, []);

  const card = cards[currentCardIndex];
  const isLast = currentCardIndex === cards.length - 1;

  // Safety check: ensure card exists
  if (!card) {
    return <LoadingScreen />;
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
      if (diff > swipeThreshold && currentCardIndex < cards.length - 1) {
        fxTap();
        setCurrentCardIndex(currentCardIndex + 1);
      }
      // Swipe right (show previous card)
      else if (diff < -swipeThreshold && currentCardIndex > 0) {
        fxTap();
        setCurrentCardIndex(currentCardIndex - 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      fxTap();
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      fxTap();
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Last card overall - mark as learned and proceed
      fxTap();
      const isReplaying = progress.cards?.[state.name]?.includes(i) ?? false;
      const wasFirstRead = !isReplaying;
      
      // Show XP toast if this is first read (not replay)
      if (wasFirstRead) {
        useToastStore.getState().show({
          type: "success",
          icon: "🪙",
          message: `+${XP_PER_CARD} XP`,
          subtitle: `Great learning! Keep going 🚀`,
          duration: 2500,
        });
      }
      
      markCard(state.name, i, isReplaying);
      onNext?.(null);
    }
  };

  const handleMainCardDone = () => {
    fxTap();
    // Mark the main card as learned
    const wasFirstRead = !isReplaying;
    
    // Show XP toast if this is first read
    if (wasFirstRead) {
      useToastStore.getState().show({
        type: "success",
        icon: "🪙",
        message: `+${XP_PER_CARD} XP`,
        subtitle: `Learning unlocked! 🎓`,
        duration: 2500,
      });
    }
    
    markCard(state.name, currentMainCardIndex, isReplaying);
    
    // If this is the last main card, go to quiz
    if (currentMainCardIndex === 5) {
      onNext?.(null);
    } else {
      // Go back to card selection screen (pass null to signal back to hub)
      onClose?.();
    }
  };

  return (
    <div className="h-full w-full bg-[#FDF7EF] flex flex-col">
      {/* Top Bar: Close + Progress + Language + Listen */}
      <div className="px-5 pt-3 pb-3 flex items-center gap-2 bg-white/40 backdrop-blur-sm">
        <button
          onClick={() => {
            fxTap();
            onClose?.();
          }}
          aria-label="Close learning card"
          className="h-12 w-12 rounded-full bg-white shadow-soft flex items-center justify-center text-lg font-bold"
        >
          ✕
        </button>

        {/* Card counter and progress bar */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="text-display font-extrabold text-saffron whitespace-nowrap">
            {currentCardIndex + 1}/{cards.length}
          </div>
          <div className="h-2 rounded-full bg-white overflow-hidden shadow-inner flex-1">
            <div
              className={`h-full ${grad} transition-all`}
              style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Language Selector */}
        <LanguageSelector
          currentLanguage={displayLanguage as LanguageCode}
          availableLanguages={getAvailableLanguages(stateName)}
          onLanguageChange={(lang) => setDisplayLanguage(lang)}
        />

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
          className={`h-9 px-3 rounded-full shadow-soft flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95 whitespace-nowrap ${
            playingCardIndex === currentCardIndex
              ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg animate-pulse"
              : hasFeatureConsent('audio')
                ? "bg-blue-50 text-blue-600 hover:shadow-md border border-blue-200"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
          }`}
          title={hasFeatureConsent('audio') ? "Play card content" : "Enable audio in settings to listen"}
        >
          {playingCardIndex === currentCardIndex ? "⏸" : "🔊"} Listen
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
        className={`mx-5 mt-4 rounded-3xl shadow-soft border border-black/5 p-4 flex-1 flex flex-col relative overflow-hidden ${card.gradient}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >

        {/* Replay indicator - shown when user is replaying a card */}
        {isReplaying && currentCardIndex === i && (
          <div className="mb-3 p-3 bg-white rounded-xl flex items-center gap-2 shadow-sm">
            <span className="text-lg">📖</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-ink/70">Replaying this card</p>
              <p className="text-xs text-ink/60 font-medium">No XP earned this time {replayCount > 0 && `• Replayed ${replayCount}x`}</p>
            </div>
          </div>
        )}
        
        <div className={`flex-1 rounded-2xl flex items-center justify-center overflow-hidden bg-white`}>
          {art && card.type === "main" && card.kicker === "Places" ? (
            <img src={art} alt={`${state.name} learning card`} loading="lazy" decoding="async" className="h-full object-contain drop-shadow-xl" />
          ) : (
            <div className="text-[92px] drop-shadow-xl">{card.icon}</div>
          )}
        </div>
        <div className="mt-3 bg-white/80 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Chip icon={card.icon} tone={card.chipTone}>
              {card.chip}
            </Chip>
            <Chip icon="📍" tone="blue">
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
            ← Swipe or tap Next →
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
          className={`w-full h-14 rounded-2xl ${grad} text-white text-display text-lg font-bold shadow-[var(--shadow-glow-orange)]`}
        >
          {isLastInMainCardSection ? (currentMainCardIndex === 5 ? "Take the Quiz! 🎯" : "Done! Back to Cards") : "Got it! Next →"}
        </button>
      </div>

      {/* Audio Permission Prompt */}
      {showAudioPermissionPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="text-center">
              <div className="text-5xl mb-3">🎧</div>
              <h3 className="text-display text-xl font-extrabold text-ink">Enable Audio?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Turn on audio to hear the stories read aloud! 🎵
              </p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <span>🎧</span>
                <span className="font-semibold text-blue-900">Stories read aloud</span>
              </div>
              <div className="flex gap-2">
                <span>🌍</span>
                <span className="font-semibold text-blue-900">Available in multiple languages</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  fxTap();
                  setShowAudioPermissionPrompt(false);
                }}
                className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-800 font-bold text-sm"
              >
                Maybe Later
              </button>
              <Link
                to="/me"
                onClick={() => {
                  fxTap();
                  setShowAudioPermissionPrompt(false);
                }}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold text-sm flex items-center justify-center"
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
}: { stateName?: string; onDone?: () => void; onClose?: () => void } = {}) {
  const progress = useProgress();
  const states = statesWithProgress(progress);
  
  // Safety check: ensure states data is loaded
  if (!states || states.length === 0) {
    return <LoadingScreen />;
  }
  
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
  const [correctCount, setCorrectCount] = useState(0);
  const [quizStartTime] = useState(Date.now());

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
      setCorrectCount((n) => n + 1);
      
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

    // Always move to next question (or finish if last)
    if (isLastQuestion) {
      setNavigationStarted(true);
      
      // Track quiz completion
      const quizDuration = Date.now() - quizStartTime;
      firebaseEvents.quizComplete({
        stateName: activeName,
        questionsAnswered: questions.length,
        correctAnswers: correctCount + 1, // +1 for current correct answer
        scorePercentage: ((correctCount + 1) / questions.length) * 100,
        timeSpentSeconds: quizDuration / 1000,
      })
      
      // Use setTimeout to ensure state is settled before navigation
      setTimeout(() => {
        onDone?.();
      }, 50);
      return;
    }
    setIndex((i) => i + 1);
    setResult(null);
    setSelected(null);
  };

  return (
    <div className="h-full w-full bg-explorer-soft flex flex-col relative">
      <ConfettiBurst trigger={burst} size="small" />
      <div className="px-5 pt-3 pb-2 flex items-center gap-3">
        <button
          onClick={() => {
            fxTap();
            onClose?.();
          }}
          aria-label="Close quiz"
          className="h-12 w-12 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
        >
          ✕
        </button>
        <div className="flex-1 flex items-center gap-1">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-2.5 flex-1 rounded-full ${
                i < index ? "bg-success" : i === index ? "gradient-explorer" : "bg-white"
              }`}
            />
          ))}
        </div>
        <div className="text-display font-extrabold text-explorer">
          Q{index + 1}/{questions.length}
        </div>
        {progress.streak > 0 && (
          <div className="ml-2 text-sm font-bold text-explorer">
            🔥 {progress.streak}
          </div>
        )}
      </div>

      <div className="px-5 mt-3 flex items-center gap-3">
        <img
          key={result === "correct" ? `cheer-${burst}` : "idle"}
          src={mascot}
          alt=""
          className={`w-16 h-16 object-contain ${result === "correct" ? "mascot-cheer" : ""}`}
        />
        <div className="relative bg-white rounded-2xl shadow-soft px-3 py-2 text-sm font-extrabold">
          {result === "correct"
            ? "Nailed it! 🎉"
            : result === "wrong"
            ? "Good try! Let's move on! 👉"
            : "You've got this! 💪"}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-3 h-3 rotate-45 bg-white" />
        </div>
        <div className="ml-auto flex items-center gap-1 bg-white rounded-full px-2.5 py-1 shadow-soft">
          <span>⭐</span>
          <span className="text-display font-extrabold text-sm">+{question.xp}</span>
        </div>
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
              className={`h-16 rounded-2xl px-5 flex items-center justify-between text-display text-lg font-bold shadow-soft border-2 transition-all active:scale-[0.99] hover:scale-[1.02] ${
                isCorrectPick
                  ? "bg-success/10 border-success text-success"
                  : isWrongPick
                  ? "bg-rose-50 border-rose-500 text-rose-600"
                  : isSelected
                  ? "bg-white border-explorer text-explorer shadow-[var(--shadow-glow-blue)]"
                  : "bg-white border-transparent text-ink"
              }`}
            >
              {label}
              <span
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                  isCorrectPick
                    ? "bg-success text-white"
                    : isWrongPick
                    ? "bg-rose-500 text-white"
                    : isSelected
                    ? "gradient-explorer text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCorrectPick ? "✓" : isWrongPick ? "✕" : isSelected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-5">
        <button
          onClick={result ? onReset : onCheck}
          disabled={!selected}
          className={`w-full h-14 rounded-2xl text-white text-display text-lg font-bold shadow-[var(--shadow-glow-blue)] disabled:opacity-50 ${
            result === "correct"
              ? "bg-success"
              : result === "wrong"
              ? "bg-rose-500"
              : "gradient-explorer"
          }`}
        >
          {result === "correct"
            ? isLastQuestion
              ? "Finish Quiz 🎉"
              : "Next Question →"
            : result === "wrong"
            ? isLastQuestion
              ? "Finish Quiz 🎉"
              : "Next Question →"
            : "Check Answer"}
        </button>
      </div>
    </div>
  );
}

export function CorrectAnswerScreen({ stateName }: { stateName?: string } = {}) {
  const state = getState(stateName);
  useEffect(() => { fxCorrect(); }, []);
  return (
    <div className="h-full w-full gradient-success relative overflow-hidden flex flex-col">
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
          <div className="relative h-32 w-32 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <div className="text-6xl">✅</div>
          </div>
        </div>
        <h1 className="mt-6 text-display text-4xl font-extrabold text-white text-center leading-relaxed">
          Awesome!
        </h1>
        <p className="mt-2 text-white/95 font-bold text-center">
          You got it right — {state.capital} is the capital of {state.name}!
        </p>

        <div className="mt-6 rounded-2xl bg-white/20 backdrop-blur px-5 py-3 flex items-center gap-3 text-white">
          <span className="text-3xl">⭐</span>
          <div>
            <div className="text-xs font-bold opacity-90">You earned</div>
            <div className="text-display text-2xl font-extrabold leading-snug">
              +20 XP
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 relative">
        <button className="w-full h-14 rounded-2xl bg-white text-success text-display text-lg font-extrabold shadow-lg animate-pulse active:scale-95 transition-transform">
          Next Question →
        </button>
      </div>
    </div>
  );
}

export function StateCompletedScreen({
  stateName,
  persist = true,
  onContinue,
  onCreatePostcard,
}: { stateName?: string; persist?: boolean; onContinue?: () => void; onCreatePostcard?: () => void } = {}) {
  const state = getState(stateName);
  const art = STATE_ART[state.name];
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";
  const [burstKey, setBurstKey] = useState(0);
  
  useEffect(() => {
    fxConfetti();
    setBurstKey((n) => n + 1);
    if (persist) completeState(state.name);
  }, [state.name, persist]);

  return (
    <div className="h-full w-full gradient-gold relative overflow-hidden flex flex-col items-center">
      <ConfettiBurst trigger={burstKey} size="big" />
      {Array.from({ length: 28 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${(i * 29) % 100}%`,
            top: `${(i * 47) % 70}%`,
            width: 6 + (i % 4) * 2,
            height: 12 + (i % 3) * 3,
            background: ["#FF7A1A", "#2E7DFF", "#fff", "#22C55E", "#F5B301"][i % 5],
            transform: `rotate(${i * 15}deg)`,
          }}
        />
      ))}

      <div className="mt-10 text-center relative px-6">
        <div className="text-white/90 text-xs font-black uppercase tracking-[0.3em]">
          State Complete
        </div>
        <h1 className="text-display text-4xl font-extrabold text-white mt-1 drop-shadow leading-relaxed">
          {state.name} Cleared!
        </h1>
      </div>

      <div className="mt-8 relative">
        <div className="absolute inset-0 blur-3xl bg-white/40 rounded-full" />
        <div className="relative h-48 w-48 rounded-full bg-white flex items-center justify-center shadow-2xl border-8 border-white">
          <div className={`h-full w-full rounded-full ${grad} flex flex-col items-center justify-center text-white px-2`}>
            {art ? (
              <img src={art} alt="" loading="lazy" decoding="async" className="h-20 object-contain drop-shadow" />
            ) : (
              <div className="text-[54px] leading-none drop-shadow">{state.emoji}</div>
            )}
            <div className="text-display font-extrabold text-sm mt-1 text-center leading-tight uppercase">
              {state.name}
            </div>
            <div className="text-[9px] font-bold opacity-90">EXPLORER · LVL 1</div>
          </div>
        </div>
        <img
          src={mascot}
          alt=""
          className="absolute -left-14 bottom-0 w-24 h-24 object-contain mascot-cheer drop-shadow"
        />
      </div>

      <div className="mt-6 w-full px-6">
        {/* Combined Achievement Card - Less visual clutter */}
        <div className="rounded-3xl bg-white/30 backdrop-blur-xl p-5 text-white text-center border border-white/40 shadow-lg">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] opacity-90 mb-3">
            Achievements
          </div>
          
          {/* Badges in compact row */}
          <div className="flex justify-center gap-2 mb-4">
            {[
              { icon: state.monument, name: "Monument" },
              { icon: state.animal, name: "Animal" },
              { icon: "🎖️", name: "Explorer" },
            ].map((b) => (
              <div
                key={b.name}
                className="h-12 w-12 rounded-full bg-white/25 flex items-center justify-center text-lg animate-fade-in border border-white/30"
                title={b.name}
              >
                {b.icon}
              </div>
            ))}
          </div>

          {/* XP + Stamp in single row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/15 rounded-xl p-2">
              <div className="text-lg">⭐</div>
              <div className="text-display text-sm font-extrabold leading-tight">+250 XP</div>
            </div>
            <div className="bg-white/15 rounded-xl p-2">
              <div className="text-lg">📜</div>
              <div className="text-display text-sm font-extrabold leading-tight">Stamp</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-6 w-full space-y-3">
        {/* Primary CTA: Add Stamp */}
        <button
          onClick={() => {
            fxTap();
            onCreatePostcard?.();
          }}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 text-white text-display text-lg font-extrabold shadow-xl active:scale-95 transition-transform"
        >
          ✨ Add Stamp
        </button>

        {/* Secondary CTA: Skip to Next State */}
        <button
          onClick={() => {
            fxTap();
            onContinue?.();
          }}
          className="w-full h-12 rounded-xl bg-white/30 text-white text-display font-bold shadow-lg active:scale-95 transition-transform backdrop-blur-sm"
        >
          ⏭️ Skip to Next State
        </button>
      </div>
    </div>
  );
}

export function StateUnlockScreen({
  stateName,
  onContinue,
}: { stateName?: string; onContinue?: () => void } = {}) {
  const state = stateName ? getState(stateName) : (INDIA_STATES && INDIA_STATES.length > 1 ? INDIA_STATES[1] : INDIA_STATES[0] || { name: "India", emoji: "🇮🇳", nickname: "Incredible India" });
  const art = STATE_ART[state.name];
  return (
    <div className="h-full w-full gradient-explorer relative overflow-hidden flex flex-col">
      <Cloud className="absolute top-10 left-2 w-28 opacity-90" />
      <Cloud className="absolute top-20 right-0 w-24 opacity-85" />
      <Cloud className="absolute bottom-56 left-0 w-32 opacity-80" />

      <div className="text-center pt-8 relative z-10 px-6">
        <div className="text-white/90 text-xs font-black uppercase tracking-[0.3em]">
          New State Unlocked
        </div>
        <h1 className="text-display text-4xl font-extrabold text-white mt-1 drop-shadow leading-relaxed">
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
          <div className="relative text-[130px] drop-shadow-2xl animate-fade-in">
            {state.emoji}
          </div>
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
          className="w-full h-14 rounded-2xl bg-white text-explorer text-display text-lg font-extrabold shadow-xl"
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
  const color = {
    orange: "#FF7A1A",
    blue: "#2E7DFF",
    green: "#22C55E",
    gold: "#F5B301",
  }[tone];
  if (!filled) {
    return (
      <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground">
        <div className="text-3xl opacity-40">🔒</div>
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
      className="relative aspect-square rounded-2xl bg-[#f5e6c8] flex flex-col items-center justify-center active:scale-95 transition-transform cursor-pointer"
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
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
        >
          ✕
        </button>

        {/* Badge Display */}
        <div className="flex flex-col items-center pt-2">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center text-5xl mb-4 ${
              badge.done
                ? "gradient-saffron shadow-lg"
                : "bg-gradient-to-br from-gray-200 to-gray-300 opacity-60"
            }`}
          >
            {badge.done ? badge.icon : "🔒"}
          </div>

          <h2 className="text-display text-2xl font-extrabold text-ink">
            {badge.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{state}</p>
        </div>

        {/* Unlock Information */}
        {!badge.done && (
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
            <p className="text-display text-sm font-extrabold text-amber-900 mb-2">
              How to Unlock
            </p>
            <p className="text-sm font-semibold text-amber-800">{unlockText}</p>
          </div>
        )}

        {/* Badge Info */}
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
          <p className="text-display text-sm font-extrabold text-blue-900 mb-1">
            Badge Type
          </p>
          <p className="text-sm font-semibold text-blue-800">
            {badge.name === "Monument" && "🏛️ Learn about famous landmarks"}
            {badge.name === "Animal" && "🦁 Discover local wildlife"}
            {badge.name === "Explorer" && "🎖️ Master all cards in this state"}
          </p>
        </div>

        {/* Status */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl bg-gray-100 text-display font-extrabold text-gray-700 hover:bg-gray-200 transition"
          >
            Close
          </button>
          {badge.done && (
            <button
              onClick={() => {
                fxConfetti();
                onClose();
              }}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-display font-extrabold text-white shadow-lg hover:shadow-xl transition"
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
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const unlockedCount = unlockedAchievementBadgeCount(progress);
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

  const tierConfig = {
    seedling: { 
      icon: "🌱", 
      label: "Seedling", 
      gradient: "gradient-saffron",
      bgTone: "saffron-soft",
      borderTone: "border-saffron/30",
    },
    growing: { 
      icon: "🌿", 
      label: "Growing", 
      gradient: "gradient-success",
      bgTone: "success-soft",
      borderTone: "border-success/30",
    },
    mighty: { 
      icon: "🌳", 
      label: "Mighty", 
      gradient: "gradient-explorer",
      bgTone: "explorer-soft",
      borderTone: "border-explorer/30",
    },
    elite: { 
      icon: "🌲", 
      label: "Elite", 
      gradient: "gradient-gold",
      bgTone: "gold-soft",
      borderTone: "border-gold/30",
    },
  };

  const tiers: AchievementBadgeTier[] = ["seedling", "growing", "mighty", "elite"];

  const getTierConfig = (tier: AchievementBadgeTier) => {
    return tierConfig[tier];
  };

  const getBadgeBackgroundColor = (tier: AchievementBadgeTier, unlocked: boolean) => {
    if (!unlocked) return "bg-gray-50";
    const config = getTierConfig(tier);
    return `bg-${config.bgTone}`;
  };

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      {/* Combined Header - Avatar + Name + Badge Stats (120px) */}
      <div className="px-5 pt-3 pb-4 gradient-saffron rounded-b-[32px] relative overflow-hidden animate-fade-in">
        <Cloud className="absolute top-2 right-4 w-14 opacity-40 pointer-events-none" />
        
        {/* PART A: Avatar + Name (flex items-center gap-3) */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-white shadow-soft p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={getAvatarImage(progress.avatar)} alt={getAvatarName(progress.avatar)} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-white">
            <div className="text-display text-lg font-bold leading-tight">
              {progress.name}
            </div>
            <div className="text-xs font-bold text-white/80">Achievement Collection</div>
          </div>
        </div>

        {/* PART B: Badge Stats (mt-3, bg-white/15 backdrop-blur p-3) */}
        <div className="mt-3 rounded-2xl bg-white/15 backdrop-blur p-4 relative transition-all duration-700 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between text-white gap-3">
            <div>
              <div className="text-xs font-bold opacity-90 uppercase tracking-wide">Achievements</div>
              <div className="text-display text-2xl font-extrabold mt-1">
                {unlockedCount}<span className="text-lg opacity-80 ml-1">/ 20</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="text-xs font-extrabold opacity-90">
                {Math.round((unlockedCount / 20) * 100)}% Unlocked
              </div>
              <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-200 via-yellow-100 to-white rounded-full transition-all duration-500"
                  style={{ width: `${(unlockedCount / 20) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div className="px-5 flex-1 overflow-auto space-y-4 pb-4 pt-4">
        {tiers.map((tier, tierIdx) => {
          const badges = achievementBadgesForTier(progress, tier);
          const config = getTierConfig(tier);
          const tierUnlocked = badges.filter((b) => b.unlocked).length;

          return (
            <div key={tier} className="animate-fade-in" style={{ animationDelay: `${tierIdx * 100}ms` }}>
              {/* Tier Header */}
              <div className={`rounded-2xl bg-${config.bgTone} border ${config.borderTone} p-4 shadow-soft`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{config.icon}</div>
                    <div>
                      <div className="text-display font-extrabold text-lg text-ink">{config.label}</div>
                      <div className="text-xs font-bold text-muted-foreground">{tierUnlocked}/{badges.length} badges unlocked</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {badges.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 w-2 rounded-full transition-all ${
                          idx < tierUnlocked
                            ? config.gradient.split("-")[1] === "saffron" ? "bg-saffron" 
                            : config.gradient.split("-")[1] === "success" ? "bg-success"
                            : config.gradient.split("-")[1] === "explorer" ? "bg-explorer"
                            : "bg-gold"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Badge Grid */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                {badges.map((badge, badgeIdx) => (
                  <button
                    key={badge.id}
                    onClick={() => {
                      fxTap();
                      setSelectedBadge(badge);
                    }}
                    className={`rounded-2xl p-3 flex flex-col items-center gap-2.5 border transition-transform active:scale-95 ${
                      badge.unlocked
                        ? `bg-white shadow-soft border-black/5 hover:shadow-md`
                        : "bg-gray-50 border-gray-200 shadow-sm opacity-70 hover:opacity-85"
                    }`}
                    style={{ animationDelay: `${badgeIdx * 50}ms` }}
                  >
                    {/* Badge Icon */}
                    <div className={`text-5xl transition-transform ${
                      badge.unlocked ? "scale-100" : "scale-75 opacity-60"
                    }`}>
                      {badge.icon}
                    </div>

                    {/* Badge Name */}
                    <div className={`text-display text-xs font-extrabold text-center leading-tight max-w-[70px] ${
                      badge.unlocked 
                        ? "text-ink"
                        : "text-muted-foreground"
                    }`}>
                      {badge.name}
                    </div>

                    {/* Progress or Unlocked */}
                    {!badge.unlocked ? (
                      <div className="text-[10px] font-bold text-muted-foreground mt-1">
                        {badge.progress}/{badge.achievementMax}
                      </div>
                    ) : (
                      <div className="text-[9px] font-extrabold text-success mt-1 px-2 py-0.5 bg-green-50 rounded-full">
                        ✓ Unlocked
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 flex flex-col gap-4 animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
            >
              ✕
            </button>

            {/* Badge Display */}
            <div className="flex flex-col items-center pt-4">
              <div className={`h-24 w-24 rounded-full flex items-center justify-center text-5xl ${
                selectedBadge.unlocked
                  ? getTierConfig(selectedBadge.tier).gradient
                  : "bg-gray-100"
              } shadow-lg`}>
                {selectedBadge.icon}
              </div>

              <h2 className="text-display text-3xl font-extrabold text-ink mt-4">
                {selectedBadge.name}
              </h2>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                {selectedBadge.tier} Tier Badge
              </p>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-semibold text-blue-900 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            {/* Progress or Success */}
            {!selectedBadge.unlocked ? (
              <div className="rounded-2xl bg-saffron-soft border border-saffron/30 p-4">
                <div className="text-xs font-extrabold text-saffron uppercase tracking-wider mb-3">
                  📈 Unlock Progress
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 rounded-full bg-white border border-saffron/20 overflow-hidden">
                    <div
                      className="h-full gradient-saffron rounded-full transition-all duration-500"
                      style={{ width: `${(selectedBadge.progress / selectedBadge.achievementMax) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-saffron whitespace-nowrap">
                    {selectedBadge.progress}/{selectedBadge.achievementMax}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-success-soft border border-success/30 p-4">
                <div className="text-xs font-extrabold text-success uppercase tracking-wider">
                  ✨ Unlocked
                </div>
                <p className="text-sm font-bold text-success mt-2">
                  🎉 Amazing achievement! Keep exploring!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setSelectedBadge(null)}
                className="flex-1 h-12 rounded-2xl bg-gray-100 text-display font-extrabold text-gray-800 active:scale-95 transition"
              >
                Close
              </button>
              {selectedBadge.unlocked && (
                <button
                  onClick={() => {
                    fxConfetti();
                    setSelectedBadge(null);
                  }}
                  className="flex-1 h-12 rounded-2xl gradient-gold text-display font-extrabold text-white shadow-lg active:scale-95 transition"
                >
                  🎉 Celebrate!
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProfileScreen() {
  const p = useProgress();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(p.name);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(p.avatar as AvatarId);
  const [showFilePermissionDialog, setShowFilePermissionDialog] = useState(false);
  const [hasFileConsent, setHasFileConsent] = useState(() => {
    if (typeof window === "undefined") return false;
    return hasFeatureConsent('file');
  });
  const [showResetPINDialog, setShowResetPINDialog] = useState(false);
  
  // Subscribe to file consent changes
  useEffect(() => {
    const unsubscribe = subscribeConsentChanges('file', () => {
      setHasFileConsent(hasFeatureConsent('file'));
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
  
  // Route guard: redirect to welcome if not onboarded (defensive check)
  if (!p.onboarded) {
    appLogger.warn('profile_screen', 'User attempted to access profile without onboarding', {});
    return <Navigate to="/welcome" replace />;
  }
  
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
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      <div className="relative gradient-explorer px-5 pt-4 pb-14 rounded-b-[36px] animate-fade-in">
        <Cloud className="absolute top-2 right-2 w-16 opacity-40" />
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center"
          >
            ‹
          </button>
          <div className="text-display font-extrabold text-white">Profile</div>
          <button
            onClick={() => {
              fxTap();
              setShowResetPINDialog(true);
            }}
            title="Reset progress (requires PIN)"
            className="h-10 w-10 rounded-full bg-white/40 hover:bg-white/60 text-white flex items-center justify-center transition active:scale-90 font-extrabold text-lg"
          >
            ⟲
          </button>
        </div>
        <div className="flex flex-col items-center mt-4">
          <div className="relative animate-bounce" style={{ animationDelay: "0ms" }}>
            <div className="h-24 w-24 rounded-3xl bg-white p-2 shadow-xl flex items-center justify-center text-5xl overflow-hidden">
              <img 
                src={getAvatarImage(p.avatar)} 
                alt={getAvatarName(p.avatar)}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full gradient-gold text-white flex items-center justify-center text-display text-sm font-extrabold border-4 border-white">
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
                className="h-12 rounded-xl bg-white text-center text-display text-lg font-extrabold text-ink outline-none border-2 border-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  disabled={saveStatus === "saving"}
                  className={`flex-1 h-10 rounded-lg text-display font-extrabold text-white text-sm transition ${
                    saveStatus === "saved"
                      ? "bg-green-400"
                      : saveStatus === "saving"
                        ? "bg-white/50"
                        : "bg-white/80 hover:bg-white"
                  }`}
                >
                  {saveStatus === "saved" ? "✓ Saved" : saveStatus === "saving" ? "Saving..." : "Save"}
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
                  ✏️
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
        <div className="rounded-3xl bg-white shadow-soft border border-black/5 p-4 grid grid-cols-3 divide-x divide-black/5">
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
            className="w-full rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex items-center gap-3 transition active:scale-[0.99]"
          >
            <div className="h-12 w-12 rounded-2xl gradient-saffron flex items-center justify-center text-2xl">
              🎭
            </div>
            <div className="flex-1 text-left">
              <div className="text-display font-extrabold text-[15px] leading-tight">
                Change Avatar
              </div>
              <div className="text-[11px] font-bold text-muted-foreground">
                {getAvatarName(p.avatar)} · Tap to select
              </div>
            </div>
            <div className="text-muted-foreground text-xl">{isSelectingAvatar ? '✕' : '›'}</div>
          </button>

          {/* Avatar Selection Grid */}
          {isSelectingAvatar && (
            <div className="mt-3 rounded-2xl bg-white shadow-soft border border-black/5 p-4 animate-fade-in">
              <div className="grid grid-cols-4 gap-2">
                {avatarImages.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleChangeAvatar(a.id)}
                    className={`aspect-square rounded-2xl flex items-center justify-center border-4 transition transform overflow-hidden ${
                      a.id === p.avatar
                        ? "border-saffron shadow-[var(--shadow-glow-orange)] scale-110"
                        : "border-gray-200 hover:scale-105"
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

        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <AudioSettingRow />
        </div>

        {/* File Permission Toggle - for saving postcards to photos */}
        <div className="animate-fade-in" style={{ animationDelay: "210ms" }}>
          {hasFileConsent ? (
            // When permission is granted, show revoke button
            <button
              onClick={() => {
                revokeFeatureConsent('file');
                fxTap();
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:border-red-300 hover:bg-red-50 transition"
            >
              {/* Left: Icon & Labels */}
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">📸</div>
                <div className="text-left">
                  <div className="font-bold text-ink">Save Pictures</div>
                  <div className="text-xs text-green-700 font-semibold">
                    ✓ Permission granted
                  </div>
                </div>
              </div>

              {/* Right: Revoke Button */}
              <div className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-full flex-shrink-0 ml-4">
                Revoke
              </div>
            </button>
          ) : (
            // When permission is not granted, show grant button
            <button
              onClick={() => setShowFilePermissionDialog(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"
            >
              {/* Left: Icon & Labels */}
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">📸</div>
                <div className="text-left">
                  <div className="font-bold text-ink">Save Pictures</div>
                  <div className="text-xs text-muted-foreground">
                    Ask permission to save
                  </div>
                </div>
              </div>

              {/* Right: Status Indicator */}
              <div className={`inline-flex h-8 w-14 items-center rounded-full transition-all flex-shrink-0 ml-4 bg-gray-300`}>
                <div className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform translate-x-1`} />
              </div>
            </button>
          )}
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "225ms" }}>
          <Link
            to="/badges"
            onClick={() => fxTap()}
            className="rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex items-center gap-3 transition active:scale-[0.99]"
          >
            <div className="h-12 w-12 rounded-2xl gradient-gold flex items-center justify-center text-2xl">
              🏆
            </div>
            <div className="flex-1">
              <div className="text-display font-extrabold text-[15px] leading-tight">
                Achievements
              </div>
              <div className="text-[11px] font-bold text-muted-foreground">
                {unlockedAchievementBadgeCount(p)}/20 badges earned
              </div>
            </div>
            <div className="text-muted-foreground text-xl">›</div>
          </Link>
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
              <div className="rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex flex-col gap-2 transition">
                {/* Header Row */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl gradient-success flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div className="flex-1">
                    <div className="text-display font-extrabold text-[15px] leading-tight">
                      Daily Goals
                    </div>
                    <div className="text-[11px] font-bold text-muted-foreground">
                      🔥 {p.streak} day streak
                    </div>
                  </div>
                </div>

                {/* Daily Challenge */}
                <div className="ml-15 text-[13px] font-extrabold text-ink">
                  📍 {dailyGoalText}
                </div>

                {/* Next Reward */}
                <div className="ml-15 text-[11px] font-bold text-amber-600">
                  {daysUntilNext === 0 
                    ? "🎁 Claim your milestone reward!" 
                    : `🎁 ${daysUntilNext} day${daysUntilNext !== 1 ? 's' : ''} until ${nextMilestone}-day bonus!`}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          {/* Parent Zone */}
          <ParentZonePlaceholder />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "350ms" }}>
          <Link
            to="/privacy"
            onClick={() => fxTap()}
            className="rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex items-center gap-3 transition active:scale-[0.99]"
          >
            <div className="h-12 w-12 rounded-2xl gradient-explorer flex items-center justify-center text-2xl">
              🔒
            </div>
            <div className="flex-1">
              <div className="text-display font-extrabold text-[15px] leading-tight">
                Privacy Policy
              </div>
              <div className="text-[11px] font-bold text-muted-foreground">How we handle your data</div>
            </div>
            <div className="text-muted-foreground text-xl">›</div>
          </Link>
        </div>
      </div>

      {/* File Permission Dialog - for saving postcards */}
      <FilePermissionDialog
        open={showFilePermissionDialog}
        onAccept={() => {
          setShowFilePermissionDialog(false);
          setHasFileConsent(true);
          fxTap();
        }}
        onReject={() => {
          setShowFilePermissionDialog(false);
          fxTap();
        }}
      />

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

  // Removed: fileEnabled toggle - now using parental-consent system via hasFeatureConsent('file')

  return (
    <div className="space-y-3">
      {/* Sound Effects Toggle - Controls volume/output, not initialization */}
      <button
        type="button"
        role="switch"
        aria-checked={soundOn}
        aria-label="Sound effects volume"
        onClick={toggleSound}
        className="w-full rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex items-center gap-3 transition active:scale-[0.99]"
      >
        <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">
          🔊
        </div>
        <div className="flex-1 text-left">
          <div className="text-display font-extrabold text-[15px] leading-tight">Sound Effects</div>
          <div className="text-[11px] font-bold text-muted-foreground">
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

      {/* Audio Permission */}
      <button
        type="button"
        role="switch"
        aria-checked={audioEnabled}
        aria-label="Audio narration permission"
        onClick={toggleAudio}
        className="w-full rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex items-center gap-3 transition active:scale-[0.99]"
      >
        <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
          🎧
        </div>
        <div className="flex-1 text-left">
          <div className="text-display font-extrabold text-[15px] leading-tight">Audio Narration</div>
          <div className="text-[11px] font-bold text-muted-foreground">
            {audioEnabled ? "Stories are read aloud" : "Turn on to hear stories"}
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

      {/* File Save Permission */}
      <button
        type="button"
        role="switch"
        aria-checked={fileEnabled}
        aria-label="File save permission"
        onClick={toggleFile}
        className="w-full rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex items-center gap-3 transition active:scale-[0.99]"
      >
        <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
          📁
        </div>
        <div className="flex-1 text-left">
          <div className="text-display font-extrabold text-[15px] leading-tight">Save & Share</div>
          <div className="text-[11px] font-bold text-muted-foreground">
            {fileEnabled ? "Can save stamps" : "Turn on to save stamps"}
          </div>
        </div>
        <span
          className={`h-7 w-12 rounded-full flex items-center px-1 transition ${fileEnabled ? "gradient-success" : "bg-muted"}`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${fileEnabled ? "translate-x-5" : "translate-x-0"}`}
          />
        </span>
      </button>
    </div>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  // Add encouragement messages for "0" stats
  const getEncouragement = (val: string, lbl: string): string => {
    if (val === "0") {
      switch (lbl) {
        case "XP":
          return "Ready to start!";
        case "States":
          return "Time to explore!";
        case "Badges":
          return "Earn in quizzes!";
        default:
          return "Keep going!";
      }
    }
    return "";
  };

  const encouragement = getEncouragement(value, label);

  return (
    <div className="flex flex-col items-center py-1">
      <div className="text-display text-xl font-extrabold">{value}</div>
      {encouragement ? (
        <div className="text-[9px] font-bold uppercase tracking-wider text-amber-600 leading-tight mt-0.5">
          {encouragement}
        </div>
      ) : (
        <div className="text-xs font-bold text-muted-foreground">
          {label}
        </div>
      )}
    </div>
  );
}

function ParentZonePlaceholder() {
  const [showSettings, setShowSettings] = useState(false);
  const [newPIN, setNewPIN] = useState("");
  const [pinSaveStatus, setPinSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleSavePIN = () => {
    if (newPIN.length !== 4) {
      alert("PIN must be 4 digits");
      return;
    }
    
    setPinSaveStatus("saving");
    try {
      localStorage.setItem("india-explorer:parent-pin:v1", newPIN);
      setPinSaveStatus("saved");
      setTimeout(() => {
        setShowSettings(false);
        setNewPIN("");
        setPinSaveStatus("idle");
      }, 1500);
    } catch (e) {
      alert("Failed to save PIN");
      setPinSaveStatus("idle");
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 p-3 transition">
      <button
        onClick={() => {
          fxTap();
          setShowSettings(!showSettings);
        }}
        className="w-full flex items-center gap-3 hover:opacity-80 transition"
      >
        <div className="h-12 w-12 rounded-2xl bg-blue-200 flex items-center justify-center text-2xl flex-shrink-0">
          👨‍👩‍👧
        </div>
        <div className="flex-1 text-left">
          <div className="text-display font-extrabold text-[15px] leading-tight text-blue-900">
            Parent Zone
          </div>
          <div className="text-[11px] font-bold text-blue-700">
            Tap to configure PIN & parental settings
          </div>
        </div>
        <div className="text-blue-900 text-lg">{showSettings ? '▼' : '›'}</div>
      </button>

      {/* PIN Settings Panel */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t-2 border-blue-300 space-y-3 animate-fade-in">
          <div>
            <label className="text-xs font-bold text-blue-900 block mb-1">
              Parental PIN (4 digits)
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPIN}
              onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 4-digit PIN"
              className="w-full h-10 rounded-lg border-2 border-blue-300 px-3 font-extrabold text-center text-lg tracking-widest text-blue-900"
            />
            <div className="text-[10px] text-blue-700 mt-1">
              💡 Used to reset progress. Default: 1234
            </div>
          </div>
          <button
            onClick={handleSavePIN}
            disabled={newPIN.length !== 4 || pinSaveStatus === "saving"}
            className={`w-full h-10 rounded-lg font-bold text-sm transition text-white ${
              pinSaveStatus === "saved"
                ? "bg-green-500"
                : "bg-blue-600 disabled:opacity-50 hover:bg-blue-700"
            }`}
          >
            {pinSaveStatus === "saved" ? "✓ PIN Saved" : pinSaveStatus === "saving" ? "Saving..." : "Save PIN"}
          </button>
          <button
            onClick={() => {
              fxTap();
              setShowSettings(false);
              setNewPIN("");
              setPinSaveStatus("idle");
            }}
            className="w-full h-10 rounded-lg font-bold text-sm bg-white text-blue-900 hover:bg-blue-50 border border-blue-300"
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
      className="rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex items-center gap-3 transition active:scale-[0.99]"
    >
      <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-display font-extrabold text-[15px] leading-tight">
          {title}
        </div>
        <div className="text-[11px] font-bold text-muted-foreground">{sub}</div>
      </div>
      <div className="text-muted-foreground text-xl">›</div>
    </Link>
  );
}

export function AchievementsScreen() {
  const progress = useProgress();
  const items = achievementsFor(progress);
  const unlocked = items.filter((a) => a.done).length;

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      <HeaderBar title="Achievements" />
      <div className="px-5 pb-3">
        <div className="rounded-2xl bg-white shadow-soft border border-black/5 px-4 py-3 flex items-center justify-between">
          <div className="text-[12px] font-extrabold text-muted-foreground uppercase tracking-wider">
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
            className={`rounded-3xl bg-white shadow-soft border p-4 flex items-center gap-3 ${
              a.done ? "border-[color:var(--gold)]/40" : "border-black/5"
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
              <div className="text-[11px] font-bold text-muted-foreground">
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
                  <span className="text-[11px] font-extrabold text-muted-foreground">
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
        <div className="text-display text-2xl font-extrabold">Flying to Gujarat…</div>
        <div className="text-sm font-bold text-muted-foreground mt-1">
          Packing camel snacks 🐪
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
        <p className="mt-2 text-sm font-bold text-muted-foreground max-w-[260px]">
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
