import React from "react";
import {
  Chart as ChartJS,
  registerables,
} from "chart.js";
import { Chart as ReactChart } from "react-chartjs-2";

ChartJS.register(...registerables);

// Palette + global defaults ported from the original assets/textbook.js.
export const XINFER_PALETTE = {
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

let defaultsApplied = false;
function applyDefaults() {
  if (defaultsApplied) return;
  defaultsApplied = true;
  ChartJS.defaults.font.family = sans;
  ChartJS.defaults.font.size = 13;
  ChartJS.defaults.color = "#444";
  ChartJS.defaults.plugins.legend.labels.boxWidth = 14;
  ChartJS.defaults.plugins.legend.labels.padding = 14;
  ChartJS.defaults.plugins.tooltip.titleFont = { family: sans, weight: "700" };
  ChartJS.defaults.plugins.tooltip.bodyFont = { family: sans };
  ChartJS.defaults.maintainAspectRatio = false;
  ChartJS.defaults.animation.duration = 700;
}
applyDefaults();

/**
 * Chart — drop-in replacement for the old `makeChart(canvasId, config)` calls.
 *
 * Usage in MDX:
 *   <Chart type="line" data={{...}} options={{...}} />
 *
 * The palette is available to callers via the exported XINFER_PALETTE, or by
 * passing a render function — but in practice each former makeChart config is
 * inlined as `type` / `data` / `options` props.
 */
export default function Chart({ type, data, options, height = 340 }) {
  applyDefaults();
  return (
    <div className="chart-wrap" style={{ position: "relative", height }}>
      <ReactChart type={type} data={data} options={options} />
    </div>
  );
}
