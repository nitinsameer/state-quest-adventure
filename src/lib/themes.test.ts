import { describe, it, expect } from "vitest";
import { getTheme, isThemeUnlocked } from "./themes";

const emptyProgress = { completed: [], streak: 0, badges: {} };

describe("Theme Unlock System", () => {
  describe("Starter Themes (always unlocked)", () => {
    it("should unlock clay regardless of progress", () => {
      const clay = getTheme("clay");
      expect(isThemeUnlocked(clay, emptyProgress)).toBe(true);
    });

    it("should unlock claydark regardless of progress", () => {
      const claydark = getTheme("claydark");
      expect(isThemeUnlocked(claydark, emptyProgress)).toBe(true);
    });

    it("should unlock cartoon regardless of progress", () => {
      const cartoon = getTheme("cartoon");
      expect(isThemeUnlocked(cartoon, emptyProgress)).toBe(true);
    });

    it("should unlock minimal regardless of progress", () => {
      const minimal = getTheme("minimal");
      expect(isThemeUnlocked(minimal, emptyProgress)).toBe(true);
    });

    it("should unlock pop regardless of progress", () => {
      const pop = getTheme("pop");
      expect(isThemeUnlocked(pop, emptyProgress)).toBe(true);
    });
  });

  describe("States-based unlocks", () => {
    describe("aero: states >= 3", () => {
      it("should be locked with 2 states completed", () => {
        const aero = getTheme("aero");
        const progress = { completed: ["State1", "State2"], streak: 0, badges: {} };
        expect(isThemeUnlocked(aero, progress)).toBe(false);
      });

      it("should be unlocked with exactly 3 states completed", () => {
        const aero = getTheme("aero");
        const progress = { completed: ["State1", "State2", "State3"], streak: 0, badges: {} };
        expect(isThemeUnlocked(aero, progress)).toBe(true);
      });
    });

    describe("brutal: states >= 6", () => {
      it("should be locked with 5 states completed", () => {
        const brutal = getTheme("brutal");
        const progress = {
          completed: ["S1", "S2", "S3", "S4", "S5"],
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(brutal, progress)).toBe(false);
      });

      it("should be unlocked with exactly 6 states completed", () => {
        const brutal = getTheme("brutal");
        const progress = {
          completed: ["S1", "S2", "S3", "S4", "S5", "S6"],
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(brutal, progress)).toBe(true);
      });
    });

    describe("bento: states >= 10", () => {
      it("should be locked with 9 states completed", () => {
        const bento = getTheme("bento");
        const progress = {
          completed: Array.from({ length: 9 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(bento, progress)).toBe(false);
      });

      it("should be unlocked with exactly 10 states completed", () => {
        const bento = getTheme("bento");
        const progress = {
          completed: Array.from({ length: 10 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(bento, progress)).toBe(true);
      });
    });

    describe("paper: states >= 15", () => {
      it("should be locked with 14 states completed", () => {
        const paper = getTheme("paper");
        const progress = {
          completed: Array.from({ length: 14 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(paper, progress)).toBe(false);
      });

      it("should be unlocked with exactly 15 states completed", () => {
        const paper = getTheme("paper");
        const progress = {
          completed: Array.from({ length: 15 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(paper, progress)).toBe(true);
      });
    });

    describe("material: states >= 20", () => {
      it("should be locked with 19 states completed", () => {
        const material = getTheme("material");
        const progress = {
          completed: Array.from({ length: 19 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(material, progress)).toBe(false);
      });

      it("should be unlocked with exactly 20 states completed", () => {
        const material = getTheme("material");
        const progress = {
          completed: Array.from({ length: 20 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(material, progress)).toBe(true);
      });
    });

    describe("neu: states >= 25", () => {
      it("should be locked with 24 states completed", () => {
        const neu = getTheme("neu");
        const progress = {
          completed: Array.from({ length: 24 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(neu, progress)).toBe(false);
      });

      it("should be unlocked with exactly 25 states completed", () => {
        const neu = getTheme("neu");
        const progress = {
          completed: Array.from({ length: 25 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(neu, progress)).toBe(true);
      });
    });

    describe("skeuo: states >= 30", () => {
      it("should be locked with 29 states completed", () => {
        const skeuo = getTheme("skeuo");
        const progress = {
          completed: Array.from({ length: 29 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(skeuo, progress)).toBe(false);
      });

      it("should be unlocked with exactly 30 states completed", () => {
        const skeuo = getTheme("skeuo");
        const progress = {
          completed: Array.from({ length: 30 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(skeuo, progress)).toBe(true);
      });
    });

    describe("glass: states >= 36", () => {
      it("should be locked with 35 states completed", () => {
        const glass = getTheme("glass");
        const progress = {
          completed: Array.from({ length: 35 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(glass, progress)).toBe(false);
      });

      it("should be unlocked with exactly 36 states completed", () => {
        const glass = getTheme("glass");
        const progress = {
          completed: Array.from({ length: 36 }, (_, i) => `State${i + 1}`),
          streak: 0,
          badges: {},
        };
        expect(isThemeUnlocked(glass, progress)).toBe(true);
      });
    });
  });

  describe("Streak-based unlocks", () => {
    describe("oled: streak >= 3", () => {
      it("should be locked with 2-day streak", () => {
        const oled = getTheme("oled");
        const progress = { completed: [], streak: 2, badges: {} };
        expect(isThemeUnlocked(oled, progress)).toBe(false);
      });

      it("should be unlocked with exactly 3-day streak", () => {
        const oled = getTheme("oled");
        const progress = { completed: [], streak: 3, badges: {} };
        expect(isThemeUnlocked(oled, progress)).toBe(true);
      });
    });

    describe("aurora: streak >= 7", () => {
      it("should be locked with 6-day streak", () => {
        const aurora = getTheme("aurora");
        const progress = { completed: [], streak: 6, badges: {} };
        expect(isThemeUnlocked(aurora, progress)).toBe(false);
      });

      it("should be unlocked with exactly 7-day streak", () => {
        const aurora = getTheme("aurora");
        const progress = { completed: [], streak: 7, badges: {} };
        expect(isThemeUnlocked(aurora, progress)).toBe(true);
      });
    });

    describe("cyber: streak >= 14", () => {
      it("should be locked with 13-day streak", () => {
        const cyber = getTheme("cyber");
        const progress = { completed: [], streak: 13, badges: {} };
        expect(isThemeUnlocked(cyber, progress)).toBe(false);
      });

      it("should be unlocked with exactly 14-day streak", () => {
        const cyber = getTheme("cyber");
        const progress = { completed: [], streak: 14, badges: {} };
        expect(isThemeUnlocked(cyber, progress)).toBe(true);
      });
    });
  });

  describe("Badge-based unlocks", () => {
    describe("term: firstBadge (totalBadges >= 1)", () => {
      it("should be locked with 0 badges", () => {
        const term = getTheme("term");
        const progress = { completed: [], streak: 0, badges: {} };
        expect(isThemeUnlocked(term, progress)).toBe(false);
      });

      it("should be unlocked with exactly 1 badge", () => {
        const term = getTheme("term");
        const progress = {
          completed: [],
          streak: 0,
          badges: { State1: ["monument"] },
        };
        expect(isThemeUnlocked(term, progress)).toBe(true);
      });
    });

    describe("synth: badges >= 10", () => {
      it("should be locked with 9 total badges", () => {
        const synth = getTheme("synth");
        const progress = {
          completed: [],
          streak: 0,
          badges: {
            State1: ["monument", "animal"],
            State2: ["explorer"],
            State3: ["monument", "animal"],
            State4: ["explorer"],
            State5: ["monument", "animal"],
          },
        };
        // Total: 2 + 1 + 2 + 1 + 2 = 8
        expect(isThemeUnlocked(synth, progress)).toBe(false);
      });

      it("should be unlocked with exactly 10 total badges", () => {
        const synth = getTheme("synth");
        const progressWith10 = {
          completed: [],
          streak: 0,
          badges: {
            S1: ["monument", "animal"],
            S2: ["explorer", "monument"],
            S3: ["monument", "animal"],
            S4: ["explorer"],
            S5: ["monument", "animal", "explorer"],
          },
        };
        // Total: 2 + 2 + 2 + 1 + 3 = 10
        expect(isThemeUnlocked(synth, progressWith10)).toBe(true);
      });
    });

    describe("pixel: badges >= 25", () => {
      it("should be locked with 24 total badges", () => {
        const pixel = getTheme("pixel");
        // Create 24 badges across multiple states
        const badges: Record<string, string[]> = {};
        for (let i = 1; i <= 8; i++) {
          badges[`State${i}`] = ["monument", "animal", "explorer"];
        }
        // Total: 8 * 3 = 24
        const progress = { completed: [], streak: 0, badges };
        expect(isThemeUnlocked(pixel, progress)).toBe(false);
      });

      it("should be unlocked with exactly 25 total badges", () => {
        const pixel = getTheme("pixel");
        // Create 25 badges across multiple states
        const badges: Record<string, string[]> = {};
        for (let i = 1; i <= 8; i++) {
          badges[`State${i}`] = ["monument", "animal", "explorer"];
        }
        badges["State9"] = ["monument"]; // +1 = 25
        const progress = { completed: [], streak: 0, badges };
        expect(isThemeUnlocked(pixel, progress)).toBe(true);
      });
    });
  });
});
