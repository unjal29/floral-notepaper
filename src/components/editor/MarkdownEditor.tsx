import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnkyuMusic } from "../Ankyu/AnkyuMusic";
import {
  EDITOR_SETTINGS_EVENT,
  getEditorSettings,
  saveEditorSettings,
  type EditorComponentId,
  type EditorLayoutMode,
  type EditorPreviewMode,
  type EditorSettings,
} from "../Ankyu/editor-settings";
import { ArticlePreview } from "./ArticlePreview";
import { BlockMarkdownEditor } from "./BlockMarkdownEditor";
import { EditorFilePanel } from "./EditorFilePanel";
import { EditorFreeNote } from "./EditorFreeNote";
import { EditorLeftRail } from "./EditorLeftRail";
import { EditorTocNav, type PreviewHeading } from "./EditorTocNav";
import { EditorToolGrid } from "./EditorToolGrid";
import { FrontmatterSlim } from "./FrontmatterSlim";
import { HandwritingPanel } from "./HandwritingPanel";
import { MaterialIcon } from "./MaterialIcon";
import { Tabs } from "./Tabs";
import { WikiLinkPicker } from "./WikiLinkPicker";
import {
  buildMarkdownDocument,
  createEditorDocument,
  getMarkdownFilename,
  parseMarkdownDocument,
  type ArticlePreviewConfig,
  type EditorDocument,
  type WikiPost,
} from "./editor-model";
import {
  buildTimerFooter,
  computeElapsedMs,
  createTimerState,
  formatDuration,
  pauseTimer,
  resumeTimer,
  stopTimer,
  type WritingTimerState,
} from "./editor-timer";
import {
  cycleKana,
  cycleNumeral,
  cycleWidth,
  detectKanaStage,
  detectNumeralStage,
  detectWidthStage,
  toggleCornerQuotes,
} from "./editor-transforms";
import "./editor.css";

type EditorMode = "write" | "preview";
type LayoutMode = EditorLayoutMode;
type ComponentId = EditorComponentId;
const draftKey = "floral-editor-draft-v1";
const legacyComponentKey = "floral-editor-components-v1";
const legacyLayoutKey = "floral-editor-layout-v1";
const componentLabels: Record<ComponentId, string> = {
  music: "Music",
  frontmatter: "Frontmatter",
  toc: "TOC",
  freeNote: "Free note",
  quickTools: "Quick tools",
  files: "File panel",
};

function readInitialEditorSettings(): EditorSettings {
  const settings = getEditorSettings();
  try {
    const legacyLayout = localStorage.getItem(legacyLayoutKey) as LayoutMode | null;
    const legacyComponents = JSON.parse(
      localStorage.getItem(legacyComponentKey) ?? "null",
    ) as Partial<Record<ComponentId, boolean>> | null;
    return {
      ...settings,
      layout:
        legacyLayout === "left2" || legacyLayout === "right2" || legacyLayout === "split"
          ? legacyLayout
          : settings.layout,
      components: { ...settings.components, ...legacyComponents },
    };
  } catch {
    return settings;
  }
}
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
function extractHeadings(value: string): PreviewHeading[] {
  let fence = false;
  return value.split(/\r?\n/).flatMap((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fence = !fence;
      return [];
    }
    if (fence) return [];
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    return match
      ? [{ depth: match[1].length, text: match[2].trim(), slug: slugify(match[2]) }]
      : [];
  });
}
const defaultPreview: ArticlePreviewConfig = {
  profileName: "",
  siteTitle: "Article Editor - Ankyu",
  siteUrl: "",
  showCover: true,
  useCoverOverlay: true,
  showSharePoster: false,
  showSponsor: false,
  sponsorUrl: "",
  showLicense: true,
  licenseName: "",
  licenseUrl: "",
  showVisitorCount: false,
  labels: {},
};

