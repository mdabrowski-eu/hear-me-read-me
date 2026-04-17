import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import {
  LANGUAGE_LABEL,
  MODE_DESCRIPTION,
  MODE_LABEL,
  type GameConfig,
  type GameMode,
} from "../types";

interface ModeSelectScreenProps {
  config: GameConfig;
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
}

const MODES: readonly GameMode[] = [
  "letters_to_sound",
  "sound_to_letters",
  "letters_to_letters",
];

export function ModeSelectScreen({
  config,
  onSelectMode,
  onBack,
}: ModeSelectScreenProps) {
  return (
    <Screen
      title="Wybierz tryb ćwiczenia"
      subtitle={`Język: ${LANGUAGE_LABEL[config.lang]} • Ciągi: ${config.strings.join(", ")}`}
      footer={
        <Button variant="ghost" onClick={onBack}>
          ← Zmień ustawienia
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MODES.map((mode) => (
          <Card key={mode} className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {MODE_LABEL[mode]}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {MODE_DESCRIPTION[mode]}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => onSelectMode(mode)}
              className="mt-auto"
            >
              Zagraj
            </Button>
          </Card>
        ))}
      </div>
    </Screen>
  );
}
