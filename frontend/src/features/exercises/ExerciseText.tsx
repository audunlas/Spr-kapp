import { Fragment } from "react";

interface ExerciseTextProps {
  text: string;
  getTokenClass: (idx: number) => string;
  onToggle?: (idx: number) => void;
}

/**
 * Renders text with clickable word tokens for grammar exercises.
 * Uses the same tokenization logic as TextRenderer so word indices
 * are consistent with the backend correct_indices list.
 */
export function ExerciseText({ text, getTokenClass, onToggle }: ExerciseTextProps) {
  const paragraphs = text.split(/\n{2,}/);
  let wordIdx = 0;

  const paragraphElements = paragraphs.map((para, pi) => {
    const chunks = para.split(/(\s+)/);
    const elements: React.ReactNode[] = [];

    chunks.forEach((chunk, ci) => {
      if (/^\s+$/.test(chunk)) { elements.push(" "); return; }
      if (!chunk) return;

      const match = chunk.match(/^([^a-zA-ZÀ-ÿ\d]*)([a-zA-ZÀ-ÿ\d][a-zA-ZÀ-ÿ\d'-]*)([^a-zA-ZÀ-ÿ\d]*)$/);
      if (match) {
        const [, leading, word, trailing] = match;
        const thisIdx = wordIdx++;
        const cls = getTokenClass(thisIdx);
        if (leading) elements.push(<span key={`l-${pi}-${ci}`}>{leading}</span>);
        elements.push(
          <span
            key={`t-${pi}-${ci}`}
            className={cls}
            onClick={() => onToggle?.(thisIdx)}
            role={onToggle ? "button" : undefined}
            tabIndex={onToggle ? 0 : undefined}
            onKeyDown={(e) => e.key === "Enter" && onToggle?.(thisIdx)}
          >
            {word}
          </span>
        );
        if (trailing) elements.push(<span key={`r-${pi}-${ci}`}>{trailing}</span>);
      } else {
        elements.push(<span key={`p-${pi}-${ci}`}>{chunk}</span>);
      }
    });

    return (
      <Fragment key={pi}>
        {pi > 0 && <br />}
        <p className="reader-paragraph" style={{ marginBottom: 0 }}>{elements}</p>
      </Fragment>
    );
  });

  return <div className="text-renderer">{paragraphElements}</div>;
}
