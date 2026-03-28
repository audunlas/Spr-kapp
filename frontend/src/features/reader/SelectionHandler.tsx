import { useEffect, useRef } from "react";

interface SelectionHandlerProps {
  children: React.ReactNode;
  onSelect: (text: string, rect: DOMRect) => void;
}

/**
 * Fires onSelect when the user finishes a multi-word text selection inside
 * this container — works via mouseup on desktop and via the document's
 * selectionchange event (debounced) on mobile/touch.
 */
export function SelectionHandler({ children, onSelect }: SelectionHandlerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

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
    onSelectRef.current(selectedText, rect);
  }

  // Desktop: fire immediately on mouseup
  function handleMouseUp() {
    checkSelection();
  }

  // Mobile: listen to selectionchange on the document with a debounce.
  // This fires after the user finishes dragging the native selection handles
  // on iOS/Android, which touch events alone can't reliably catch.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function handleSelectionChange() {
      clearTimeout(timeout);
      timeout = setTimeout(checkSelection, 300);
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp} className="selection-handler">
      {children}
    </div>
  );
}
