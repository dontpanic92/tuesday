import React from 'react';
import styled from '@emotion/styled';
import {ReactComponent as DocsIcon} from '../../assets/docs.svg';

const Wrapper = styled.div({
  display: 'flex',
  fontSize: 24
});

const StyledDocsIcon = styled(DocsIcon)({
  height: '0.7857142857em',
  marginTop: '0.07142857143em'
});

export default function Logo() {
  return (
    <Wrapper>
    </Wrapper>
  );
}
