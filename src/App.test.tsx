import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import {
  createMockSpeechRecognition,
  createMockSpeechSynthesis,
  type MockSpeechRecognitionApi,
  type MockSpeechSynthesisApi,
} from "./test/mockSpeech";

let recognition: MockSpeechRecognitionApi;
let synth: MockSpeechSynthesisApi;

beforeEach(() => {
  recognition = createMockSpeechRecognition();
  synth = createMockSpeechSynthesis();
  recognition.install();
  synth.install();
});

afterEach(() => {
  recognition.uninstall();
  synth.uninstall();
});

describe("App stage navigation", () => {
  it("starts on the setup screen", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /hear me, read me/i }),
    ).toBeInTheDocument();
  });

  it("flows setup → mode select → game → back to mode select", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /dalej/i }));

    expect(
      screen.getByRole("heading", { name: /wybierz tryb ćwiczenia/i }),
    ).toBeInTheDocument();

    const letterToLetterCard = screen.getByText("Litery → Litery").closest("div");
    if (!letterToLetterCard) throw new Error("mode card missing");
    await user.click(
      await screen.findAllByRole("button", { name: /zagraj/i }).then((nodes) =>
        nodes[2],
      ),
    );

    expect(screen.getByText("Dopasuj")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /wyjdź/i }));
    expect(
      screen.getByRole("heading", { name: /wybierz tryb ćwiczenia/i }),
    ).toBeInTheDocument();
  });

  it("lets the user return from mode select to setup to edit input", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /dalej/i }));
    await user.click(screen.getByRole("button", { name: /zmień ustawienia/i }));
    expect(screen.getByRole("textbox")).toHaveValue("pa, pe, pi, po, pu");
  });
});
