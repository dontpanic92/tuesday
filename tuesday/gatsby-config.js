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
        icon: "src/images/icon.png",
      },
    },
    "gatsby-plugin-mdx",
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
    /*{
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },*/
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        root: __dirname,
        subtitle: 'Tuesday.',
        description: 'dontpanic 的技术专栏',
        defaultVersion: '2',
        versions: {
          '1': 'version-1'
        },
        sidebarCategories: {
          null: [
            'index',
            'whats-new',
          ],
          译文: [
          ]
        }
      }
    }
  ],
};
