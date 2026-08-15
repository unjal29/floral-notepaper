export function Md1DatePicker({
  id,
  value,
  onChange,
  required = false,
  label,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
}) {
  return (
    <label className="editor-date-field" htmlFor={id}>
      {label && <span>{label}</span>}
      <input
        id={id}
        type="date"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
