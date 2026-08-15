import type { HTMLAttributes } from "react";

const glyphs: Record<string, string> = {
  save: "▣",
  check: "✓",
  mail: "✉",
  refresh: "↻",
  close: "×",
  search: "⌕",
  article: "▤",
  tag: "#",
  chevron_right: "›",
  expand_more: "⌄",
  calendar_month: "▦",
  image: "▧",
  insert_link: "⛓",
  edit_note: "✎",
  push_pin: "⌖",
  mode_comment: "◌",
  hourglass_empty: "⌛",
  download: "⇩",
  upload: "⇧",
  delete: "⌫",
  undo: "↶",
  redo: "↷",
  add: "+",
  folder: "▰",
  folder_open: "▱",
  play_arrow: "▶",
  stop: "■",
};

export function MaterialIcon({
  name,
  className = "",
  ...props
}: { name: string; className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`editor-material-icon ${className}`} aria-hidden="true" {...props}>
      {glyphs[name] ?? name.slice(0, 1)}
    </span>
  );
}