export function MarkdownEditor({
  categories = [],
  suggestedTags = [],
  previewConfig = defaultPreview,
  wikiPosts = [],
}: {
  categories?: string[];
  suggestedTags?: string[];
  previewConfig?: ArticlePreviewConfig;
  wikiPosts?: WikiPost[];
}) {
  const [article, setArticle] = useState<EditorDocument>(() => {
    try {
      return (
        parseMarkdownDocument(localStorage.getItem(draftKey) ?? "") ?? {
          ...createEditorDocument(),
          title: "Draft",
          content: "# Start writing\n\nThis is a new Markdown article.",
        }
      );
    } catch {
      return createEditorDocument();
    }
  });
  const [mode, setMode] = useState<EditorMode>("write");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [error, setError] = useState("");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif">("sans");
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(readInitialEditorSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timer, setTimer] = useState<WritingTimerState>(createTimerState);
  const [clock, setClock] = useState(Date.now());
  const [activePath, setActivePath] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const headings = useMemo(() => extractHeadings(article.content), [article.content]);
  const layout = editorSettings.layout;
  const previewMode: EditorPreviewMode = editorSettings.previewMode;
  const components = editorSettings.components;
  const words = useMemo(
    () => (article.content.trim() ? article.content.trim().split(/\s+/u).length : 0),
    [article.content],
  );
  const minutes = Math.max(1, Math.ceil(words / 300));
  const updateArticle = useCallback(
    (patch: Partial<EditorDocument>) => setArticle((current) => ({ ...current, ...patch })),
    [],
  );
  useEffect(() => {
    localStorage.setItem(draftKey, buildMarkdownDocument(article));
  }, [article]);
  useEffect(() => {
    const onSettingsChange = (event: Event) => {
      const detail = (event as CustomEvent<EditorSettings>).detail;
      if (!detail) return;
      setEditorSettings((current) =>
        JSON.stringify(current) === JSON.stringify(detail) ? current : detail,
      );
    };
    window.addEventListener(EDITOR_SETTINGS_EVENT, onSettingsChange);
    return () => window.removeEventListener(EDITOR_SETTINGS_EVENT, onSettingsChange);
  }, []);
  useEffect(() => {
    if (!timer.startedAt || timer.paused || timer.endedAt) return;
    const id = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timer.startedAt, timer.paused, timer.endedAt]);
  useEffect(() => {
    if (article.enableTimer && !timer.startedAt)
      setTimer({ ...createTimerState(), startedAt: Date.now() });
  }, [article.enableTimer, timer.startedAt]);
  const replaceSelection = (
    transform: (
      selected: string,
      start: number,
      end: number,
      value: string,
    ) => { text: string; cursor?: [number, number] },
  ) => {
    const element = textareaRef.current;
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const value = element.value;
    const result = transform(value.slice(start, end), start, end, value);
    updateArticle({ content: value.slice(0, start) + result.text + value.slice(end) });
    requestAnimationFrame(() => {
      element.focus();
      const cursor = result.cursor ?? [result.text.length, result.text.length];
      element.setSelectionRange(start + cursor[0], start + cursor[1]);
    });
  };
  const onWrap = (before: string, after = "", placeholder = "text") =>
    replaceSelection((selected) => {
      const text = selected || placeholder;
      return { text: before + text + after, cursor: [before.length, before.length + text.length] };
    });
  const onPrefix = (prefix: string) =>
    replaceSelection((selected) => ({ text: prefix + (selected || "text") }));
  const onInsert = (snippet: string, placeholder = "") =>
    replaceSelection((selected) => ({
      text: snippet.replace(placeholder, selected || placeholder),
    }));
  const onTransform = (kind: "quotes" | "width" | "kana" | "numeral") =>
    replaceSelection((selected, _start, _end, value) => {
      const input = selected || value;
      if (kind === "quotes") return { text: toggleCornerQuotes(input) };
      if (kind === "width") return { text: cycleWidth(input, detectWidthStage(input)).text };
      if (kind === "kana") return { text: cycleKana(input, detectKanaStage(input)).text };
      return { text: cycleNumeral(input, detectNumeralStage(input)).text };
    });
  const onCycleWrap = (pairs: [string, string][]) => onWrap(pairs[0][0], pairs[0][1], "text");
  const onCycleAlign = () => onWrap('<div style="text-align: center">\n', "\n</div>", "paragraph");
  const onColor = (color: string) => onWrap(`<span style="color:${color}">`, "</span>");
  const onHighlight = (color: string | null) => {
    if (color) onWrap(`<mark style="background:${color}">`, "</mark>");
  };
  const updateEditorSettings = (patch: Partial<EditorSettings>) => {
    const next: EditorSettings = {
      ...editorSettings,
      ...patch,
      components: { ...editorSettings.components, ...patch.components },
    };
    setEditorSettings(next);
    saveEditorSettings(next);
  };
  const toggle = (id: ComponentId) =>
    updateEditorSettings({ components: { [id]: !components[id] } });
  const save = () => {
    if (!article.title.trim()) {
      setError("A title is required before saving.");
      return;
    }
    setError("");
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    const content = article.enableTimer
      ? article.content + buildTimerFooter(timer, clock)
      : article.content;
    const blob = new Blob([buildMarkdownDocument({ ...article, content })], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getMarkdownFilename(article);
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const openFile = (path: string, source: string) => {
    const parsed = parseMarkdownDocument(source);
    if (!parsed) {
      setError("The selected file does not contain valid Frontmatter.");
      return;
    }
    setArticle(parsed);
    setActivePath(path);
    setSavedAt("");
  };
  const openWiki = () =>
    (document.querySelector(".wiki-picker-anchor button") as HTMLButtonElement | null)?.click();
  const openHandwriting = () =>
    (document.querySelector(".handwriting-trigger") as HTMLButtonElement | null)?.click();
  const tools = {
    fontFamily,
    onToggleFont: () => setFontFamily((current) => (current === "sans" ? "serif" : "sans")),
    onWrap,
    onPrefix,
    onInsert,
    onWikiLink: openWiki,
    onTransform,
    onCycleWrap,
    onCycleAlign,
    onColor,
    onHighlight,
    onLineBreak: () => onInsert("\\\n"),
    onHandwriting: openHandwriting,
  };
  const left = [
    components.music && <AnkyuMusic key="music" />,
    components.frontmatter && (
      <FrontmatterSlim
        key="frontmatter"
        article={article}
        onChange={updateArticle}
        categories={categories}
        suggestedTags={suggestedTags}
        onOpenFile={() => toggle("files")}
      />
    ),
    components.toc && <EditorTocNav key="toc" headings={headings} />,
    components.files && (
      <EditorFilePanel key="files" activePath={activePath} onOpenFile={openFile} onSave={save} />
    ),
  ].filter(Boolean);
  const right = [
    components.freeNote && <EditorFreeNote key="freeNote" />,
    components.quickTools && (
      <EditorLeftRail key="quickTools" {...tools} onRefreshPreview={() => setMode("preview")} />
    ),
  ].filter(Boolean);
  const leftSplit = Math.ceil(left.length / 2);
  const rightSplit = Math.ceil(right.length / 2);
  const writingEditor = (
    <div className="write-view">
      <div className="editor-content-heading">
        <h2>Body</h2>
        <button type="button" onClick={() => setDrawerOpen((value) => !value)}>
          {drawerOpen ? "Hide properties" : "Edit tools"}
        </button>
      </div>
      {drawerOpen && (
        <div className="editor-drawer">
          <FrontmatterSlim
            article={article}
            onChange={updateArticle}
            categories={categories}
            suggestedTags={suggestedTags}
          />
          <div className="full-source">
            <h3>Source</h3>
            <textarea
              value={buildMarkdownDocument(article)}
              onChange={(event) => {
                const parsed = parseMarkdownDocument(event.target.value);
                if (parsed) setArticle(parsed);
              }}
            />
          </div>
        </div>
      )}
      <details className="writing-toolbar" open>
        <summary>Editing tools</summary>
        <EditorToolGrid {...tools} />
      </details>
      <BlockMarkdownEditor
        content={article.content}
        onChange={(content) => updateArticle({ content })}
        fontFamily={fontFamily}
        onEditorFocus={(element) => {
          textareaRef.current = element;
        }}
      />
    </div>
  );
  return (
    <section className={`ankyuf-editor layout-${layout}`} aria-label="article editor">
      <header className="editor-navbar">
        <button type="button" className="editor-home" onClick={() => window.history.back()}>
          home
        </button>
        <span className="editor-brand">Article Editor - Ankyu</span>
        <div className="editor-nav-actions">
          <button
            type="button"
            onClick={() => setSettingsOpen((value) => !value)}
            title="components"
          >
            components
          </button>
          <button type="button" onClick={() => setMode("preview")} title="preview">
            preview
          </button>
          <button
            type="button"
            onClick={() => setFontFamily((value) => (value === "sans" ? "serif" : "sans"))}
            title="font"
          >
            A
          </button>
        </div>
      </header>
      {settingsOpen && (
        <div className="component-settings">
          <div>
            <strong>Components</strong>
            <button type="button" onClick={() => setSettingsOpen(false)}>
              close
            </button>
          </div>
          <label>
            Layout
            <select
              value={layout}
              onChange={(event) =>
                updateEditorSettings({ layout: event.target.value as LayoutMode })
              }
            >
              <option value="split">Left + right</option>
              <option value="left2">Two columns left</option>
              <option value="right2">Two columns right</option>
            </select>
          </label>
          <div className="component-checks">
            {(Object.keys(componentLabels) as ComponentId[]).map((id) => (
              <label key={id}>
                <input type="checkbox" checked={components[id]} onChange={() => toggle(id)} />
                {componentLabels[id]}
              </label>
            ))}
          </div>
          <p>The original file panel remains an optional component.</p>
        </div>
      )}
      <div className="editor-page-grid">
        <aside className="editor-sidebar editor-sidebar-left">
          <div className="sidebar-column">
            {left.slice(0, layout === "left2" ? leftSplit : left.length)}
          </div>
          {layout === "left2" && <div className="sidebar-column">{left.slice(leftSplit)}</div>}
        </aside>
        <main className="editor-main">
          <div className="editor-workspace">
            <div className="stats-strip">
              <div className="stats-lead">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(article.content)}`;
                  }}
                >
                  <MaterialIcon name="mail" />
                </button>
                <button type="button" onClick={save}>
                  <MaterialIcon name={savedAt ? "check" : "save"} />
                </button>
                <span>
                  <strong>{words}</strong> words
                </span>
                <span>
                  <strong>{minutes}</strong> min
                </span>
              </div>
              <div className="stats-date">{article.published.slice(5) || "--/--"}</div>
              <div className="editor-mode-tabs">
                <Tabs
                  tabs={[
                    { key: "write", label: "Write" },
                    { key: "preview", label: "Preview" },
                  ]}
                  active={mode}
                  onChange={(value) => setMode(value as EditorMode)}
                />
              </div>
            </div>
            {savedAt && <div className="saved-badge">{savedAt} saved</div>}
            {error && <div className="validation-message">{error}</div>}
            {mode === "write" ? (
              previewMode === "dual" ? (
                <div className="dual-writing-view">
                  <div className="dual-writing-editor">{writingEditor}</div>
                  <div className="dual-inline-preview">
                    <ArticlePreview
                      article={article}
                      words={words}
                      minutes={minutes}
                      config={previewConfig}
                    />
                  </div>
                </div>
              ) : (
                <div className="ankyu-writing-view">
                  {writingEditor}
                  <div className="ankyu-inline-preview">
                    <div className="inline-preview-label">Live preview</div>
                    <ArticlePreview
                      article={article}
                      words={words}
                      minutes={minutes}
                      config={previewConfig}
                    />
                  </div>
                </div>
              )
            ) : (
              <div className="preview-view">
                <ArticlePreview
                  article={article}
                  words={words}
                  minutes={minutes}
                  config={previewConfig}
                />
              </div>
            )}
            <div className="editor-statusbar">
              <span>
                {timer.startedAt
                  ? `${timer.paused ? "paused" : "writing"} ${formatDuration(computeElapsedMs(timer, clock))}`
                  : "Markdown + LaTeX"}
              </span>
              <span>{article.content.length} chars - UTF-8</span>
              {article.enableTimer && (
                <button
                  type="button"
                  onClick={() =>
                    setTimer((current) =>
                      current.paused
                        ? resumeTimer(current, Date.now())
                        : pauseTimer(current, Date.now()),
                    )
                  }
                >
                  {timer.paused ? "Resume timer" : "Pause timer"}
                </button>
              )}
              {timer.startedAt && !timer.endedAt && (
                <button
                  type="button"
                  onClick={() => setTimer((current) => stopTimer(current, Date.now()))}
                >
                  Stop timer
                </button>
              )}
            </div>
          </div>
        </main>
        <aside className="editor-sidebar editor-sidebar-right">
          <div className="sidebar-column">
            {right.slice(0, layout === "right2" ? rightSplit : right.length)}
          </div>
          {layout === "right2" && <div className="sidebar-column">{right.slice(rightSplit)}</div>}
        </aside>
      </div>
      <WikiLinkPicker posts={wikiPosts} onSelect={onInsert} />
      <HandwritingPanel onInsert={onInsert} />
      <button type="button" className="floating-save" onClick={save}>
        Save and download md
      </button>
    </section>
  );
}
