import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TextRenderer } from "../../features/reader/TextRenderer";

describe("TextRenderer", () => {
  it("renders all words as tokens", () => {
    render(<TextRenderer text="Hola mundo" onWordClick={vi.fn()} />);
    expect(screen.getByText("Hola")).toHaveAttribute("data-word");
    expect(screen.getByText("mundo")).toHaveAttribute("data-word");
  });

  it("strips punctuation from tokens", () => {
    render(<TextRenderer text="¡Hola, mundo!" onWordClick={vi.fn()} />);
    // The word span should contain only the word
    const tokens = document.querySelectorAll(".token");
    const words = Array.from(tokens).map((t) => t.getAttribute("data-word"));
    expect(words).toContain("Hola");
    expect(words).toContain("mundo");
    // Commas should not be inside a token
    tokens.forEach((t) => {
      expect(t.textContent).not.toContain(",");
      expect(t.textContent).not.toContain("!");
    });
  });

  it("renders paragraph breaks", () => {
    const { container } = render(
      <TextRenderer text={"Primera línea\n\nSegunda línea"} onWordClick={vi.fn()} />
    );
    const paragraphs = container.querySelectorAll(".reader-paragraph");
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onWordClick when a token is clicked", async () => {
    const onWordClick = vi.fn();
    render(<TextRenderer text="hola" onWordClick={onWordClick} />);
    screen.getByText("hola").click();
    expect(onWordClick).toHaveBeenCalledWith("hola", expect.any(Object));
  });
});
