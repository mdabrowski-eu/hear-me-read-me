import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { GameConfig } from "../types";
import { ModeSelectScreen } from "./ModeSelectScreen";

const CONFIG: GameConfig = {
  strings: ["pa", "pe", "pi", "po"],
  lang: "polish",
};

describe("ModeSelectScreen", () => {
  it("renders a card for every game mode", () => {
    render(
      <ModeSelectScreen config={CONFIG} onSelectMode={vi.fn()} onBack={vi.fn()} />,
    );
    expect(screen.getByText("Litery → Dźwięk")).toBeInTheDocument();
    expect(screen.getByText("Dźwięk → Litery")).toBeInTheDocument();
    expect(screen.getByText("Litery → Litery")).toBeInTheDocument();
    const playButtons = screen.getAllByRole("button", { name: /zagraj/i });
    expect(playButtons).toHaveLength(3);
  });

  it("displays the provided config in the subtitle", () => {
    render(
      <ModeSelectScreen config={CONFIG} onSelectMode={vi.fn()} onBack={vi.fn()} />,
    );
    expect(
      screen.getByText(/Język: Polski.*pa, pe, pi, po/),
    ).toBeInTheDocument();
  });

  it("invokes onSelectMode with the correct mode identifier", async () => {
    const user = userEvent.setup();
    const onSelectMode = vi.fn();
    render(
      <ModeSelectScreen
        config={CONFIG}
        onSelectMode={onSelectMode}
        onBack={vi.fn()}
      />,
    );
    const playButtons = screen.getAllByRole("button", { name: /zagraj/i });
    await user.click(playButtons[0]);
    await user.click(playButtons[1]);
    await user.click(playButtons[2]);
    expect(onSelectMode).toHaveBeenNthCalledWith(1, "letters_to_sound");
    expect(onSelectMode).toHaveBeenNthCalledWith(2, "sound_to_letters");
    expect(onSelectMode).toHaveBeenNthCalledWith(3, "letters_to_letters");
  });

  it("calls onBack when the footer button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(
      <ModeSelectScreen
        config={CONFIG}
        onSelectMode={vi.fn()}
        onBack={onBack}
      />,
    );
    await user.click(screen.getByRole("button", { name: /zmień ustawienia/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
