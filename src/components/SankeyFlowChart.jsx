import PropTypes from 'prop-types';
import { useMemo } from 'react';
import * as echarts from 'echarts/core';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { SankeyChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { formatCurrency } from '../utils/format.js';

echarts.use([SankeyChart, TooltipComponent, CanvasRenderer]);

const PALETTE = {
  forest: '#0B3D2E',
  emerald: '#10B981',
  emeraldDark: '#059669',
  catRamp: ['#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#0B3D2E', '#D1E7DB'],
};

const TOOLTIP_TOKENS = {
  surface: '#FFFFFF',
  border: '#E9E7DF',
  ink: '#0E1F17',
  muted: '#5B6B63',
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function colorForNode(node, ramp) {
  if (node.kind === 'income') return PALETTE.forest;
  if (node.kind === 'pool') return PALETTE.emeraldDark;
  if (node.kind === 'savings') return PALETTE.emeraldDark;
  if (node.color) return node.color;
  return ramp[0];
}

export default function SankeyFlowChart({ data, height = 520, framed = true, className = '' }) {
  const expenseRamp = PALETTE.catRamp;

  const nodes = useMemo(
    () =>
      data.nodes.map((node, i) => {
        let color = colorForNode(node, expenseRamp);

        if (node.kind === 'expense') {
          const expenseIndex = data.nodes.slice(0, i).filter((n) => n.kind === 'expense').length;
          color = expenseRamp[expenseIndex % expenseRamp.length];
        }

        return {
          name: node.name,
          itemStyle: {
            color,
            borderColor: 'rgba(255,255,255,0.4)',
            borderWidth: 1,
          },
          label: {
            color: TOOLTIP_TOKENS.ink,
            fontWeight: 500,
          },
        };
      }),
    [data, expenseRamp]
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
        backgroundColor: TOOLTIP_TOKENS.surface,
        borderColor: TOOLTIP_TOKENS.border,
        borderWidth: 1,
        textStyle: {
          color: TOOLTIP_TOKENS.ink,
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontSize: 13,
        },
        extraCssText:
          'box-shadow: 0 8px 24px rgba(14,31,23,0.10); border-radius: 12px; padding: 10px 12px;',
        formatter: (params) => {
          if (params.dataType === 'edge') {
            const amount = formatCurrency(Number(params.data.value));
            return `
              <div style="display:grid;gap:4px;min-width:160px;">
                <strong style="color:${TOOLTIP_TOKENS.ink};">${escapeHtml(params.data.source)} &rarr; ${escapeHtml(params.data.target)}</strong>
                <span style="color:${TOOLTIP_TOKENS.muted};">Amount: ${escapeHtml(amount)}</span>
              </div>
            `;
          }

          const nodeValue = Number(params.value);

          return `
            <div style="display:grid;gap:4px;">
              <strong style="color:${TOOLTIP_TOKENS.ink};">${escapeHtml(params.name)}</strong>
              ${
                Number.isFinite(nodeValue) && nodeValue > 0
                  ? `<span style="color:${TOOLTIP_TOKENS.muted};">Total: ${escapeHtml(formatCurrency(nodeValue))}</span>`
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
            color: TOOLTIP_TOKENS.ink,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'Inter, -apple-system, sans-serif',
            width: 110,
            overflow: 'break',
          },
        },
      ],
    }),
    [links, nodes]
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
      <div className={className} aria-label="Money flow sankey chart">
        {chart}
      </div>
    );
  }

  return (
    <section className={`card card--lg ${className}`.trim()} aria-label="Money flow sankey chart">
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
  height: PropTypes.number,
  framed: PropTypes.bool,
  className: PropTypes.string,
};
