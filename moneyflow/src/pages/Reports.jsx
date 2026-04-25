import { useMemo } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2'
import { useApp } from '../context/AppContext'
import { fmtShort } from '../utils/helpers'
import styles from './Reports.module.css'

// Chart.js only renders chart types that are registered first.
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

const chartColors = ['#20b486', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#f97316', '#64748b']
const monthLabel = (ym) => {
  const [year, month] = ym.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-US', { month: 'short' })
}

const monthKey = (date) => date.slice(0, 7)

export default function Reports() {
  const { expenses, incomeEntries, CATEGORIES, totalIncome, totalExpenses, balance, savingsRate, baseAmountOf } = useApp()

  // Build chart-friendly data from raw income and expense records.
  const report = useMemo(() => {
    // Donut chart: total spending grouped by category.
    const categoryTotals = CATEGORIES.map(cat => ({
      name: cat.name,
      color: cat.color,
      value: expenses
        .filter(expense => expense.category === cat.name)
        .reduce((sum, expense) => sum + baseAmountOf(expense), 0),
    })).filter(item => item.value > 0)

    // Bar and line charts use the last six months that have any activity.
    const monthSet = new Set()
    expenses.forEach(expense => monthSet.add(monthKey(expense.date)))
    incomeEntries.forEach(entry => monthSet.add(monthKey(entry.date)))
    const months = [...monthSet].sort().slice(-6)
    const safeMonths = months.length ? months : [new Date().toISOString().slice(0, 7)]

    const monthlyIncome = safeMonths.map(month => incomeEntries
      .filter(entry => monthKey(entry.date) === month)
      .reduce((sum, entry) => sum + baseAmountOf(entry), 0))
    const monthlyExpenses = safeMonths.map(month => expenses
      .filter(expense => monthKey(expense.date) === month)
      .reduce((sum, expense) => sum + baseAmountOf(expense), 0))
    const monthlySavings = monthlyIncome.map((income, index) => income - monthlyExpenses[index])

    const totalAllIncome = incomeEntries.reduce((sum, entry) => sum + baseAmountOf(entry), 0)
    const totalAllExpenses = expenses.reduce((sum, expense) => sum + baseAmountOf(expense), 0)
    const totalAllSavings = totalAllIncome - totalAllExpenses

    return {
      categoryTotals,
      labels: safeMonths.map(monthLabel),
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      totalAllIncome,
      totalAllExpenses,
      totalAllSavings,
    }
  }, [CATEGORIES, baseAmountOf, expenses, incomeEntries])

  // Empty charts still render a placeholder so the reports page never looks broken.
  const expenseBreakdown = report.categoryTotals.length
    ? report.categoryTotals
    : [{ name: 'No expenses', value: 1, color: '#334155' }]
  const savingsValue = Math.max(balance, 0)
  const sankeyExpenses = report.categoryTotals.slice(0, 5)

  const doughnutData = {
    labels: expenseBreakdown.map(item => item.name),
    datasets: [{
      data: expenseBreakdown.map(item => item.value),
      backgroundColor: expenseBreakdown.map((item, index) => item.color || chartColors[index % chartColors.length]),
      borderColor: '#10192d',
      borderWidth: 2,
    }],
  }

  const barData = {
    labels: report.labels,
    datasets: [
      { label: 'Income', data: report.monthlyIncome, backgroundColor: '#20b486', borderRadius: 6 },
      { label: 'Expenses', data: report.monthlyExpenses, backgroundColor: '#f87171', borderRadius: 6 },
      { label: 'Savings', data: report.monthlySavings, backgroundColor: '#7aa7ff', borderRadius: 6 },
    ],
  }

  const lineData = {
    labels: report.labels,
    datasets: [
      {
        label: 'Expenses',
        data: report.monthlyExpenses,
        borderColor: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.16)',
        tension: 0.35,
        pointRadius: 4,
      },
      {
        label: 'Savings',
        data: report.monthlySavings,
        borderColor: '#20b486',
        backgroundColor: 'rgba(32, 180, 134, 0.16)',
        tension: 0.35,
        pointRadius: 4,
      },
    ],
  }

  const pieData = {
    labels: ['Expenses', 'Savings'],
    datasets: [{
      data: [Math.max(totalExpenses, 0), savingsValue || 0],
      backgroundColor: ['#f87171', '#20b486'],
      borderColor: '#10192d',
      borderWidth: 2,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8f9bb3' } },
      tooltip: { callbacks: { label: context => `${context.dataset.label || context.label}: ${fmtShort(context.raw)}` } },
    },
    scales: {
      x: { ticks: { color: '#8f9bb3' }, grid: { color: 'rgba(148, 163, 184, 0.08)' } },
      y: { ticks: { color: '#8f9bb3' }, grid: { color: 'rgba(148, 163, 184, 0.08)' } },
    },
  }

  const circleOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#8f9bb3' } },
      tooltip: { callbacks: { label: context => `${context.label}: ${fmtShort(context.raw)}` } },
    },
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>View Report</p>
          <h1 className={styles.title}>MoneyFlow analytics</h1>
          <p className={styles.sub}>Dynamic charts built from your income entries, expenses, categories, and savings.</p>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <Summary label="Total income" value={fmtShort(totalIncome)} tone="green" />
        <Summary label="Total expenses" value={fmtShort(totalExpenses)} tone="red" />
        <Summary label="Savings" value={fmtShort(balance)} tone={balance >= 0 ? 'blue' : 'red'} />
        <Summary label="Savings rate" value={`${savingsRate}%`} tone="green" />
      </section>

      <section className={styles.chartGrid}>
        <ChartCard title="Donut chart" desc="Expense breakdown by category.">
          <Doughnut data={doughnutData} options={circleOptions} />
        </ChartCard>

        <ChartCard title="Pie chart" desc="Current month split between expenses and savings.">
          <Pie data={pieData} options={circleOptions} />
        </ChartCard>

        <ChartCard title="Bar chart" desc="Income, expenses, and savings month over month." wide>
          <Bar data={barData} options={chartOptions} />
        </ChartCard>

        <ChartCard title="Line chart" desc="Trend line for spending and savings over time." wide>
          <Line data={lineData} options={chartOptions} />
        </ChartCard>

        <ChartCard title="Sankey flow" desc="Where income moves across expenses and savings." full>
          <SankeyChart totalIncome={totalIncome} expenses={sankeyExpenses} savings={savingsValue} />
        </ChartCard>
      </section>
    </main>
  )
}

