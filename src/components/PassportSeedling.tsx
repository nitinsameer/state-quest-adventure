import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProgress } from "@/lib/progress";
import { REGIONS, REGION_KEYS, getProgressPercentage } from "@/lib/passport-helpers";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { fxTap } from "@/lib/fx";

/**
 * Passport for Ages 6-7 (Seedling)
 * Organized by regions, full state names with emojis
 */
export function PassportSeedling() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof REGIONS>("north");
  const [burst, setBurst] = useState(0);

  const region = REGIONS[selectedRegion];
  const regionStates = region.states;
  const unlockedInRegion = regionStates.filter((s) => progress.completed.includes(s.name));
  const regionProgress = `${unlockedInRegion.length} of ${regionStates.length}`;

  const handleStateClick = (stateName: string) => {
    fxTap();
    if (progress.completed.includes(stateName)) {
      navigate({ to: "/state/$slug/learn", params: { slug: stateName.toLowerCase().replace(/\s+/g, "-") } });
    }
  };

  const handleRegionChange = (newRegion: keyof typeof REGIONS) => {
    fxTap();
    setSelectedRegion(newRegion);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white flex flex-col overflow-hidden">
      <ConfettiBurst trigger={burst} size="big" />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-b-3xl shadow-lg">
        <div className="text-2xl font-extrabold">My Passport 📖</div>
      </div>

      {/* Profile Card */}
      <div className="mx-5 mt-4 p-4 rounded-3xl bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">{progress.avatar}</div>
          <div>
            <div className="text-lg font-extrabold">{progress.name}</div>
            <div className="text-xs opacity-75">Passport No: IN-2026-{String(Math.random() * 10000).padStart(4, "0")}</div>
          </div>
        </div>
        <div className="text-sm opacity-90 mt-2">
          India Progress: {progress.completed.length} of 36 states
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

      {/* Navigation */}
      <div className="px-5 pb-4 flex gap-2">
        {REGION_KEYS.indexOf(selectedRegion) > 0 && (
          <button
            onClick={() => handleRegionChange(REGION_KEYS[REGION_KEYS.indexOf(selectedRegion) - 1])}
            className="flex-1 h-12 rounded-2xl bg-white border-2 border-gray-300 text-gray-700 font-extrabold"
          >
            ← Previous Region
          </button>
        )}
        {REGION_KEYS.indexOf(selectedRegion) < REGION_KEYS.length - 1 && (
          <button
            onClick={() => handleRegionChange(REGION_KEYS[REGION_KEYS.indexOf(selectedRegion) + 1])}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 text-white font-extrabold shadow-lg"
          >
            Next Region →
          </button>
        )}
        {REGION_KEYS.indexOf(selectedRegion) === REGION_KEYS.length - 1 && (
          <button
            onClick={() => navigate({ to: "/home" })}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-extrabold shadow-lg"
          >
            Back Home 🏠
          </button>
        )}
      </div>
    </div>
  );
}
