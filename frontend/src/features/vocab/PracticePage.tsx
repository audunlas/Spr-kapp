import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { type VocabEntry, type VocabList, getVocabList } from "../../api/vocab";

type Direction = "target-to-native" | "native-to-target" | "mixed";

const LANGUAGE_CHARS: Record<string, string[]> = {
  es: ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"],
  fr: ["à", "â", "é", "è", "ê", "ë", "î", "ï", "ô", "ù", "û", "ü", "ç", "œ", "æ"],
  de: ["ä", "ö", "ü", "Ä", "Ö", "Ü", "ß"],
  pt: ["á", "â", "ã", "à", "é", "ê", "í", "ó", "ô", "õ", "ú", "ç"],
  it: ["à", "è", "é", "ì", "í", "î", "ò", "ó", "ù", "ú"],
  pl: ["ą", "ć", "ę", "ł", "ń", "ó", "ś", "ź", "ż"],
  nl: ["á", "é", "ë", "ï", "ó", "ö", "ü"],
  sv: ["å", "ä", "ö"],
  da: ["å", "æ", "ø"],
  no: ["å", "æ", "ø"],
  ru: [],
  ar: [],
  zh: [],
  ja: [],
  ko: [],
};

type Screen = "setup" | "practice" | "done";

interface CardResult {
  correct: boolean;
}

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildCards(entries: VocabEntry[], direction: Direction): Array<{ prompt: string; answer: string }> {
  const cards = entries.map((e) => {
    if (direction === "target-to-native") {
      return { prompt: e.target_word, answer: e.native_word };
    } else if (direction === "native-to-target") {
      return { prompt: e.native_word, answer: e.target_word };
    } else {
      // mixed: randomly pick direction per card
      const flip = Math.random() < 0.5;
      return flip
        ? { prompt: e.target_word, answer: e.native_word }
        : { prompt: e.native_word, answer: e.target_word };
    }
  });
  return shuffled(cards);
}

export function PracticePage() {
  const { lang, listId } = useParams<{ lang: string; listId: string }>();
  const [list, setList] = useState<VocabList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Setup
  const [direction, setDirection] = useState<Direction>("target-to-native");

  // Practice
  const [screen, setScreen] = useState<Screen>("setup");
  const [cards, setCards] = useState<Array<{ prompt: string; answer: string }>>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState<CardResult[]>([]);

  useEffect(() => {
    if (!listId) return;
    setIsLoading(true);
    getVocabList(Number(listId))
      .then(setList)
      .finally(() => setIsLoading(false));
  }, [listId]);

  function handleStart() {
    if (!list) return;
    const builtCards = buildCards(list.entries, direction);
    setCards(builtCards);
    setCardIndex(0);
    setUserAnswer("");
    setSubmitted(false);
    setResults([]);
    setScreen("practice");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const correct = userAnswer.trim().toLowerCase() === cards[cardIndex].answer.toLowerCase();
    setIsCorrect(correct);
    setResults((prev) => [...prev, { correct }]);
    setSubmitted(true);
  }

  function handleNext() {
    if (cardIndex + 1 >= cards.length) {
      setScreen("done");
    } else {
      setCardIndex((i) => i + 1);
      setUserAnswer("");
      setSubmitted(false);
    }
  }

  function handleRestart() {
    setScreen("setup");
    setResults([]);
    setCards([]);
    setCardIndex(0);
    setUserAnswer("");
    setSubmitted(false);
  }

  if (isLoading) return <div className="loading">Loading…</div>;
  if (!list) return <div className="loading">List not found.</div>;

  if (screen === "setup") {
    return (
      <div className="vocab-page">
        <Link to={`/learn/${lang}/vocab/${list.id}`} className="back-link">← Back to list</Link>
        <div className="practice-card" style={{ marginTop: 24 }}>
          <h1>{list.name}</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            {list.entries.length} word{list.entries.length !== 1 ? "s" : ""}
          </p>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Direction</p>
            {(["target-to-native", "native-to-target", "mixed"] as Direction[]).map((d) => (
              <label key={d} style={{ display: "block", marginBottom: 6, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="direction"
                  value={d}
                  checked={direction === d}
                  onChange={() => setDirection(d)}
                  style={{ marginRight: 8 }}
                />
                {d === "target-to-native" ? "Target → Native" : d === "native-to-target" ? "Native → Target" : "Mixed"}
              </label>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={handleStart}
            disabled={list.entries.length === 0}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  if (screen === "done") {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="vocab-page">
        <div className="practice-card">
          <h1>Practice complete!</h1>
          <p style={{ fontSize: 22, fontWeight: 600, color: "var(--accent)", margin: "16px 0" }}>
            {correct} / {total} correct ({pct}%)
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button className="btn-primary" onClick={handleRestart}>Practice again</button>
            <Link to={`/learn/${lang}/vocab/${list.id}`} className="btn-read">Back to list</Link>
          </div>
        </div>
      </div>
    );
  }

  const card = cards[cardIndex];

  return (
    <div className="vocab-page">
      <div className="practice-card">
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
          Card {cardIndex + 1} / {cards.length}
        </p>

        <p style={{ fontSize: 32, fontWeight: 700, color: "var(--text-head)", marginBottom: 24 }}>
          {card.prompt}
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer"
              autoFocus
              style={{ fontSize: 18, padding: "8px 12px", width: "100%", marginBottom: 8 }}
            />
            {lang && LANGUAGE_CHARS[lang] && LANGUAGE_CHARS[lang].length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {LANGUAGE_CHARS[lang].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setUserAnswer((prev) => prev + ch)}
                    style={{ padding: "4px 10px", fontSize: 16, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", cursor: "pointer" }}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={!userAnswer.trim()}>
              Submit
            </button>
          </form>
        ) : (
          <div>
            {isCorrect ? (
              <p style={{ color: "#27ae60", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                Correct!
              </p>
            ) : (
              <p style={{ color: "var(--danger)", fontSize: 18, marginBottom: 16 }}>
                Wrong — correct answer was: <strong>{card.answer}</strong>
              </p>
            )}
            <button className="btn-primary" onClick={handleNext}>
              {cardIndex + 1 >= cards.length ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
