import { useRef } from "react";

interface SelectionHandlerProps {
  children: React.ReactNode;
  onSelect: (text: string, rect: DOMRect) => void;
}

/**
 * Wraps its children. On mouseup, checks if the user has a multi-word text
 * selection within this container and fires onSelect with the selected text
 * and the bounding rect of the selection.
 */
export function SelectionHandler({ children, onSelect }: SelectionHandlerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseUp() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    // Only fire for multi-word selections (contains at least one space)
    if (!selectedText || !selectedText.includes(" ")) return;

    // Confirm selection is within our container
    if (!containerRef.current) return;
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !containerRef.current.contains(anchorNode)) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    onSelect(selectedText, rect);
  }

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp} className="selection-handler">
      {children}
    </div>
  );
}
