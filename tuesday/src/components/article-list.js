import React from 'react';
import styled from '@emotion/styled';
import { StaticQuery, graphql } from "gatsby"
import { colors } from 'gatsby-theme-apollo-core';
import { articles } from '../articles';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';

function getMdCommon(x) {
  return x.childMarkdownRemark || x.childMdx
}

const ArticleListWrapper = styled.div({
  'a[href]:not([class])': {
    color: colors.hyperlink,
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline'
    },
  },
  ul: {
    listStyleType: 'none',
    li: {
      margin: 0,
      fontSize: '0.95rem',
    }
  },
})

const Title = styled.div({
  fontSize: '1.25rem',
  marginBottom: '10px',
})

const ShortIntro = styled.section({
  color: colors.text2,
  p: {
    fontSize: '0.9rem',
    marginLeft: 24,
  },
})

function trimSlash(slug) {
  return slug.replace(/^\/+|\/+$/g, '')
}

function makeSlug(root, chapter) {
  return trimSlash(root) + '/' + trimSlash(chapter);
}

function renderContent(md) {
  if (!!md.html) {
    return  <ShortIntro dangerouslySetInnerHTML={{ __html: md.html }} />;
  } else if (!!md.body) {
    return <ShortIntro><MDXProvider><MDXRenderer>{md.body}</MDXRenderer></MDXProvider></ShortIntro>;
  } else {
    return <></>;
  }
}

export default function ArticleList(props) {
  return <StaticQuery
    query={graphql`
        query Articles {
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
    `}
    render={
      data => {
        const articlesContent = {}
        data.allFile.edges.forEach(obj => {
          let md = getMdCommon(obj.node);
          articlesContent[trimSlash(md.fields.slug)] = md;
        });
        let fragments = <></>
        for (let key in articles) {
          const shortIntroSlug = makeSlug(articles[key].root, 'short-intro');
          fragments = <>
            {fragments}
            <Title>{key}</Title>
            {shortIntroSlug in articlesContent ? renderContent(articlesContent[shortIntroSlug]) : <></>}
            <ul>
              {
                articles[key].chapters
                  .map(s => {
                    const slug = makeSlug(articles[key].root, s);
                    return <li><a href={slug}>{articlesContent[slug].frontmatter.title}</a></li>
                  })
                  .reduce((result, item) => <>{result}{item}</>)
              }
            </ul>
          </>
        }
        return <ArticleListWrapper>{fragments}</ArticleListWrapper>;
      }}
  />
}
