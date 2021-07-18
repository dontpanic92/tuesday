import React from 'react';
import styled from '@emotion/styled';
import {IconProceed} from '@apollo/space-kit/icons/IconProceed';
import {breakpoints} from 'gatsby-theme-apollo-core';
import {colors} from '@apollo/space-kit/colors';

const Container = styled.div({
  display: 'flex',
  flexShrink: 0,
  width: 240,
  [breakpoints.lg]: {
    width: 'auto',
    marginRight: 0
  },
  [breakpoints.md]: {
    display: 'none'
  }
});

const StyledLink = styled.a({
  display: 'flex',
  alignItems: 'center',
  color: colors.indigo.dark,
  lineHeight: 2,
  textDecoration: 'none',
  ':hover': {
    color: colors.indigo.darker
  }
});


export default function HeaderButton() {
  return (
    <></>
    /*
    <Container>
      <StyledLink
        href="https://studio.apollographql.com?referrer=docs"
        target="_blank"
        rel="noopener noreferrer"
      >
        Launch Apollo Studio
        <StyledIcon weight="thin" />
      </StyledLink>
    </Container>
  */
  );
}
