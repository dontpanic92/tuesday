const path = require('path');
const { HEADER_HEIGHT } = require('./src/utils');
const { NavHeight } = require('gatsby-theme-apollo-core/src/utils/constants');

module.exports = ({
  root,
  siteName,
  pageTitle,
  description,
  githubHost = 'github.com',
  githubRepo,
  baseDir = '',
  contentDir = 'content',
  versions = {},
  gaTrackingId,
  gtmContainerId,
  ignore,
  checkLinksOptions,
  gatsbyRemarkPlugins = [],
  remarkPlugins = []
}) => {
  const allGatsbyRemarkPlugins = [
    {
      resolve: 'gatsby-remark-autolink-headers',
      options: {
        offsetY: HEADER_HEIGHT + NavHeight
      }
    },
    {
      resolve: 'gatsby-remark-copy-linked-files',
      options: {
        ignoreFileExtensions: []
      }
    },
    'gatsby-remark-code-titles',
    {
      resolve: 'gatsby-remark-prismjs',
      options: {
        showLineNumbers: true
      }
    },
    'gatsby-remark-rewrite-relative-links',
    {
      resolve: 'gatsby-remark-check-links',
      options: checkLinksOptions
    },
    ...gatsbyRemarkPlugins
  ];

  const plugins = [
    'gatsby-theme-apollo-core',
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: path.join(root, contentDir),
        name: 'content',
        ignore
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: allGatsbyRemarkPlugins
      }
    },
    /*...Object.entries(versions).map(([name, branch]) => ({
      resolve: 'gatsby-source-git',
      options: {
        name,
        branch,
        remote: `https://${githubHost}/${githubRepo}`,
        patterns: [
          path.join(baseDir, contentDir, '**'),
          path.join(baseDir, 'gatsby-config.js'),
          path.join(baseDir, '_config.yml')
        ]
      }
    }))*/
  ];

  if (gaTrackingId) {
    plugins.push({
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: Array.isArray(gaTrackingId) ? gaTrackingId : [gaTrackingId]
      }
    });
  }

  if (gtmContainerId) {
    plugins.push({
      resolve: 'gatsby-plugin-google-tagmanager',
      options: {
        id: gtmContainerId
      }
    });
  }

  return {
    siteMetadata: {
      title: pageTitle || siteName,
      siteName,
      description
    },
    plugins
  };
};
