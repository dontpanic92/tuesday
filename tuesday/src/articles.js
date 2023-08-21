
exports.articles = {
  "山海狂心：仙古轩系列游戏逆向研究": {
    root: 'xgx-research-1',
    pdf: true,
    chapters: [
      '0-preface',
      '1-cpk',
    ]
  },
  '栈缓冲区溢出 101': {
    root: 'stack-buffer-overflow',
    pdf: false,
    chapters: [
      '[一、栈缓冲区溢出 101](https://ctf.dontpanic.blog/notes/stack-buffer-overflow-101.html)',
      '[二、ASLR](https://ctf.dontpanic.blog/notes/stack-buffer-overflow-aslr.html)',
      '[三、Security Cookie / Canary](https://ctf.dontpanic.blog/notes/stack-buffer-overflow-canary.html)'
    ]
  },
  /*"Erlang 快速入门": {
    root: 'erlang-getting-started',
    original_title: 'Getting Started with Erlang',
    origin: 'https://www.erlang.org/doc/getting_started/intro.html',
    chapters: [
      '1-introduction',
      '2-sequential-programming',
    ]
  },*/
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
};

exports.getSidebarCategoryList = () => {
  let x =
    Object.entries(this.articles)
      .map(([k, v]) => [k, v.chapters.map(c => c.startsWith('[') ? c : (v.root + '/' + c))])
      .reduce((p, c) => {p[c[0]] = c[1]; return p;}, {});
  return x;
}
