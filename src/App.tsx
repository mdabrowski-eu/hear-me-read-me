import { useState } from "react";
import { GameScreen } from "./screens/GameScreen";
import { ModeSelectScreen } from "./screens/ModeSelectScreen";
import { SetupScreen } from "./screens/SetupScreen";
import type { GameConfig, GameMode } from "./types";

type Stage =
  | { name: "setup" }
  | { name: "mode-select"; config: GameConfig }
  | { name: "playing"; config: GameConfig; mode: GameMode };

function App() {
  const [stage, setStage] = useState<Stage>({ name: "setup" });

  switch (stage.name) {
    case "setup":
      return (
        <SetupScreen
          onSubmit={(config) => setStage({ name: "mode-select", config })}
        />
      );
    case "mode-select":
      return (
        <ModeSelectScreen
          config={stage.config}
          onSelectMode={(mode) =>
            setStage({ name: "playing", config: stage.config, mode })
          }
          onBack={() => setStage({ name: "setup" })}
        />
      );
    case "playing":
      return (
        <GameScreen
          mode={stage.mode}
          config={stage.config}
          onExit={() =>
            setStage({ name: "mode-select", config: stage.config })
          }
        />
      );
    default: {
      const exhaustiveCheck: never = stage;
      throw new Error(`Unhandled stage: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}

export default App;
