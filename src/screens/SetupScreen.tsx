import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { LANGUAGE_LABEL, type GameConfig, type Language } from "../types";
import { parseStrings } from "../utils/parseStrings";

interface SetupScreenProps {
  initialConfig?: GameConfig;
  onSubmit: (config: GameConfig) => void;
}

const DEFAULT_INPUT = "pa, pe, pi, po, pu";
const LANGUAGES: readonly Language[] = ["polish", "english"];

export function SetupScreen({ initialConfig, onSubmit }: SetupScreenProps) {
  const [rawStrings, setRawStrings] = useState<string>(
    initialConfig ? initialConfig.strings.join(", ") : DEFAULT_INPUT,
  );
  const [lang, setLang] = useState<Language>(initialConfig?.lang ?? "polish");
  const [showError, setShowError] = useState(false);

  const parsed = useMemo(() => parseStrings(rawStrings), [rawStrings]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (parsed.error) {
      setShowError(true);
      return;
    }
    onSubmit({ strings: parsed.strings, lang });
  };

  return (
    <Screen
      title="Hear Me, Read Me"
      subtitle="Trenuj rozpoznawanie i wymowę ciągów liter w języku polskim lub angielskim."
    >
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">
              Lista ciągów znaków (rozdzielone przecinkami)
            </span>
            <textarea
              value={rawStrings}
              onChange={(event) => {
                setRawStrings(event.target.value);
                setShowError(false);
              }}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-lg text-white placeholder-slate-500 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              placeholder="np. pa, pe, pi, po, pu"
            />
            <span className="text-xs text-slate-400">
              Rozpoznanych unikalnych ciągów: {parsed.strings.length}
            </span>
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-slate-200">
              Język wymowy
            </legend>
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map((option) => {
                const checked = lang === option;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-base font-medium transition ${
                      checked
                        ? "border-indigo-400 bg-indigo-500/20 text-white"
                        : "border-white/10 bg-slate-950/40 text-slate-200 hover:border-white/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={option}
                      checked={checked}
                      onChange={() => setLang(option)}
                      className="sr-only"
                    />
                    {LANGUAGE_LABEL[option]}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {showError && parsed.error ? (
            <p className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
              {parsed.error}
            </p>
          ) : null}

          <Button type="submit" variant="primary" className="w-full sm:w-auto">
            Dalej
          </Button>
        </form>
      </Card>
    </Screen>
  );
}
