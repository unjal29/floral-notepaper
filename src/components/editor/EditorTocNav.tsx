export interface PreviewHeading {
  depth: number;
  slug: string;
  text: string;
}

export function EditorTocNav({ headings }: { headings: PreviewHeading[] }) {
  return (
    <section className="editor-card editor-toc">
      <h3>Table of contents</h3>
      {headings.length ? (
        <nav>
          {headings.map((heading) => (
            <a
              key={`${heading.slug}-${heading.depth}`}
              className={heading.depth > 2 ? "child" : ""}
              href={`#${heading.slug}`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      ) : (
        <p>Headings will appear here as you write.</p>
      )}
    </section>
  );
}
