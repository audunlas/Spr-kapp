import { useState } from "react";

interface TranslationPopupProps {
  sourceText: string | null;
  translation: string | null;
  alternatives: string[];
  isLoading: boolean;
  onClose: () => void;
  vocabLists?: Array<{ id: number; name: string }>;
  onAddToVocabList?: (listId: number) => void;
}

export function TranslationPopup({
  sourceText,
  translation,
  alternatives,
  isLoading,
  onClose,
  vocabLists,
  onAddToVocabList,
}: TranslationPopupProps) {
  const [selectedListId, setSelectedListId] = useState<number | "">("");
  const [addedFeedback, setAddedFeedback] = useState(false);

  function handleAdd() {
    if (!selectedListId || !onAddToVocabList) return;
    onAddToVocabList(Number(selectedListId));
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  }

  const showVocabRow =
    sourceText &&
    translation &&
    !isLoading &&
    vocabLists &&
    vocabLists.length > 0;

  return (
    <aside className="translation-panel">
      {!sourceText ? (
        <p className="panel-hint">Click any word to see its translation</p>
      ) : (
        <>
          <div className="panel-header">
            <span className="panel-source">{sourceText}</span>
            <button className="panel-close" onClick={onClose} aria-label="Close">✕</button>
          </div>

          {isLoading ? (
            <p className="panel-loading">Translating…</p>
          ) : translation ? (
            <>
              <p className="panel-translation">{translation}</p>
              {alternatives.length > 0 && (
                <div className="panel-alternatives">
                  <p className="panel-alt-label">Other translations</p>
                  <ul>
                    {alternatives.map((alt, i) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="panel-error">No translation found</p>
          )}

          {showVocabRow && (
            <div className="panel-vocab-add" style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <p className="panel-alt-label">Add to vocab list</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value === "" ? "" : Number(e.target.value))}
                  style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13 }}
                  aria-label="Select vocab list"
                >
                  <option value="">Select list…</option>
                  {vocabLists!.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                {addedFeedback ? (
                  <span style={{ color: "#27ae60", fontSize: 13, fontWeight: 600 }}>Added ✓</span>
                ) : (
                  <button
                    className="btn-read"
                    onClick={handleAdd}
                    disabled={!selectedListId}
                    style={{ padding: "4px 10px", fontSize: 13 }}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
