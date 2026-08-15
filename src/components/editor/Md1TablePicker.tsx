import { useState } from "react";

export function Md1TablePicker({ onInsert }: { onInsert: (markdown: string) => void }) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState({ rows: 0, cols: 0 });
  const insert = (rows: number, cols: number) => {
    const header = Array.from({ length: cols }, (_, index) => `Header ${index + 1}`).join(" | ");
    const divider = Array.from({ length: cols }, () => "---").join(" | ");
    const body = Array.from(
      { length: Math.max(1, rows - 1) },
      () => `| ${Array.from({ length: cols }, () => "Cell").join(" | ")} |`,
    );
    onInsert(`| ${header} |\n| ${divider} |\n${body.join("\n")}`);
    setOpen(false);
  };
  return (
    <div className="picker-anchor">
      <button
        type="button"
        className="editor-tool-button"
        onClick={() => setOpen((current) => !current)}
        title="Insert table"
      >
        table
      </button>
      {open && (
        <div className="table-picker">
          <strong>
            {size.rows || 0} x {size.cols || 0}
          </strong>
          <div className="table-grid">
            {Array.from({ length: 64 }, (_, index) => {
              const row = Math.floor(index / 8) + 1;
              const col = (index % 8) + 1;
              return (
                <button
                  key={index}
                  type="button"
                  className={row <= size.rows && col <= size.cols ? "selected" : ""}
                  onMouseEnter={() => setSize({ rows: row, cols: col })}
                  onClick={() => insert(row, col)}
                  aria-label={`${row} rows ${col} columns`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
