import { MarkdownPreviewLazy } from "../../features/markdown/MarkdownPreviewLazy";
import type { ArticlePreviewConfig, EditorDocument } from "./editor-model";
import { ArticlePreviewMeta } from "./ArticlePreviewMeta";

export function ArticlePreview({
  article,
  words,
  minutes,
  config,
}: {
  article: EditorDocument;
  words: number;
  minutes: number;
  config: ArticlePreviewConfig;
}) {
  return (
    <article className={`article-preview ${article.serif ? "font-serif" : ""}`}>
      <div className="article-preview-inner">
        {article.image && (
          <img className="article-cover" src={article.image} alt={article.title || "cover"} />
        )}
        <div className="article-preview-kicker">{config.siteTitle || "Ankyu Editor"}</div>
        <h1>{article.title || "Untitled article"}</h1>
        <ArticlePreviewMeta article={article} words={words} minutes={minutes} />
        {article.description && <p className="article-description">{article.description}</p>}
        <div className="article-preview-content">
          <MarkdownPreviewLazy
            content={article.content || "Waiting for content..."}
            fontSize={16}
            renderHtml
          />
        </div>
        <footer>
          {article.author || config.profileName || "Author"} ·{" "}
          {article.licenseName || config.licenseName || "All rights reserved"}
        </footer>
      </div>
    </article>
  );
}
