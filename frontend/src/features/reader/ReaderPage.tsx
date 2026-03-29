import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getDocument, getPage, type Document, type Page } from "../../api/documents";
import { getVocabLists, createVocabList, addEntries, type VocabList } from "../../api/vocab";
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

/** Extracts clean words in order from text, matching TextRenderer's tokenization. */
function extractWords(text: string): string[] {
  const words: string[] = [];
  for (const para of text.split(/\n{2,}/)) {
    for (const chunk of para.split(/(\s+)/)) {
      if (/^\s+$/.test(chunk) || !chunk) continue;
      const match = chunk.match(/^[^a-zA-ZÀ-ÿ\d]*([a-zA-ZÀ-ÿ\d][a-zA-ZÀ-ÿ\d'-]*)[^a-zA-ZÀ-ÿ\d]*$/);
      if (match) words.push(match[1]);
    }
  }
  return words;
}

export function ReaderPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchParams] = useSearchParams();
  const backUrl = searchParams.get("back");
  const { user } = useAuthContext();
  const [document, setDocument] = useState<Document | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [panel, setPanel] = useState<PanelState | null>(null);
  const [vocabLists, setVocabLists] = useState<VocabList[]>([]);
  const [anchorIdx, setAnchorIdx] = useState<number | null>(null);
  const wordListRef = useRef<string[]>([]);

  const { translateText, isLoading: isTranslating } = useTranslation();

  useEffect(() => {
    if (!documentId) return;
    getDocument(Number(documentId)).then((doc) => {
      setDocument(doc);
      getVocabLists(doc.target_language).then(setVocabLists).catch(() => {});
    });
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;
    setIsLoading(true);
    getPage(Number(documentId), currentPage)
      .then((p) => {
        setPage(p);
        if (p?.text_content) wordListRef.current = extractWords(p.text_content);
      })
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

  function handleTokenClick(idx: number, word: string) {
    if (anchorIdx === null) {
      // First tap: translate word and mark as anchor
      setAnchorIdx(idx);
      showTranslation(word);
    } else if (anchorIdx === idx) {
      // Tap same word: deselect
      setAnchorIdx(null);
      setPanel(null);
    } else {
      // Tap a different word: translate phrase from anchor to here
      const words = wordListRef.current;
      const from = Math.min(anchorIdx, idx);
      const to = Math.max(anchorIdx, idx);
      const phrase = words.slice(from, to + 1).join(" ");
      setAnchorIdx(null);
      showTranslation(phrase);
    }
  }

  function handleClose() {
    setPanel(null);
    setAnchorIdx(null);
  }

  async function handleAddToVocabList(listId: number) {
    if (!panel?.sourceText || !panel?.translation) return;
    await addEntries(listId, `${panel.translation}:${panel.sourceText}`);
  }

  async function handleCreateAndAdd(listName: string) {
    if (!panel?.sourceText || !panel?.translation || !document) return;
    const newList = await createVocabList(listName, document.target_language);
    await addEntries(newList.id, `${panel.translation}:${panel.sourceText}`);
    const updated = await getVocabLists(document.target_language);
    setVocabLists(updated);
  }

  if (isLoading && !page) return <div className="loading">Loading document…</div>;

  const backLang = document?.target_language ?? "es";

  return (
    <div className="reader-page">
      <div className="reader-main">
        <div className="reader-header">
          <Link to={backUrl ?? `/learn/${backLang}`} className="back-link">
            ← {backUrl ? "Back to class" : "My Documents"}
          </Link>
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
            <SelectionHandler onSelect={(text) => { setAnchorIdx(null); showTranslation(text); }}>
              <TextRenderer
                text={page.text_content}
                onWordClick={(idx, word) => handleTokenClick(idx, word)}
                anchorIdx={anchorIdx}
              />
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
        onClose={handleClose}
        vocabLists={vocabLists.map((l) => ({ id: l.id, name: l.name }))}
        onAddToVocabList={handleAddToVocabList}
        targetLanguage={document?.target_language}
        onCreateAndAdd={handleCreateAndAdd}
      />
    </div>
  );
}
