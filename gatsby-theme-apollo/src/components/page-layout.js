import '../prism.less';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import Header from './header';
import HeaderButton from './header-button';
import PropTypes from 'prop-types';
import React, { createContext } from 'react';
import styled from '@emotion/styled';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import {
  FlexWrapper,
  Layout,
  MenuButton,
  Sidebar,
  SidebarNav,
  breakpoints,
  colors,
  useResponsiveSidebar
} from '../../core-exports';
import { Helmet } from 'react-helmet';
import { graphql, useStaticQuery } from 'gatsby';
import { SelectedLanguageContext } from './multi-code-block';
import { trackCustomEvent } from '../utils';
import { SidebarTitle } from './sidebar-title';

const Main = styled.main({
  flexGrow: 1
});

const MobileNav = styled.div({
  display: 'none',
  [breakpoints.md]: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 32,
    color: colors.text1
  }
});

const HeaderInner = styled.span({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 32
});

const GA_EVENT_CATEGORY_SIDEBAR = 'Sidebar';

function handleToggleAll(expanded) {
  trackCustomEvent({
    category: GA_EVENT_CATEGORY_SIDEBAR,
    action: 'Toggle all',
    label: expanded ? 'expand' : 'collapse'
  });
}

function handleToggleCategory(label, expanded) {
  trackCustomEvent({
    category: GA_EVENT_CATEGORY_SIDEBAR,
    action: 'Toggle category',
    label,
    value: Number(expanded)
  });
}

export const NavItemsContext = createContext();

export default function PageLayout(props) {
  const data = useStaticQuery(
    graphql`
      {
        site {
          siteMetadata {
            title
            siteName
          }
        }
      }
    `
  );

  const {
    sidebarRef,
    openSidebar,
    sidebarOpen,
    handleWrapperClick,
    handleSidebarNavLinkClick
  } = useResponsiveSidebar();

  const selectedLanguageState = useLocalStorage('docs-lang');

  const { pathname } = props.location;
  const { siteName, title } = data.site.siteMetadata;
  const { subtitle, sidebarContents } = props.pageContext;
  const { logoLink } = props.pluginOptions;

  const sidebarTitle = <SidebarTitle />;

  return (
    <Layout>
      <Helmet
        titleTemplate={['%s', subtitle, title].filter(Boolean).join(' - ')}
      >
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Helmet>
      <FlexWrapper onClick={handleWrapperClick}>
        <Sidebar
          responsive
          className="sidebar"
          open={sidebarOpen}
          ref={sidebarRef}
          title={siteName}
          logoLink={logoLink}
        >
          <HeaderInner>{sidebarTitle}</HeaderInner>
          {sidebarContents && (
            <SidebarNav
              contents={sidebarContents}
              pathname={pathname}
              onToggleAll={handleToggleAll}
              onToggleCategory={handleToggleCategory}
              onLinkClick={handleSidebarNavLinkClick}
            />
          )}
        </Sidebar>
        <Main>
          <Header>
            <MobileNav>
              <MenuButton onClick={openSidebar} />
            </MobileNav>
            <HeaderButton />
          </Header>
          <SelectedLanguageContext.Provider value={selectedLanguageState}>
            <NavItemsContext.Provider value={[]}>
              {props.children}
            </NavItemsContext.Provider>
          </SelectedLanguageContext.Provider>
        </Main>
      </FlexWrapper>
    </Layout>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
  pluginOptions: PropTypes.object.isRequired
};
