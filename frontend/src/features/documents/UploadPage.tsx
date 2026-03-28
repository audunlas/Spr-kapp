import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { languageName } from "../../constants/languages";
import { uploadDocument, createTextDocument } from "../../api/documents";

type Tab = "pdf" | "text";

export function UploadPage() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("pdf");

  // PDF state
  const [file, setFile] = useState<File | null>(null);

  // Text state
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
  }

  async function handlePdfSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || !lang) return;

    setIsUploading(true);
    setError(null);
    try {
      const doc = await uploadDocument(file, lang);
      navigate(`/read/${doc.id}`);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : "Make sure the file is a valid PDF.";
      setError(`Upload failed: ${message}`);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleTextSubmit(e: FormEvent) {
    e.preventDefault();
    if (!textTitle.trim() || !textContent.trim() || !lang) return;

    setIsUploading(true);
    setError(null);
    try {
      const doc = await createTextDocument(textTitle.trim(), textContent.trim(), lang);
      navigate(`/read/${doc.id}`);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : "Could not create document.";
      setError(`Error: ${message}`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="upload-page">
      <h1>Add document — {languageName(lang ?? "")}</h1>

      <div className="tab-bar">
        <button
          type="button"
          className={`tab${tab === "pdf" ? " active" : ""}`}
          onClick={() => { setTab("pdf"); setError(null); }}
        >
          PDF
        </button>
        <button
          type="button"
          className={`tab${tab === "text" ? " active" : ""}`}
          onClick={() => { setTab("text"); setError(null); }}
        >
          Paste text
        </button>
      </div>

      {tab === "pdf" ? (
        <form onSubmit={handlePdfSubmit}>
          <label>
            Select a PDF file
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={!file || isUploading} className="btn-primary">
            {isUploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleTextSubmit}>
          <label>
            Title
            <input
              type="text"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="Document title"
              required
            />
          </label>
          <label>
            Text content
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste your text here…"
              rows={12}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button
            type="submit"
            disabled={!textTitle.trim() || !textContent.trim() || isUploading}
            className="btn-primary"
          >
            {isUploading ? "Creating…" : "Create document"}
          </button>
        </form>
      )}
    </div>
  );
}
