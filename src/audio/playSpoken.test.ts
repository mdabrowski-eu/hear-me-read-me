import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockAudio,
  type MockAudioApi,
} from "../test/mockAudio";
import {
  createMockSpeechSynthesis,
  type MockSpeechSynthesisApi,
} from "../test/mockSpeech";
import { __resetAudioManifestForTests, loadAudioManifest } from "./audioManifest";
import { playSpoken, resetAudioFactoryForTests } from "./playSpoken";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
  });
}

let audio: MockAudioApi;
let synth: MockSpeechSynthesisApi;

beforeEach(() => {
  __resetAudioManifestForTests();
  audio = createMockAudio();
  synth = createMockSpeechSynthesis();
  synth.install();
});

afterEach(() => {
  resetAudioFactoryForTests();
  synth.uninstall();
  audio.uninstall();
  __resetAudioManifestForTests();
});

describe("playSpoken", () => {
  it("plays a pre-recorded file when one is registered for the text", async () => {
    audio.install("success");
    const fetcher = vi
      .fn()
      .mockResolvedValue(jsonResponse({ pl: { pa: "pl/pa.mp3" } }));
    await loadAudioManifest(fetcher);

    const result = await playSpoken({ text: "pa", lang: "polish" });

    expect(result.source).toBe("recording");
    expect(audio.instances).toHaveLength(1);
    expect(audio.latest().src).toMatch(/\/audio\/pl\/pa\.mp3$/);
    expect(audio.latest().play).toHaveBeenCalledTimes(1);
    expect(synth.utterances).toHaveLength(0);
  });

  it("falls back to speech synthesis when no recording is registered", async () => {
    audio.install("success");
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ pl: {} }));
    await loadAudioManifest(fetcher);

    const result = await playSpoken({ text: "pa", lang: "polish" });

    expect(result.source).toBe("synthesis");
    expect(audio.instances).toHaveLength(0);
    expect(synth.utterances).toHaveLength(1);
    expect(synth.utterances[0].lang).toBe("pl-PL");
  });

  it("falls back to speech synthesis when play() rejects", async () => {
    audio.install("fail-play");
    const fetcher = vi
      .fn()
      .mockResolvedValue(jsonResponse({ pl: { pa: "pl/pa.mp3" } }));
    await loadAudioManifest(fetcher);

    const result = await playSpoken({ text: "pa", lang: "polish" });

    expect(result.source).toBe("synthesis");
    expect(synth.utterances).toHaveLength(1);
  });

  it("falls back to speech synthesis when the recording errors while loading", async () => {
    audio.install("fail-load");
    const fetcher = vi
      .fn()
      .mockResolvedValue(jsonResponse({ pl: { pa: "pl/pa.mp3" } }));
    await loadAudioManifest(fetcher);

    const result = await playSpoken({ text: "pa", lang: "polish" });

    expect(result.source).toBe("synthesis");
    expect(synth.utterances).toHaveLength(1);
  });

  it("short-circuits when the abort signal is already aborted", async () => {
    audio.install("success");
    const controller = new AbortController();
    controller.abort();
    const result = await playSpoken({
      text: "pa",
      lang: "polish",
      signal: controller.signal,
    });
    expect(result.source).toBe("synthesis");
    expect(audio.instances).toHaveLength(0);
    expect(synth.utterances).toHaveLength(0);
  });

  it("still resolves synthesis when no manifest load path is registered", async () => {
    audio.install("success");
    const fetcher = vi.fn().mockRejectedValue(new Error("offline"));
    await loadAudioManifest(fetcher);

    const result = await playSpoken({ text: "whatever", lang: "polish" });
    expect(result.source).toBe("synthesis");
  });
});
