import { useRef } from "react";

interface TokenProps {
  word: string;
  isAnchor?: boolean;
  onClick: (word: string, rect: DOMRect) => void;
}

export function Token({ word, isAnchor, onClick }: TokenProps) {
  const ref = useRef<HTMLSpanElement>(null);

  function handleClick() {
    if (ref.current) {
      onClick(word, ref.current.getBoundingClientRect());
    }
  }

  return (
    <span
      ref={ref}
      className={`token${isAnchor ? " token-anchor" : ""}`}
      data-word={word}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {word}
    </span>
  );
}
