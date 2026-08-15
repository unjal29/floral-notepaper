import { MaterialIcon } from "./MaterialIcon";

export function EditorTileIcon({
  name,
  label,
  className = "",
}: {
  name: string;
  label?: string;
  className?: string;
}) {
  return (
    <span className={`editor-tile-icon ${className}`} aria-label={label}>
      <MaterialIcon name={name} />
    </span>
  );
}
