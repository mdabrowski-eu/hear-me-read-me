import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetAudioManifestForTests,
  getAudioManifest,
  loadAudioManifest,
  resolveRecordedAudioUrl,
} from "./audioManifest";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

beforeEach(() => {
  __resetAudioManifestForTests();
});

afterEach(() => {
  __resetAudioManifestForTests();
});

describe("loadAudioManifest", () => {
  it("populates the cache with valid Polish and English entries", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        pl: { pa: "pl/pa.mp3", kot: "pl/kot.mp3" },
        en: { cat: "en/cat.mp3" },
      }),
    );
    const manifest = await loadAudioManifest(fetcher);
    expect(manifest).toEqual({
      pl: { pa: "pl/pa.mp3", kot: "pl/kot.mp3" },
      en: { cat: "en/cat.mp3" },
    });
    expect(getAudioManifest()).toEqual(manifest);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("is idempotent across repeated calls", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ pl: { pa: "pl/pa.mp3" } }),
    );
    await loadAudioManifest(fetcher);
    await loadAudioManifest(fetcher);
    await loadAudioManifest(fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("yields an empty manifest on HTTP errors", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("nope", { status: 404 }));
    const manifest = await loadAudioManifest(fetcher);
    expect(manifest).toEqual({});
  });

  it("yields an empty manifest on network failures", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("offline"));
    const manifest = await loadAudioManifest(fetcher);
    expect(manifest).toEqual({});
  });

  it("yields an empty manifest when the response is not an object", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse("oops"));
    const manifest = await loadAudioManifest(fetcher);
    expect(manifest).toEqual({});
  });

  it("ignores entries with non-string paths", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        pl: { pa: "pl/pa.mp3", bad: 42, empty: "" },
        en: 7,
      }),
    );
    const manifest = await loadAudioManifest(fetcher);
    expect(manifest).toEqual({ pl: { pa: "pl/pa.mp3" } });
  });
});

describe("resolveRecordedAudioUrl", () => {
  it("returns null when no manifest is loaded", () => {
    expect(resolveRecordedAudioUrl("polish", "pa")).toBeNull();
  });

  it("resolves an absolute URL relative to the audio base once loaded", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ pl: { pa: "pl/pa.mp3" } }),
    );
    await loadAudioManifest(fetcher);
    const url = resolveRecordedAudioUrl("polish", "pa");
    expect(url).not.toBeNull();
    expect(url).toMatch(/\/audio\/pl\/pa\.mp3$/);
  });

  it("returns null for texts that are not registered", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ pl: { pa: "pl/pa.mp3" } }),
    );
    await loadAudioManifest(fetcher);
    expect(resolveRecordedAudioUrl("polish", "pe")).toBeNull();
    expect(resolveRecordedAudioUrl("english", "pa")).toBeNull();
  });
});
