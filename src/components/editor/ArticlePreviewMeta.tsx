import type { EditorDocument } from "./editor-model";

export function ArticlePreviewMeta({
  article,
  words,
  minutes,
}: {
  article: EditorDocument;
  words: number;
  minutes: number;
}) {
  return (
    <div className="article-preview-meta">
      <span>{article.category || "Uncategorized"}</span>
      <span>
        {article.tags.length ? article.tags.map((tag) => `#${tag}`).join(" ") : "No tags"}
      </span>
      <span>
        {words} words · {minutes} min
      </span>
      <span>{article.published || "Unpublished"}</span>
    </div>
  );
}
