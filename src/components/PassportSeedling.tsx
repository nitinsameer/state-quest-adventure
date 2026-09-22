import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProgress, type PostcardData } from "@/lib/progress";
import { REGIONS, REGION_KEYS, getProgressPercentage } from "@/lib/passport-helpers";
import { getState } from "@/lib/states";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { PostcardModal } from "@/components/PostcardModal";
import { fxTap } from "@/lib/fx";
import avatarExplorerHat from "@/assets/avatars/avatar-explorer-hat.png";
import avatarExplorerPink from "@/assets/avatars/avatar-explorer-pink.png";
import avatarGeekGlasses from "@/assets/avatars/avatar-geek-glasses.png";
import avatarGirlPeace from "@/assets/avatars/avatar-girl-peace.png";
import avatarTurbanRed from "@/assets/avatars/avatar-turban-red.png";
import avatarGirlEarring from "@/assets/avatars/avatar-girl-earring.png";
import avatarBoySMile from "@/assets/avatars/avatar-boy-smile.png";
import avatarGirlTikka from "@/assets/avatars/avatar-girl-tikka.png";
import avatarSkiGoggles from "@/assets/avatars/avatar-ski-goggles.png";
import avatarFarmerHat from "@/assets/avatars/avatar-farmer-hat.png";
import avatarSportsCap from "@/assets/avatars/avatar-sports-cap.png";
import avatarGirlFlower from "@/assets/avatars/avatar-girl-flower.png";
import type { AvatarId } from "@/lib/avatar-config";

/**
 * My Stamps for Ages 6-7 (Seedling)
 * Organized by regions, full state names with emojis
 */
