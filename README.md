# Hear Me, Read Me

A tiny frontend-only web game for practicing the connection between letter
sequences and their pronunciation in Polish or English. Built as a static site
so it can be hosted on GitHub Pages.

Based on the requirements in [`design_doc.md`](./design_doc.md).

## Game modes

The game starts by letting you configure a list of letter sequences (comma
separated) and the language used for pronunciation (Polish or English). After
that you can pick one of three exercise modes:

- **Litery → Dźwięk (`letters_to_sound`)** — the app shows a letter sequence
  and you read it aloud into the microphone. The browser transcribes your
  voice and confirms whether it matches.
- **Dźwięk → Litery (`sound_to_letters`)** — the app pronounces one of your
  sequences using speech synthesis and asks you to pick the matching letters
  from a 2×2 grid of four options.
- **Litery → Litery (`letters_to_letters`)** — a gentle reading exercise for
  children: a letter sequence is shown at the top and you pick the identical
  one from a 2×2 grid.

## Technology

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript.
- [Tailwind CSS v4](https://tailwindcss.com/) for styling.
- The **Web Speech API** for both speech synthesis (`SpeechSynthesis`) and
  voice recognition (`SpeechRecognition` / `webkitSpeechRecognition`). This is
  fully client-side, supports Polish and English, and requires no backend.

> Speech recognition (`letters_to_sound`) works best in Chromium-based
> browsers (Chrome, Edge). Safari and Firefox may not expose it; in that case
> the other two modes still work. Speech synthesis is widely supported.

## Local development

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually <http://localhost:5173>). Grant
microphone access when prompted if you want to try the `letters_to_sound`
mode.

Useful scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check with `tsc -b` and produce a production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint across the project. |

## Deployment to GitHub Pages

Deployment is automated via GitHub Actions:

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) lints and builds on
  every push and pull request.
- [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) builds the
  site and publishes it to GitHub Pages whenever `main` is updated.

To enable Pages for this repository once, go to **Settings → Pages** and set
**Source** to **GitHub Actions**. The workflow sets `VITE_BASE_PATH` to
`/<repository-name>/` so asset URLs resolve correctly under a project Pages
URL.
