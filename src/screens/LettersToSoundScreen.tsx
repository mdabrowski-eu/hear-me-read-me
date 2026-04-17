import { useCallback, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FeedbackBanner, type FeedbackStatus } from "../components/FeedbackBanner";
import { GameHeader } from "../components/GameHeader";
import { Screen } from "../components/Screen";
import { useGameRound } from "../game/useGameRound";
import { isSpeechRecognitionSupported } from "../speech/speechRecognitionTypes";
import { transcriptMatches } from "../speech/transcriptMatching";
import {
  type RecognitionResult,
  useSpeechRecognition,
} from "../speech/useSpeechRecognition";
import { MODE_LABEL, type GameConfig, type Language } from "../types";

interface LettersToSoundScreenProps {
  config: GameConfig;
  onExit: () => void;
}

interface Feedback {
  status: FeedbackStatus;
  message: string;
}

const INITIAL_FEEDBACK: Feedback = {
  status: "idle",
  message: "Naciśnij mikrofon i przeczytaj na głos pokazany ciąg.",
};

function describeError(error: string): string {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Brak uprawnień do mikrofonu. Zezwól na dostęp w przeglądarce.";
    case "no-speech":
      return "Nie wykryto mowy — spróbuj jeszcze raz.";
    case "audio-capture":
      return "Nie udało się uzyskać sygnału z mikrofonu.";
    case "network":
      return "Błąd sieci podczas rozpoznawania mowy.";
    default:
      return `Błąd rozpoznawania mowy: ${error}`;
  }
}

interface RoundProps {
  currentString: string;
  lang: Language;
  onComplete: (wasCorrect: boolean) => void;
  onSkip: () => void;
}

function Round({ currentString, lang, onComplete, onSkip }: RoundProps) {
  const [feedback, setFeedback] = useState<Feedback>(INITIAL_FEEDBACK);
  const [lastTranscripts, setLastTranscripts] = useState<string[]>([]);

  const handleResult = useCallback(
    (result: RecognitionResult) => {
      setLastTranscripts(result.transcripts);
      const matched = transcriptMatches(result.transcripts, currentString);
      if (matched) {
        setFeedback({
          status: "correct",
          message: `Świetnie! Usłyszałem „${result.bestTranscript}".`,
        });
        window.setTimeout(() => {
          onComplete(true);
        }, 900);
      } else {
        setFeedback({
          status: "incorrect",
          message: `Usłyszałem „${result.bestTranscript}". Spróbuj jeszcze raz.`,
        });
      }
    },
    [currentString, onComplete],
  );

  const handleError = useCallback((error: string) => {
    setFeedback({ status: "incorrect", message: describeError(error) });
  }, []);

  const { isListening, start, stop } = useSpeechRecognition({
    lang,
    onResult: handleResult,
    onError: handleError,
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <Card className="w-full text-center">
        <p className="text-sm uppercase tracking-widest text-slate-400">
          Przeczytaj
        </p>
        <p className="mt-3 font-mono text-7xl font-black text-white sm:text-8xl">
          {currentString}
        </p>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant={isListening ? "danger" : "success"}
          onClick={isListening ? stop : start}
          className="min-w-[180px]"
        >
          {isListening ? "● Słucham... (stop)" : "🎤 Nagraj głos"}
        </Button>
        <Button variant="secondary" onClick={onSkip}>
          Pomiń
        </Button>
      </div>

      <div className="w-full max-w-xl">
        <FeedbackBanner status={feedback.status} message={feedback.message} />
        {lastTranscripts.length > 1 ? (
          <p className="mt-2 text-center text-xs text-slate-400">
            Inne propozycje rozpoznania: {lastTranscripts.slice(1).join(", ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function LettersToSoundScreen({
  config,
  onExit,
}: LettersToSoundScreenProps) {
  const { currentString, correct, attempts, registerResult, nextRound } =
    useGameRound({ strings: config.strings });

  const handleComplete = useCallback(
    (wasCorrect: boolean) => {
      registerResult(wasCorrect);
      nextRound();
    },
    [nextRound, registerResult],
  );

  const handleSkip = useCallback(() => {
    registerResult(false);
    nextRound();
  }, [nextRound, registerResult]);

  if (!isSpeechRecognitionSupported()) {
    return (
      <Screen title={MODE_LABEL.letters_to_sound}>
        <Card>
          <p className="text-base text-slate-200">
            Twoja przeglądarka nie obsługuje Web Speech API dla rozpoznawania
            mowy. Ten tryb najlepiej działa w Chrome na komputerze.
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
    <Screen title={MODE_LABEL.letters_to_sound}>
      <GameHeader
        modeLabel={MODE_LABEL.letters_to_sound}
        correct={correct}
        attempts={attempts}
        onExit={onExit}
      />
      <Round
        key={`${currentString}-${attempts}`}
        currentString={currentString}
        lang={config.lang}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </Screen>
  );
}
