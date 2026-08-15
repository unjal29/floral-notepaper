export interface TabOption {
  key: string;
  label: string;
}
export function Tabs({
  tabs,
  active,
  onChange,
  ariaLabel = "Tabs",
}: {
  tabs: TabOption[];
  active: string;
  onChange: (key: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="editor-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          className={active === tab.key ? "active" : ""}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
