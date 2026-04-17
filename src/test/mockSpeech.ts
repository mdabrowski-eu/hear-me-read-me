import { vi } from "vitest";
import type {
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechRecognitionInstance,
} from "../speech/speechRecognitionTypes";

export interface MockRecognitionHandle {
  instance: SpeechRecognitionInstance;
  emitStart: () => void;
  emitResult: (alternatives: string[][]) => void;
  emitError: (error: string) => void;
  emitEnd: () => void;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
}

export interface MockSpeechRecognitionApi {
  instances: MockRecognitionHandle[];
  latest: () => MockRecognitionHandle;
  install: () => void;
  uninstall: () => void;
}

function buildResultList(
  alternatives: string[][],
): SpeechRecognitionEvent["results"] {
  const results = alternatives.map((altTexts) => {
    const alts = altTexts.map((text, index) => ({
      transcript: text,
      confidence: 1 - index * 0.1,
    }));
    const resultObject: Record<number, (typeof alts)[number]> & {
      length: number;
      isFinal: boolean;
    } = { length: alts.length, isFinal: true };
    alts.forEach((alt, index) => {
      resultObject[index] = alt;
    });
    return resultObject;
  });
  const listObject: Record<number, (typeof results)[number]> & {
    length: number;
  } = { length: results.length };
  results.forEach((result, index) => {
    listObject[index] = result;
  });
  return listObject as unknown as SpeechRecognitionEvent["results"];
}

export function createMockSpeechRecognition(): MockSpeechRecognitionApi {
  const instances: MockRecognitionHandle[] = [];
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    window,
    "SpeechRecognition",
  );
  const originalWebkitDescriptor = Object.getOwnPropertyDescriptor(
    window,
    "webkitSpeechRecognition",
  );

  class FakeRecognition extends EventTarget {
    lang = "";
    continuous = false;
    interimResults = false;
    maxAlternatives = 1;
    onstart: ((event: Event) => void) | null = null;
    onend: ((event: Event) => void) | null = null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
    onnomatch: ((event: Event) => void) | null = null;
    start = vi.fn();
    stop = vi.fn();
    abort = vi.fn();

    constructor() {
      super();
      const handle: MockRecognitionHandle = {
        instance: this as unknown as SpeechRecognitionInstance,
        emitStart: () => this.onstart?.(new Event("start")),
        emitResult: (alternatives) => {
          const event = new Event("result") as SpeechRecognitionEvent;
          Object.defineProperty(event, "resultIndex", { value: 0 });
          Object.defineProperty(event, "results", {
            value: buildResultList(alternatives),
          });
          this.onresult?.(event);
        },
        emitError: (error) => {
          const event = new Event("error") as SpeechRecognitionErrorEvent;
          Object.defineProperty(event, "error", { value: error });
          Object.defineProperty(event, "message", { value: error });
          this.onerror?.(event);
        },
        emitEnd: () => this.onend?.(new Event("end")),
        start: this.start,
        stop: this.stop,
        abort: this.abort,
      };
      instances.push(handle);
    }
  }

  return {
    instances,
    latest: () => instances[instances.length - 1],
    install: () => {
      Object.defineProperty(window, "SpeechRecognition", {
        configurable: true,
        writable: true,
        value: FakeRecognition,
      });
      Object.defineProperty(window, "webkitSpeechRecognition", {
        configurable: true,
        writable: true,
        value: FakeRecognition,
      });
    },
    uninstall: () => {
      if (originalDescriptor) {
        Object.defineProperty(window, "SpeechRecognition", originalDescriptor);
      } else {
        delete (window as { SpeechRecognition?: unknown }).SpeechRecognition;
      }
      if (originalWebkitDescriptor) {
        Object.defineProperty(
          window,
          "webkitSpeechRecognition",
          originalWebkitDescriptor,
        );
      } else {
        delete (window as { webkitSpeechRecognition?: unknown })
          .webkitSpeechRecognition;
      }
    },
  };
}

export interface MockSpeechSynthesisApi {
  utterances: SpeechSynthesisUtterance[];
  install: () => void;
  uninstall: () => void;
  resolveLatest: () => void;
}

export function createMockSpeechSynthesis(): MockSpeechSynthesisApi {
  const utterances: SpeechSynthesisUtterance[] = [];
  const originalSynth = Object.getOwnPropertyDescriptor(
    window,
    "speechSynthesis",
  );
  const originalUtterance = Object.getOwnPropertyDescriptor(
    window,
    "SpeechSynthesisUtterance",
  );

  class FakeUtterance {
    text: string;
    lang = "";
    rate = 1;
    pitch = 1;
    voice: SpeechSynthesisVoice | null = null;
    onend: ((event: SpeechSynthesisEvent) => void) | null = null;
    onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }

  const voices = [
    {
      default: true,
      lang: "pl-PL",
      localService: true,
      name: "Test Polish",
      voiceURI: "test-pl",
    },
    {
      default: false,
      lang: "en-US",
      localService: true,
      name: "Test English",
      voiceURI: "test-en",
    },
  ] as unknown as SpeechSynthesisVoice[];

  const fakeSynth = {
    speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
      utterances.push(utterance);
      queueMicrotask(() => {
        const event = new Event("end") as unknown as SpeechSynthesisEvent;
        utterance.onend?.(event);
      });
    }),
    cancel: vi.fn(),
    getVoices: vi.fn(() => voices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speaking: false,
    pending: false,
    paused: false,
  };

  return {
    utterances,
    install: () => {
      Object.defineProperty(window, "speechSynthesis", {
        configurable: true,
        writable: true,
        value: fakeSynth,
      });
      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        configurable: true,
        writable: true,
        value: FakeUtterance,
      });
    },
    uninstall: () => {
      if (originalSynth) {
        Object.defineProperty(window, "speechSynthesis", originalSynth);
      } else {
        delete (window as { speechSynthesis?: unknown }).speechSynthesis;
      }
      if (originalUtterance) {
        Object.defineProperty(
          window,
          "SpeechSynthesisUtterance",
          originalUtterance,
        );
      } else {
        delete (window as { SpeechSynthesisUtterance?: unknown })
          .SpeechSynthesisUtterance;
      }
    },
    resolveLatest: () => {
      const last = utterances[utterances.length - 1];
      const event = new Event("end") as unknown as SpeechSynthesisEvent;
      last?.onend?.(event);
    },
  };
}
