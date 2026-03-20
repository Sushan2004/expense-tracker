import PropTypes from "prop-types";
import { useMemo } from "react";
import * as echarts from "echarts/core";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { SankeyChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useCurrency } from "../../context/CurrencyContext";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/helpers";

echarts.use([SankeyChart, TooltipComponent, CanvasRenderer]);

const LIGHT_NODE_COLORS = ["#10b981", "#f97316", "#38bdf8", "#8b5cf6", "#ec4899", "#22c55e", "#eab308", "#06b6d4"];
const DARK_NODE_COLORS = ["#34d399", "#fb923c", "#60a5fa", "#a78bfa", "#f472b6", "#4ade80", "#facc15", "#22d3ee"];
const FALLBACK_THEME_TOKENS = {
  text: "#0f172a",
  muted: "#475569",
  border: "#dbe2ea",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc"
};

function readThemeTokens() {
  if (typeof window === "undefined") {
    return FALLBACK_THEME_TOKENS;
  }

  const styles = window.getComputedStyle(document.documentElement);

  return {
    text: styles.getPropertyValue("--text").trim() || FALLBACK_THEME_TOKENS.text,
    muted: styles.getPropertyValue("--muted").trim() || FALLBACK_THEME_TOKENS.muted,
    border: styles.getPropertyValue("--border").trim() || FALLBACK_THEME_TOKENS.border,
    surface: styles.getPropertyValue("--surface").trim() || FALLBACK_THEME_TOKENS.surface,
    surfaceSoft: styles.getPropertyValue("--surface-soft").trim() || FALLBACK_THEME_TOKENS.surfaceSoft
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildSankeyNodesAndLinks(data, palette) {
  const nodes = data.nodes.map((node, index) => ({
    name: node.name,
    itemStyle: {
      color: palette[index % palette.length],
      borderColor: "rgba(255,255,255,0.28)",
      borderWidth: 1
    }
  }));

  const links = data.links.map((link) => ({
    source: nodes[link.source]?.name,
    target: nodes[link.target]?.name,
    value: Number(link.value)
  }));

  return { nodes, links };
}

export default function IncomeExpenseSankeyChart({ data }) {
  const { currency } = useCurrency();
  const { theme } = useTheme();

  const themeTokens = useMemo(() => readThemeTokens(), [theme]);
  const palette = theme === "dark" ? DARK_NODE_COLORS : LIGHT_NODE_COLORS;

  const { nodes, links } = useMemo(
    () => buildSankeyNodesAndLinks(data, palette),
    [data, palette]
  );

  const option = useMemo(
    () => ({
      animationDuration: 700,
      animationEasing: "cubicOut",
      tooltip: {
        trigger: "item",
        backgroundColor: themeTokens.surface,
        borderColor: themeTokens.border,
        borderWidth: 1,
        textStyle: {
          color: themeTokens.text,
          fontFamily: "Inter, Segoe UI, sans-serif"
        },
        extraCssText: "box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18); border-radius: 12px; padding: 10px 12px;",
        formatter: (params) => {
          if (params.dataType === "edge") {
            const amount = formatCurrency(Number(params.data.value), currency, { maximumFractionDigits: 0 });
            return `
              <div style="display:grid;gap:4px;">
                <strong style="color:${themeTokens.text};">${escapeHtml(params.data.source)} -> ${escapeHtml(params.data.target)}</strong>
                <span style="color:${themeTokens.muted};">Amount: ${escapeHtml(amount)}</span>
              </div>
            `;
          }

          const nodeValue = Number(params.value);

          return `
            <div style="display:grid;gap:4px;">
              <strong style="color:${themeTokens.text};">${escapeHtml(params.name)}</strong>
              ${Number.isFinite(nodeValue) && nodeValue > 0
                ? `<span style="color:${themeTokens.muted};">Total: ${escapeHtml(
                    formatCurrency(nodeValue, currency, { maximumFractionDigits: 0 })
                  )}</span>`
                : ""}
            </div>
          `;
        }
      },
      series: [
        {
          type: "sankey",
          left: 24,
          right: 140,
          top: 24,
          bottom: 24,
          data: nodes,
          links,
          nodeAlign: "justify",
          nodeWidth: 20,
          nodeGap: 18,
          draggable: false,
          emphasis: {
            focus: "adjacency"
          },
          lineStyle: {
            color: "gradient",
            opacity: 0.58,
            curveness: 0.55
          },
          label: {
            color: themeTokens.text,
            fontSize: 12,
            fontWeight: 700,
            width: 120,
            overflow: "break"
          }
        }
      ]
    }),
    [currency, links, nodes, themeTokens]
  );

  return (
    <section className="panel chart-panel money-flow-panel" aria-label="Money flow sankey chart">
      <div className="chart-wrap money-flow-chart-wrap">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          notMerge
          lazyUpdate
          style={{ height: "520px", width: "100%" }}
        />
      </div>
    </section>
  );
}

IncomeExpenseSankeyChart.propTypes = {
  data: PropTypes.shape({
    nodes: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired })).isRequired,
    links: PropTypes.arrayOf(
      PropTypes.shape({
        source: PropTypes.number.isRequired,
        target: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired
      })
    ).isRequired
  }).isRequired
};
