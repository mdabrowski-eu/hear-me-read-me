# Pre-recorded audio

This directory is served as-is from the final GitHub Pages site
(`<site-base>/audio/…`). Drop `.mp3` (or any browser-playable format) files in
here and register them in [`manifest.json`](./manifest.json) so the game uses
them instead of the Web Speech API synthesizer.

## `manifest.json` shape

```json
{
  "pl": {
    "pa": "pl/pa.mp3",
    "kot": "pl/kot.mp3"
  },
  "en": {
    "cat": "en/cat.mp3"
  }
}
```

- Keys are the exact letter sequences the user configures on the setup
  screen. Matching is case-sensitive and literal, so register entries
  exactly as the user will type them.
- Values are paths relative to this `audio/` directory. Keeping per-language
  subfolders (e.g. `pl/`, `en/`) is recommended but not enforced.

## Playback behavior

At startup the app fetches this manifest eagerly. Whenever `SoundToLetters`
needs to play a prompt:

1. If a recording is registered for the current language + text, the game
   plays the `.mp3` directly via `HTMLAudioElement`.
2. Otherwise (or if the recording fails to load/play) it transparently falls
   back to the speech synthesizer, preserving the existing short-syllable
   handling.

An empty manifest is therefore a valid default — everything just keeps using
speech synthesis until recordings are added.
