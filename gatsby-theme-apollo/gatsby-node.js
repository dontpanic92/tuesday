const path = require('path');
const {createFilePath} = require('gatsby-source-filesystem');
const {getVersionBasePath} = require('./src/utils');

function getConfigPaths(baseDir) {
  return [
    path.join(baseDir, 'gatsby-config.js'), // new gatsby config
    path.join(baseDir, '_config.yml') // old hexo config
  ];
}

async function onCreateNode(
  {node, actions, getNode, loadNodeContent},
  {
    baseDir = '',
    defaultVersion = 'default',
    localVersion,
    siteName,
    subtitle,
    sidebarCategories
  }
) {
  const configPaths = getConfigPaths(baseDir);
  if (configPaths.includes(node.relativePath)) {
    const value = await loadNodeContent(node);
    actions.createNodeField({
      name: 'raw',
      node,
      value
    });
  }

  if (['MarkdownRemark'].includes(node.internal.type)) {
    const version = localVersion || defaultVersion;
    let slug = createFilePath({
      node,
      getNode
    });

    if (node.frontmatter.slug) {
      slug = node.frontmatter.slug; // eslint-disable-line prefer-destructuring
    }

    const {sidebar_title, api_reference} = node.frontmatter;

    if (version !== defaultVersion) {
      slug = getVersionBasePath(version) + slug;
    }

    actions.createNodeField({
      name: 'image',
      node,
      value: ''
    });

    actions.createNodeField({
      node,
      name: 'version',
      value: version
    });

    actions.createNodeField({
      node,
      name: 'versionRef',
      value: ''
    });

    actions.createNodeField({
      node,
      name: 'slug',
      value: slug
    });

    actions.createNodeField({
      node,
      name: 'sidebarTitle',
      value: sidebar_title || ''
    });

    actions.createNodeField({
      node,
      name: 'apiReference',
      value: Boolean(api_reference)
    });
  }
}

exports.onCreateNode = onCreateNode;

function getPageFromEdge({node}) {
  return node.childMarkdownRemark;
}

function getSidebarContents(sidebarCategories, edges, version, dirPattern) {
  return Object.keys(sidebarCategories).map(key => ({
    title: key === 'null' ? null : key,
    pages: sidebarCategories[key]
      .map(linkPath => {
        const match = linkPath.match(/^\[(.+)\]\((https?:\/\/.+)\)$/);
        if (match) {
          return {
            anchor: true,
            title: match[1],
            path: match[2]
          };
        }

        const edge = edges.find(edge => {
          const {relativePath} = edge.node;
          const {fields} = getPageFromEdge(edge);
          return (
            fields.version === version &&
            relativePath
              .slice(0, relativePath.lastIndexOf('.'))
              .replace(dirPattern, '') === linkPath
          );
        });

        if (!edge) {
          return null;
        }

        const {frontmatter, fields} = getPageFromEdge(edge);
        return {
          title: frontmatter.title,
          sidebarTitle: fields.sidebarTitle,
          description: frontmatter.description,
          path: fields.slug
        };
      })
      .filter(Boolean)
  }));
}

const pageFragment = `
  internal {
    type
  }
  frontmatter {
    title
    description
  }
  fields {
    slug
    version
    versionRef
    sidebarTitle
  }
`;

exports.createPages = async (
  {actions, graphql},
  {
    baseDir = '',
    contentDir = 'content',
    defaultVersion = 'default',
    subtitle,
    githubRepo,
    githubHost = 'github.com',
    sidebarCategories,
    ffWidgetId,
    footerNavConfig,
    twitterHandle,
    localVersion,
    baseUrl
  }
) => {
  const {data} = await graphql(`
    {
      allFile(filter: {sourceInstanceName: {eq: "content"}, extension: {in: ["md"]}}) {
        edges {
          node {
            id
            relativePath
            childMarkdownRemark {
              ${pageFragment}
            }
          }
        }
      }
    }
  `);

  const {edges} = data.allFile;
  const mainVersion = localVersion || defaultVersion;
  const contentPath = path.join(baseDir, contentDir);
  const dirPattern = new RegExp(`^${contentPath}/`);

  const sidebarContents = {
    [mainVersion]: getSidebarContents(
      sidebarCategories,
      edges,
      mainVersion,
      dirPattern
    )
  };

  const versionKeys = [localVersion].filter(Boolean);

  let defaultVersionNumber = null;
  try {
    defaultVersionNumber = parseFloat(defaultVersion, 10);
  } catch (error) {
    // let it slide
  }

  // get the current git branch for GitHub "edit" links; fall back to master
  const currentBranch = process.env.BRANCH || 'master';

  const template = require.resolve('./src/components/template');
  edges.forEach(edge => {
    const {id, relativePath} = edge.node;
    const {fields} = getPageFromEdge(edge);

    let versionDifference = 0;
    if (defaultVersionNumber) {
      try {
        const versionNumber = parseFloat(fields.version, 10);
        versionDifference = versionNumber - defaultVersionNumber;
      } catch (error) {
        // do nothing
      }
    }

    let githubUrl;

    if (githubRepo) {
      const [owner, repo] = githubRepo.split('/');
      githubUrl =
        'https://' +
        path.join(
          githubHost,
          owner,
          repo,
          'tree',
          fields.versionRef || path.join(currentBranch, contentPath),
          relativePath
        );
    }

    actions.createPage({
      path: fields.slug,
      component: template,
      context: {
        id,
        subtitle,
        versionDifference,
        versionBasePath: getVersionBasePath(fields.version),
        sidebarContents: sidebarContents[fields.version],
        githubUrl,
        forumUrl:
          footerNavConfig &&
          footerNavConfig.Forums &&
          footerNavConfig.Forums.href,
        ffWidgetId,
        twitterHandle,
        versions: versionKeys, // only need to send version labels to client
        defaultVersion,
        baseUrl
      }
    });
  });
};
