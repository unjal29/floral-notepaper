import { useState } from "react";
import type { EditorToolGridProps } from "./EditorToolGrid";
import { EditorToolGrid } from "./EditorToolGrid";
import { MaterialIcon } from "./MaterialIcon";

export function EditorLeftRail({
  onRefreshPreview,
  ...props
}: EditorToolGridProps & { onRefreshPreview: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="editor-card quick-tools">
      <div className="editor-card-heading">
        <button
          type="button"
          className="plain-title"
          onClick={() => setOpen((current) => !current)}
        >
          Quick tools
        </button>
        <button
          type="button"
          className="refresh-button"
          title="Refresh preview"
          onClick={onRefreshPreview}
        >
          <MaterialIcon name="refresh" />
        </button>
      </div>
      {open && <EditorToolGrid {...props} compact />}
    </section>
  );
}
