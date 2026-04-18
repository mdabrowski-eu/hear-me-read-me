import {
  LANGUAGE_MANIFEST_KEY,
  type Language,
  type ManifestLanguageKey,
} from "../types";

export type AudioManifest = Partial<Record<ManifestLanguageKey, Record<string, string>>>;

const MANIFEST_URL = new URL("audio/manifest.json", document.baseURI).toString();
const AUDIO_BASE_URL = new URL("audio/", document.baseURI).toString();

let cachedManifest: AudioManifest = {};
let loadPromise: Promise<AudioManifest> | null = null;

interface ManifestFetcher {
  (url: string): Promise<Response>;
}

async function fetchManifest(
  fetcher: ManifestFetcher,
): Promise<AudioManifest> {
  try {
    const response = await fetcher(MANIFEST_URL);
    if (!response.ok) return {};
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return {};
    const manifest: AudioManifest = {};
    for (const key of ["pl", "en"] as const) {
      const entries = (data as Record<string, unknown>)[key];
      if (entries && typeof entries === "object") {
        manifest[key] = {};
        for (const [text, path] of Object.entries(entries)) {
          if (typeof path === "string" && path.length > 0) {
            manifest[key]![text] = path;
          }
        }
      }
    }
    return manifest;
  } catch {
    return {};
  }
}

export function loadAudioManifest(
  fetcher: ManifestFetcher = fetch.bind(window),
): Promise<AudioManifest> {
  if (loadPromise) return loadPromise;
  loadPromise = fetchManifest(fetcher).then((manifest) => {
    cachedManifest = manifest;
    return manifest;
  });
  return loadPromise;
}

export function getAudioManifest(): AudioManifest {
  return cachedManifest;
}

export function resolveRecordedAudioUrl(
  lang: Language,
  text: string,
): string | null {
  const key = LANGUAGE_MANIFEST_KEY[lang];
  const entries = cachedManifest[key];
  if (!entries) return null;
  const relativePath = entries[text];
  if (!relativePath) return null;
  return new URL(relativePath, AUDIO_BASE_URL).toString();
}

export function __resetAudioManifestForTests(): void {
  cachedManifest = {};
  loadPromise = null;
}
