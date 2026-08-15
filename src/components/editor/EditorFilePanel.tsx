import { useRef, useState } from "react";
import { EditorFileTree, type EditorFsNode } from "./EditorFileTree";

export function EditorFilePanel({
  onOpenFile,
  onSave,
  activePath = "",
}: {
  onOpenFile: (path: string, source: string) => void;
  onSave?: () => void;
  activePath?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [nodes, setNodes] = useState<EditorFsNode[]>([]);
  const [expanded, setExpanded] = useState(new Set<string>());
  const [status, setStatus] = useState("Markdown files only");
  const openFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    setNodes(list.map((file) => ({ kind: "file", name: file.name, path: file.name })));
    for (const file of list)
      if (/\.md(?:own)?$/i.test(file.name))
        void file.text().then((source) => onOpenFile(file.name, source));
    setStatus(`${list.length} file(s) loaded`);
  };
  const openNode = (node: EditorFsNode) => {
    const file = Array.from(inputRef.current?.files ?? []).find((item) => item.name === node.name);
    if (file) void file.text().then((source) => onOpenFile(node.path, source));
  };
  return (
    <section className="editor-card file-panel">
      <div className="editor-card-heading">
        <h3>Files</h3>
        <div>
          <button type="button" onClick={() => inputRef.current?.click()}>
            Open
          </button>
          {onSave && (
            <button type="button" onClick={onSave}>
              Save
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,text/markdown"
        multiple
        hidden
        onChange={(event) => openFiles(event.target.files)}
      />
      <p className="file-status">{status}</p>
      {nodes.length ? (
        <EditorFileTree
          nodes={nodes}
          activePath={activePath}
          expanded={expanded}
          onOpenFile={openNode}
          onToggleDirectory={(path) =>
            setExpanded((current) => {
              const next = new Set(current);
              if (next.has(path)) next.delete(path);
              else next.add(path);
              return next;
            })
          }
        />
      ) : (
        <div className="file-empty">
          Choose a Markdown file to open.
          <br />
          <small>The original file panel is kept as an optional component.</small>
        </div>
      )}
    </section>
  );
}
