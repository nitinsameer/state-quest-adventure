import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProgress, type PostcardData } from "@/lib/progress";
import { REGIONS, REGION_KEYS, getProgressPercentage } from "@/lib/passport-helpers";
import { getState } from "@/lib/states";
import { generatePassportNumber } from "@/lib/passport-number";
import { STATE_ART } from "@/lib/state-art";
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
    <div className="w-full h-full bg-gradient-to-b from-info-soft to-white flex flex-col overflow-hidden">
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
          className="px-4 py-2 rounded-full bg-gradient-to-r from-info-soft0 to-purple-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition active:scale-95 flex items-center gap-2"
          title="View all your postcards with granular consent controls"
        >
          📸 Library
        </button>
      </div>

      {/* Profile Card - EXPANDED to 140px */}
      <div className="mx-5 mt-5 p-5 rounded-3xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-white shadow-xl">
        {/* ROW 1: Avatar + User Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-2xl bg-white p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
            <img 
              src={getAvatarImage(progress.avatar)} 
              alt={getAvatarName(progress.avatar)}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="text-lg font-extrabold">{progress.name}</div>
            <div className="text-[11px] font-bold opacity-80">🎫 Passport #{generatePassportNumber(progress.avatar, progress.name)}</div>
            <div className="text-[11px] font-bold opacity-90 mt-1">Age {progress.ageBand}</div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/30 mb-4"></div>

        {/* ROW 2: Stats Row */}
        <div className="flex justify-between mb-4">
          <div className="text-center flex-1">
            <div className="text-2xl">🗺️</div>
            <div className="text-sm font-extrabold mt-1">{progress.completed.filter(s => {
              const state = getState(s);
              return state.kind !== "ut";
            }).length}/28</div>
            <div className="text-[10px] opacity-80 font-bold">States</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-2xl">🏝️</div>
            <div className="text-sm font-extrabold mt-1">{progress.completed.filter(s => {
              const state = getState(s);
              return state.kind === "ut";
            }).length}/8</div>
            <div className="text-[10px] opacity-80 font-bold">UTs</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-2xl">🏆</div>
            <div className="text-sm font-extrabold mt-1">{Math.round((progress.completed.length / 36) * 100)}%</div>
            <div className="text-[10px] opacity-80 font-bold">Complete</div>
          </div>
        </div>

        {/* ROW 3: Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold opacity-90">Overall Journey</span>
            <span className="text-[11px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full">{progress.completed.length}/36 regions</span>
          </div>
          <div className="h-3 bg-white/30 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-yellow-200 via-yellow-100 to-white rounded-full transition-all duration-500"
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
            const regionStates = reg.states;
            const completed = regionStates.filter((s) => progress.completed.includes(s.name)).length;
            return (
              <button
                key={key}
                onClick={() => handleRegionChange(key)}
                className={`px-4 py-2 rounded-full font-extrabold text-sm whitespace-nowrap transition active:scale-95 ${
                  isSelected
                    ? `bg-gradient-to-r ${reg.gradient} text-white shadow-lg`
                    : "bg-muted text-muted hover:bg-muted"
                }`}
                title={`${completed}/${regionStates.length} explored`}
              >
                {reg.emoji} {reg.name.split(" ")[0]} {isSelected && completed === regionStates.length && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Title & Progress */}
      <div className="px-5 mt-4 mb-2">
        <div className="text-lg font-extrabold text-muted-dark">{region.name}</div>
        <div className="text-sm font-semibold text-muted mt-1">
          {regionProgress} explored {unlockedInRegion.length === regionStates.length && "✨ Region Complete!"}
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${region.gradient} transition-all duration-300`}
            style={{ width: `${(unlockedInRegion.length / regionStates.length) * 100}%` }}
          />
        </div>
      </div>

      {/* States Grid */}
      <div className="px-5 pt-2 pb-3 flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-3">
          {regionStates.map((state) => {
            const isUnlocked = progress.completed.includes(state.name);
            return (
              <button
                key={state.name}
                onClick={() => handleStateClick(state.name)}
                className={`p-4 rounded-2xl transition transform active:scale-95 ${
                  isUnlocked
                    ? `bg-gradient-to-br ${REGIONS[selectedRegion].gradient} text-white shadow-lg hover:shadow-xl`
                    : "bg-gradient-to-br from-gray-100 to-gray-200 text-muted hover:to-gray-300"
                }`}
              >
                <img
                  src={STATE_ART[state.name]}
                  alt={state.name}
                  className="w-16 h-16 object-cover rounded-lg mb-2"
                  loading="lazy"
                  decoding="async"
                />
                <div className="text-sm font-extrabold leading-tight">{state.name}</div>
                <div className="text-[11px] font-bold mt-1 opacity-90">
                  {isUnlocked ? "✓ Collected" : "🔒 Locked"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

