import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addDocumentToClass,
  addVocabListToClass,
  getClass,
  removeDocumentFromClass,
  removeVocabListFromClass,
  updateClass,
  type ClassRoom,
} from "../../api/classes";
import { getDocuments, type Document } from "../../api/documents";
import { getVocabLists, type VocabList } from "../../api/vocab";

export function ClassManagePage() {
  const { classId } = useParams<{ classId: string }>();
  const [cls, setCls] = useState<ClassRoom | null>(null);
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [allLists, setAllLists] = useState<VocabList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [descVal, setDescVal] = useState("");

  useEffect(() => {
    if (!classId) return;
    Promise.all([
      getClass(Number(classId)),
      getDocuments(),
      getVocabLists(),
    ]).then(([c, docs, lists]) => {
      setCls(c);
      setAllDocs(docs);
      setAllLists(lists);
      setNameVal(c.name);
      setDescVal(c.description ?? "");
    }).finally(() => setIsLoading(false));
  }, [classId]);

  function copyLink() {
    if (!cls) return;
    navigator.clipboard.writeText(`${window.location.origin}/class/${cls.share_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSaveName() {
    if (!cls || !nameVal.trim()) return;
    const updated = await updateClass(cls.id, nameVal.trim(), descVal.trim() || undefined);
    setCls(updated);
    setEditingName(false);
  }

  async function handleAddDoc(docId: number) {
    if (!cls) return;
    const updated = await addDocumentToClass(cls.id, docId);
    setCls(updated);
  }

  async function handleRemoveDoc(docId: number) {
    if (!cls) return;
    const updated = await removeDocumentFromClass(cls.id, docId);
    setCls(updated);
  }

  async function handleAddList(listId: number) {
    if (!cls) return;
    const updated = await addVocabListToClass(cls.id, listId);
    setCls(updated);
  }

  async function handleRemoveList(listId: number) {
    if (!cls) return;
    const updated = await removeVocabListFromClass(cls.id, listId);
    setCls(updated);
  }

  if (isLoading) return <div className="loading">Loading…</div>;
  if (!cls) return <div className="loading">Class not found.</div>;

  const classDocIds = new Set(cls.documents.map((d) => d.id));
  const classListIds = new Set(cls.vocab_lists.map((l) => l.id));
  const docsToAdd = allDocs.filter((d) => !classDocIds.has(d.id));
  const listsToAdd = allLists.filter((l) => !classListIds.has(l.id));

  return (
    <div className="vocab-page">
      <Link to="/classes" className="back-link">← My Classes</Link>

      {/* Name / description */}
      <div className="card" style={{ marginTop: 16, marginBottom: 24 }}>
        {editingName ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              autoFocus
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 16, fontWeight: 600 }}
            />
            <textarea
              value={descVal}
              onChange={(e) => setDescVal(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" onClick={handleSaveName} disabled={!nameVal.trim()}>Save</button>
              <button className="btn-read" onClick={() => setEditingName(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>{cls.name}</h1>
              {cls.description && <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>{cls.description}</p>}
            </div>
            <button className="btn-read" onClick={() => setEditingName(true)} style={{ fontSize: 13 }}>Edit</button>
          </div>
        )}

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)", wordBreak: "break-all" }}>
            {window.location.origin}/class/{cls.share_code}
          </span>
          <button className="btn-read" onClick={copyLink} style={{ fontSize: 13, flexShrink: 0 }}>
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </div>

      {/* Documents */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Texts in this class</h2>
        {cls.documents.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>None yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cls.documents.map((doc) => (
              <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)" }}>
                <span style={{ fontSize: 14 }}>{doc.title} <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({doc.target_language.toUpperCase()})</span></span>
                <button className="btn-read" onClick={() => handleRemoveDoc(doc.id)} style={{ fontSize: 12, color: "var(--danger)" }}>Remove</button>
              </div>
            ))}
          </div>
        )}
        {docsToAdd.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <select
              defaultValue=""
              onChange={(e) => { if (e.target.value) { handleAddDoc(Number(e.target.value)); e.target.value = ""; } }}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13 }}
              aria-label="Add a text"
            >
              <option value="">+ Add a text…</option>
              {docsToAdd.map((d) => (
                <option key={d.id} value={d.id}>{d.title} ({d.target_language.toUpperCase()})</option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Vocab lists */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Vocab lists in this class</h2>
        {cls.vocab_lists.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>None yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cls.vocab_lists.map((list) => (
              <div key={list.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)" }}>
                <span style={{ fontSize: 14 }}>{list.name} <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({list.entries.length} words)</span></span>
                <button className="btn-read" onClick={() => handleRemoveList(list.id)} style={{ fontSize: 12, color: "var(--danger)" }}>Remove</button>
              </div>
            ))}
          </div>
        )}
        {listsToAdd.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <select
              defaultValue=""
              onChange={(e) => { if (e.target.value) { handleAddList(Number(e.target.value)); e.target.value = ""; } }}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13 }}
              aria-label="Add a vocab list"
            >
              <option value="">+ Add a vocab list…</option>
              {listsToAdd.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        )}
      </section>
    </div>
  );
}
