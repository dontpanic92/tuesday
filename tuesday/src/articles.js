
exports.articles = {
  公共语言运行时: {
    root: 'botr',
    original_title: 'Boot of the Runtime',
    origin: 'https://github.com/dotnet/coreclr/blob/master/Documentation/botr/',
    chapters: [
      '1-introduction',
      '2-garbage-collection',
      '6-type-loader',
    ],
  },
  错误模型: {
    root: 'the-error-model',
    original_title: 'The Error Model',
    origin: 'http://joeduffyblog.com/2016/02/07/the-error-model/',
    chapters: [
      '0-introduction',
      '1-ambitions-and-learnings',
      '2-bugs-arent-recoverable-errors',
      '3-reliability-fault-tolerance-and-isolation',
      '4-bugs-abandonment-assertions-and-contracts',
      '5-ecoverable-errors-type-directed-exceptions',
      '6-retrospective-and-conclusions',
    ]
  },
};

exports.getSidebarCategoryList = () => {
  let x =
    Object.entries(this.articles)
      .map(([k, v]) => [k, v.chapters.map(c => v.root + '/' + c)])
      .reduce((p, c) => {p[c[0]] = c[1]; return p;}, {});
  return x;
}
