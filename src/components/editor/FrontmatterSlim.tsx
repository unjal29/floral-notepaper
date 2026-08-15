import { useState } from "react";
import type { EditorDocument } from "./editor-model";
import { EditorTileIcon } from "./EditorTileIcon";
import { Md1DatePicker } from "./Md1DatePicker";
import { Tabs } from "./Tabs";

export function FrontmatterSlim({
  article,
  onChange,
  categories = [],
  suggestedTags = [],
  onOpenFile,
}: {
  article: EditorDocument;
  onChange: (patch: Partial<EditorDocument>) => void;
  categories?: string[];
  suggestedTags?: string[];
  onOpenFile?: () => void;
}) {
  const [tab, setTab] = useState("basic");
  const [tagDraft, setTagDraft] = useState("");
  const addTag = () => {
    const value = tagDraft.trim();
    if (value && !article.tags.includes(value)) onChange({ tags: [...article.tags, value] });
    setTagDraft("");
  };
  return (
    <section className="editor-card frontmatter-slim">
      <div className="editor-card-heading">
        <h3>Frontmatter</h3>
        <span className="collapse-mark">^</span>
      </div>
      <Tabs
        tabs={[
          { key: "basic", label: "Basic" },
          { key: "definition", label: "Definition" },
          { key: "control", label: "Control" },
          { key: "license", label: "License" },
          { key: "files", label: "Files" },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === "basic" && (
        <div className="frontmatter-fields">
          <label>
            Title
            <input
              value={article.title}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="Draft title"
            />
          </label>
          <label>
            Author
            <input
              value={article.author}
              onChange={(event) => onChange({ author: event.target.value })}
              placeholder="Author"
            />
          </label>
          <div className="field-row">
            <Md1DatePicker
              label="Published"
              value={article.published}
              onChange={(published) => onChange({ published })}
            />
            <Md1DatePicker
              label="Updated"
              value={article.updated}
              onChange={(updated) => onChange({ updated })}
            />
          </div>
          <label>
            Description
            <textarea
              value={article.description}
              onChange={(event) => onChange({ description: event.target.value })}
              rows={3}
            />
          </label>
          <label>
            Tags
            <div className="tag-input">
              {article.tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => onChange({ tags: article.tags.filter((item) => item !== tag) })}
                >
                  {tag} x
                </button>
              ))}
              <input
                list="editor-tags"
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder="Press Enter"
              />
            </div>
            <datalist id="editor-tags">
              {suggestedTags.map((tag) => (
                <option value={tag} key={tag} />
              ))}
            </datalist>
          </label>
          <label>
            Category
            <input
              list="editor-categories"
              value={article.category}
              onChange={(event) => onChange({ category: event.target.value })}
            />
            <datalist id="editor-categories">
              {categories.map((category) => (
                <option value={category} key={category} />
              ))}
            </datalist>
          </label>
        </div>
      )}
      {tab === "definition" && (
        <div className="frontmatter-fields">
          <label>
            Slug
            <input
              value={article.slug}
              onChange={(event) => onChange({ slug: event.target.value })}
              placeholder="my-first-post"
            />
          </label>
          <label>
            File name
            <input
              value={article.fileName}
              onChange={(event) => onChange({ fileName: event.target.value })}
              placeholder="Auto generated"
            />
          </label>
          <label>
            Directory
            <input
              value={article.directory}
              onChange={(event) => onChange({ directory: event.target.value })}
              placeholder="posts/"
            />
          </label>
          <label>
            Cover image
            <input
              value={article.image}
              onChange={(event) => onChange({ image: event.target.value })}
              placeholder="/assets/image/post/cover.jpg"
            />
          </label>
          <label>
            Language
            <select
              value={article.lang}
              onChange={(event) => onChange({ lang: event.target.value })}
            >
              <option value="zh-CN">Chinese</option>
              <option value="en">English</option>
              <option value="ja">Japanese</option>
            </select>
          </label>
        </div>
      )}
      {tab === "control" && (
        <div className="switch-grid">
          {(["draft", "pinned", "comment", "enableTimer"] as const).map((key) => (
            <button
              type="button"
              key={key}
              className={article[key] ? "enabled" : ""}
              aria-pressed={article[key]}
              onClick={() => onChange({ [key]: !article[key] } as Partial<EditorDocument>)}
            >
              <EditorTileIcon name={key} label={key} />
            </button>
          ))}
        </div>
      )}
      {tab === "license" && (
        <div className="frontmatter-fields">
          <label>
            License name
            <input
              value={article.licenseName}
              onChange={(event) => onChange({ licenseName: event.target.value })}
              placeholder="CC BY-NC-SA 4.0"
            />
          </label>
          <label>
            License URL
            <input
              value={article.licenseUrl}
              onChange={(event) => onChange({ licenseUrl: event.target.value })}
            />
          </label>
          <label>
            Source URL
            <input
              value={article.sourceLink}
              onChange={(event) => onChange({ sourceLink: event.target.value })}
            />
          </label>
          <label>
            Password hint
            <input
              value={article.passwordHint}
              onChange={(event) => onChange({ passwordHint: event.target.value })}
            />
          </label>
        </div>
      )}
      {tab === "files" && (
        <div className="file-tab">
          <p>Open a local Markdown file or use the download button.</p>
          <button type="button" onClick={onOpenFile}>
            Open file panel
          </button>
        </div>
      )}
    </section>
  );
}
