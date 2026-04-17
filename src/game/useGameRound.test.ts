import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGameRound } from "./useGameRound";

afterEach(() => {
  vi.restoreAllMocks();
});

const STRINGS = ["pa", "pe", "pi", "po", "pu"] as const;

describe("useGameRound", () => {
  it("starts with the first string and zero score", () => {
    const { result } = renderHook(() => useGameRound({ strings: STRINGS }));
    expect(result.current.currentString).toBe("pa");
    expect(result.current.correct).toBe(0);
    expect(result.current.attempts).toBe(0);
  });

  it("increments attempts and correct on a successful result", () => {
    const { result } = renderHook(() => useGameRound({ strings: STRINGS }));
    act(() => result.current.registerResult(true));
    expect(result.current.attempts).toBe(1);
    expect(result.current.correct).toBe(1);
  });

  it("increments attempts but not correct on a failed result", () => {
    const { result } = renderHook(() => useGameRound({ strings: STRINGS }));
    act(() => result.current.registerResult(false));
    expect(result.current.attempts).toBe(1);
    expect(result.current.correct).toBe(0);
  });

  it("moves to a different string on nextRound", () => {
    const { result } = renderHook(() => useGameRound({ strings: STRINGS }));
    const first = result.current.currentString;
    act(() => result.current.nextRound());
    expect(result.current.currentString).not.toBe(first);
    expect(STRINGS).toContain(result.current.currentString);
  });

  it("never repeats the same string across a long sequence of rounds", () => {
    const { result } = renderHook(() => useGameRound({ strings: STRINGS }));
    let previous = result.current.currentString;
    for (let i = 0; i < 50; i += 1) {
      act(() => result.current.nextRound());
      expect(result.current.currentString).not.toBe(previous);
      previous = result.current.currentString;
    }
  });

  it("keeps scoring independent from round rotation", () => {
    const { result } = renderHook(() => useGameRound({ strings: STRINGS }));
    act(() => {
      result.current.registerResult(true);
      result.current.nextRound();
      result.current.registerResult(false);
      result.current.nextRound();
      result.current.registerResult(true);
    });
    expect(result.current.attempts).toBe(3);
    expect(result.current.correct).toBe(2);
  });
});
