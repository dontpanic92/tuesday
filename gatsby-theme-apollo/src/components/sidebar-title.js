import { graphql, StaticQuery } from "gatsby";

export function SidebarTitle() {
    return <StaticQuery
        query={graphql`
            {
                site {
                    siteMetadata {
                        siteName
                    }
                }
            }
        `}
        render={data => {
            const { siteName, title } = data.site.siteMetadata;
            return <span className="title-sidebar">{siteName}</span>;
        }}
    />
}
