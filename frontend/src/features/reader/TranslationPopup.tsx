interface TranslationPopupProps {
  sourceText: string | null;
  translation: string | null;
  alternatives: string[];
  isLoading: boolean;
  onClose: () => void;
}

export function TranslationPopup({
  sourceText,
  translation,
  alternatives,
  isLoading,
  onClose,
}: TranslationPopupProps) {
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
        </>
      )}
    </aside>
  );
}
