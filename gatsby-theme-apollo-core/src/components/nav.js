import styled from '@emotion/styled';
import { colors } from '../utils/colors';
import { sizes } from '../utils/breakpoints';
import { NavHeight } from '../utils/constants';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithubAlt } from '@fortawesome/free-brands-svg-icons';

const NavContainer = styled.nav({
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

const NavFlexWrapper = styled.div({
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: sizes.xlg,
    margin: '0 auto',
    height: '100%',
    alignItems: 'center',
})

export const NavList = styled.ul({
    listStyleType: 'none',
    margin: '0 12px',
    display: 'flex',
})

export var NavItem = styled.li({
    fontSize: '1rem',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    a: {
        color: 'inherit',
        padding: '4px 12px',
        textDecoration: 'none',
        borderRadius: 4,
        display: 'inline-flex',
        ':hover': {
            opacity: colors.hoverOpacity,
            color: colors.primary,
            background: colors.background2,
        },
    }
});

export const ResizedFontAwesomeIcon = styled(FontAwesomeIcon)({
    height: '1.7rem',
})

var Brand = styled.span({
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
                <NavItem><a href="/">首页</a></NavItem>
                <NavItem><a href="https://dontpanic.blog/" target="_blank">博客</a></NavItem>
                <NavItem><a href="https://dontpanic.blog/about" target="_blank">关于</a></NavItem>
            </NavList>
            <NavList>
                <NavItem><a href="https://github.com/dontpanic92/tuesday" target="_blank"><ResizedFontAwesomeIcon icon={faGithubAlt} fixedWidth /></a></NavItem>
            </NavList>
        </NavFlexWrapper>
    </NavContainer>
}
