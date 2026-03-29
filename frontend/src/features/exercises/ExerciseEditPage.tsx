import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createExercise,
  getExercise,
  updateExercise,
} from "../../api/exercises";
import { ExerciseText } from "./ExerciseText";

type Phase = "form" | "marking";

export function ExerciseEditPage() {
  const { classId, exerciseId } = useParams<{ classId?: string; exerciseId?: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("form");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [textContent, setTextContent] = useState("");
  const [markedIndices, setMarkedIndices] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(!!exerciseId);
  const [isSaving, setIsSaving] = useState(false);
  const [loadedClassId, setLoadedClassId] = useState<number | null>(null);

  useEffect(() => {
    if (!exerciseId) return;
    getExercise(Number(exerciseId))
      .then((ex) => {
        setTitle(ex.title);
        setPrompt(ex.prompt);
        setTextContent(ex.text_content);
        setMarkedIndices(new Set(ex.correct_indices));
        setLoadedClassId(ex.class_id);
        setPhase("marking");
      })
      .finally(() => setIsLoading(false));
  }, [exerciseId]);

  function handleToggle(idx: number) {
    setMarkedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function getTokenClass(idx: number): string {
    return markedIndices.has(idx) ? "ex-token ex-token-marked" : "ex-token";
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      if (exerciseId) {
        await updateExercise(Number(exerciseId), {
          title,
          prompt,
          text_content: textContent,
          correct_indices: [...markedIndices],
        });
        navigate(`/classes/${loadedClassId}/manage`);
      } else {
        await createExercise({
          class_id: Number(classId),
          title,
          prompt,
          text_content: textContent,
          correct_indices: [...markedIndices],
        });
        navigate(`/classes/${classId}/manage`);
      }
    } finally {
      setIsSaving(false);
    }
  }

  const backHref = exerciseId
    ? `/classes/${loadedClassId}/manage`
    : `/classes/${classId}/manage`;

  if (isLoading) return <div className="loading">Loading…</div>;

  return (
    <div className="vocab-page">
      <Link to={backHref} className="back-link">← Back to class</Link>
      <h1 className="page-title" style={{ marginTop: 16 }}>
        {exerciseId ? "Edit exercise" : "New exercise"}
      </h1>

      {phase === "form" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 3 — Indefinido"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
              Instruction for students
            </label>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Mark all verbs in the indefinido tense"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Text</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste or type the text students will read…"
              rows={10}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 15, lineHeight: 1.7, resize: "vertical" }}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => setPhase("marking")}
            disabled={!title.trim() || !prompt.trim() || !textContent.trim()}
          >
            Continue: Mark words →
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{title}</p>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
                Task: <em>{prompt}</em>
              </p>
            </div>
            <button
              className="btn-read"
              style={{ fontSize: 13 }}
              onClick={() => { setPhase("form"); setMarkedIndices(new Set()); }}
            >
              Edit text (clears marks)
            </button>
          </div>

          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
            Click words to mark them as correct answers. Click again to unmark.
            {markedIndices.size > 0 && (
              <strong style={{ color: "var(--text)" }}> {markedIndices.size} word{markedIndices.size !== 1 ? "s" : ""} marked.</strong>
            )}
          </p>

          <div style={{ padding: "20px 24px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", marginBottom: 20 }}>
            <ExerciseText text={textContent} getTokenClass={getTokenClass} onToggle={handleToggle} />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={isSaving || !title.trim() || !prompt.trim()}
            >
              {isSaving ? "Saving…" : "Save exercise"}
            </button>
            {markedIndices.size === 0 && (
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>No words marked yet — you can save and mark later.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
