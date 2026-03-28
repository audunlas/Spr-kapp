import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { languageName } from "../../constants/languages";
import { deleteDocument, getDocuments, seedLanguage, type Document } from "../../api/documents";

export function DocumentListPage() {
  const { lang } = useParams<{ lang: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!lang) return;
    setIsLoading(true);
    const seedKey = `seeded_${lang}`;
    const alreadySeeded = localStorage.getItem(seedKey);
    (alreadySeeded ? Promise.resolve() : seedLanguage(lang).catch(() => {}))
      .then(() => {
        if (!alreadySeeded) localStorage.setItem(seedKey, "1");
        return getDocuments(lang);
      })
      .then(setDocuments)
      .finally(() => setIsLoading(false));
  }, [lang]);

  async function handleDelete(id: number) {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  if (isLoading) return <div className="loading">Loading…</div>;

  return (
    <div className="document-list-page">
      <div className="page-top">
        <h1>{languageName(lang ?? "")}</h1>
        <Link to={`/learn/${lang}/upload`} className="btn-primary">Add material</Link>
      </div>
      {documents.length === 0 ? (
        <div className="empty-state">
          <p>No documents yet.</p>
          <Link to={`/learn/${lang}/upload`} className="btn-primary">Add your first material</Link>
        </div>
      ) : (
        <ul className="doc-list">
          {documents.map((doc) => (
            <li key={doc.id} className="doc-card">
              <div className="doc-info">
                <span className="doc-title">{doc.title}</span>
                <span className="doc-meta">{doc.page_count} page{doc.page_count !== 1 ? "s" : ""}</span>
              </div>
              <div className="doc-actions">
                <Link to={`/read/${doc.id}`} className="btn-read">Read</Link>
                <button className="btn-delete" onClick={() => handleDelete(doc.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
