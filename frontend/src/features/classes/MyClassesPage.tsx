import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createClass, deleteClass, getMyClasses, type ClassRoom } from "../../api/classes";

interface JoinedClass { code: string; name: string; }

export function MyClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [joinedClasses, setJoinedClasses] = useState<JoinedClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    getMyClasses().then((myClasses) => {
      setClasses(myClasses);
      // Load joined classes from localStorage, excluding ones the user owns
      const ownedCodes = new Set(myClasses.map((c) => c.share_code));
      const stored: JoinedClass[] = JSON.parse(localStorage.getItem("joinedClasses") ?? "[]");
      setJoinedClasses(stored.filter((j) => !ownedCodes.has(j.code)));
    }).finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const cls = await createClass(newName.trim(), newDesc.trim() || undefined);
      setClasses((prev) => [cls, ...prev]);
      setShowForm(false);
      setNewName("");
      setNewDesc("");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this class? Students will lose access.")) return;
    await deleteClass(id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }

  function copyLink(cls: ClassRoom) {
    navigator.clipboard.writeText(`${window.location.origin}/class/${cls.share_code}`);
    setCopied(cls.id);
    setTimeout(() => setCopied(null), 1500);
  }

  if (isLoading) return <div className="loading">Loading…</div>;

  return (
    <div className="vocab-page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 className="page-title">My Classes</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ New class</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Create new class</h2>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Class name"
            autoFocus
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14 }}
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn-primary" disabled={!newName.trim() || creating}>
              {creating ? "Creating…" : "Create"}
            </button>
            <button type="button" className="btn-read" onClick={() => { setShowForm(false); setNewName(""); setNewDesc(""); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {classes.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No classes yet. Create one to share texts and vocab with students.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {classes.map((cls) => (
            <div key={cls.id} className="card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{cls.name}</h2>
                  {cls.description && <p style={{ margin: "0 0 8px", color: "var(--text-muted)", fontSize: 14 }}>{cls.description}</p>}
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
                    {cls.documents.length} text{cls.documents.length !== 1 ? "s" : ""} · {cls.vocab_lists.length} vocab list{cls.vocab_lists.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button className="btn-read" onClick={() => copyLink(cls)} style={{ fontSize: 13 }}>
                    {copied === cls.id ? "Copied ✓" : "Copy link"}
                  </button>
                  <Link to={`/classes/${cls.id}/manage`} className="btn-read" style={{ fontSize: 13 }}>Manage</Link>
                  <button className="btn-read" onClick={() => handleDelete(cls.id)} style={{ fontSize: 13, color: "var(--danger)" }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {joinedClasses.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Joined classes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {joinedClasses.map((j) => (
              <div key={j.code} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link to={`/class/${j.code}`} style={{ fontWeight: 500, textDecoration: "none", color: "var(--text)" }}>
                  {j.name}
                </Link>
                <button
                  className="btn-read"
                  style={{ fontSize: 12, color: "var(--text-muted)" }}
                  onClick={() => {
                    const updated = joinedClasses.filter((c) => c.code !== j.code);
                    setJoinedClasses(updated);
                    localStorage.setItem("joinedClasses", JSON.stringify(updated));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
