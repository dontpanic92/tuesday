# USB GPIO 离线 HTML 教程

本目录包含教程站点基础设施。页面清单严格对应 `toc.md`：关于页、37 章和
附录 A–L。当前内容页是明确标记的占位片段，后续写作任务应只替换
`src/pages/` 中对应文件的正文，不要手工编辑生成的 HTML。

## 构建

要求 Python 3.9 或更高版本，不需要第三方包：

```sh
cd tutorial
python3 scripts/build_tutorial.py
```

构建会生成：

- `index.html`、`about.html`
- `chapters/*.html`、`appendices/*.html`
- `assets/data/search-index.json`
- 可供 `file://` 页面直接加载的 `assets/js/search-index.js`

直接打开 `tutorial/index.html` 即可离线阅读。禁用 JavaScript 后，全站目录、
面包屑和前后页链接仍然可用；JavaScript 只增强移动目录和站内搜索。

## 验证

```sh
cd tutorial
python3 scripts/validate_tutorial.py
```

验证器检查清单与 `toc.md` 的精确映射、51 个 HTML 页面、50 个源片段、
确定性重建、本地资源、内部链接、锚点、搜索索引和远程运行时依赖。

## 目录约定

- `src/page_manifest.json`：页面顺序、标题、分组、稳定 URL 和源片段的唯一清单。
- `src/templates/`：共享语义化页面模板与占位片段模板。
- `src/pages/`：章节和附录 HTML 内容片段。
- `assets/css/`：屏幕与打印样式。
- `assets/js/`：渐进增强导航和搜索。
- `assets/svg/`、`assets/images/`：后续本地原创图示和项目自有图片。

内容片段应以 `section` 为主，保持标题层级从 `h2` 开始，并为标题提供稳定且
唯一的 `id`。正文不得依赖 CDN、远程字体、前端框架或运行时网络服务。
