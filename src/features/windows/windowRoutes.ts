export type AppView = "main" | "notepad" | "tile" | "editor";

export interface AppRoute {
  view: AppView;
  noteId?: string;
}

export function getInitialRoute(url: URL = new URL(window.location.href)): AppRoute {
  if (/\/Editor\/?$/i.test(url.pathname)) return { view: "editor" };
  return routeFromSearch(url.search);
}

export function routeFromSearch(search: string): AppRoute {
  const params = new URLSearchParams(search);
  const view = params.get("view");
  const noteId = params.get("noteId") ?? undefined;

  if (view === "notepad") return noteId ? { view, noteId } : { view };
  if (view === "tile") return noteId ? { view, noteId } : { view };
  if (view === "editor") return { view };
  return { view: "main" };
}

export function buildNotepadUrl(noteId?: string): string {
  return buildUrl("notepad", noteId);
}

export function buildTileUrl(noteId: string): string {
  return buildUrl("tile", noteId);
}

export function buildEditorUrl(): string {
  return buildUrl("editor");
}

function buildUrl(view: AppView, noteId?: string): string {
  const params = new URLSearchParams({ view });
  if (noteId) params.set("noteId", noteId);
  return `index.html?${params.toString()}`;
}
