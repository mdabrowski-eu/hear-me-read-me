import { describe, expect, it } from "vitest";
import { transcriptMatches } from "./transcriptMatching";

describe("transcriptMatches", () => {
  it("matches an exact transcript", () => {
    expect(transcriptMatches(["pa"], "pa")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(transcriptMatches(["PA"], "pa")).toBe(true);
    expect(transcriptMatches(["pa"], "PA")).toBe(true);
  });

  it("trims surrounding whitespace and punctuation", () => {
    expect(transcriptMatches(["  pa!  "], "pa")).toBe(true);
    expect(transcriptMatches(["pa."], "pa")).toBe(true);
  });

  it("matches when the target appears as a separate token", () => {
    expect(transcriptMatches(["mówię pa głośno"], "pa")).toBe(true);
  });

  it("matches a collapsed transcript (recognizer inserted spaces)", () => {
    expect(transcriptMatches(["p a"], "pa")).toBe(true);
    expect(transcriptMatches(["p e"], "pe")).toBe(true);
  });

  it("normalizes Polish diacritics in both target and transcript", () => {
    expect(transcriptMatches(["mąka"], "maka")).toBe(true);
    expect(transcriptMatches(["maka"], "mąka")).toBe(true);
    expect(transcriptMatches(["łódź"], "lodz")).toBe(true);
  });

  it("handles arbitrary Unicode diacritics via NFD normalization", () => {
    expect(transcriptMatches(["café"], "cafe")).toBe(true);
  });

  it("returns true when any alternative matches", () => {
    expect(transcriptMatches(["spam", "ham", "pa"], "pa")).toBe(true);
  });

  it("rejects completely different transcripts", () => {
    expect(transcriptMatches(["be"], "pa")).toBe(false);
    expect(transcriptMatches(["pepe"], "pa")).toBe(false);
  });

  it("returns false for empty transcript list or empty target", () => {
    expect(transcriptMatches([], "pa")).toBe(false);
    expect(transcriptMatches([""], "pa")).toBe(false);
    expect(transcriptMatches(["pa"], "")).toBe(false);
  });
});
