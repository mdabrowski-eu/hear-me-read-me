import { useCallback, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { FeedbackBanner, type FeedbackStatus } from "../components/FeedbackBanner";
import { GameHeader } from "../components/GameHeader";
import { Screen } from "../components/Screen";
import { useGameRound } from "../game/useGameRound";
import { MODE_LABEL, type GameConfig } from "../types";
import { sampleDistinct } from "../utils/random";

interface LettersToLettersScreenProps {
  config: GameConfig;
  onExit: () => void;
}

interface Feedback {
  status: FeedbackStatus;
  message: string;
}

const INITIAL_FEEDBACK: Feedback = {
  status: "info",
  message: "Kliknij kafelek, który pasuje do napisu u góry.",
};

interface RoundProps {
  currentString: string;
  strings: readonly string[];
  onComplete: (wasCorrect: boolean) => void;
}

function Round({ currentString, strings, onComplete }: RoundProps) {
  const options = useMemo(
    () => sampleDistinct(strings, 4, currentString),
    [strings, currentString],
  );
  const [feedback, setFeedback] = useState<Feedback>(INITIAL_FEEDBACK);
  const [selected, setSelected] = useState<string | null>(null);

  const handlePick = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const matched = choice === currentString;
    if (matched) {
      setFeedback({ status: "correct", message: "Brawo, to ten sam napis!" });
      window.setTimeout(() => onComplete(true), 700);
    } else {
      setFeedback({
        status: "incorrect",
        message: `Szukaliśmy „${currentString}". Kolejna runda za chwilę.`,
      });
      window.setTimeout(() => onComplete(false), 1200);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-6">
      <Card className="w-full text-center">
        <p className="text-sm uppercase tracking-widest text-slate-400">
          Dopasuj
        </p>
        <p className="mt-3 font-mono text-7xl font-black text-white sm:text-8xl">
          {currentString}
        </p>
      </Card>

      <div className="grid w-full max-w-xl grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = selected === option;
          const isAnswer = option === currentString;
          const showCorrect = selected !== null && isAnswer;
          const showWrong = isSelected && !isAnswer;
          const baseClass =
            "flex aspect-square items-center justify-center rounded-2xl border font-mono text-4xl font-black shadow-lg shadow-black/20 transition sm:text-5xl";
          let stateClass =
            "border-white/10 bg-slate-900/60 text-white hover:border-indigo-400 hover:bg-indigo-500/20";
          if (showCorrect) {
            stateClass =
              "border-emerald-400 bg-emerald-500/20 text-emerald-100";
          } else if (showWrong) {
            stateClass = "border-rose-400 bg-rose-500/20 text-rose-100";
          } else if (selected !== null) {
            stateClass = "border-white/10 bg-slate-900/40 text-slate-300";
          }
          return (
            <button
              key={option}
              type="button"
              disabled={selected !== null}
              onClick={() => handlePick(option)}
              className={`${baseClass} ${stateClass} disabled:cursor-default`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-xl">
        <FeedbackBanner status={feedback.status} message={feedback.message} />
      </div>
    </div>
  );
}

export function LettersToLettersScreen({
  config,
  onExit,
}: LettersToLettersScreenProps) {
  const { currentString, correct, attempts, registerResult, nextRound } =
    useGameRound({ strings: config.strings });

  const handleComplete = useCallback(
    (wasCorrect: boolean) => {
      registerResult(wasCorrect);
      nextRound();
    },
    [nextRound, registerResult],
  );

  return (
    <Screen title={MODE_LABEL.letters_to_letters}>
      <GameHeader
        modeLabel={MODE_LABEL.letters_to_letters}
        correct={correct}
        attempts={attempts}
        onExit={onExit}
      />
      <Round
        key={`${currentString}-${attempts}`}
        currentString={currentString}
        strings={config.strings}
        onComplete={handleComplete}
      />
    </Screen>
  );
}
