export type EditorLayoutMode = "split" | "left2" | "right2";
export type EditorPreviewMode = "ankyu" | "dual";
export type EditorVariant = "ankyu" | "original";
export type EditorComponentId =
  | "music"
  | "frontmatter"
  | "toc"
  | "freeNote"
  | "quickTools"
  | "files";

export interface EditorSettings {
  editorVariant: EditorVariant;
  layout: EditorLayoutMode;
  previewMode: EditorPreviewMode;
  components: Record<EditorComponentId, boolean>;
}

export const EDITOR_SETTINGS_EVENT = "floral-editor-settings-changed";
export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  editorVariant: "ankyu",
  layout: "split",
  previewMode: "ankyu",
  components: {
    music: true,
    frontmatter: true,
    toc: true,
    freeNote: true,
    quickTools: true,
    files: false,
  },
};
const STORAGE_KEY = "floral-editor-settings-v2";

function cloneDefaultSettings(): EditorSettings {
  return {
    ...DEFAULT_EDITOR_SETTINGS,
    components: { ...DEFAULT_EDITOR_SETTINGS.components },
  };
}

export function getEditorSettings(): EditorSettings {
  if (typeof window === "undefined") return cloneDefaultSettings();
  try {
    const value = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    ) as Partial<EditorSettings> | null;
    const layout = value?.layout === "left2" || value?.layout === "right2" ? value.layout : "split";
    const previewMode = value?.previewMode === "dual" ? "dual" : "ankyu";
    const editorVariant = value?.editorVariant === "original" ? "original" : "ankyu";
    return {
      editorVariant,
      layout,
      previewMode,
      components: {
        ...DEFAULT_EDITOR_SETTINGS.components,
        ...value?.components,
      },
    };
  } catch {
    return cloneDefaultSettings();
  }
}

export function saveEditorSettings(settings: EditorSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(
    new CustomEvent<EditorSettings>(EDITOR_SETTINGS_EVENT, { detail: settings }),
  );
}
