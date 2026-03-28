import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  type VocabList,
  getVocabList,
  renameVocabList,
  addEntries,
  deleteEntry,
} from "../../api/vocab";

export function VocabListPage() {
  const { lang, listId } = useParams<{ lang: string; listId: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<VocabList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rename
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // Add entries
  const [rawText, setRawText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!listId) return;
    setIsLoading(true);
    getVocabList(Number(listId))
      .then((data) => {
        setList(data);
        setEditName(data.name);
      })
      .finally(() => setIsLoading(false));
  }, [listId]);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!list || !editName.trim()) return;
    const updated = await renameVocabList(list.id, editName.trim());
    setList(updated);
    setIsEditing(false);
  }

  function countValidLines(raw: string): number {
    return raw
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        const parts = trimmed.split(":");
        if (parts.length < 2) return false;
        const native = parts[0].trim();
        const target = parts.slice(1).join(":").trim();
        return native.length > 0 && target.length > 0;
      }).length;
  }

  async function handleAddEntries(e: React.FormEvent) {
    e.preventDefault();
    if (!list || !rawText.trim()) return;
    setIsAdding(true);
    try {
      const updated = await addEntries(list.id, rawText.trim());
      setList(updated);
      setRawText("");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteEntry(entryId: number) {
    if (!list) return;
    await deleteEntry(list.id, entryId);
    setList((prev) =>
      prev ? { ...prev, entries: prev.entries.filter((e) => e.id !== entryId) } : null
    );
  }

  if (isLoading) return <div className="loading">Loading…</div>;
  if (!list) return <div className="loading">List not found.</div>;

  const validCount = countValidLines(rawText);

  return (
    <div className="vocab-page">
      <Link to={`/learn/${lang}/vocab`} className="back-link">← Vocab lists</Link>

      <div className="page-top" style={{ marginTop: 12 }}>
        {isEditing ? (
          <form onSubmit={handleRename} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-delete" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <h1
            style={{ cursor: "pointer" }}
            title="Click to rename"
            onClick={() => setIsEditing(true)}
          >
            {list.name} ✎
          </h1>
        )}

        <button
          className="btn-primary"
          onClick={() => navigate(`/learn/${lang}/vocab/${list.id}/practice`)}
          disabled={list.entries.length === 0}
        >
          Practice
        </button>
      </div>

      {/* Add words section */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Add words</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
          One per line in <code>native:target</code> format (e.g. <code>hello:hola</code>)
        </p>
        <form onSubmit={handleAddEntries}>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={"hello:hola\ngoodbye:adios"}
            rows={5}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 14 }}
          />
          {rawText.trim() && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0" }}>
              {validCount} valid {validCount === 1 ? "entry" : "entries"} found
            </p>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={validCount === 0 || isAdding}
            style={{ marginTop: 8 }}
          >
            {isAdding ? "Adding…" : "Add"}
          </button>
        </form>
      </section>

      {/* Entries table */}
      {list.entries.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No words yet. Add some above!</p>
      ) : (
        <table className="vocab-entry-table">
          <thead>
            <tr>
              <th>Native</th>
              <th>Target</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.native_word}</td>
                <td>{entry.target_word}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteEntry(entry.id)}
                    aria-label={`Delete ${entry.native_word}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
