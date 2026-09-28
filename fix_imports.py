#!/usr/bin/env python3
"""Add necessary imports to each extracted module"""

import os

screens_dir = 'd:\\NishaanTech\\state-quest-adventure\\src\\screens'

# Common imports needed by all modules
common_imports = """import mascot from "@/assets/mascot.png";
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
import { ParentalConsentDialog } from "@/components/ParentalConsentDialog";
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
import { DailyGoalCard } from "@/components/DailyGoalCard";
import { lazy, Suspense } from "react";
const IndiaProgressMap = lazy(() => import("@/components/IndiaProgressMap").then(m => ({ default: m.IndiaProgressMap })));
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
  PERFORMANCE_BADGES,
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
  type PerformanceBadgeId,
  ALL_BADGE_IDS,
  achievementBadgesFor,
  achievementBadgesForTier,
  unlockedAchievementBadgeCount,
  type AchievementBadge,
  type AchievementBadgeTier,
  type Progress,
  type StatePerformance,
  getReplayCount,
  type Achievement,
  type PostcardData,
  getStreakStatus,
  getStreakMilestone,
  getNextAchievementBadge,
  getPostcardsArray,
  getTotalStampCount,
  recordCardRead,
  recordReplay,
  getRecentlyCompletedState,
  clearRecentlyCompleted,
  markRecentlyCompleted,
} from "@/lib/progress";

// Shared imports from other modules
import { 
  AVATAR_IMAGE_MAP, 
  getAvatarImage, 
  getAvatarName, 
  Cloud, 
  XPBar, 
  Chip, 
  useGoBack 
} from "./shared";

const TOTAL_STATES = 36;

"""

# Module-specific imports
module_imports = {
    'onboarding': common_imports,
    'home': common_imports,
    'journey': common_imports,
    'learning': common_imports,
    'quiz': common_imports,
    'progression': common_imports,
    'passport': common_imports,
    'badges': common_imports,
    'profile': common_imports,
    'achievements': common_imports,
}

# HeaderBar component needed by several modules
header_bar = """
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

"""

# BottomNav component needed by home module
bottom_nav = """
export function BottomNav({
  active,
}: {
  active: "home" | "map" | "explorer" | "badges" | "profile";
}) {
  const items = [
    { id: "home", icon: "🏠", label: "Home", to: "/home" },
    { id: "map", icon: "🗺️", label: "Journey", to: "/journey" },
    { id: "explorer", icon: "🔍", label: "Explorer", to: "/explorer" },
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

"""

# Modules that need HeaderBar
modules_with_header = ['learning', 'profile', 'journey']
modules_with_bottom_nav = ['home']

for module_name in ['onboarding', 'home', 'journey', 'learning', 'quiz', 'progression', 'passport', 'badges', 'profile', 'achievements']:
    file_path = os.path.join(screens_dir, f'{module_name}.tsx')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Build imports
    imports = module_imports[module_name]
    
    # Add HeaderBar if needed
    if module_name in modules_with_header:
        imports += header_bar
    
    # Add BottomNav if needed
    if module_name in modules_with_bottom_nav:
        imports += bottom_nav
    
    # Write back with imports
    new_content = imports + '\n' + content
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Fixed imports in {module_name}.tsx")

print("\nAll imports fixed!")
