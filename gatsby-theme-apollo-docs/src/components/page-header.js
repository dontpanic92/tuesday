import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import { colors } from 'gatsby-theme-apollo-core';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

const FeaturedImage = styled(GatsbyImage)({
  marginBottom: '20px',
  maxHeight: '400px',
})

const Heading = styled.h1({
  ':not(:last-child)': {
    marginBottom: 8
  }
});

const Subheading = styled.h3({
  color: colors.text2
});

export default function PageHeader(props) {
  console.log(props)
  return (
    <div className="header-wrapper">
      <Heading>{props.title}</Heading>
      {props.description && <Subheading>{props.description}</Subheading>}
      {props.featuredImage && <FeaturedImage image={getImage(props.featuredImage)} alt="Cover Image" />}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  featuredImage: PropTypes.object,
};
