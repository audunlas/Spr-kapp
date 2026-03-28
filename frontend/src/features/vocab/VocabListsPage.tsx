import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { type VocabList, getVocabLists, createVocabList, deleteVocabList } from "../../api/vocab";

export function VocabListsPage() {
  const { lang } = useParams<{ lang: string }>();
  const [lists, setLists] = useState<VocabList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!lang) return;
    setIsLoading(true);
    getVocabLists(lang)
      .then(setLists)
      .finally(() => setIsLoading(false));
  }, [lang]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !lang) return;
    setIsCreating(true);
    try {
      const created = await createVocabList(newName.trim(), lang);
      setLists((prev) => [...prev, created]);
      setNewName("");
      setShowCreate(false);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteVocabList(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
  }

  if (isLoading) return <div className="loading">Loading…</div>;

  return (
    <div className="vocab-page">
      <div className="page-top">
        <h1>Vocab lists</h1>
        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
          + Create list
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="List name"
            autoFocus
            required
          />
          <button type="submit" className="btn-primary" disabled={isCreating} style={{ marginLeft: 8 }}>
            {isCreating ? "Creating…" : "Create"}
          </button>
          <button
            type="button"
            className="btn-delete"
            onClick={() => setShowCreate(false)}
            style={{ marginLeft: 8 }}
          >
            Cancel
          </button>
        </form>
      )}

      {lists.length === 0 ? (
        <div className="empty-state">
          <p>No vocab lists yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="doc-list">
          {lists.map((list) => (
            <div key={list.id} className="vocab-list-item doc-card">
              <div className="doc-info">
                <span className="doc-title">{list.name}</span>
                <span className="doc-meta">{list.entries.length} word{list.entries.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="doc-actions">
                <Link to={`/learn/${lang}/vocab/${list.id}`} className="btn-read">
                  Open
                </Link>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(list.id)}
                  aria-label={`Delete ${list.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
