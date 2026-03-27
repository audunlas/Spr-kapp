import { Fragment } from "react";
import { Token } from "./Token";

interface TextRendererProps {
  text: string;
  onWordClick: (word: string, rect: DOMRect) => void;
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
 */
export function TextRenderer({ text, onWordClick }: TextRendererProps) {
  const paragraphs = text.split(/\n{2,}/);

  return (
    <div className="text-renderer">
      {paragraphs.map((para, pi) => (
        <Fragment key={pi}>
          {pi > 0 && <br />}
          <p className="reader-paragraph">
            {renderParagraph(para, onWordClick)}
          </p>
        </Fragment>
      ))}
    </div>
  );
}

function renderParagraph(para: string, onWordClick: (word: string, rect: DOMRect) => void) {
  // Split on whitespace but keep the whitespace tokens for spacing
  const chunks = para.split(/(\s+)/);
  const elements: React.ReactNode[] = [];

  chunks.forEach((chunk, i) => {
    if (/^\s+$/.test(chunk)) {
      // Whitespace — render as a space
      elements.push(" ");
      return;
    }
    if (!chunk) return;

    // Strip leading/trailing punctuation from the word
    const match = chunk.match(/^([^a-zA-ZÀ-ÿ\d]*)([a-zA-ZÀ-ÿ\d][a-zA-ZÀ-ÿ\d'-]*)([^a-zA-ZÀ-ÿ\d]*)$/);
    if (match) {
      const [, leading, word, trailing] = match;
      if (leading) elements.push(<span key={`l-${i}`} className="punct">{leading}</span>);
      elements.push(<Token key={`t-${i}`} word={word} onClick={onWordClick} />);
      if (trailing) elements.push(<span key={`r-${i}`} className="punct">{trailing}</span>);
    } else {
      // Chunk is entirely punctuation or numbers — render plain
      elements.push(<span key={`p-${i}`} className="punct">{chunk}</span>);
    }
  });

  return elements;
}
