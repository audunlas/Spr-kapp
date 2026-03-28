import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { UploadPage } from "../../features/documents/UploadPage";

function renderUploadPage() {
  return render(
    <MemoryRouter initialEntries={["/upload"]}>
      <Routes>
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/read/:id" element={<div>Reader page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function selectFile(file: File) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

describe("UploadPage", () => {
  it("renders upload form with upload button disabled", () => {
    renderUploadPage();
    expect(screen.getByRole("heading", { name: /upload pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload/i })).toBeDisabled();
  });

  it("enables upload button when file is selected", () => {
    renderUploadPage();
    const file = new File(["%PDF-test"], "test.pdf", { type: "application/pdf" });
    selectFile(file);
    expect(screen.getByRole("button", { name: /upload/i })).not.toBeDisabled();
  });

  it("navigates to reader on successful upload", async () => {
    renderUploadPage();

    const file = new File(["%PDF-test"], "book.pdf", { type: "application/pdf" });
    selectFile(file);

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Reader page")).toBeInTheDocument();
    });
  });

  it("shows error message on upload failure", async () => {
    const { server } = await import("../mocks/server");
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.post("/documents/upload", () =>
        HttpResponse.json({ detail: "Not a PDF" }, { status: 400 })
      )
    );

    renderUploadPage();

    const file = new File(["not a pdf"], "bad.pdf", { type: "application/pdf" });
    selectFile(file);

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });
});
