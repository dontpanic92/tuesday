import React from 'react';
import styled from '@emotion/styled';
import { colors } from 'gatsby-theme-apollo-core';

const AvatarWrapper = styled.div({
    display: 'flex',
    marginBottom: '40px',
})

const Avatar = styled.img({
    width: '2rem',
    height: '2rem',
    margin: 0,
})

const Name = styled.span({
    margin: '0 0 0 10px',
    fontSize: '1.25rem',
})

const AvatarSmall = styled.img({
    width: '1.5rem',
    height: '1.5rem',
    margin: 0,
})

const NameSmall = styled.span({
    margin: '0 0 0 10px',
    fontSize: '1.125rem',
})


const Row = styled.div({
    display: 'flex',
    alignItems: 'center',
})

export default function AvatarCard() {
    return <AvatarWrapper>
        <Row>
            <Avatar src='/avatar.png' />
            <Name>dontpanic 的技术专栏</Name>
        </Row>
    </AvatarWrapper>
};

export function AvatarCardSmall() {
    return <AvatarWrapper>
        <Row>
            <AvatarSmall src='/avatar.png' />
            <NameSmall>dontpanic 的技术专栏</NameSmall>
        </Row>
    </AvatarWrapper>
};
