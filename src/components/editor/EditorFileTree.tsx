export interface EditorFsNode {
  kind: "file" | "directory";
  name: string;
  path: string;
  children?: EditorFsNode[];
}

export function EditorFileTree({
  nodes,
  activePath,
  expanded,
  onOpenFile,
  onToggleDirectory,
  depth = 0,
}: {
  nodes: EditorFsNode[];
  activePath: string;
  expanded: Set<string>;
  onOpenFile: (node: EditorFsNode) => void;
  onToggleDirectory: (path: string) => void;
  depth?: number;
}) {
  return (
    <ul className="editor-file-tree">
      {nodes.map((node) => (
        <li key={node.path}>
          <div
            className={`file-tree-row ${activePath === node.path ? "active" : ""}`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {node.kind === "directory" ? (
              <button type="button" onClick={() => onToggleDirectory(node.path)}>
                {expanded.has(node.path) ? "v" : ">"} {node.name}
              </button>
            ) : (
              <button type="button" onClick={() => onOpenFile(node)}>
                file {node.name}
              </button>
            )}
          </div>
          {node.kind === "directory" && expanded.has(node.path) && node.children && (
            <EditorFileTree
              nodes={node.children}
              activePath={activePath}
              expanded={expanded}
              onOpenFile={onOpenFile}
              onToggleDirectory={onToggleDirectory}
              depth={depth + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
