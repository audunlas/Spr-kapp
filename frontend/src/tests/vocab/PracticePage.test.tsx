import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../features/auth/AuthContext";
import { PracticePage } from "../../features/vocab/PracticePage";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/learn/es/vocab/1/practice"]}>
      <AuthProvider>
        <Routes>
          <Route path="/learn/:lang/vocab/:listId/practice" element={<PracticePage />} />
          <Route path="/learn/:lang/vocab/:listId" element={<div>List page</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("PracticePage", () => {
  it("renders setup screen with direction options", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("My Spanish Words")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/target → native/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/native → target/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mixed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("clicking Start shows first card", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByText(/card 1 \/ 1/i)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/your answer/i)).toBeInTheDocument();
  });

  it("correct answer shows Correct", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    });

    // Pick "target-to-native" direction: prompt=hola, answer=hello
    await user.click(screen.getByLabelText(/target → native/i));
    await user.click(screen.getByRole("button", { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your answer/i)).toBeInTheDocument();
    });

    // The card shows either "hola" (target→native) or "hello" (native→target)
    // We need to determine which is shown and type the right answer
    const promptText = screen.getByText(/hola|hello/i).textContent ?? "";
    const answer = promptText.includes("hola") ? "hello" : "hola";

    await user.type(screen.getByPlaceholderText(/your answer/i), answer);
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/correct!/i)).toBeInTheDocument();
    });
  });

  it("wrong answer shows correct answer", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your answer/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/your answer/i), "wronganswer");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/wrong — correct answer was/i)).toBeInTheDocument();
    });
  });

  it("final score is shown after last card", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your answer/i)).toBeInTheDocument();
    });

    // Submit any answer
    await user.type(screen.getByPlaceholderText(/your answer/i), "some answer");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // Click Finish (last card)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /finish/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /finish/i }));

    await waitFor(() => {
      expect(screen.getByText(/practice complete/i)).toBeInTheDocument();
      expect(screen.getByText(/\d+ \/ 1 correct/i)).toBeInTheDocument();
    });
  });
});
