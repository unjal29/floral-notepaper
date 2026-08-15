import { useMemo, useState } from "react";
import type { WikiPost } from "./editor-model";

export function WikiLinkPicker({
  posts,
  onSelect,
}: {
  posts: WikiPost[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      posts.filter((post) =>
        `${post.title} ${post.path}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [posts, query],
  );
  return (
    <div className="wiki-picker-anchor">
      <button
        type="button"
        className="editor-tool-button"
        title="Insert WikiLink"
        onClick={() => setOpen(true)}
      >
        wiki
      </button>
      {open && (
        <div className="editor-modal-backdrop" onMouseDown={() => setOpen(false)}>
          <div className="wiki-picker-modal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <strong>Insert WikiLink</strong>
              <button type="button" onClick={() => setOpen(false)}>
                close
              </button>
            </header>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or path"
            />
            <div className="wiki-results">
              {filtered.map((post) => (
                <button
                  key={post.path}
                  type="button"
                  onClick={() => {
                    onSelect(`[[${post.path}]]`);
                    setOpen(false);
                  }}
                >
                  {post.title}
                  <small>{post.path}</small>
                </button>
              ))}
              {!filtered.length && <p>No matching posts.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
