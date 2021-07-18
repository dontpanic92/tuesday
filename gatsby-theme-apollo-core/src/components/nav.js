import styled from '@emotion/styled';
import {colors} from '../utils/colors';
import {sizes} from '../utils/breakpoints';
import { NavHeight } from '../utils/constants';

var NavContainer = styled.nav({
    position: 'sticky',
    top: 0,
    width: '100%',
    color: colors.text2,
    background: colors.backgroundPure,
    borderWidth: '0 0 1px 0',
    borderColor: colors.divider,
    borderStyle: 'solid',
    height: NavHeight,
})

var NavFlexWrapper = styled.div({
    display: 'flex',
    maxWidth: sizes.xlg,
    margin: '0 auto'
})

var NavList = styled.ul({
    listStyleType: 'none',
    padding: '10px 10px',
    margin: 0,
})

var NavItem = styled.li({
    display: 'inline',
    fontSize: '1rem',
    a: {
        color: 'inherit',
        textDecoration: 'none',
        padding: '8px 12px',
        borderRadius: 4,
        ':hover': {
            opacity: colors.hoverOpacity,
            color: colors.primary,
            background: colors.background,
        },
    }
});


export function Nav(props) {
    return <NavContainer>
        <NavFlexWrapper>
            <NavList>
                <NavItem><a href="/">文章</a></NavItem>
                <NavItem><a href="/">关于</a></NavItem>
            </NavList>
        </NavFlexWrapper>
    </NavContainer>
}
