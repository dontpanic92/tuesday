/* xinfer 教程教材 — 图表助手
   Shared Chart.js defaults + a tiny helper so every lesson plot looks consistent.
   依赖：在引入本文件前先通过 CDN 加载 Chart.js v4。 */

(function () {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js 未加载；plots 将不可用。");
    return;
  }

  // 配色（与教材主题一致）
  window.XINFER_PALETTE = {
    teal: "#1f6f78",
    orange: "#b8531a",
    purple: "#6b4fbb",
    green: "#2e7d4f",
    gold: "#9a6b00",
    grayline: "#e3e1da",
    ink: "#1a1a1a",
    inkSoft: "#555",
  };

  const sans =
    '"Noto Sans SC","Source Han Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif';

  Chart.defaults.font.family = sans;
  Chart.defaults.font.size = 13;
  Chart.defaults.color = "#444";
  Chart.defaults.plugins.legend.labels.boxWidth = 14;
  Chart.defaults.plugins.legend.labels.padding = 14;
  Chart.defaults.plugins.tooltip.titleFont = { family: sans, weight: "700" };
  Chart.defaults.plugins.tooltip.bodyFont = { family: sans };
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.animation.duration = 700;

  /** 在给定 canvas id 上创建图表（薄封装，便于以后统一处理）。 */
  window.makeChart = function (canvasId, config) {
    const el = document.getElementById(canvasId);
    if (!el) {
      console.warn("找不到 canvas:", canvasId);
      return null;
    }
    return new Chart(el.getContext("2d"), config);
  };
})();

