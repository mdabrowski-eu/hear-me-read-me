import { afterEach, describe, expect, it, vi } from "vitest";
import {
  pickRandom,
  pickRandomExcept,
  sampleDistinct,
  shuffle,
} from "./random";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("pickRandom", () => {
  it("picks the element indexed by Math.random", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.75);
    expect(pickRandom(["a", "b", "c", "d"])).toBe("d");
  });

  it("always returns an element of the list", () => {
    const items = ["a", "b", "c"];
    for (let i = 0; i < 50; i += 1) {
      expect(items).toContain(pickRandom(items));
    }
  });
});

describe("shuffle", () => {
  it("returns an array with the same members", () => {
    const input = ["a", "b", "c", "d", "e"];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it("does not mutate the input array", () => {
    const input = ["a", "b", "c"];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });
});

describe("pickRandomExcept", () => {
  it("never returns the excluded element when alternatives exist", () => {
    const items = ["a", "b", "c"];
    for (let i = 0; i < 50; i += 1) {
      expect(pickRandomExcept(items, "a")).not.toBe("a");
    }
  });

  it("returns the single available element even if it equals the exclude", () => {
    expect(pickRandomExcept(["only"], "only")).toBe("only");
  });
});

describe("sampleDistinct", () => {
  it("always includes the required element", () => {
    const items = ["pa", "pe", "pi", "po", "pu"];
    for (let i = 0; i < 25; i += 1) {
      const sample = sampleDistinct(items, 4, "pi");
      expect(sample).toContain("pi");
      expect(sample).toHaveLength(4);
      expect(new Set(sample).size).toBe(4);
    }
  });

  it("returns items that are all present in the input list", () => {
    const items = ["pa", "pe", "pi", "po", "pu"];
    const sample = sampleDistinct(items, 4, "pa");
    for (const item of sample) {
      expect(items).toContain(item);
    }
  });

  it("handles the boundary case where pool size equals requested count", () => {
    const items = ["pa", "pe", "pi", "po"];
    const sample = sampleDistinct(items, 4, "pe");
    expect([...sample].sort()).toEqual([...items].sort());
  });
});
