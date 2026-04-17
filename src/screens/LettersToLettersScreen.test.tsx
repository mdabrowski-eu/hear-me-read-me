import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { GameConfig } from "../types";
import { LettersToLettersScreen } from "./LettersToLettersScreen";

const CONFIG: GameConfig = {
  strings: ["pa", "pe", "pi", "po", "pu"],
  lang: "polish",
};

function getPromptText(): string {
  const prompt = screen.getByText("Dopasuj").nextElementSibling;
  if (!(prompt instanceof HTMLElement)) {
    throw new Error("prompt element not found");
  }
  return prompt.textContent ?? "";
}

function getOptionButtons(): HTMLButtonElement[] {
  return screen
    .getAllByRole("button")
    .filter((button) => CONFIG.strings.includes(button.textContent ?? ""))
    .map((button) => button as HTMLButtonElement);
}

describe("LettersToLettersScreen", () => {
  it("shows the prompt among the 2x2 option grid", () => {
    render(<LettersToLettersScreen config={CONFIG} onExit={vi.fn()} />);
    const options = getOptionButtons();
    expect(options).toHaveLength(4);
    expect(options.map((button) => button.textContent)).toContain(
      getPromptText(),
    );
  });

  it("counts a correct answer and advances to a different round", async () => {
    const user = userEvent.setup();
    render(<LettersToLettersScreen config={CONFIG} onExit={vi.fn()} />);
    const promptBefore = getPromptText();
    const correctButton = getOptionButtons().find(
      (button) => button.textContent === promptBefore,
    );
    if (!correctButton) throw new Error("correct option not found");
    await user.click(correctButton);
    expect(screen.getByText(/brawo/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 1/)).toBeInTheDocument();
    });
    expect(getPromptText()).not.toBe(promptBefore);
  });

  it("registers a wrong answer as attempt without increasing the correct count", async () => {
    const user = userEvent.setup();
    render(<LettersToLettersScreen config={CONFIG} onExit={vi.fn()} />);
    const prompt = getPromptText();
    const wrongButton = getOptionButtons().find(
      (button) => button.textContent !== prompt,
    );
    if (!wrongButton) throw new Error("wrong option not found");
    await user.click(wrongButton);
    expect(screen.getByText(/szukaliśmy/i)).toBeInTheDocument();
    await waitFor(
      () => {
        expect(screen.getByText(/0 \/ 1/)).toBeInTheDocument();
      },
      { timeout: 2500 },
    );
  });

  it("disables all options immediately after a choice", async () => {
    const user = userEvent.setup();
    render(<LettersToLettersScreen config={CONFIG} onExit={vi.fn()} />);
    const prompt = getPromptText();
    const correctButton = getOptionButtons().find(
      (button) => button.textContent === prompt,
    );
    if (!correctButton) throw new Error("correct option not found");
    await user.click(correctButton);
    for (const button of getOptionButtons()) {
      expect(button).toBeDisabled();
    }
  });

  it("calls onExit when the header exit button is pressed", async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<LettersToLettersScreen config={CONFIG} onExit={onExit} />);
    const exitButton = within(document.body).getByRole("button", {
      name: /wyjdź/i,
    });
    await user.click(exitButton);
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
