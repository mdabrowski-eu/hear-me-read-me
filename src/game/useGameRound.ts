import { useCallback, useState } from "react";
import { pickRandomExcept } from "../utils/random";

interface UseGameRoundOptions {
  strings: readonly string[];
}

interface UseGameRoundValue {
  currentString: string;
  correct: number;
  attempts: number;
  registerResult: (wasCorrect: boolean) => void;
  nextRound: () => void;
}

interface RoundState {
  currentString: string;
  correct: number;
  attempts: number;
}

export function useGameRound({
  strings,
}: UseGameRoundOptions): UseGameRoundValue {
  const [state, setState] = useState<RoundState>(() => ({
    currentString: strings[0],
    correct: 0,
    attempts: 0,
  }));

  const nextRound = useCallback(() => {
    setState((previous) => ({
      ...previous,
      currentString: pickRandomExcept(strings, previous.currentString),
    }));
  }, [strings]);

  const registerResult = useCallback((wasCorrect: boolean) => {
    setState((previous) => ({
      ...previous,
      attempts: previous.attempts + 1,
      correct: previous.correct + (wasCorrect ? 1 : 0),
    }));
  }, []);

  return {
    currentString: state.currentString,
    correct: state.correct,
    attempts: state.attempts,
    registerResult,
    nextRound,
  };
}
