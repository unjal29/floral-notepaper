export interface EditorDocument {
  title: string;
  published: string;
  updated: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  draft: boolean;
  serif: boolean;
  pinned: boolean;
  slug: string;
  lang: string;
  author: string;
  comment: boolean;
  licenseName: string;
  licenseUrl: string;
  sourceLink: string;
  password: string;
  passwordHint: string;
  content: string;
  fileName: string;
  directory: string;
  enableTimer: boolean;
}

export interface WikiPost {
  path: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  published: string;
  tags: string[];
  headings: string[];
}

export interface ArticlePreviewConfig {
  profileName: string;
  siteTitle: string;
  siteUrl: string;
  showCover: boolean;
  useCoverOverlay: boolean;
  showSharePoster: boolean;
  showSponsor: boolean;
  sponsorUrl: string;
  showLicense: boolean;
  licenseName: string;
  licenseUrl: string;
  showVisitorCount: boolean;
  labels: Record<string, string>;
}

function localDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function createEditorDocument(): EditorDocument {
  return {
    title: "",
    published: localDate(),
    updated: "",
    description: "",
    image: "",
    tags: [],
    category: "",
    draft: true,
    serif: false,
    pinned: false,
    slug: "",
    lang: "zh-CN",
    author: "",
    comment: true,
    licenseName: "",
    licenseUrl: "",
    sourceLink: "",
    password: "",
    passwordHint: "",
    content: "",
    fileName: "",
    directory: "",
    enableTimer: false,
  };
}

export function buildMarkdownDocument(document: EditorDocument): string {
  const optional = (key: string, value: string) => {
    const trimmed = value.trim();
    return trimmed ? `${key}: ${JSON.stringify(trimmed)}` : null;
  };
  const lines = [
    "---",
    `title: ${JSON.stringify(document.title.trim())}`,
    `published: ${document.published}`,
  ];
  for (const line of [
    optional("updated", document.updated),
    optional("description", document.description),
    optional("image", document.image),
  ])
    if (line) lines.push(line);
  if (document.tags.length) lines.push(`tags: ${JSON.stringify(document.tags)}`);
  for (const line of [
    optional("category", document.category),
    `draft: ${document.draft}`,
    `serif: ${document.serif}`,
    `pinned: ${document.pinned}`,
    optional("slug", document.slug),
    optional("lang", document.lang),
    optional("author", document.author),
    `comment: ${document.comment}`,
    optional("licenseName", document.licenseName),
    optional("licenseUrl", document.licenseUrl),
    optional("sourceLink", document.sourceLink),
    optional("password", document.password),
    optional("passwordHint", document.passwordHint),
  ])
    if (line) lines.push(line);
  return `${lines.join("\n")}\n---\n\n${document.content}`;
}

function parseValue(value: string): unknown {
  const text = value.trim();
  if (text === "true") return true;
  if (text === "false") return false;
  try {
    return JSON.parse(text);
  } catch {
    return text.replace(/^['"]|['"]$/g, "");
  }
}

export function parseMarkdownDocument(source: string): EditorDocument | null {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) return null;
  const values = new Map<string, unknown>();
  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index > 0) values.set(line.slice(0, index).trim(), parseValue(line.slice(index + 1)));
  }
  const base = createEditorDocument();
  const text = (key: keyof EditorDocument) => String(values.get(key) ?? "");
  const bool = (key: keyof EditorDocument, fallback: boolean) =>
    typeof values.get(key) === "boolean" ? (values.get(key) as boolean) : fallback;
  const tagsValue = values.get("tags");
  const tags = Array.isArray(tagsValue)
    ? tagsValue.map(String)
    : typeof tagsValue === "string"
      ? tagsValue
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ""))
          .filter(Boolean)
      : [];
  return {
    ...base,
    title: text("title"),
    published: text("published") || base.published,
    updated: text("updated"),
    description: text("description"),
    image: text("image"),
    tags,
    category: text("category"),
    draft: bool("draft", base.draft),
    serif: bool("serif", false),
    pinned: bool("pinned", false),
    slug: text("slug"),
    lang: text("lang") || base.lang,
    author: text("author"),
    comment: bool("comment", true),
    licenseName: text("licenseName"),
    licenseUrl: text("licenseUrl"),
    sourceLink: text("sourceLink"),
    password: text("password"),
    passwordHint: text("passwordHint"),
    content: match[2].replace(/^\r?\n/, "").replace(/\r\n/g, "\n"),
  };
}

export function getDefaultMarkdown(): string {
  return buildMarkdownDocument({
    ...createEditorDocument(),
    title: "草稿示例",
    content: "# 开始写作\n\n这是一篇新的 Markdown 文章。",
  });
}

export function getMarkdownFilename(document: EditorDocument): string {
  const fallback = `post-${document.published || localDate()}`;
  const raw =
    document.fileName.trim().replace(/\.(?:md|markdown)$/i, "") ||
    document.slug.trim() ||
    document.title.trim() ||
    fallback;
  const safe = raw
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 96);
  return `${safe || fallback}.md`;
}

export function normalizeDirectory(value: string): string {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

export const IMAGE_PATH_PREFIX = "assets/image/post/";

export function buildImagePath(rawPath: string, directory: string): string {
  const name = rawPath.trim().replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? "";
  if (!name) return "";
  const trimmed = directory.trim().replace(/\\/g, "/");
  if (!trimmed) return `./${name}`;
  const folder = normalizeDirectory(trimmed);
  return `${trimmed.startsWith("/") ? "/" : ""}${IMAGE_PATH_PREFIX}${folder ? `${folder}/` : ""}${name}`;
}

export function createPersistedDocument(document: EditorDocument): EditorDocument {
  return { ...document, password: "", passwordHint: "" };
}
