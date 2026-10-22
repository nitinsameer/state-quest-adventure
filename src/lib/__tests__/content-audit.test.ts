import { describe, expect, it } from "vitest";
import { INDIA_STATES, TOTAL_STATES_ONLY, TOTAL_UNION_TERRITORIES } from "../states";
import { getCardContentByAge, getStateContent } from "../state-content";
import { questionsForStateName } from "../quiz";

const ACTIVE_CARDS = ["capital", "language", "food", "places", "animal", "funFact"] as const;

describe("India-wide learning content audit guards", () => {
  it("covers all 28 states and 8 union territories", () => {
    expect(INDIA_STATES).toHaveLength(36);
    expect(TOTAL_STATES_ONLY).toBe(28);
    expect(TOTAL_UNION_TERRITORIES).toBe(8);
  });

  it("resolves all state/UT names to six complete English learning cards", () => {
    for (const state of INDIA_STATES) {
      expect(getStateContent(state.name), state.name).not.toBeNull();
      for (const card of ACTIVE_CARDS) {
        const content = getCardContentByAge(state.name, card, "en", "8-9");
        expect(content, state.name + " / " + card).not.toBeNull();
        expect(content?.title.trim().length, state.name + " / " + card + " title").toBeGreaterThan(0);
        expect(content?.mainText.trim().length, state.name + " / " + card + " mainText").toBeGreaterThan(0);
        expect(content?.narration.trim().length, state.name + " / " + card + " narration").toBeGreaterThan(0);
        expect(content?.mainText).not.toMatch(/\[CONTENT MISSING\]|\[TRANSLATION MISSING\]|\[FORMAT ERROR\]/);
      }
    }
  });

  it("keeps younger narration concise and caps older narration at 180 words", () => {
    for (const state of INDIA_STATES) {
      for (const card of ACTIVE_CARDS) {
        const young = getCardContentByAge(state.name, card, "en", "3-5");
        const earlyReader = getCardContentByAge(state.name, card, "en", "6-7");
        const older = getCardContentByAge(state.name, card, "en", "10-12");
        expect(young?.narration).toBe(young?.mainText);
        expect(earlyReader?.narration).toBe(earlyReader?.mainText);
        expect(older?.narration.trim().split(/\s+/).length, state.name + " / " + card).toBeLessThanOrEqual(180);
      }
    }
  });

  it("generates ten valid quiz candidates per state/UT", () => {
    for (const state of INDIA_STATES) {
      const questions = questionsForStateName(state.name);
      expect(questions, state.name).toHaveLength(10);
      for (const question of questions) {
        expect(question.prompt.trim().length, state.name + " prompt").toBeGreaterThan(0);
        expect(question.options.length, state.name + " options").toBeGreaterThanOrEqual(3);
        expect(new Set(question.options).size, state.name + " duplicate options").toBe(question.options.length);
        expect(question.options, state.name + " answer missing").toContain(question.correct);
        expect(question.prompt).not.toMatch(/\[CONTENT MISSING\]|\[TRANSLATION MISSING\]|\[FORMAT ERROR\]/);
      }
    }
  });

  it("handles the shared Chandigarh capital without an ambiguous single-state answer", () => {
    const haryana = questionsForStateName("Haryana").find((q) => q.id.endsWith("-state-of-capital"));
    const punjab = questionsForStateName("Punjab").find((q) => q.id.endsWith("-state-of-capital"));
    const chandigarh = questionsForStateName("Chandigarh").find((q) => q.id.endsWith("-state-of-capital"));
    expect(haryana?.correct).toBe("Chandigarh");
    expect(punjab?.correct).toBe("Chandigarh");
    expect(chandigarh?.correct).toBe("Haryana and Punjab");
  });

  it("uses corrected canonical animal facts for high-risk state/UT records", () => {
    const byName = Object.fromEntries(INDIA_STATES.map((state) => [state.name, state]));
    expect(byName["Delhi"]?.animalName).toBe("Nilgai");
    expect(byName["Chandigarh"]?.animalName).toBe("Indian Grey Mongoose");
    expect(byName["West Bengal"]?.animalName).toBe("Fishing Cat");
    expect(byName["Dadra & Nagar Haveli and Daman & Diu"]?.animalName).toBe("Leopard");
  });

  it("keeps corrected local-language animal and capital cards aligned", () => {
    const punjabi = getCardContentByAge("Chandigarh", "animal", "pa", "8-9");
    const hindi = getCardContentByAge("Andaman & Nicobar Islands", "capital", "hi", "8-9");
    expect(punjabi?.mainText).toContain("ਨੇਵਲਾ");
    expect(punjabi?.mainText).not.toContain("ਮੋਰ");
    expect(hindi?.mainText).toContain("श्री विजयपुरम");
  });

  it("uses the current name Sri Vijaya Puram for the Andaman and Nicobar capital", () => {
    const question = questionsForStateName("Andaman & Nicobar Islands").find((q) => q.id.endsWith("-capital"));
    expect(question?.correct).toBe("Sri Vijaya Puram");
  });
});
