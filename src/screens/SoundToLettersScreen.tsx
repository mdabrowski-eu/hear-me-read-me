import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cancelSpokenPlayback, playSpoken } from "../audio/playSpoken";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FeedbackBanner, type FeedbackStatus } from "../components/FeedbackBanner";
import { GameHeader } from "../components/GameHeader";
import { Screen } from "../components/Screen";
import { useGameRound } from "../game/useGameRound";
import { isSpeechSynthesisSupported } from "../speech/speechSynthesis";
import { MODE_LABEL, type GameConfig, type Language } from "../types";
import { sampleDistinct } from "../utils/random";

interface SoundToLettersScreenProps {
  config: GameConfig;
  onExit: () => void;
}

interface Feedback {
  status: FeedbackStatus;
  message: string;
}

const INITIAL_FEEDBACK: Feedback = {
  status: "info",
  message: "Posłuchaj i wskaż właściwy ciąg liter.",
};

interface RoundProps {
  currentString: string;
  lang: Language;
  strings: readonly string[];
  onComplete: (wasCorrect: boolean) => void;
}

function Round({ currentString, lang, strings, onComplete }: RoundProps) {
  const options = useMemo(
    () => sampleDistinct(strings, 4, currentString),
    [strings, currentString],
  );
  const [feedback, setFeedback] = useState<Feedback>(INITIAL_FEEDBACK);
  const [selected, setSelected] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const playSound = useCallback(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    void playSpoken({
      text: currentString,
      lang,
      signal: controller.signal,
    }).catch(() => {
      // Ignore playback errors; user can replay manually.
    });
  }, [currentString, lang]);

  useEffect(() => {
    playSound();
    return () => {
      abortControllerRef.current?.abort();
      cancelSpokenPlayback();
    };
  }, [playSound]);

  const handlePick = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const matched = choice === currentString;
    if (matched) {
      setFeedback({ status: "correct", message: "Świetnie, to ten ciąg!" });
      window.setTimeout(() => onComplete(true), 900);
    } else {
      setFeedback({
        status: "incorrect",
        message: `To było „${currentString}". Spróbuj jeszcze raz w kolejnej rundzie.`,
      });
      window.setTimeout(() => onComplete(false), 1400);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-6">
      <Button
        variant="primary"
        onClick={playSound}
        className="min-w-[220px]"
      >
        🔊 Posłuchaj ponownie
      </Button>

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

export function SoundToLettersScreen({
  config,
  onExit,
}: SoundToLettersScreenProps) {
  const { currentString, correct, attempts, registerResult, nextRound } =
    useGameRound({ strings: config.strings });

  const handleComplete = useCallback(
    (wasCorrect: boolean) => {
      registerResult(wasCorrect);
      nextRound();
    },
    [nextRound, registerResult],
  );

  if (!isSpeechSynthesisSupported()) {
    return (
      <Screen title={MODE_LABEL.sound_to_letters}>
        <Card>
          <p className="text-base text-slate-200">
            Twoja przeglądarka nie obsługuje syntezatora mowy (Speech Synthesis
            API). Spróbuj w Chrome, Edge lub Safari.
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={onExit}>
              Wróć do wyboru trybu
            </Button>
          </div>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={MODE_LABEL.sound_to_letters}>
      <GameHeader
        modeLabel={MODE_LABEL.sound_to_letters}
        correct={correct}
        attempts={attempts}
        onExit={onExit}
      />
      <Round
        key={`${currentString}-${attempts}`}
        currentString={currentString}
        lang={config.lang}
        strings={config.strings}
        onComplete={handleComplete}
      />
    </Screen>
  );
}
