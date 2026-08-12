import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import {
  StateIntroScreen,
  LearningHubScreen,
  LearningCardScreen,
  QuizScreen,
  CorrectAnswerScreen,
  StateCompletedScreen,
  StateUnlockScreen,
} from "@/components/screens";
import { INDIA_STATES } from "@/lib/states";
import { fxTap } from "@/lib/fx";


export function AllStatesSection() {
  const [active, setActive] = useState(INDIA_STATES[0].name);

  return (
    <section>
      <div className="mb-6 md:mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-display text-2xl md:text-3xl font-extrabold">
            All {INDIA_STATES.length} State Screens
          </h2>
          <p className="mt-1 text-sm font-bold text-muted-foreground">
            Pick a state to see its full six-screen set — Intro, Learning Hub,
            Learning Card, Quiz, Correct Answer, Completed and Unlock — all
            generated from that state's own data.
          </p>
        </div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {INDIA_STATES.length * 7} screens
        </div>
      </div>


      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {INDIA_STATES.map((s) => {
          const isActive = s.name === active;
          return (
            <button
              key={s.name}
              onClick={() => {
                fxTap();
                setActive(s.name);
              }}
              className={`rounded-full px-3.5 py-2 text-sm font-extrabold border-2 transition-colors ${
                isActive
                  ? "gradient-saffron text-white border-transparent shadow-[var(--shadow-glow-orange)]"
                  : "bg-card text-foreground border-border hover:border-saffron"
              }`}
            >
              <span className="mr-1">{s.emoji}</span>
              {s.short}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-10 md:gap-12 justify-center">
        <PhoneFrame label="State Intro" sublabel={active}>
          <StateIntroScreen key={active} stateName={active} />
        </PhoneFrame>
        <PhoneFrame label="Learning Hub" sublabel={`${active} · 6 cards`}>
          <LearningHubScreen key={active} stateName={active} />
        </PhoneFrame>
        <PhoneFrame label="Learning Card" sublabel={`${active} · Places`}>
          <LearningCardScreen key={active} stateName={active} />
        </PhoneFrame>
        <PhoneFrame label="Quiz" sublabel={`${active} · 3 questions`}>
          <QuizScreen key={active} stateName={active} />
        </PhoneFrame>
        <PhoneFrame label="Correct Answer" sublabel={`${active} · +20 XP`}>
          <CorrectAnswerScreen key={active} stateName={active} />
        </PhoneFrame>
        <PhoneFrame label="State Completed" sublabel={`${active} · stamp`}>
          <StateCompletedScreen key={active} stateName={active} persist={false} />
        </PhoneFrame>
        <PhoneFrame label="State Unlock" sublabel={active}>
          <StateUnlockScreen key={active} stateName={active} />
        </PhoneFrame>
      </div>
    </section>

  );
}
