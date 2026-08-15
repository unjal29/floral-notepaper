import { useRef } from "react";

export function Md1ColorPicker({
  onPick,
  onReset,
  value = "#6fae45",
  label = "Color",
}: {
  onPick: (color: string) => void;
  onReset?: () => void;
  value?: string;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="color-picker-inline">
      <button
        type="button"
        className="editor-tool-button"
        title={label}
        onClick={() => input.current?.click()}
      >
        <span className="color-dot" style={{ backgroundColor: value }} />
      </button>
      <input
        ref={input}
        type="color"
        value={value}
        onChange={(event) => onPick(event.target.value)}
      />
      <button type="button" className="color-reset" onClick={onReset}>
        reset
      </button>
    </div>
  );
}
