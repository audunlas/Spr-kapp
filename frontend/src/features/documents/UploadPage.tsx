import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { languageName } from "../../constants/languages";
import { uploadDocument } from "../../api/documents";

export function UploadPage() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
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

  return (
    <div className="upload-page">
      <h1>Upload PDF — {languageName(lang ?? "")}</h1>
      <form onSubmit={handleSubmit}>
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
    </div>
  );
}
