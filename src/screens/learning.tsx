// Learning screens: StateIntroScreen, LearningHubScreen, LearningCardScreen
// Plus helper components: IntroFact, HubCard, learningCardsFor, getMainCardStartIndex

import { useEffect, useMemo, useState, ReactNode } from "react";
import { useGoBack, Cloud, HeaderBar, getAvatarImage, getAvatarName } from "./shared";
import { useProgress, cardsRead, cardsDone } from "@/lib/progress";
import { STATE_ART, TONE_GRADIENT, preloadStateArt } from "@/lib/state-art";
import { getState, stateIndex, TOTAL_STATES, nextStateAfter } from "@/lib/states";
import { REGIONS, REGION_KEYS } from "@/lib/passport-helpers";
import { appLogger } from "@/lib/logger";
import { fxTap } from "@/lib/fx";
import { useCelebration } from "@/hooks/useCelebration";
import { CARDS_PER_STATE, XP_PER_CARD } from "@/lib/progress";

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

  const currentRegion = useMemo(() => {
    for (const regionKey of REGION_KEYS) {
      const region = REGIONS[regionKey];
      if (region.states.some((s) => s.name === state.name)) {
        return region;
      }
    }
    return null;
  }, [state.name]);

  useEffect(() => {
    appLogger.info('state_intro_screen', 'useEffect - preloading art');
    preloadStateArt(state.name, nextStateAfter(state.name)?.name);
  }, [state.name]);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className={`relative py-12 ${grad} overflow-hidden`}>
        <Cloud className="absolute top-6 left-2 w-20 opacity-80" />
        <Cloud className="absolute top-14 right-2 w-16 opacity-70" />
        
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
          ←
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
          Start Exploring! 🎯
        </button>
      </div>
    </div>
  );
}

export function IntroFact({
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
  const live = null; // To be implemented with actual state lookup
  let status = state.status;
  
  if (allowReplay && status === "locked") {
    appLogger.info('learning_hub_screen', 'allowReplay is true and status was locked, changing to current');
    status = "current";
  }

  const read = cardsRead(progress, state.name);
  const completedCards = cardsDone(progress, state.name);
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";

  const currentRegion = useMemo(() => {
    for (const regionKey of REGION_KEYS) {
      const region = REGIONS[regionKey];
      if (region.states.some((s) => s.name === state.name)) {
        return region;
      }
    }
    return null;
  }, [state.name]);

  const [celebratedCategories, setCelebratedCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (completedCards === 3 && !celebratedCategories.has(3)) {
      celebration.custom(
        `Halfway there! 🔥`,
        "📚🗺️",
        {
          subtitle: `3/6 categories explored! Keep up the momentum 🚀`,
          confetti: true,
          duration: 2500,
          type: "success",
        }
      );
      
      setCelebratedCategories(prev => new Set([...prev, 3]));
    }
    
    if (completedCards === 6 && !celebratedCategories.has(6)) {
      celebration.custom(
        `${state.name.toUpperCase()} MASTERED!`,
        "🎓",
        {
          subtitle: `You've explored all 6 categories! Ready for the quiz?`,
          confetti: true,
          duration: 3500,
          type: "success",
        }
      );
      
      setCelebratedCategories(prev => new Set([...prev, 6]));
    }
  }, [completedCards, celebratedCategories, celebration, state.name]);

  const cards = [
    { icon: "🏛️", title: "Capital", sub: state.capital, tone: "orange" as const },
    { icon: "🗣️", title: "Language", sub: state.language, tone: "blue" as const },
    { icon: "🍽️", title: "Famous Food", sub: state.food, tone: "gold" as const },
    { icon: state.monument, title: "Places", sub: state.monumentName, tone: "green" as const },
    { icon: state.animal, title: "State Animal", sub: state.animalName, tone: "orange" as const },
    { icon: "💡", title: "Fun Fact", sub: state.funFact, tone: "blue" as const },
  ];

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      <div className={`px-5 pt-3 pb-4 ${grad} rounded-b-[32px] relative`}>
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
            ←
          </button>
          <div className="flex-1 text-white">
            <div className="text-xs font-bold text-white/90">
              Learning Hub
            </div>
            <div className="text-display text-xl font-extrabold">{state.name}</div>
          </div>
          <div className="flex items-center gap-1 text-white text-display font-extrabold">
            <span>✨</span> {completedCards * XP_PER_CARD}
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
        {cards.map((c, idx) => (
          <HubCard 
            key={c.title} 
            icon={c.icon}
            title={c.title}
            done={idx < completedCards}
            tone={c.tone}
            stateName={state.name}
            onOpen={() => onCard?.(idx)}
          />
        ))}
      </div>
      <div className="p-4">
        <button
          onClick={() => {
            fxTap();
            onQuiz?.();
          }}
          disabled={completedCards < 6}
          className={`w-full h-14 rounded-2xl text-display font-extrabold transition ${
            completedCards < 6
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {completedCards < 6 ? `Quiz (${completedCards}/6 ready)` : "Take Quiz 🧠"}
        </button>
      </div>
    </div>
  );
}

export function HubCard({
  icon,
  title,
  done,
  tone,
  stateName,
  onOpen,
}: {
  icon: string;
  title: string;
  done: boolean;
  tone: "orange" | "blue" | "green" | "gold";
  stateName: string;
  onOpen: () => void;
}) {
  const toneMap = {
    orange: "gradient-saffron",
    blue: "gradient-explorer",
    green: "gradient-success",
    gold: "gradient-gold",
  };

  return (
    <button
      onClick={() => {
        fxTap();
        onOpen();
      }}
      className={`rounded-2xl p-3 transition transform active:scale-95 ${
        done
          ? `${toneMap[tone]} text-white shadow-lg`
          : "bg-white border border-gray-200 text-gray-700 hover:shadow-md hover:scale-102"
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs font-extrabold">{title}</div>
      {done && (
        <div className="text-[10px] font-bold mt-1">✓ Learned</div>
      )}
    </button>
  );
}

export function LearningCardScreen({
  stateName,
  cardIndex,
  onClose,
  onNext,
}: {
  stateName?: string;
  cardIndex?: number;
  onClose?: () => void;
  onNext?: (index: number | null) => void;
} = {}) {
  const goBack = useGoBack();

  return (
    <div className="h-full w-full bg-white flex flex-col items-center justify-center">
      <div className="text-2xl font-bold">Learning Card</div>
      <div className="text-sm text-muted-foreground mt-2">{stateName} - Card {cardIndex}</div>
      <button
        onClick={() => {
          fxTap();
          onClose?.();
        }}
        className="mt-6 h-12 px-6 rounded-2xl bg-gray-200 text-gray-800 font-bold"
      >
        Back
      </button>
    </div>
  );
}

export function learningCardsFor(stateName: string, language: string, ageBand: string) {
  return [];
}

export function getMainCardStartIndex(cardIndex: number): number {
  return cardIndex;
}
