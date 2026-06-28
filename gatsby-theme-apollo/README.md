# gatsby-theme-apollo

A single, self-contained Gatsby 5 theme for the [Tuesday](../tuesday) site.

It is a consolidation of the (now unmaintained) upstream
`gatsby-theme-apollo-core` and `gatsby-theme-apollo-docs` packages into one
workspace, with the Apollo-specific and unused machinery removed.

## Layout

- `index.js` — public component/util exports consumed by the site.
- `core-exports.js` — the former `-core` barrel (layout, sidebar, colors, breakpoints, etc.).
- `gatsby-config.js` — theme plugins (svgr, emotion, less, remark pipeline, prismjs) and
  `gatsby-transformer-remark` wiring. Accepts options such as `root`, `description`,
  `sidebarCategories`, `githubRepo`, and `gaTrackingId`.
- `gatsby-node.js` — builds a page per Markdown file in the site's `content/` dir and
  attaches sidebar/slug fields.
- `gatsby-ssr.js` / `gatsby-browser.js` — wraps content pages in the docs `PageLayout`
  and everything else in the base `Layout`.
- `src/` — React components, utilities, and Less styles.

## Customizing

Components can be overridden with [Gatsby component shadowing](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/shadowing/)
by placing a file at `tuesday/src/gatsby-theme-apollo/<path>` (for example
`components/sidebar-title.js`).

Removed vs. upstream: Algolia/DocSearch, multi-version/`gatsby-source-git` switching,
Cloudinary share images, the `TypescriptApiBox`, the docset switcher, and Apollo
branding scripts/options.

## License

MIT — see [LICENSE](./LICENSE). Originally derived from
[apollographql/gatsby-theme-apollo](https://github.com/apollographql/gatsby-theme-apollo).
