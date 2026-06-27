import React from "react";
import { Helmet } from "react-helmet";
import { MDXProvider } from "@mdx-js/react";
import "./textbook.css";
import Chart, { XINFER_PALETTE } from "./Chart";
import {
  CourseMark,
  PartBadge,
  Callout,
  Objectives,
  Figure,
  Diagram,
  QAGroup,
  QA,
  Pager,
} from "./components";
import { SERIES_TITLE, getPage } from "./manifest";

// Components made available to every MDX page without per-file imports.
const shortcodes = {
  Chart,
  Callout,
  Objectives,
  Figure,
  Diagram,
  QAGroup,
  QA,
  PartBadge,
};

/**
 * Layout — self-contained theme wrapper for the xinfer textbook series.
 * Fully isolated from gatsby-theme-apollo: all styling lives under .xinfer-page.
 *
 * Props:
 *   slug      — manifest slug; drives crumb, part badge and pager.
 *   title     — page <title>; falls back to the manifest title.
 *   crumb     — override for the coursemark right-hand crumb.
 *   badge     — override for the part badge (pass null to hide).
 *   showPager — show prev/next pager (default true when slug is known).
 */
export default function Layout({
  slug,
  title,
  crumb,
  badge,
  showPager,
  children,
}) {
  const page = slug ? getPage(slug) : null;
  const pageTitle = title || (page && page.title) || SERIES_TITLE;
  const crumbRight = crumb !== undefined ? crumb : page ? page.crumb : "";
  const badgeText = badge !== undefined ? badge : page ? page.badge : null;
  const withPager = showPager !== undefined ? showPager : Boolean(page);

  return (
    <MDXProvider components={shortcodes}>
      <div className="xinfer-page" lang="zh-CN">
        <Helmet>
          <html lang="zh-CN" />
          <title>{`${pageTitle}｜从零构建 LLM 推理引擎`}</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
        </Helmet>
        <main className="page">
          <CourseMark left={SERIES_TITLE} right={crumbRight} />
          {badgeText ? <PartBadge>{badgeText}</PartBadge> : null}
          {children}
          {withPager && slug ? <Pager slug={slug} /> : null}
        </main>
      </div>
    </MDXProvider>
  );
}

export { XINFER_PALETTE };
