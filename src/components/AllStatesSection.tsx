import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import {
  StateIntroScreen,
  LearningHubScreen,
  LearningCardScreen,
  QuizScreen,
  CorrectAnswerScreen,
  StateUnlockScreen,
} from "@/components/screens";
import { INDIA_STATES } from "@/lib/states";
import { STATE_ART } from "@/lib/state-art";
import { fxTap } from "@/lib/fx";

export function AllStatesSection() {
  const [active, setActive] = useState(INDIA_STATES[0].name);

  return (
    <section>
      <div className="mb-(--space-2) md:mb-(--space-3) flex items-end justify-between gap-(--gap-md) flex-wrap">
        <div>
          <h2 className="text-display text-2xl md:text-3xl font-extrabold">
            All {INDIA_STATES.length} State Screens
          </h2>
          <p className="mt-(--space-0-25) text-sm font-bold text-muted-foreground">
            Pick a state to see its full six-screen set — Intro, Learning Hub, Learning Card, Quiz,
            Correct Answer, Completed and Unlock — all generated from that state's own data.
          </p>
        </div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {INDIA_STATES.length * 7} screens
        </div>
      </div>

      <div className="flex flex-wrap gap-(--gap-base) mb-(--space-3) justify-center">
        {INDIA_STATES.map((s) => {
          const isActive = s.name === active;
          return (
            <button
              key={s.name}
              onClick={() => {
                fxTap();
                setActive(s.name);
              }}
              className={`rounded-lg px-(--padding-md) py-(--padding-xs) text-sm font-extrabold border-2 transition-colors flex items-center gap-(--gap-base) ${
                isActive
                  ? "gradient-saffron text-white border-transparent shadow-[var(--shadow-glow-orange)]"
                  : "bg-card text-foreground border-border hover:border-saffron"
              }`}
            >
              <img
                src={STATE_ART[s.name]}
                alt={s.name}
                className="w-6 h-6 object-cover rounded"
                loading="lazy"
                decoding="async"
              />
              {s.short}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-(--gap-xl) md:gap-(--gap-xl-plus) justify-center">
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

        <PhoneFrame label="State Unlock" sublabel={active}>
          <StateUnlockScreen key={active} stateName={active} />
        </PhoneFrame>
      </div>
    </section>
  );
}
