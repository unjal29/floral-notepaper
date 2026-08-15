import { useMemo } from "react";
import { EditorTileIcon } from "./EditorTileIcon";
import { Md1ColorPicker } from "./Md1ColorPicker";
import { Md1TablePicker } from "./Md1TablePicker";

export interface EditorToolGridProps {
  fontFamily: "sans" | "serif";
  onToggleFont: () => void;
  onWrap: (before: string, after?: string, placeholder?: string) => void;
  onPrefix: (prefix: string) => void;
  onInsert: (snippet: string, placeholder?: string) => void;
  onWikiLink: () => void;
  onTransform: (kind: "quotes" | "width" | "kana" | "numeral") => void;
  onCycleWrap: (pairs: [string, string][]) => void;
  onCycleAlign: () => void;
  onColor: (color: string) => void;
  onHighlight: (color: string | null) => void;
  onLineBreak: () => void;
  onHandwriting: () => void;
  compact?: boolean;
}

export function EditorToolGrid(props: EditorToolGridProps) {
  const tools = useMemo(
    () =>
      [
        ["H1", "Heading 1", () => props.onPrefix("# ")],
        ["B", "Bold", () => props.onWrap("**", "**", "bold")],
        ["I", "Italic", () => props.onWrap("*", "*", "italic")],
        ["S", "Strike", () => props.onWrap("~~", "~~", "strike")],
        ["H2", "Heading 2", () => props.onPrefix("## ")],
        [">", "Quote", () => props.onPrefix("> ")],
        ["-", "Unordered list", () => props.onPrefix("- ")],
        ["1.", "Ordered list", () => props.onPrefix("1. ")],
        ["H3", "Heading 3", () => props.onPrefix("### ")],
        ["link", "Link", () => props.onWrap("[", "](https://)", "link")],
        ["img", "Image", () => props.onInsert("![alt](./image.png)")],
        ["wiki", "WikiLink", props.onWikiLink],
        ["font", "Font", props.onToggleFont],
        ["code", "Code", () => props.onWrap("```\n", "\n```", "code")],
        ["table", "Table", () => undefined],
        ["tip", "Callout", () => props.onInsert("> [!TIP]\n> Tip")],
        ["quotes", "Corner quotes", () => props.onTransform("quotes")],
        ["width", "Punctuation", () => props.onTransform("width")],
        ["kana", "Kana", () => props.onTransform("kana")],
        ["num", "Numerals", () => props.onTransform("numeral")],
        ["br", "Line break", props.onLineBreak],
        [
          "sup",
          "Superscript",
          () =>
            props.onCycleWrap([
              ["<sup>", "</sup>"],
              ["<sub>", "</sub>"],
              ["", ""],
            ]),
        ],
        ["under", "Underline", () => props.onWrap("<u>", "</u>", "underline")],
        ["align", "Align", props.onCycleAlign],
        ["html", "HTML break", () => props.onInsert("<br>\n")],
        ["color", "Text color", () => undefined],
        ["mark", "Highlight", () => props.onHighlight("#fff59d")],
        ["pen", "Handwriting", props.onHandwriting],
      ] as Array<[string, string, () => void]>,
    [props],
  );
  return (
    <div className={`tool-grid-panel ${props.compact ? "compact" : ""}`}>
      <div className="tool-grid-sections">
        <div className="tool-section">
          <h4>Common Markdown</h4>
          <div className="tool-grid">
            {tools.slice(0, 12).map(([icon, label, action]) => (
              <button
                key={label}
                type="button"
                title={label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={action}
              >
                <EditorTileIcon name={icon} label={label} />
              </button>
            ))}
          </div>
        </div>
        <div className="tool-section">
          <h4>Extensions</h4>
          <div className="tool-grid">
            {tools.slice(12, 20).map(([icon, label, action]) =>
              label === "Table" ? (
                <Md1TablePicker key={label} onInsert={props.onInsert} />
              ) : (
                <button
                  key={label}
                  type="button"
                  title={label}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={action}
                >
                  <EditorTileIcon name={icon} label={label} />
                </button>
              ),
            )}
          </div>
        </div>
        <div className="tool-section">
          <h4>HTML and transforms</h4>
          <div className="tool-grid">
            {tools.slice(20).map(([icon, label, action]) => (
              <button
                key={label}
                type="button"
                title={label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={action}
              >
                <EditorTileIcon name={icon} label={label} />
              </button>
            ))}
          </div>
          <div className="tool-color-row">
            <Md1ColorPicker onPick={props.onColor} label="Text color" />
            <Md1ColorPicker
              onPick={(color) => props.onHighlight(color)}
              onReset={() => props.onHighlight(null)}
              value="#fff59d"
              label="Highlight"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
