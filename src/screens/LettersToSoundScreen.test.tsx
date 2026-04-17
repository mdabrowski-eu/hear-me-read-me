import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockSpeechRecognition,
  type MockSpeechRecognitionApi,
} from "../test/mockSpeech";
import type { GameConfig } from "../types";
import { LettersToSoundScreen } from "./LettersToSoundScreen";

const CONFIG: GameConfig = {
  strings: ["pa", "pe", "pi", "po"],
  lang: "polish",
};

let recognition: MockSpeechRecognitionApi;

beforeEach(() => {
  recognition = createMockSpeechRecognition();
  recognition.install();
});

afterEach(() => {
  recognition.uninstall();
});

function getPromptText(): string {
  const prompt = screen.getByText("Przeczytaj").nextElementSibling;
  if (!(prompt instanceof HTMLElement)) {
    throw new Error("prompt element not found");
  }
  return prompt.textContent ?? "";
}

describe("LettersToSoundScreen", () => {
  it("shows a fallback when speech recognition is not supported", async () => {
    recognition.uninstall();
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<LettersToSoundScreen config={CONFIG} onExit={onExit} />);
    expect(screen.getByText(/nie obsługuje Web Speech API/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /wróć/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("starts listening when the microphone button is pressed", async () => {
    const user = userEvent.setup();
    render(<LettersToSoundScreen config={CONFIG} onExit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /nagraj głos/i }));
    expect(recognition.latest().start).toHaveBeenCalledTimes(1);
    act(() => recognition.latest().emitStart());
    expect(
      screen.getByRole("button", { name: /słucham/i }),
    ).toBeInTheDocument();
  });

  it("accepts a matching transcript, increments the score, and advances", async () => {
    const user = userEvent.setup();
    render(<LettersToSoundScreen config={CONFIG} onExit={vi.fn()} />);
    const before = getPromptText();
    await user.click(screen.getByRole("button", { name: /nagraj głos/i }));
    act(() => recognition.latest().emitStart());
    act(() => recognition.latest().emitResult([[before]]));
    expect(screen.getByText(/świetnie/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 1/)).toBeInTheDocument();
    });
    expect(getPromptText()).not.toBe(before);
  });

  it("shows feedback and keeps the prompt on a mismatched transcript", async () => {
    const user = userEvent.setup();
    render(<LettersToSoundScreen config={CONFIG} onExit={vi.fn()} />);
    const before = getPromptText();
    await user.click(screen.getByRole("button", { name: /nagraj głos/i }));
    act(() => recognition.latest().emitStart());
    act(() => recognition.latest().emitResult([["completely-different"]]));
    expect(screen.getByText(/spróbuj jeszcze raz/i)).toBeInTheDocument();
    expect(getPromptText()).toBe(before);
    expect(screen.getByText(/0 \/ 0/)).toBeInTheDocument();
  });

  it("surfaces microphone permission errors", async () => {
    const user = userEvent.setup();
    render(<LettersToSoundScreen config={CONFIG} onExit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /nagraj głos/i }));
    act(() => recognition.latest().emitError("not-allowed"));
    expect(screen.getByText(/brak uprawnień/i)).toBeInTheDocument();
  });

  it("advances the round when skip is pressed and registers a failed attempt", async () => {
    const user = userEvent.setup();
    render(<LettersToSoundScreen config={CONFIG} onExit={vi.fn()} />);
    const before = getPromptText();
    await user.click(screen.getByRole("button", { name: /pomiń/i }));
    expect(screen.getByText(/0 \/ 1/)).toBeInTheDocument();
    expect(getPromptText()).not.toBe(before);
  });
});
