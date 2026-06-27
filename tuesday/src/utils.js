exports.getMdCommon = (x) => {
    return x.childMarkdownRemark
}

exports.trimSlash = trimSlash;

exports.makeSlug = (root, chapter) => {
    return trimSlash(root) + '/' + trimSlash(chapter);
}

function trimSlash(slug) {
    return slug.replace(/^\/+|\/+$/g, '')
}