import type { GameConfig, GameMode } from "../types";
import { LettersToLettersScreen } from "./LettersToLettersScreen";
import { LettersToSoundScreen } from "./LettersToSoundScreen";
import { SoundToLettersScreen } from "./SoundToLettersScreen";

interface GameScreenProps {
  mode: GameMode;
  config: GameConfig;
  onExit: () => void;
}

export function GameScreen({ mode, config, onExit }: GameScreenProps) {
  switch (mode) {
    case "letters_to_sound":
      return <LettersToSoundScreen config={config} onExit={onExit} />;
    case "sound_to_letters":
      return <SoundToLettersScreen config={config} onExit={onExit} />;
    case "letters_to_letters":
      return <LettersToLettersScreen config={config} onExit={onExit} />;
    default: {
      const exhaustiveCheck: never = mode;
      throw new Error(`Unhandled game mode: ${String(exhaustiveCheck)}`);
    }
  }
}
