import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProgress, type PostcardData } from "@/lib/progress";
import { REGIONS, REGION_KEYS, getProgressPercentage } from "@/lib/passport-helpers";
import { getState } from "@/lib/states";
import { generatePassportNumber } from "@/lib/passport-number";
import { STATE_ART } from "@/lib/state-art";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { PostcardModal } from "@/components/PostcardModal";
import { PostcardCard } from "@/components/PostcardCard";
import { LockedPostcardModal } from "@/components/LockedPostcardModal";
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
 * My Explorer - Postcard Collection
 * Organized by regions with postcard-based UI
 */
export function PassportSeedling() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof REGIONS>("north");
  const [burst, setBurst] = useState(0);
  const [selectedPostcard, setSelectedPostcard] = useState<PostcardData | null>(null);
  const [lockedPostcardState, setLockedPostcardState] = useState<string | null>(null);

  // Map avatar IDs to image imports
  const AVATAR_IMAGE_EMOJI_MAP: Record<AvatarId, string> = {
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
    return AVATAR_IMAGE_EMOJI_MAP[avatarId as AvatarId] || avatarExplorerHat;
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
    } else {
      // Show locked postcard modal
      setLockedPostcardState(stateName);
    }
  };

  const handleRegionChange = (newRegion: keyof typeof REGIONS) => {
    fxTap();
    setSelectedRegion(newRegion);
  };

  return (
    <div className="w-full h-full bg-accent-1-soft flex flex-col overflow-hidden">
      <ConfettiBurst trigger={burst} size="big" />

      {/* Postcard Modal - shown on same screen */}
      {selectedPostcard && (
        <PostcardModal
          postcard={selectedPostcard}
          onClose={() => setSelectedPostcard(null)}
        />
      )}

      {/* Locked Postcard Modal */}
      {lockedPostcardState && (
        <LockedPostcardModal
          destination={lockedPostcardState}
          onClose={() => setLockedPostcardState(null)}
        />
      )}

      {/* Header with title */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <h1 style={{ fontSize: 'var(--type-screen-title)', fontWeight: 'var(--type-screen-title-weight)' }} className="text-ink">🎫 My Explorer</h1>
      </div>

      {/* Profile Card - Simplified */}
      <div className="mx-5 mt-5 p-5 rounded-3xl bg-accent-1 text-on-header shadow-xl">
        {/* ROW 1: Avatar + User Info */}
        <div className="flex items-center gap-4 mb-3">
          <div className="h-16 w-16 rounded-2xl bg-surface-card p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
            <img 
              src={getAvatarImage(progress.avatar)} 
              alt={getAvatarName(progress.avatar)}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="text-lg font-extrabold">{progress.name}</div>
            <div className="text-sm font-bold">🎫 {progress.completed.length} of 36 stamps</div>
          </div>
        </div>

        {/* ROW 2: Progress Bar */}
        <div>
          <div className="h-2 bg-surface-card/30 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-accent-2-soft rounded-full transition-all duration-500"
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
                className={`px-4 py-3 rounded-full font-extrabold whitespace-nowrap transition active:scale-95 ${
                  isSelected
                    ? "ui-button ui-accent-1 text-ink"
                    : "ui-button ui-accent-1-soft text-ink"
                }`}
                style={{ fontSize: 'var(--type-body)', fontWeight: 'var(--type-body-weight)' }}
                title={`${completed}/${regionStates.length} explored`}
              >
                {reg.emoji} {reg.name.split(" ")[0]} {isSelected && completed === regionStates.length && "âœ“"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Title & Progress */}
      <div className="px-5 mt-4 mb-2">
        <div style={{ fontSize: 'var(--type-section-heading)', fontWeight: 'var(--type-section-heading-weight)' }} className="text-text-primary">{region.name}</div>
        <div className="text-base font-semibold text-text-secondary mt-1">
          {regionProgress} explored {unlockedInRegion.length === regionStates.length && "✨ Region Complete!"}
        </div>
        <div className="mt-2 h-2 bg-[oklch(0.9_0.02_260)] rounded-full overflow-hidden">
          <div
            className={`h-full bg-accent-1 transition-all duration-300`}
            style={{ width: `${(unlockedInRegion.length / regionStates.length) * 100}%` }}
          />
        </div>
      </div>

      {/* States Grid - Using PostcardCard component */}
      <div className="px-5 pt-2 pb-6 flex-1 overflow-auto" style={{ paddingBottom: 'calc(64px + 16px + env(safe-area-inset-bottom))' }}>
        <div className="grid grid-cols-2 gap-3">
          {regionStates.map((state) => {
            const isCollected = progress.completed.includes(state.name);
            return (
              <PostcardCard
                key={state.name}
                destination={state.name}
                landmarkSrc={STATE_ART[state.name]}
                isCollected={isCollected}
                region={selectedRegion}
                onClick={() => handleStateClick(state.name)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}


