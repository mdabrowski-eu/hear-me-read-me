import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SetupScreen } from "./SetupScreen";

describe("SetupScreen", () => {
  it("renders with the default example input and Polish selected", () => {
    render(<SetupScreen onSubmit={vi.fn()} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("pa, pe, pi, po, pu");
    expect(screen.getByLabelText("Polski")).toBeChecked();
    expect(screen.getByLabelText("English")).not.toBeChecked();
  });

  it("updates the unique-count hint as the user types", async () => {
    const user = userEvent.setup();
    render(<SetupScreen onSubmit={vi.fn()} />);
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "ka, ke, ki, ko, ku, ky");
    expect(screen.getByText(/Rozpoznanych unikalnych ciągów: 6/)).toBeInTheDocument();
  });

  it("submits a parsed config with the selected language", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SetupScreen onSubmit={onSubmit} />);
    await user.click(screen.getByLabelText("English"));
    await user.click(screen.getByRole("button", { name: /dalej/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      strings: ["pa", "pe", "pi", "po", "pu"],
      lang: "english",
    });
  });

  it("shows a validation error and does not submit when input is too short", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SetupScreen onSubmit={onSubmit} />);
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "pa, pe");
    await user.click(screen.getByRole("button", { name: /dalej/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/co najmniej 4/i)).toBeInTheDocument();
  });

  it("honors an initial config when provided", () => {
    render(
      <SetupScreen
        initialConfig={{ strings: ["ba", "be", "bi", "bo"], lang: "english" }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("ba, be, bi, bo");
    expect(screen.getByLabelText("English")).toBeChecked();
  });
});
