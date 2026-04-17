import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockSpeechSynthesis,
  type MockSpeechSynthesisApi,
} from "../test/mockSpeech";
import type { GameConfig } from "../types";
import { SoundToLettersScreen } from "./SoundToLettersScreen";

const CONFIG: GameConfig = {
  strings: ["pa", "pe", "pi", "po"],
  lang: "polish",
};

let synth: MockSpeechSynthesisApi;

beforeEach(() => {
  synth = createMockSpeechSynthesis();
  synth.install();
});

afterEach(() => {
  synth.uninstall();
});

function getOptionButtons(): HTMLButtonElement[] {
  return screen
    .getAllByRole("button")
    .filter((button) => CONFIG.strings.includes(button.textContent ?? ""))
    .map((button) => button as HTMLButtonElement);
}

async function waitForSpokenUtterance() {
  await waitFor(() => expect(synth.utterances.length).toBeGreaterThan(0));
}

describe("SoundToLettersScreen", () => {
  it("triggers speech synthesis on mount with the Polish locale", async () => {
    render(<SoundToLettersScreen config={CONFIG} onExit={vi.fn()} />);
    await waitForSpokenUtterance();
    expect(synth.utterances[0].lang).toBe("pl-PL");
    expect(CONFIG.strings).toContain(synth.utterances[0].text);
  });

  it("uses the English locale when configured for English", async () => {
    render(
      <SoundToLettersScreen
        config={{ ...CONFIG, lang: "english" }}
        onExit={vi.fn()}
      />,
    );
    await waitForSpokenUtterance();
    expect(synth.utterances[0].lang).toBe("en-US");
  });

  it("plays again when the replay button is clicked", async () => {
    const user = userEvent.setup();
    render(<SoundToLettersScreen config={CONFIG} onExit={vi.fn()} />);
    await waitForSpokenUtterance();
    const playedBefore = synth.utterances.length;
    await user.click(screen.getByRole("button", { name: /posłuchaj ponownie/i }));
    await waitFor(() =>
      expect(synth.utterances.length).toBeGreaterThan(playedBefore),
    );
  });

  it("accepts the correct option and increments the score", async () => {
    const user = userEvent.setup();
    render(<SoundToLettersScreen config={CONFIG} onExit={vi.fn()} />);
    await waitForSpokenUtterance();
    const target = synth.utterances[0].text;
    const correctButton = getOptionButtons().find(
      (button) => button.textContent === target,
    );
    if (!correctButton) throw new Error("correct option not found");
    await user.click(correctButton);
    expect(screen.getByText(/świetnie/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 1/)).toBeInTheDocument();
    });
  });

  it("registers a wrong choice as an attempt without scoring", async () => {
    const user = userEvent.setup();
    render(<SoundToLettersScreen config={CONFIG} onExit={vi.fn()} />);
    await waitForSpokenUtterance();
    const target = synth.utterances[0].text;
    const wrongButton = getOptionButtons().find(
      (button) => button.textContent !== target,
    );
    if (!wrongButton) throw new Error("wrong option not found");
    await user.click(wrongButton);
    await waitFor(
      () => {
        expect(screen.getByText(/0 \/ 1/)).toBeInTheDocument();
      },
      { timeout: 2500 },
    );
  });

  it("shows a fallback when speech synthesis is not supported", async () => {
    synth.uninstall();
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<SoundToLettersScreen config={CONFIG} onExit={onExit} />);
    expect(screen.getByText(/nie obsługuje syntezatora/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /wróć/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
