// JourneyMapScreen and related components
// This module handles the journey map view showing all states organized by regions

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProgress, statesWithProgress } from "@/lib/progress";
import { STATE_ART, TONE_GRADIENT, preloadStateArt } from "@/lib/state-art";
import { REGIONS, REGION_KEYS } from "@/lib/passport-helpers";
import { INDIA_STATES, TOTAL_STATES_ONLY, getState, stateIndex, stateSlug } from "@/lib/states";
import { setJourneyBackHandler } from "@/lib/journeyBackHandler";
import { useCelebration } from "@/hooks/useCelebration";
import { appLogger } from "@/lib/logger";
import { fxTap } from "@/lib/fx";
import { Cloud, BottomNav, getAvatarImage, getAvatarName } from "./shared";
import { StateIntroScreen } from "./learning";
import { LearningHubScreen } from "./learning";
import { LearningCardScreen } from "./learning";
import { QuizScreen } from "./quiz";
import { LoadingScreen } from "./states";

const TOTAL_STATES = 36;

export function JourneyMapScreen() {
  const navigate = useNavigate();
  const p = useProgress();
  const states = statesWithProgress(p);
  const [view, setView] = useState<{ screen: "intro" | "hub" | "card" | "quiz"; name: string; cardIndex?: number } | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const celebration = useCelebration();

  useEffect(() => {
    const totalStates = TOTAL_STATES;
    const completed = p.completed.length;
    const percentage = Math.round((completed / totalStates) * 100);

    const milestones = [
      { threshold: 25, emoji: "🎉", message: "Quarter Way There! 25% Complete!" },
      { threshold: 50, emoji: "🌳", message: "Halfway Around India! 50% Complete!" },
      { threshold: 75, emoji: "⭐", message: "Almost Complete! 75% Explored!" },
      { threshold: 100, emoji: "👑", message: "India Master! 100% Complete!" },
    ];

    const celebratedKey = "india-explorer:milestones-celebrated:v1";
    const celebrated = typeof window !== "undefined" 
      ? JSON.parse(localStorage.getItem(celebratedKey) || "[]")
      : [];

    milestones.forEach((m) => {
      if (percentage >= m.threshold && !celebrated.includes(m.threshold)) {
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
        
        celebrated.push(m.threshold);
        if (typeof window !== "undefined") {
          localStorage.setItem(celebratedKey, JSON.stringify(celebrated));
        }
      }
    });
  }, [p.completed.length, celebration]);

  useEffect(() => {
    const handleBack = () => {
      appLogger.info('journey_map_screen', 'handleJourneyBack called, current view:', view?.screen);
      
      if (view?.screen === "card" || view?.screen === "quiz") {
        appLogger.info('journey_map_screen', 'Back from card/quiz to hub');
        setView({ screen: "hub", name: view.name });
        return;
      } else if (view?.screen === "hub") {
        appLogger.info('journey_map_screen', 'Back from hub to intro');
        setView({ screen: "intro", name: view.name });
        return;
      } else if (view?.screen === "intro") {
        appLogger.info('journey_map_screen', 'Back from intro to map');
        setView(null);
        return;
      }
      appLogger.info('journey_map_screen', 'At journey map, allowing default back behavior');
    };
    
    setJourneyBackHandler(handleBack);
    
    return () => {
      setJourneyBackHandler(null);
    };
  }, [view]);

  useEffect(() => {
    const stateNames = states.map((s) => s.name);
    preloadStateArt(...stateNames);
  }, [states]);

  if (!states || states.length === 0) {
    return <LoadingScreen />;
  }

  const statesByRegion = useMemo(() => {
    const result: Record<string, typeof states> = {};
    REGION_KEYS.forEach((key) => {
      const region = REGIONS[key];
      result[key] = states.filter((s) => region.states.some((rs) => rs.name === s.name));
    });
    return result;
  }, [states]);

  if (view?.screen === "intro") {
    return (
      <StateIntroScreen
        stateName={view.name}
        onBack={() => setView(null)}
        onContinue={() => setView({ screen: "hub", name: view.name })}
      />
    );
  }
  if (view?.screen === "hub") {
    return (
      <LearningHubScreen
        stateName={view.name}
        onBack={() => setView({ screen: "intro", name: view.name })}
        onCard={(index) => setView({ screen: "card", name: view.name, cardIndex: index })}
        onQuiz={() => setView({ screen: "quiz", name: view.name })}
        allowReplay={true}
      />
    );
  }
  if (view?.screen === "card") {
    return (
      <LearningCardScreen
        stateName={view.name}
        cardIndex={view.cardIndex}
        onClose={() => setView({ screen: "hub", name: view.name })}
        onNext={(index) => {
          if (index === null) {
            setView({ screen: "quiz", name: view.name });
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
        onClose={() => setView({ screen: "hub", name: view.name })}
        onDone={() => {
          const slug = view.name.toLowerCase().replace(/\s+/g, "-");
          navigate({ to: "/state/$slug/complete", params: { slug } });
        }}
      />
    );
  }

  const totalStates = TOTAL_STATES;
  const completedStates = states.filter((n) => n.status === "done").length;

  return (
    <div className="h-full w-full gradient-sky relative overflow-hidden flex flex-col">
      <div className="px-5 pt-3 pb-4 gradient-saffron rounded-b-[32px] relative overflow-hidden animate-fade-in">
        <Cloud className="absolute top-2 right-4 w-14 opacity-40 pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-11 w-11 rounded-2xl bg-white shadow-soft p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                {completedStates}/{totalStates} places explored
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/60 rounded-full px-3 py-1.5 backdrop-blur flex-shrink-0">
            <span>✨</span>
            <span className="text-display font-extrabold text-saffron text-sm">{p.xp.toLocaleString()}</span>
          </div>
        </div>

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
          <div className="text-xs font-bold text-white/80 mt-2">
            {completedStates < 9 && `🎉 25% milestone: ${Math.max(0, 9 - completedStates)} more states`}
            {completedStates >= 9 && completedStates < 18 && `🌳 50% milestone: ${Math.max(0, 18 - completedStates)} more states`}
            {completedStates >= 18 && completedStates < 27 && `⭐ 75% milestone: ${Math.max(0, 27 - completedStates)} more states`}
            {completedStates >= 27 && `👑 Explore the final states to become India Master!`}
          </div>
        </div>
      </div>

      <Cloud className="absolute top-40 left-2 w-24 opacity-90 pointer-events-none animate-fade-in" style={{ animationDelay: "100ms" }} />
      <Cloud className="absolute top-80 right-1 w-20 opacity-85 pointer-events-none animate-fade-in" style={{ animationDelay: "150ms" }} />

      <div className="relative flex-1 mx-3 mt-2 rounded-[28px] overflow-y-auto overflow-x-hidden animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="relative w-full px-4 space-y-6 py-6">
          {REGION_KEYS.map((regionKey, regionIdx) => {
            if (regionKey === "unionTerritories") return null;
            
            const region = REGIONS[regionKey];
            const regionStates = statesByRegion[regionKey] || [];
            const regionDone = regionStates.filter((s) => s.status === "done").length;
            
            return (
              <div key={regionKey} className="animate-fade-in" style={{ animationDelay: `${300 + regionIdx * 100}ms` }}>
                <div className={`rounded-2xl bg-gradient-to-r ${region.gradient} text-white p-3 mb-3 shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{region.emoji}</span>
                      <div>
                        <div className="text-sm font-extrabold">{region.name}</div>
                        <div className="text-xs font-bold opacity-90">{regionDone}/{regionStates.length} explored • {Math.round((regionDone / Math.max(regionStates.length, 1)) * 100)}%</div>
                      </div>
                    </div>
                    {regionDone === regionStates.length && regionStates.length > 0 && (
                      <div className="text-lg">⭐ Complete!</div>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${(regionDone / Math.max(regionStates.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>

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
                            : `bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 shadow-sm hover:shadow-md hover:scale-102`
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
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="map" />
    </div>
  );
}
