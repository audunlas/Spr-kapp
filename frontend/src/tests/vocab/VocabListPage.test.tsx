import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../features/auth/AuthContext";
import { VocabListPage } from "../../features/vocab/VocabListPage";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/learn/es/vocab/1"]}>
      <AuthProvider>
        <Routes>
          <Route path="/learn/:lang/vocab/:listId" element={<VocabListPage />} />
          <Route path="/learn/:lang/vocab" element={<div>Vocab lists</div>} />
          <Route path="/learn/:lang/vocab/:listId/practice" element={<div>Practice page</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("VocabListPage", () => {
  it("renders entries", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("hello")).toBeInTheDocument();
      expect(screen.getByText("hola")).toBeInTheDocument();
    });
  });

  it("adds entries via textarea", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/my spanish words/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/hello:hola/i);
    await user.type(textarea, "hello:hola{Enter}goodbye:adios");

    // Check preview
    await waitFor(() => {
      expect(screen.getByText(/2 valid entries found/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /^add$/i }));

    await waitFor(() => {
      expect(screen.getByText("goodbye")).toBeInTheDocument();
      expect(screen.getByText("adiós")).toBeInTheDocument();
    });
  });

  it("deletes an entry", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("hello")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole("button", { name: /delete hello/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("hello")).not.toBeInTheDocument();
    });
  });
});
