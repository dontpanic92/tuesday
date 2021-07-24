import React from 'react';
import styled from '@emotion/styled';
import { StaticQuery, graphql } from "gatsby"
import { colors } from 'gatsby-theme-apollo-core';
import { articles } from '../articles';

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
  fontSize: '1.125rem',
  marginBottom: '10px',
})

function trimSlash(slug) {
  return slug.replace(/^\/+|\/+$/g, '')
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
                  }
                  childMdx {
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                    }
                  }
                }
            }
            }
        }
    `}
    render={data => {
      const articlesInfo = {}
      data.allFile.edges.forEach(obj => {
        let md = getMdCommon(obj.node);
        articlesInfo[trimSlash(md.fields.slug)] = md.frontmatter.title;
      });
      let fragments = <></>
      for (let key in articles) {
        console.log(key)
        console.log(articles)
        fragments = <>
          {fragments}
          <Title>{key}</Title>
          <ul>
            {
              articles[key]
                .map(s => {
                  const slug = trimSlash(s);
                  return <li><a href={slug}>{articlesInfo[slug]}</a></li>
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
