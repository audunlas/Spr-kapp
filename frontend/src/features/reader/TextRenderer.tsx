import { Fragment } from "react";
import { Token } from "./Token";

interface TextRendererProps {
  text: string;
  onWordClick: (globalIdx: number, word: string, rect: DOMRect) => void;
  anchorIdx?: number | null;
}

/**
 * Tokenizes a string into words and punctuation/whitespace spans.
 * Words become clickable Token components; everything else is plain text.
 *
 * Strategy:
 *  - Split on double newlines → paragraph breaks → render <br /><br />
 *  - Within each paragraph, split on runs of whitespace
 *  - For each whitespace-delimited chunk, strip leading/trailing punctuation
 *    and render the clean word as a Token, with surrounding punctuation as plain spans.
 *  - Each Token receives a global index (across all paragraphs) for tap-to-range selection.
 */
export function TextRenderer({ text, onWordClick, anchorIdx }: TextRendererProps) {
  const paragraphs = text.split(/\n{2,}/);
  let wordIdx = 0;

  const paragraphElements = paragraphs.map((para, pi) => {
    const chunks = para.split(/(\s+)/);
    const elements: React.ReactNode[] = [];

    chunks.forEach((chunk, i) => {
      if (/^\s+$/.test(chunk)) {
        elements.push(" ");
        return;
      }
      if (!chunk) return;

      const match = chunk.match(/^([^a-zA-ZÀ-ÿ\d]*)([a-zA-ZÀ-ÿ\d][a-zA-ZÀ-ÿ\d'-]*)([^a-zA-ZÀ-ÿ\d]*)$/);
      if (match) {
        const [, leading, word, trailing] = match;
        const thisIdx = wordIdx++;
        if (leading) elements.push(<span key={`l-${pi}-${i}`} className="punct">{leading}</span>);
        elements.push(
          <Token
            key={`t-${pi}-${i}`}
            word={word}
            isAnchor={thisIdx === anchorIdx}
            onClick={(w, rect) => onWordClick(thisIdx, w, rect)}
          />
        );
        if (trailing) elements.push(<span key={`r-${pi}-${i}`} className="punct">{trailing}</span>);
      } else {
        elements.push(<span key={`p-${pi}-${i}`} className="punct">{chunk}</span>);
      }
    });

    return (
      <Fragment key={pi}>
        {pi > 0 && <br />}
        <p className="reader-paragraph">{elements}</p>
      </Fragment>
    );
  });

  return <div className="text-renderer">{paragraphElements}</div>;
}
