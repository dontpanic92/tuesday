import React from 'react';
import styled from '@emotion/styled';
import { StaticQuery, graphql } from "gatsby"
import { colors } from 'gatsby-theme-apollo-core';
import { articles } from '../articles';
import { MDXProvider } from '@mdx-js/react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { badges } from '../badges';
import { getMdCommon, makeSlug, trimSlash } from '../utils';

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

const TitleLine = styled.div({
  fontSize: '1.25rem',
  marginBottom: '10px',
})

const Title = styled.span({
  verticalAlign: 'text-top',
})

const Badge = styled.img({
  margin: '0 0 0 20px',
  verticalAlign: 'middle',
})

const ShortIntro = styled.section({
  color: colors.text2,
  p: {
    fontSize: '0.9rem',
    marginLeft: 24,
  },
})

const Icon = styled(FontAwesomeIcon)({
  height: '1rem',
})

function renderContent(md) {
  if (!!md.html) {
    return <ShortIntro dangerouslySetInnerHTML={{ __html: md.html }} />;
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
    `}
    render={
      data => {
        const articlesContent = {}
        data.allFile.edges.forEach(obj => {
          let md = getMdCommon(obj.node);
          md.frontmatter.badges ??= [];
          articlesContent[trimSlash(md.fields.slug)] = md;
        });
        let fragments = <></>
        for (let key in articles) {
          const shortIntroSlug = makeSlug(articles[key].root, 'short-intro');
          fragments = <>
            {fragments}
            <TitleLine>
              <Title>{key}</Title>
              {
                !!articles[key].origin ?
                  <Badge src="https://img.shields.io/badge/%E8%AF%91-green?style=flat-square&color=7156d9" alt="译文" /> : null
              }
              {
                articles[key].pdf === false ? null :
                  <a href={articles[key].root + ".pdf"} target="_blank">
                    <Badge src="https://img.shields.io/badge/Download-PDF-green?style=flat-square&logo=adobeacrobatreader&color=7156d9" alt="Download PDF" />
                  </a>
              }
            </TitleLine>
            {shortIntroSlug in articlesContent ? renderContent(articlesContent[shortIntroSlug]) : <></>}
            <ul>
              {
                articles[key].chapters
                  .map(s => {
                    const match = s.match(/^\[(.+)\]\((https?:\/\/.+)\)$/);
                    if (match) {
                      return <li><a href={match[2]}>{match[1]}&nbsp;&nbsp;<Icon icon={faExternalLinkAlt} /></a></li>
                    } else {
                      const slug = makeSlug(articles[key].root, s);
                      return <li>
                        <a href={slug}>{articlesContent[slug].frontmatter.title}</a>
                        {articlesContent[slug].frontmatter.badges.map((b) => {
                          console.log(b);
                          if (badges[b]) {
                            return <Badge src={badges[b]} />;
                          }
                        })}
                      </li>
                    }
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
