import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TranslationPopup } from "../../features/reader/TranslationPopup";

const defaultProps = {
  sourceText: "hola" as string | null,
  translation: null as string | null,
  alternatives: [] as string[],
  isLoading: false,
  onClose: vi.fn(),
};

describe("TranslationPopup", () => {
  it("shows hint when no word is selected", () => {
    render(<TranslationPopup {...defaultProps} sourceText={null} />);
    expect(screen.getByText(/click any word/i)).toBeInTheDocument();
  });

  it("shows the source text", () => {
    render(<TranslationPopup {...defaultProps} />);
    expect(screen.getByText("hola")).toBeInTheDocument();
  });

  it("shows loading text while loading", () => {
    render(<TranslationPopup {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/translating/i)).toBeInTheDocument();
  });

  it("shows translation when provided", () => {
    render(<TranslationPopup {...defaultProps} translation="Hei" />);
    expect(screen.getByText("Hei")).toBeInTheDocument();
  });

  it("shows alternatives when provided", () => {
    render(<TranslationPopup {...defaultProps} translation="Hei" alternatives={["Hallo", "God dag"]} />);
    expect(screen.getByText("Hallo")).toBeInTheDocument();
    expect(screen.getByText("God dag")).toBeInTheDocument();
  });

  it("shows error when no translation and not loading", () => {
    render(<TranslationPopup {...defaultProps} translation={null} isLoading={false} />);
    expect(screen.getByText(/no translation/i)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<TranslationPopup {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
