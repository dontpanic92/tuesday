module.exports = {
  pathPrefix: "/",
  siteMetadata: {
    siteUrl: "https://tuesday.dontpanic.blog",
    title: "Tuesday.",
    siteName: "dontpanic 的技术专栏",
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/avatar.png",
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        root: __dirname,
        description: 'dontpanic 的技术专栏',
        defaultVersion: '2',
        versions: {
          '1': 'version-1'
        },
        sidebarCategories: {
          null: [
            'index',
          ],
          错误模型: [
            'the-error-model/0-introduction',
            'the-error-model/1-ambitions-learnings',
          ]
        }
      }
    }
  ],
};
