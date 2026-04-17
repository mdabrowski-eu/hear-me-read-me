import { describe, expect, it } from "vitest";
import { renderSpokenText } from "./renderSpokenText";

describe("renderSpokenText", () => {
  describe("Polish", () => {
    it("repeats single-letter sequences to keep the voice audible", () => {
      const result = renderSpokenText({ text: "a", lang: "polish" });
      expect(result.wasExpanded).toBe(true);
      expect(result.text).toBe("a, a, a");
      expect(result.rate).toBeLessThan(0.9);
    });

    it("repeats two-letter syllables which the Polish engine often clips", () => {
      const result = renderSpokenText({ text: "po", lang: "polish" });
      expect(result.wasExpanded).toBe(true);
      expect(result.text).toBe("po, po, po");
      expect(result.rate).toBeLessThan(0.9);
    });

    it("repeats three-letter syllables too (still too short for clear prosody)", () => {
      const result = renderSpokenText({ text: "pra", lang: "polish" });
      expect(result.wasExpanded).toBe(true);
      expect(result.text).toBe("pra, pra, pra");
    });

    it("leaves longer words alone", () => {
      const result = renderSpokenText({ text: "kotek", lang: "polish" });
      expect(result.wasExpanded).toBe(false);
      expect(result.text).toBe("kotek");
      expect(result.rate).toBeCloseTo(0.9);
    });

    it("counts Polish diacritics as single characters, not codepoint pairs", () => {
      const result = renderSpokenText({ text: "łódź", lang: "polish" });
      expect(result.wasExpanded).toBe(false);
      expect(result.text).toBe("łódź");
    });

    it("supports tuning the number of repetitions with a minimum of 2", () => {
      const five = renderSpokenText({
        text: "pa",
        lang: "polish",
        repeatCount: 5,
      });
      expect(five.text).toBe("pa, pa, pa, pa, pa");

      const clamped = renderSpokenText({
        text: "pa",
        lang: "polish",
        repeatCount: 1,
      });
      expect(clamped.text).toBe("pa, pa");
    });

    it("does not expand text that contains non-letter characters", () => {
      const result = renderSpokenText({ text: "p-a", lang: "polish" });
      expect(result.wasExpanded).toBe(false);
      expect(result.text).toBe("p-a");
    });

    it("returns the trimmed empty string unchanged without expansion", () => {
      const result = renderSpokenText({ text: "   ", lang: "polish" });
      expect(result.wasExpanded).toBe(false);
      expect(result.text).toBe("");
    });

    it("trims surrounding whitespace before applying the heuristic", () => {
      const result = renderSpokenText({ text: "  pa  ", lang: "polish" });
      expect(result.wasExpanded).toBe(true);
      expect(result.text).toBe("pa, pa, pa");
    });
  });

  describe("English", () => {
    it("expands single characters", () => {
      const result = renderSpokenText({ text: "a", lang: "english" });
      expect(result.wasExpanded).toBe(true);
      expect(result.text).toBe("a, a, a");
    });

    it("expands two-letter tokens such as 'oo' or 'ee'", () => {
      const result = renderSpokenText({ text: "oo", lang: "english" });
      expect(result.wasExpanded).toBe(true);
      expect(result.text).toBe("oo, oo, oo");
    });

    it("does not expand three-letter English tokens which sound fine", () => {
      const result = renderSpokenText({ text: "cat", lang: "english" });
      expect(result.wasExpanded).toBe(false);
      expect(result.text).toBe("cat");
      expect(result.rate).toBeCloseTo(0.9);
    });
  });
});
