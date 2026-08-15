import { useEffect, useRef, useState } from "react";

export function HandwritingPanel({ onInsert }: { onInsert: (snippet: string) => void }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#25313b";
    context.lineWidth = 3;
    context.lineCap = "round";
    let drawing = false;
    const down = (event: PointerEvent) => {
      drawing = true;
      context.beginPath();
      context.moveTo(event.offsetX, event.offsetY);
    };
    const move = (event: PointerEvent) => {
      if (drawing) {
        context.lineTo(event.offsetX, event.offsetY);
        context.stroke();
      }
    };
    const up = () => {
      drawing = false;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", up);
    };
  }, [open]);
  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    setResult("");
  };
  return (
    <>
      <button
        type="button"
        className="editor-tool-button handwriting-trigger"
        title="Handwriting"
        onClick={() => setOpen(true)}
      >
        pen
      </button>
      {open && (
        <div className="handwriting-panel">
          <header>
            <strong>Handwriting</strong>
            <button type="button" onClick={() => setOpen(false)}>
              close
            </button>
          </header>
          <canvas ref={canvasRef} width={440} height={190} />
          <div className="handwriting-row">
            <select defaultValue="latex">
              <option value="latex">Inline math</option>
              <option value="block">Block math</option>
              <option value="text">Text</option>
            </select>
            <button
              type="button"
              onClick={() => {
                onInsert(`$${result || "x^2 + y^2 = r^2"}$`);
                setResult("");
              }}
            >
              Insert
            </button>
            <button type="button" onClick={clear}>
              Clear
            </button>
          </div>
          <input
            value={result}
            onChange={(event) => setResult(event.target.value)}
            placeholder="Recognition result (editable)"
          />
          <small>Local canvas mode. Edit the result before inserting it.</small>
        </div>
      )}
    </>
  );
}
