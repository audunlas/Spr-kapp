import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDocument, getPage, type Document, type Page } from "../../api/documents";
import { useAuthContext } from "../auth/AuthContext";
import { useTranslation } from "../../hooks/useTranslation";
import { SelectionHandler } from "./SelectionHandler";
import { TextRenderer } from "./TextRenderer";
import { TranslationPopup } from "./TranslationPopup";

interface PanelState {
  sourceText: string;
  translation: string | null;
  alternatives: string[];
}

export function ReaderPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuthContext();
  const [document, setDocument] = useState<Document | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [panel, setPanel] = useState<PanelState | null>(null);

  const { translateText, isLoading: isTranslating } = useTranslation();

  useEffect(() => {
    if (!documentId) return;
    getDocument(Number(documentId)).then(setDocument);
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;
    setIsLoading(true);
    getPage(Number(documentId), currentPage)
      .then(setPage)
      .finally(() => setIsLoading(false));
  }, [documentId, currentPage]);

  async function showTranslation(text: string) {
    const sourceLang = document?.target_language ?? "es";
    const targetLang = user?.native_language ?? "en";
    setPanel({ sourceText: text, translation: null, alternatives: [] });
    const result = await translateText(text, sourceLang, targetLang);
    setPanel((prev) =>
      prev
        ? { ...prev, translation: result?.translation ?? null, alternatives: result?.alternatives ?? [] }
        : null
    );
  }

  if (isLoading && !page) return <div className="loading">Loading document…</div>;

  const backLang = document?.target_language ?? "es";

  return (
    <div className="reader-page">
      <div className="reader-main">
        <div className="reader-header">
          <Link to={`/learn/${backLang}`} className="back-link">← My Documents</Link>
          {document && <h1 className="reader-title">{document.title}</h1>}
          {document && (
            <div className="page-nav">
              <button
                className="btn-nav"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage <= 1}
              >
                ← Prev
              </button>
              <span className="page-indicator">Page {currentPage} of {document.page_count}</span>
              <button
                className="btn-nav"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= (document?.page_count ?? 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        <div className="reader-body">
          {page?.text_content ? (
            <SelectionHandler onSelect={(text) => showTranslation(text)}>
              <TextRenderer text={page.text_content} onWordClick={(word) => showTranslation(word)} />
            </SelectionHandler>
          ) : (
            <p className="empty-page">No text found on this page.</p>
          )}
        </div>
      </div>

      <TranslationPopup
        sourceText={panel?.sourceText ?? null}
        translation={panel?.translation ?? null}
        alternatives={panel?.alternatives ?? []}
        isLoading={isTranslating && panel !== null && panel.translation === null}
        onClose={() => setPanel(null)}
      />
    </div>
  );
}
