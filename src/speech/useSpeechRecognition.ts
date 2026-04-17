import { useCallback, useEffect, useRef, useState } from "react";
import { LANGUAGE_LOCALE, type Language } from "../types";
import {
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
  type SpeechRecognitionErrorEvent,
  type SpeechRecognitionEvent,
  type SpeechRecognitionInstance,
} from "./speechRecognitionTypes";

export interface RecognitionResult {
  transcripts: string[];
  bestTranscript: string;
}

interface UseSpeechRecognitionOptions {
  lang: Language;
  onResult: (result: RecognitionResult) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionValue {
  isSupported: boolean;
  isListening: boolean;
  start: () => void;
  stop: () => void;
}

function collectTranscripts(event: SpeechRecognitionEvent): string[] {
  const transcripts: string[] = [];
  for (let i = 0; i < event.results.length; i += 1) {
    const result = event.results[i];
    if (!result.isFinal) continue;
    for (let j = 0; j < result.length; j += 1) {
      const alt = result[j];
      if (alt?.transcript) {
        transcripts.push(alt.transcript);
      }
    }
  }
  return transcripts;
}

export function useSpeechRecognition({
  lang,
  onResult,
  onError,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionValue {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = LANGUAGE_LOCALE[lang];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      onErrorRef.current?.(event.error);
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcripts = collectTranscripts(event);
      if (transcripts.length === 0) return;
      onResultRef.current({
        transcripts,
        bestTranscript: transcripts[0],
      });
    };
    recognitionRef.current = recognition;
    return () => {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || isListening) return;
    try {
      recognition.start();
    } catch (error) {
      onErrorRef.current?.(
        error instanceof Error ? error.message : "start-failed",
      );
    }
  }, [isListening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    isSupported: isSpeechRecognitionSupported(),
    isListening,
    start,
    stop,
  };
}
