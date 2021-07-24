import React from 'react';
import styled from '@emotion/styled';
import { sizes } from 'gatsby-theme-apollo-core';

const PageWrapper = styled.div({
    maxWidth: sizes.md,
    margin: '20px auto',
})

export default function PageLayout(props) {
    return <PageWrapper>
        {props.children}
    </PageWrapper>
}
