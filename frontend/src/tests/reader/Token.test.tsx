import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Token } from "../../features/reader/Token";

describe("Token", () => {
  it("renders the word", () => {
    render(<Token word="hola" onClick={vi.fn()} />);
    expect(screen.getByText("hola")).toBeInTheDocument();
  });

  it("has data-word attribute", () => {
    render(<Token word="mundo" onClick={vi.fn()} />);
    expect(screen.getByText("mundo")).toHaveAttribute("data-word", "mundo");
  });

  it("calls onClick with the word when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Token word="hola" onClick={onClick} />);
    await user.click(screen.getByText("hola"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith("hola", expect.any(Object));
  });

  it("calls onClick on Enter key press", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Token word="hola" onClick={onClick} />);
    screen.getByText("hola").focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });
});
