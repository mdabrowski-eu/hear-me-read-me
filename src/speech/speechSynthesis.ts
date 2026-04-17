import { LANGUAGE_LOCALE, type Language } from "../types";

interface SpeakOptions {
  text: string;
  lang: Language;
  rate?: number;
  pitch?: number;
}

let cachedVoices: SpeechSynthesisVoice[] | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (cachedVoices && cachedVoices.length > 0) {
    return Promise.resolve(cachedVoices);
  }
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      cachedVoices = existing;
      resolve(existing);
      return;
    }
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        cachedVoices = voices;
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged,
        );
        resolve(voices);
      }
    };
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      handleVoicesChanged,
    );
    window.setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      cachedVoices = voices;
      resolve(voices);
    }, 1500);
  });
}

function pickVoice(
  voices: readonly SpeechSynthesisVoice[],
  targetLocale: string,
): SpeechSynthesisVoice | undefined {
  const target = targetLocale.toLowerCase();
  const exact = voices.find((voice) => voice.lang.toLowerCase() === target);
  if (exact) return exact;
  const prefix = target.split("-")[0];
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix));
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export async function speak({
  text,
  lang,
  rate = 0.9,
  pitch = 1,
}: SpeakOptions): Promise<void> {
  if (!isSpeechSynthesisSupported()) {
    throw new Error("Speech synthesis is not supported in this browser.");
  }
  const locale = LANGUAGE_LOCALE[lang];
  const voices = await loadVoices();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = rate;
  utterance.pitch = pitch;
  const voice = pickVoice(voices, locale);
  if (voice) {
    utterance.voice = voice;
  }
  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") {
        resolve();
        return;
      }
      reject(new Error(event.error ?? "speech-synthesis-error"));
    };
    window.speechSynthesis.speak(utterance);
  });
}

export function cancelSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
