exports.getMdCommon = (x) => {
    return x.childMarkdownRemark || x.childMdx
}

exports.trimSlash = trimSlash;

exports.makeSlug = (root, chapter) => {
    return trimSlash(root) + '/' + trimSlash(chapter);
}

function trimSlash(slug) {
    return slug.replace(/^\/+|\/+$/g, '')
}