function Summary({ label, value, tone }) {
  return (
    <div className={`${styles.summaryCard} ${styles[tone]}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}

function ChartCard({ title, desc, children, wide, full }) {
  return (
    <section className={`${styles.chartCard} ${wide ? styles.wide : ''} ${full ? styles.full : ''}`}>
      <div className={styles.chartHeader}>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      <div className={styles.chartBody}>{children}</div>
    </section>
  )
}

// Lightweight SVG Sankey: visualizes money flowing from income into expenses and savings.
function SankeyChart({ totalIncome, expenses, savings }) {
  const visibleIncome = Math.max(totalIncome, 1)
  // Scale each flow width relative to the biggest outgoing amount.
  const maxExpense = Math.max(...expenses.map(item => item.value), savings, 1)
  const savingsWidth = Math.max(8, (savings / maxExpense) * 34)
  const expenseStartY = 62
  const expenseGap = 46

  return (
    <div className={styles.sankeyWrap}>
      <svg viewBox="0 0 900 360" role="img" aria-label="Income flow sankey chart">
        <defs>
          <linearGradient id="incomeFlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#20b486" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#20b486" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="expenseFlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="savingFlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#7aa7ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#20b486" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <rect x="52" y="120" width="24" height="120" rx="6" fill="#20b486" />
        <text x="45" y="104" fill="#f4f7fb" fontSize="18" fontWeight="700">Income</text>
        <text x="36" y="270" fill="#8f9bb3" fontSize="14">{fmtShort(totalIncome)}</text>

        <rect x="392" y="112" width="28" height="136" rx="6" fill="#14a36f" />
        <text x="348" y="96" fill="#f4f7fb" fontSize="18" fontWeight="700">Money pool</text>
        <path d="M76 180 C190 180 270 180 392 180" stroke="url(#incomeFlow)" strokeWidth="72" fill="none" strokeLinecap="round" />

        {expenses.map((expense, index) => {
          const y = expenseStartY + index * expenseGap
          const width = Math.max(7, (expense.value / maxExpense) * 32)
          return (
            <g key={expense.name}>
              <path d={`M420 180 C540 180 590 ${y} 700 ${y}`} stroke="url(#expenseFlow)" strokeWidth={width} fill="none" strokeLinecap="round" />
              <rect x="700" y={y - 14} width="22" height="28" rx="5" fill={expense.color} />
              <text x="734" y={y - 2} fill="#f4f7fb" fontSize="14" fontWeight="700">{expense.name}</text>
              <text x="734" y={y + 16} fill="#8f9bb3" fontSize="12">{fmtShort(expense.value)}</text>
            </g>
          )
        })}

        <path d="M420 192 C545 220 590 288 700 288" stroke="url(#savingFlow)" strokeWidth={savingsWidth} fill="none" strokeLinecap="round" />
        <rect x="700" y="270" width="22" height="36" rx="5" fill="#20b486" />
        <text x="734" y="286" fill="#f4f7fb" fontSize="14" fontWeight="700">Savings</text>
        <text x="734" y="304" fill="#8f9bb3" fontSize="12">{fmtShort(savings)}</text>
      </svg>
      {totalIncome <= 0 && <p className={styles.emptyNote}>Add income entries to activate the full Sankey flow.</p>}
    </div>
  )
}
