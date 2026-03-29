import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClassByShareCode, type ClassRoom } from "../../api/classes";

export function ClassViewPage() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [cls, setCls] = useState<ClassRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shareCode) return;
    getClassByShareCode(shareCode)
      .then(setCls)
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [shareCode]);

  if (isLoading) return <div className="loading">Loading class…</div>;
  if (notFound) return <div className="loading">Class not found. Check the link and try again.</div>;
  if (!cls) return null;

  return (
    <div className="vocab-page">
      <h1 className="page-title">{cls.name}</h1>
      {cls.description && (
        <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 15 }}>{cls.description}</p>
      )}

      {/* Texts */}
      {cls.documents.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Texts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cls.documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/read/${doc.id}?back=/class/${shareCode}`}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", textDecoration: "none", color: "var(--text)" }}
              >
                <span style={{ fontWeight: 500 }}>{doc.title}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{doc.target_language.toUpperCase()} · {doc.page_count} p.</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Vocab lists */}
      {cls.vocab_lists.length > 0 && (
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Vocabulary</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cls.vocab_lists.map((list) => (
              <div key={list.id} className="card">
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600 }}>
                  {list.name}
                  <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: 13, marginLeft: 8 }}>
                    {list.entries.length} word{list.entries.length !== 1 ? "s" : ""}
                  </span>
                </h3>
                {list.entries.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <tbody>
                      {list.entries.map((entry) => (
                        <tr key={entry.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "6px 0", color: "var(--text-muted)" }}>{entry.native_word}</td>
                          <td style={{ padding: "6px 0", paddingLeft: 16, fontWeight: 500 }}>{entry.target_word}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>No entries.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grammar exercises */}
      {cls.exercises.length > 0 && (
        <section style={{ marginTop: cls.documents.length > 0 || cls.vocab_lists.length > 0 ? 0 : 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Grammar exercises</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cls.exercises.map((ex) => (
              <Link
                key={ex.id}
                to={`/exercises/${ex.id}/play?back=/class/${shareCode}`}
                style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", textDecoration: "none", color: "var(--text)" }}
              >
                <span style={{ fontWeight: 500 }}>{ex.title}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{ex.prompt}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {cls.documents.length === 0 && cls.vocab_lists.length === 0 && cls.exercises.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>This class has no content yet.</p>
      )}
    </div>
  );
}
