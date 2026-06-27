// Ordered page manifest for the xinfer textbook series.
// Drives the coursemark crumb, part badge, and pager prev/next links.
// `slug` maps to the page route: /xinfer/<slug> (slug "" => /xinfer/).

export const SERIES_TITLE = "Building an LLM Inference Engine from Scratch";
export const SERIES_BASE = "/xinfer";

// The reading order (the index/TOC page is intentionally NOT in this chain).
export const pages = [
  {
    slug: "part0",
    title: "教程导论：我们要从零构建什么？",
    badge: "教程首页",
    crumb: "Part 0",
  },
  {
    slug: "module1",
    title: "Module 1：从 n-gram 到 Transformer",
    badge: "Part I · Foundations",
    crumb: "Part I / Module 1",
  },
  {
    slug: "module2",
    title: "Module 2：Transformer Block，算子逐个看",
    badge: "Part I · Foundations",
    crumb: "Part I / Module 2",
  },
  {
    slug: "module3",
    title: "Module 3：自回归生成、KV Cache 与采样",
    badge: "Part I · Foundations",
    crumb: "Part I / Module 3",
  },
  {
    slug: "module4",
    title: "Module 4：为什么需要 GPU，什么是 Shader？",
    badge: "Part II · GPU Compute",
    crumb: "Part II / Module 4",
  },
  {
    slug: "module5",
    title: "Module 5：GPU Compute API 版图",
    badge: "Part II · GPU Compute",
    crumb: "Part II / Module 5",
  },
  {
    slug: "module6",
    title: "Module 6：HLSL 与 Direct3D 12 编程模型",
    badge: "Part II · GPU Compute",
    crumb: "Part II / Module 6",
  },
  {
    slug: "module7",
    title: "Module 7：Qwen2 / Qwen2.5 模型",
    badge: "Part III · Concrete Candidates",
    crumb: "Part III / Module 7",
  },
  {
    slug: "module8",
    title: "Module 8：DirectML 与 Direct3D 12 Backend",
    badge: "Part III · Concrete Candidates",
    crumb: "Part III / Module 8",
  },
  {
    slug: "module9",
    title: "Module 9：Phase 0 — 项目脚手架与 Backend Bring-up",
    badge: "Part IV · Building xinfer",
    crumb: "Part IV / Module 9",
  },
  {
    slug: "module10",
    title: "Module 10：Phase 1 — 硬件抽象层 HAL",
    badge: "Part IV · Building xinfer",
    crumb: "Part IV / Module 10",
  },
  {
    slug: "module11",
    title: "Module 11：Phase 2 — Transformer Ops as Kernels",
    badge: "Part IV · Building xinfer",
    crumb: "Part IV / Module 11",
  },
  {
    slug: "module12",
    title: "Module 12：Phase 3 — 组装 Qwen2 模型",
    badge: "Part IV · Building xinfer",
    crumb: "Part IV / Module 12",
  },
  {
    slug: "module13",
    title: "Module 13：Phase 4 — Runtime、KV Cache、Decode 与 Sampling",
    badge: "Part IV · Building xinfer",
    crumb: "Part IV / Module 13",
  },
  {
    slug: "module14",
    title: "Module 14：Phase 5 — Layer Streaming",
    badge: "Part IV · Building xinfer",
    crumb: "Part IV / Module 14",
  },
  {
    slug: "module15",
    title: "Module 15：先测量，再优化",
    badge: "Part V · Performance",
    crumb: "Part V / Module 15",
  },
  {
    slug: "module16",
    title: "Module 16：六层优化案例",
    badge: "Part V · Performance",
    crumb: "Part V / Module 16",
  },
  {
    slug: "module17",
    title: "Module 17：高级优化方向",
    badge: "Part V · Performance",
    crumb: "Part V / Module 17",
  },
  {
    slug: "module18",
    title: "Module 18：Xbox GDK 部署路径",
    badge: "Part VI · Portability & Deployment",
    crumb: "Part VI / Module 18",
  },
  {
    slug: "module19",
    title: "Module 19：Productionizing",
    badge: "Part VI · Portability & Deployment",
    crumb: "Part VI / Module 19",
  },
  {
    slug: "appendices",
    title: "附录：数学、Rust、浮点、调试、术语与阅读清单",
    badge: "Appendices",
    crumb: "Appendices A–G",
  },
];

const indexBySlug = Object.fromEntries(pages.map((p, i) => [p.slug, i]));

export function getPage(slug) {
  const i = indexBySlug[slug];
  if (i === undefined) return null;
  return { ...pages[i], prev: pages[i - 1] || null, next: pages[i + 1] || null };
}

export function pageHref(slug) {
  return `${SERIES_BASE}/${slug}`;
}
