import { describe, expect, it } from "vitest";
import { parseStrings } from "./parseStrings";

describe("parseStrings", () => {
  it("splits a comma-separated list and trims entries", () => {
    const result = parseStrings(" pa , pe ,pi,po , pu ");
    expect(result.strings).toEqual(["pa", "pe", "pi", "po", "pu"]);
    expect(result.error).toBeNull();
  });

  it("splits on newlines, semicolons and tabs as well as commas", () => {
    const result = parseStrings("pa\npe;pi\tpo,pu");
    expect(result.strings).toEqual(["pa", "pe", "pi", "po", "pu"]);
    expect(result.error).toBeNull();
  });

  it("deduplicates case-insensitively keeping the first occurrence", () => {
    const result = parseStrings("pa, PA, Pe, pe, pi, po");
    expect(result.strings).toEqual(["pa", "Pe", "pi", "po"]);
    expect(result.error).toBeNull();
  });

  it("returns an error when fewer than four unique strings are provided", () => {
    const result = parseStrings("pa, pa, pe");
    expect(result.strings).toEqual(["pa", "pe"]);
    expect(result.error).toMatch(/co najmniej 4/i);
  });

  it("returns an error for empty input without throwing", () => {
    const result = parseStrings("   ");
    expect(result.strings).toEqual([]);
    expect(result.error).not.toBeNull();
  });

  it("ignores empty tokens from consecutive separators", () => {
    const result = parseStrings("pa,,,pe,\n\npi,,po");
    expect(result.strings).toEqual(["pa", "pe", "pi", "po"]);
    expect(result.error).toBeNull();
  });
});
