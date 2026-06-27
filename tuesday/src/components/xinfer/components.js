import React from "react";
import { Link } from "gatsby";
import { getPage, pageHref } from "./manifest";

export function CourseMark({ left, right }) {
  return (
    <div className="coursemark">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

export function PartBadge({ children }) {
  return <span className="part-badge">{children}</span>;
}

// Callout: kind = "note" | "warn" | "def". `tag` is the bold label line.
export function Callout({ kind = "note", tag, children }) {
  return (
    <div className={`callout ${kind}`}>
      {tag ? <span className="tag">{tag}</span> : null}
      {children}
    </div>
  );
}

export function Objectives({ title = "学习目标", children }) {
  return (
    <section className="objectives">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

// Figure card wrapper. Use for charts/diagrams/images with an optional caption.
export function Figure({ card = true, caption, children }) {
  return (
    <figure className={card ? "fig-card" : undefined}>
      {children}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

/**
 * Diagram — renders a hand-authored inline SVG verbatim.
 * Pass the raw SVG markup as a template-literal string:
 *   <Diagram svg={`<svg ...>...</svg>`} caption="..." />
 * This preserves the original SVG (including its <style> blocks) exactly.
 */
export function Diagram({ svg, caption, card = true }) {
  return (
    <figure className={card ? "fig-card" : undefined}>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

// Exercises / Q&A. Wrap a set of <QA> in <QAGroup> so question numbering resets.
export function QAGroup({ children }) {
  return <div className="exercises">{children}</div>;
}

export function QA({ question, children }) {
  return (
    <details className="qa">
      <summary>{question}</summary>
      <div className="answer">{children}</div>
    </details>
  );
}

export function Pager({ slug }) {
  const page = getPage(slug);
  const prev = page && page.prev;
  const next = page && page.next;
  return (
    <div className="pager">
      {prev ? (
        <Link to={pageHref(prev.slug)}>← {prev.title}</Link>
      ) : (
        <span className="disabled">← 前一页：无</span>
      )}
      <Link to="/xinfer/">教程目录 ↑</Link>
      {next ? (
        <Link to={pageHref(next.slug)}>{next.title} →</Link>
      ) : (
        <span className="disabled">后一页：无 →</span>
      )}
    </div>
  );
}