export function PassportSeedling() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof REGIONS>("north");
  const [burst, setBurst] = useState(0);
  const [selectedPostcard, setSelectedPostcard] = useState<PostcardData | null>(null);

  // Map avatar IDs to image imports
  const AVATAR_IMAGE_MAP: Record<AvatarId, string> = {
    "explorer-hat": avatarExplorerHat,
    "explorer-pink": avatarExplorerPink,
    "geek-glasses": avatarGeekGlasses,
    "girl-peace": avatarGirlPeace,
    "turban-red": avatarTurbanRed,
    "girl-earring": avatarGirlEarring,
    "boy-smile": avatarBoySMile,
    "girl-tikka": avatarGirlTikka,
    "ski-goggles": avatarSkiGoggles,
    "farmer-hat": avatarFarmerHat,
    "sports-cap": avatarSportsCap,
    "girl-flower": avatarGirlFlower,
  };

  // Get avatar image by ID
  function getAvatarImage(avatarId: string): string {
    if (!avatarId) return avatarExplorerHat;
    return AVATAR_IMAGE_MAP[avatarId as AvatarId] || avatarExplorerHat;
  }

  // Get avatar display name
  function getAvatarName(avatarId: string): string {
    const names: Record<string, string> = {
      "explorer-hat": "Mia",
      "explorer-pink": "Alex",
      "geek-glasses": "Rohan",
      "girl-peace": "Priya",
      "turban-red": "Ishaan",
      "girl-earring": "Zara",
      "boy-smile": "Aditya",
      "girl-tikka": "Anaya",
      "ski-goggles": "Karan",
      "farmer-hat": "Vikram",
      "sports-cap": "Nikhil",
      "girl-flower": "Diya",
    };
    return names[avatarId] || "Explorer";
  }

  const region = REGIONS[selectedRegion];
  const regionStates = region.states;
  const unlockedInRegion = regionStates.filter((s) => progress.completed.includes(s.name));
  const regionProgress = `${unlockedInRegion.length} of ${regionStates.length}`;

  const handleStateClick = (stateName: string) => {
    fxTap();
    if (progress.completed.includes(stateName)) {
      // Show postcard with celebration
      if (progress.postcards[stateName]) {
        setSelectedPostcard(progress.postcards[stateName]);
        setBurst(b => b + 1);
        return;
      }
    }
  };

  const handleRegionChange = (newRegion: keyof typeof REGIONS) => {
    fxTap();
    setSelectedRegion(newRegion);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white flex flex-col overflow-hidden">
      <ConfettiBurst trigger={burst} size="big" />

      {/* Postcard Modal - shown on same screen */}
      {selectedPostcard && (
        <PostcardModal
          postcard={selectedPostcard}
          onClose={() => setSelectedPostcard(null)}
        />
      )}

      {/* Header with Postcard Library Link - Proposal C */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">🎫 My Stamps</h1>
        <button
          onClick={() => {
            fxTap();
            navigate({ to: "/explorer/postcard-library" });
          }}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition active:scale-95 flex items-center gap-2"
          title="View all your postcards with granular consent controls"
        >
          📸 Library
        </button>
      </div>

      {/* Profile Card - EXPANDED to 140px */}
      <div className="mx-5 mt-5 p-5 rounded-3xl bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-lg">
        {/* ROW 1: Avatar + User Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-2xl bg-white p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              src={getAvatarImage(progress.avatar)} 
              alt={getAvatarName(progress.avatar)}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="text-lg font-extrabold">{progress.name}</div>
            <div className="text-xs opacity-75">Passport No: IN-2026-{String(Math.random() * 10000).padStart(4, "0")}</div>
            <div className="text-xs opacity-90 mt-1">Age Band: {progress.ageBand}</div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/30 mb-4"></div>

        {/* ROW 2: Stats Row */}
        <div className="flex justify-between mb-4">
          <div className="text-center">
            <div className="text-2xl">🗺️</div>
            <div className="text-sm font-extrabold mt-1">{progress.completed.filter(s => {
              const state = getState(s);
              return state.kind !== "ut";
            }).length}/28</div>
            <div className="text-xs opacity-90">States</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">🏝️</div>
            <div className="text-sm font-extrabold mt-1">{progress.completed.filter(s => {
              const state = getState(s);
              return state.kind === "ut";
            }).length}/8</div>
            <div className="text-xs opacity-90">UTs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">📊</div>
            <div className="text-sm font-extrabold mt-1">{Math.round((progress.completed.length / 36) * 100)}%</div>
            <div className="text-xs opacity-90">Complete</div>
          </div>
        </div>

        {/* ROW 3: Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-90">Journey Progress</span>
            <span className="text-xs font-bold opacity-90">{Math.round((progress.completed.length / 36) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-yellow-200 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((progress.completed.length / 36) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Region Tabs */}
      <div className="mt-4 px-5 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {REGION_KEYS.map((key) => {
            const reg = REGIONS[key];
            const isSelected = key === selectedRegion;
            return (
              <button
                key={key}
                onClick={() => handleRegionChange(key)}
                className={`px-4 py-2 rounded-full font-extrabold text-sm whitespace-nowrap transition ${
                  isSelected
                    ? `bg-gradient-to-r ${reg.gradient} text-white shadow-lg`
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {reg.emoji} {reg.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Title & Progress */}
      <div className="px-5 mt-4">
        <div className="text-lg font-extrabold text-gray-800">{region.name}</div>
        <div className="text-sm font-semibold text-gray-600">
          {regionProgress} explored 🌍
        </div>
      </div>

      {/* States Grid */}
      <div className="px-5 pt-3 pb-2 flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-3">
          {regionStates.map((state) => {
            const isUnlocked = progress.completed.includes(state.name);
            return (
              <button
                key={state.name}
                onClick={() => handleStateClick(state.name)}
                className={`p-4 rounded-2xl transition transform ${
                  isUnlocked
                    ? `bg-gradient-to-br ${REGIONS[selectedRegion].gradient} text-white shadow-lg hover:scale-105 active:scale-95`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                }`}
              >
                <div className="text-3xl mb-1">{state.emoji}</div>
                <div className="text-sm font-extrabold">{state.name}</div>
                <div className="text-xs mt-1">
                  {isUnlocked ? "✓ Unlocked" : "🔒 Locked"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation - Removed: users navigate via region tabs and bottom nav */}
    </div>
  );
}
