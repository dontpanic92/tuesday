import styled from '@emotion/styled';
import { sizes } from '../utils/breakpoints';
import { NavHeight } from '../utils/constants';

const FlexWrapper = styled.div({
  display: 'flex',
  minHeight: `calc(100vh - ${NavHeight}px)`,
  maxWidth: sizes.xlg,
  margin: '0 auto'
});

export default FlexWrapper;
