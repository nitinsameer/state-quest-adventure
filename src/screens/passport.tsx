// Passport screen and related components
// Displays collected stamps and passport progress

import { useGoBack, BottomNav, HeaderBar } from "./shared";
import { useProgress, getTotalStampCount, getPostcardsArray } from "@/lib/progress";
import { INDIA_STATES } from "@/lib/states";

export function PassportScreen() {
  const p = useProgress();
  const goBack = useGoBack();
  const stamps = getPostcardsArray(p);
  const totalStamps = getTotalStampCount();
  const collectedPercent = Math.round((stamps.length / totalStamps) * 100);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <HeaderBar title="My Passport" onBack={true} />
      
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛂</div>
          <h2 className="text-display text-2xl font-extrabold">India Explorer Passport</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Collect stamps from every state
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground">PROGRESS</span>
            <span className="text-xs font-extrabold text-saffron">{collectedPercent}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full gradient-saffron transition-all duration-500"
              style={{ width: `${collectedPercent}%` }}
            />
          </div>
          <div className="text-xs font-bold text-muted-foreground mt-2">
            {stamps.length} / {totalStamps} stamps collected
          </div>
        </div>

        {/* Stamp Grid */}
        <div className="grid grid-cols-4 gap-3">
          {stamps.map((postcard, idx) => {
            const state = INDIA_STATES.find(s => s.name === postcard.stateName);
            return (
              <Stamp
                key={`${postcard.stateName}-${idx}`}
                state={state}
                collected={true}
              />
            );
          })}
          
          {/* Empty slots for uncollected stamps */}
          {Array.from({ length: Math.max(0, totalStamps - stamps.length) }).map((_, idx) => (
            <Stamp key={`empty-${idx}`} state={undefined} collected={false} />
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

export function Stamp({
  state,
  collected,
}: {
  state?: any;
  collected: boolean;
}) {
  return (
    <div
      className={`aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition ${
        collected
          ? "border-saffron bg-saffron-soft shadow-md hover:shadow-lg"
          : "border-dashed border-gray-300 bg-gray-50"
      }`}
    >
      {state ? (
        <div className="text-center">
          <div className="text-lg">{state.emoji}</div>
          <div className="text-[8px] font-bold mt-0.5">{state.short}</div>
        </div>
      ) : (
        <span className="text-2xl opacity-30">?</span>
      )}
    </div>
  );
}
