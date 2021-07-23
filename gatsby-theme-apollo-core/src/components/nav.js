import styled from '@emotion/styled';
import { colors } from '../utils/colors';
import { sizes } from '../utils/breakpoints';
import { NavHeight } from '../utils/constants';
import { Helmet } from 'react-helmet';

var NavContainer = styled.nav({
    position: 'sticky',
    top: 0,
    zIndex: 1,
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

export var NavList = styled.ul({
    listStyleType: 'none',
    padding: '10px 10px',
    margin: 0,
})

export var NavItem = styled.li({
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

var Brand = styled.span({
    fontSize: '1.125rem',
    lineHeight: 1,
    fontFamily: "'Righteous'",
    color: colors.text1,
    // background: 'url("/2.jpg") center',
    backgroundClip: 'text',
    // backgroundSize: 'cover',
    mixBlendMode: 'multiply',
})

var Logo = styled.img({
    height: `${NavHeight}px`,
    margin: 0,
})

export function Nav(props) {
    return <NavContainer>
        <Helmet>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css?family=Righteous"
            />
        </Helmet>
        <NavFlexWrapper>
            <NavList>
                <NavItem><a href="/"><Brand>Tuesday.</Brand></a></NavItem>
                <NavItem><a href="/">文章</a></NavItem>
                <NavItem><a href="/">关于</a></NavItem>
            </NavList>
        </NavFlexWrapper>
    </NavContainer>
}
