import '../styles.less';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Helmet} from 'react-helmet';
import {StaticQuery, graphql} from 'gatsby';
import { Nav } from './nav';

export default function Layout(props) {
  return (
    <StaticQuery
      query={graphql`
        {
          site {
            siteMetadata {
              title
              description
            }
          }
        }
      `}
      render={data => {
        const {title, description} = data.site.siteMetadata;
        return (
          <Fragment>
            <Helmet defaultTitle={title} titleTemplate={`%s - ${title}`}>
              <meta name="description" content={description} />
            </Helmet>
            <Nav />
            {props.children}
          </Fragment>
        );
      }}
    />
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};
