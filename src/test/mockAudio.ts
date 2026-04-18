import { vi } from "vitest";
import { setAudioFactoryForTests } from "../audio/playSpoken";

export interface MockAudioInstance {
  src: string;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
  onerror: (() => void) | null;
  finish: () => void;
  fail: () => void;
}

export interface MockAudioApi {
  instances: MockAudioInstance[];
  latest: () => MockAudioInstance;
  install: (mode?: "success" | "fail-play" | "fail-load") => void;
  uninstall: () => void;
}

export function createMockAudio(): MockAudioApi {
  const instances: MockAudioInstance[] = [];

  const factory = (mode: "success" | "fail-play" | "fail-load") =>
    (src: string): HTMLAudioElement => {
      const instance: MockAudioInstance = {
        src,
        onended: null,
        onerror: null,
        play: vi.fn(),
        pause: vi.fn(),
        finish: () => instance.onended?.(),
        fail: () => instance.onerror?.(),
      };
      if (mode === "fail-play") {
        instance.play.mockRejectedValue(new Error("play-failed"));
      } else {
        instance.play.mockResolvedValue(undefined);
        if (mode === "success") {
          queueMicrotask(() => instance.onended?.());
        } else {
          queueMicrotask(() => instance.onerror?.());
        }
      }
      instances.push(instance);
      return instance as unknown as HTMLAudioElement;
    };

  return {
    instances,
    latest: () => instances[instances.length - 1],
    install: (mode = "success") => {
      setAudioFactoryForTests(factory(mode));
    },
    uninstall: () => {
      instances.length = 0;
    },
  };
}
