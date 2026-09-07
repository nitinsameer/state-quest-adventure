import { INDIA_STATES, type IndiaState } from "./states";

export type QuizQuestion = {
  id: string;
  /** short kicker shown above the question */
  kicker: string;
  prompt: string;
  options: string[];
  correct: string;
  xp: number;
};

/** Deterministic hash so every render produces the same shuffle. */
function seed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(items: T[], key: string): T[] {
  const out = [...items];
  let s = seed(key) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick up to `count` distinct distractors from other states. */
function distractors(
  state: IndiaState,
  pick: (s: IndiaState) => string,
  correct: string,
  key: string,
  count = 3,
): string[] {
  const pool = shuffle(
    INDIA_STATES.filter((s) => s.name !== state.name),
    `${key}:${state.name}`,
  );
  const seen = new Set([correct]);
  const out: string[] = [];
  for (const s of pool) {
    const value = pick(s);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length === count) break;
  }
  return out;
}

function build(
  state: IndiaState,
  id: string,
  kicker: string,
  prompt: string,
  correct: string,
  pick: (s: IndiaState) => string,
  xp = 20,
): QuizQuestion {
  const options = shuffle([correct, ...distractors(state, pick, correct, id)], `${id}:${state.name}:opts`);
  return { id: `${state.name.toLowerCase().replace(/\s+/g, "-")}-${id}`, kicker, prompt, options, correct, xp };
}

/** Every possible question for a state, generated from that state's own data. */
export function questionsForState(state: IndiaState): QuizQuestion[] {
  return [
    build(state, "capital", "Capital City", `What is the capital of ${state.name}?`, state.capital, (s) => s.capital),
    build(state, "state-of-capital", "Find the State", `${state.capital} is the capital of which state?`, state.name, (s) => s.name),
    build(state, "landmark", "Landmark", `Which symbol stands for ${state.name}?`, state.emoji, (s) => s.emoji),
    build(state, "language", "Language", `Which language is mainly spoken in ${state.name}?`, state.language, (s) => s.language),
    build(state, "food", "Famous Food", `Which tasty dish comes from ${state.name}?`, state.food, (s) => s.food),
    build(state, "animal", "State Animal", `Which animal is the state animal of ${state.name}?`, state.animalName, (s) => s.animalName),
    build(state, "monument", "Monument", `Which famous place can you visit in ${state.name}?`, state.monumentName, (s) => s.monumentName),
    build(state, "nickname", "Nickname", `${state.name} is also known as...?`, state.nickname, (s) => s.nickname),
    build(state, "population", "How Many People", `About how many people live in ${state.name}?`, state.population, (s) => s.population),
    build(state, "fun-fact", "Cool Fact", `What's super cool about ${state.name}?`, state.funFact, (s) => s.funFact, 25),
  ];
}

/** Pick `count` random questions for a state (fresh mix on every quiz start). */
export function randomQuestionsForState(name: string, count = 3): QuizQuestion[] {
  const pool = [...questionsForStateName(name)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function questionsForStateName(name: string): QuizQuestion[] {
  const state = INDIA_STATES.find((s) => s.name === name) ?? INDIA_STATES[0];
  return questionsForState(state);
}

/** All 28 states' quizzes, keyed by state name. */
export const QUIZ_BY_STATE: Record<string, QuizQuestion[]> = Object.fromEntries(
  INDIA_STATES.map((s) => [s.name, questionsForState(s)]),
);
