import { useEffect, useState } from "react";
import { MarkdownPreviewLazy } from "../../features/markdown/MarkdownPreviewLazy";

const noteKey = "floral-editor-free-note";
export function EditorFreeNote() {
  const [value, setValue] = useState(() => localStorage.getItem(noteKey) ?? "");
  const [editing, setEditing] = useState(true);
  useEffect(() => {
    localStorage.setItem(noteKey, value);
  }, [value]);
  const download = () => {
    const url = URL.createObjectURL(new Blob([value], { type: "text/markdown" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "free-note.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="editor-card free-note">
      <div className="editor-card-heading">
        <h3>Free note</h3>
        <button type="button" onClick={() => setEditing((current) => !current)}>
          {editing ? "Preview" : "Edit"}
        </button>
      </div>
      {editing ? (
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Temporary notes..."
        />
      ) : (
        <div className="free-note-preview" onClick={() => setEditing(true)}>
          <MarkdownPreviewLazy content={value || "_Empty_"} fontSize={13} />
        </div>
      )}
      <button type="button" className="free-note-download" onClick={download}>
        Download note
      </button>
    </section>
  );
}
