import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { checkExercise, getExercisePlay, type CheckResult, type ExercisePlay } from "../../api/exercises";
import { ExerciseText } from "./ExerciseText";

export function ExercisePlayPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [searchParams] = useSearchParams();
  const backUrl = searchParams.get("back");

  const [exercise, setExercise] = useState<ExercisePlay | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<CheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getExercisePlay(Number(exerciseId))
      .then(setExercise)
      .finally(() => setIsLoading(false));
  }, [exerciseId]);

  function handleToggle(idx: number) {
    if (result) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const res = await checkExercise(Number(exerciseId), [...selected]);
      setResult(res);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleTryAgain() {
    setSelected(new Set());
    setResult(null);
  }

  function getTokenClass(idx: number): string {
    if (!result) {
      return selected.has(idx) ? "ex-token ex-token-selected" : "ex-token";
    }
    if (result.correct_selected.includes(idx)) return "ex-token ex-token-correct";
    if (result.wrong_selected.includes(idx)) return "ex-token ex-token-wrong";
    if (result.missed.includes(idx)) return "ex-token ex-token-missed";
    return "ex-token";
  }

  if (isLoading) return <div className="loading">Loading exercise…</div>;
  if (!exercise) return <div className="loading">Exercise not found.</div>;

  const pct = result && result.total > 0 ? Math.round((result.score / result.total) * 100) : null;

  return (
    <div className="vocab-page">
      {backUrl && <Link to={backUrl} className="back-link">← Back to class</Link>}

      <h1 className="page-title" style={{ marginTop: backUrl ? 16 : 0 }}>{exercise.title}</h1>

      <div style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 15 }}>
        <strong>Task:</strong> {exercise.prompt}
      </div>

      {!result && (
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 14 }}>
          Click the words that match. Click again to deselect.
        </p>
      )}

      <div style={{ padding: "20px 24px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)", marginBottom: 20 }}>
        <ExerciseText
          text={exercise.text_content}
          getTokenClass={getTokenClass}
          onToggle={result ? undefined : handleToggle}
        />
      </div>

      {!result ? (
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitting || selected.size === 0}
        >
          {isSubmitting ? "Checking…" : `Submit${selected.size > 0 ? ` (${selected.size} selected)` : ""}`}
        </button>
      ) : (
        <div>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", margin: "0 0 8px" }}>
            {result.score} / {result.total} correct {pct !== null && `(${pct}%)`}
          </p>
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
            <span><span className="ex-token ex-token-correct" style={{ pointerEvents: "none" }}>word</span> Correct</span>
            <span><span className="ex-token ex-token-wrong" style={{ pointerEvents: "none" }}>word</span> Wrong</span>
            <span><span className="ex-token ex-token-missed" style={{ pointerEvents: "none" }}>word</span> Missed</span>
          </div>
          <button className="btn-primary" onClick={handleTryAgain}>Try again</button>
        </div>
      )}
    </div>
  );
}
