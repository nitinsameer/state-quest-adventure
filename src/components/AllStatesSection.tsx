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
import { EMOJI } from "@/constants/emoji";

export function AllStatesSection() {
  const [active, setActive] = useState(INDIA_STATES[0].name);

  return (
    <section>
      <div className="mb-8 md:mb-12 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-display text-2xl md:text-3xl font-extrabold">
            All {INDIA_STATES.length} State Screens
          </h2>
          <p className="mt-1 text-sm font-bold text-muted-foreground">
            Pick a state to see its full six-screen set — Intro, Learning Hub, Learning Card, Quiz,
            Correct Answer, Completed and Unlock — all generated from that state's own data.
          </p>
        </div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {INDIA_STATES.length * 7} screens
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-12 justify-center">
        {INDIA_STATES.map((s) => {
          const isActive = s.name === active;
          return (
            <button
              key={s.name}
              onClick={() => {
                fxTap();
                setActive(s.name);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-extrabold border-2 transition-colors flex items-center gap-3 ${
                isActive
                  ? "bg-accent-1 border-transparent shadow-elevated-2 text-accent-1-ink"
                  : "bg-surface-card text-text-primary border-border-subtle hover:border-accent-1"
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

      <div className="flex flex-wrap gap-12 md:gap-16 justify-center">
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
