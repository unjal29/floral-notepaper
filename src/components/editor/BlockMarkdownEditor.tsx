import { useRef } from "react";

export function BlockMarkdownEditor({
  content,
  onChange,
  fontFamily = "sans",
  onEditorFocus,
  onDropImages,
  onDropFiles,
}: {
  content: string;
  onChange: (value: string) => void;
  fontFamily?: "sans" | "serif";
  onEditorFocus?: (element: HTMLTextAreaElement, offset: number) => void;
  onDropImages?: (markdown: string) => void;
  onDropFiles?: (files: File[]) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <div
      className={`block-markdown-editor ${fontFamily === "serif" ? "serif-editor" : ""}`}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("Files")) event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        if (files.length) onDropFiles?.(files);
        const text = event.dataTransfer.getData("text/plain").trim();
        if (text) onDropImages?.(text);
      }}
    >
      <textarea
        ref={ref}
        value={content}
        spellCheck={false}
        aria-label="Markdown body editor"
        onFocus={() => ref.current && onEditorFocus?.(ref.current, ref.current.selectionStart)}
        onClick={() => ref.current && onEditorFocus?.(ref.current, ref.current.selectionStart)}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Start writing..."
      />
      <div className="block-editor-hint">
        Markdown, LaTeX, tables, HTML, and image drop are supported.
      </div>
    </div>
  );
}
