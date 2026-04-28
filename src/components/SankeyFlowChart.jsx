import PropTypes from 'prop-types';
import { useMemo } from 'react';
import * as echarts from 'echarts/core';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { SankeyChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { formatCurrency } from '../utils/format.js';

echarts.use([SankeyChart, TooltipComponent, CanvasRenderer]);

function readCssVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function colorForNode(node, ramp, palette) {
  if (node.kind === 'income') return palette.forest;
  if (node.kind === 'pool') return palette.emeraldDark;
  if (node.kind === 'savings') return palette.emeraldDark;
  if (node.color) return node.color;
  return ramp[0];
}

export default function SankeyFlowChart({ data, theme, height = 520, framed = true, className = '' }) {
  const palette = {
    forest: readCssVar('--accent-surface', '#0B3D2E'),
    emeraldDark: readCssVar('--emerald-dark', '#059669'),
    ramp: [
      readCssVar('--cat-2', '#A7F3D0'),
      readCssVar('--cat-3', '#6EE7B7'),
      readCssVar('--cat-4', '#34D399'),
      readCssVar('--cat-5', '#10B981'),
      readCssVar('--cat-6', '#059669'),
      readCssVar('--cat-7', '#0B3D2E'),
      readCssVar('--cat-1', '#D1E7DB'),
    ],
    tooltipBg: readCssVar('--chart-tooltip-bg', '#FFFFFF'),
    tooltipBorder: readCssVar('--chart-tooltip-border', '#E9E7DF'),
    tooltipText: readCssVar('--chart-tooltip-text', '#0E1F17'),
    tooltipMuted: readCssVar('--chart-tooltip-muted', '#5B6B63'),
    lineBorder: readCssVar('--panel-border-strong', 'rgba(255,255,255,0.4)'),
    shadow: theme === 'dark'
      ? 'box-shadow: 0 12px 28px rgba(0,0,0,0.32); border-radius: 12px; padding: 10px 12px;'
      : 'box-shadow: 0 8px 24px rgba(14,31,23,0.10); border-radius: 12px; padding: 10px 12px;',
  };

  const nodes = useMemo(
    () =>
      data.nodes.map((node, i) => {
        let color = colorForNode(node, palette.ramp, palette);

        if (node.kind === 'expense') {
          const expenseIndex = data.nodes.slice(0, i).filter((item) => item.kind === 'expense').length;
          color = palette.ramp[expenseIndex % palette.ramp.length];
        }

        return {
          name: node.name,
          itemStyle: {
            color,
            borderColor: palette.lineBorder,
            borderWidth: 1,
          },
          label: {
            color: palette.tooltipText,
            fontWeight: 500,
          },
        };
      }),
    [data, palette]
  );

  const links = useMemo(
    () =>
      data.links.map((link) => ({
        source: data.nodes[link.source]?.name,
        target: data.nodes[link.target]?.name,
        value: Number(link.value),
      })),
    [data]
  );

  const option = useMemo(
    () => ({
      animationDuration: 600,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'item',
        backgroundColor: palette.tooltipBg,
        borderColor: palette.tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: palette.tooltipText,
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontSize: 13,
        },
        extraCssText: palette.shadow,
        formatter: (params) => {
          if (params.dataType === 'edge') {
            const amount = formatCurrency(Number(params.data.value));
            return `
              <div style="display:grid;gap:4px;min-width:160px;">
                <strong style="color:${palette.tooltipText};">${escapeHtml(params.data.source)} &rarr; ${escapeHtml(params.data.target)}</strong>
                <span style="color:${palette.tooltipMuted};">Amount: ${escapeHtml(amount)}</span>
              </div>
            `;
          }

          const nodeValue = Number(params.value);

          return `
            <div style="display:grid;gap:4px;">
              <strong style="color:${palette.tooltipText};">${escapeHtml(params.name)}</strong>
              ${
                Number.isFinite(nodeValue) && nodeValue > 0
                  ? `<span style="color:${palette.tooltipMuted};">Total: ${escapeHtml(formatCurrency(nodeValue))}</span>`
                  : ''
              }
            </div>
          `;
        },
      },
      series: [
        {
          type: 'sankey',
          left: 16,
          right: 120,
          top: 24,
          bottom: 24,
          data: nodes,
          links,
          nodeAlign: 'justify',
          nodeWidth: 16,
          nodeGap: 14,
          draggable: false,
          emphasis: {
            focus: 'adjacency',
            lineStyle: { opacity: 0.85 },
          },
          lineStyle: {
            color: 'gradient',
            opacity: 0.5,
            curveness: 0.5,
          },
          label: {
            color: palette.tooltipText,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'Inter, -apple-system, sans-serif',
            width: 110,
            overflow: 'break',
          },
        },
      ],
    }),
    [links, nodes, palette]
  );

  const chart = (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      style={{ height: `${height}px`, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );

  if (!framed) {
    return (
      <div className={className} aria-label="Money flow sankey chart" data-theme-render={theme}>
        {chart}
      </div>
    );
  }

  return (
    <section className={`card card--lg ${className}`.trim()} aria-label="Money flow sankey chart" data-theme-render={theme}>
      {chart}
    </section>
  );
}

SankeyFlowChart.propTypes = {
  data: PropTypes.shape({
    nodes: PropTypes.arrayOf(
      PropTypes.shape({ name: PropTypes.string.isRequired, kind: PropTypes.string, color: PropTypes.string })
    ).isRequired,
    links: PropTypes.arrayOf(
      PropTypes.shape({
        source: PropTypes.number.isRequired,
        target: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
  height: PropTypes.number,
  framed: PropTypes.bool,
  className: PropTypes.string,
};
