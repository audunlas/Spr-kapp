import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../features/auth/AuthContext";
import { VocabListsPage } from "../../features/vocab/VocabListsPage";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/learn/es/vocab"]}>
      <AuthProvider>
        <Routes>
          <Route path="/learn/:lang/vocab" element={<VocabListsPage />} />
          <Route path="/learn/:lang/vocab/:listId" element={<div>List detail</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("VocabListsPage", () => {
  it("renders list names and entry count", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("My Spanish Words")).toBeInTheDocument();
    });
    expect(screen.getByText("1 word")).toBeInTheDocument();
  });

  it("creates a new list and shows it", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("My Spanish Words")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /create list/i }));

    const input = screen.getByPlaceholderText(/list name/i);
    await user.type(input, "My New List");
    await user.click(screen.getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.getByText("My New List")).toBeInTheDocument();
    });
  });

  it("deletes a list", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("My Spanish Words")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole("button", { name: /delete my spanish words/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("My Spanish Words")).not.toBeInTheDocument();
    });
  });
});
