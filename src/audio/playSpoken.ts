import { renderSpokenText } from "../speech/renderSpokenText";
import { cancelSpeech, speak } from "../speech/speechSynthesis";
import type { Language } from "../types";
import { loadAudioManifest, resolveRecordedAudioUrl } from "./audioManifest";

export type PlaySpokenSource = "recording" | "synthesis";

export interface PlaySpokenOptions {
  text: string;
  lang: Language;
  signal?: AbortSignal;
}

export interface PlaySpokenResult {
  source: PlaySpokenSource;
}

interface AudioFactory {
  (src: string): HTMLAudioElement;
}

let audioFactory: AudioFactory = (src: string) => new Audio(src);

export function setAudioFactoryForTests(factory: AudioFactory): void {
  audioFactory = factory;
}

export function resetAudioFactoryForTests(): void {
  audioFactory = (src: string) => new Audio(src);
}

function playRecording(
  url: string,
  signal: AbortSignal | undefined,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = audioFactory(url);
    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      signal?.removeEventListener("abort", handleAbort);
    };
    const handleAbort = () => {
      cleanup();
      audio.pause();
      resolve();
    };
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error("recording-playback-failed"));
    };
    signal?.addEventListener("abort", handleAbort);
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error: unknown) => {
        cleanup();
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    }
  });
}

async function speakWithSynthesis(
  text: string,
  lang: Language,
): Promise<void> {
  const spoken = renderSpokenText({ text, lang });
  await speak({ text: spoken.text, lang, rate: spoken.rate });
}

export async function playSpoken({
  text,
  lang,
  signal,
}: PlaySpokenOptions): Promise<PlaySpokenResult> {
  if (signal?.aborted) return { source: "synthesis" };
  await loadAudioManifest();
  if (signal?.aborted) return { source: "synthesis" };
  const recordedUrl = resolveRecordedAudioUrl(lang, text);
  if (recordedUrl) {
    try {
      await playRecording(recordedUrl, signal);
      return { source: "recording" };
    } catch {
      // Fall through to synthesis if the recording fails to load or play.
    }
  }
  await speakWithSynthesis(text, lang);
  return { source: "synthesis" };
}

export function cancelSpokenPlayback(): void {
  cancelSpeech();
}
