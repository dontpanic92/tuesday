const { articles } = require('./src/articles');
const { execSync } = require('child_process');
const { getMdCommon, trimSlash, makeSlug } = require('./src/utils');
const { badges } = require('./src/badges');

exports.createPages = async (
  { actions, graphql },
) => {
  generate_readme(graphql);

  for (let title in articles) {
    if (articles[title].pdf === false) {
      continue;
    }

    let root = articles[title].root;
    let o_title = !!articles[title].original_title ? articles[title].original_title : "";
    let o = !!articles[title].origin ? articles[title].origin : "";
    let command = `cd pandoc && bash run_pandoc.sh "${title}" ../content/${root} "../public/${root}.pdf" "${o_title}" "${o}"`;
    // let result = execSync(command);
    // console.log(result.toString());
  }
};

async function generate_readme(graphql) {
  const { data } = await graphql(`
  {
    allFile(filter: {sourceInstanceName: {eq: "content"}, extension: {in: ["md", "mdx"]}}) {
      edges {
        node {
        id
        relativePath
        childMarkdownRemark {
            fields {
              slug
            }
            frontmatter {
              title
              badges
            }
            html
          }
          childMdx {
            fields {
              slug
            }
            frontmatter {
              title
            }
            body
          }
        }
      }
    }
  }
`);

  let list = generate_article_list(data);
  const fs = require('fs');
  let content = fs.readFileSync('../README.md.t', 'utf8');
  content = content.replace("<!-- Insert List -->", list);
  fs.writeFileSync("../README.md",  content);
}

function generate_article_list(data) {
  const articlesContent = {}
  data.allFile.edges.forEach(obj => {
    let md = getMdCommon(obj.node);
    md.frontmatter.badges ??= [];
    articlesContent[trimSlash(md.fields.slug)] = md;
  });
  let fragments = "";
  for (let key in articles) {
    const shortIntroSlug = makeSlug(articles[key].root, 'short-intro');
    console.log(articlesContent[shortIntroSlug]);
    fragments = fragments + `
**${key}** ${!!articles[key].origin ?
  `<img src="https://img.shields.io/badge/%E8%AF%91-green?style=flat-square&color=7156d9" alt="译文" />` : ""}
  ${articles[key].pdf === false ? "" :
`<a href=${articles[key].root + ".pdf"} target="_blank">
  <img src="https://img.shields.io/badge/Download-PDF-green?style=flat-square&logo=adobeacrobatreader&color=7156d9" alt="Download PDF" />
</a>`
}
<small>${shortIntroSlug in articlesContent ? articlesContent[shortIntroSlug].html : ""}</small>
<ul>
  ${articles[key].chapters
  .map(s => {
    const match = s.match(/^\[(.+)\]\((https?:\/\/.+)\)$/);
    if (match) {
      return `<li><a href=${match[2]}>${match[1]}&nbsp;&nbsp;</a></li>`
    } else {
      const slug = makeSlug(articles[key].root, s);
      return `<li>
<a href='https://tuesday.dontpanic.blog/${slug}'>${articlesContent[slug].frontmatter.title}</a>
            ${articlesContent[slug].frontmatter.badges.map((b) => {
        if (badges[b]) {
          return `<img src=${badges[b]} />`;
        }
      }).join("  ")}
 </li>`
    }
  })
  .reduce((result, item) => result + item)
}
</ul>

`
  }

  return fragments;
}
