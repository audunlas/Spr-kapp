import { useRef } from "react";

interface SelectionHandlerProps {
  children: React.ReactNode;
  onSelect: (text: string, rect: DOMRect) => void;
}

/**
 * Wraps its children. On mouseup or touchend, checks if the user has a
 * multi-word text selection within this container and fires onSelect.
 */
export function SelectionHandler({ children, onSelect }: SelectionHandlerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function checkSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || !selectedText.includes(" ")) return;

    if (!containerRef.current) return;
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !containerRef.current.contains(anchorNode)) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    onSelect(selectedText, rect);
  }

  function handleMouseUp() {
    checkSelection();
  }

  function handleTouchEnd() {
    // iOS finalizes the selection slightly after touchend
    setTimeout(checkSelection, 50);
  }

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp} onTouchEnd={handleTouchEnd} className="selection-handler">
      {children}
    </div>
  );
}
