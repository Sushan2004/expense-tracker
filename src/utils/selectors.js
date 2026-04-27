import { isoMonth } from './format.js';

export function categoryById(categories, id) {
  return categories.find((c) => c.id === id);
}

export function accountById(accounts, id) {
  return accounts.find((a) => a.id === id);
}

export function totalBalance(accounts) {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

export function monthTotals(transactions, month = isoMonth()) {
  let income = 0;
  let spending = 0;
  for (const t of transactions) {
    if (!t.date.startsWith(month)) continue;
    if (t.type === 'income' || t.amount > 0) income += t.amount;
    else spending += Math.abs(t.amount);
  }
  return { income, spending, savingsRate: income > 0 ? (income - spending) / income : 0 };
}

export function spendingByCategory(transactions, month = isoMonth()) {
  const map = new Map();
  for (const t of transactions) {
    if (!t.date.startsWith(month)) continue;
    if (t.type === 'income' || t.amount >= 0) continue;
    const key = t.categoryId;
    map.set(key, (map.get(key) || 0) + Math.abs(t.amount));
  }
  return [...map.entries()]
    .map(([categoryId, amount]) => ({ categoryId, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function budgetStatusForRatio(ratio) {
  if (ratio > 1) return 'over';
  if (ratio >= 0.8) return 'warn';
  return 'ok';
}

export function getBudgetCategoryData(budgets, transactions, categories, month = isoMonth()) {
  const monthBudgets = budgets.filter((b) => b.month === month);
  const spending = spendingByCategory(transactions, month);
  const spentMap = new Map(spending.map((item) => [item.categoryId, item.amount]));
  const statusOrder = { over: 0, warn: 1, ok: 2 };

  return monthBudgets
    .map((budget) => {
      const category = categoryById(categories, budget.categoryId);
      const spent = spentMap.get(budget.categoryId) || 0;
      const ratio = budget.amount > 0 ? spent / budget.amount : 0;
      const remaining = budget.amount - spent;
      const status = budgetStatusForRatio(ratio);

      return {
        categoryId: budget.categoryId,
        name: category?.name || 'Other',
        colorVar: category?.colorVar || '--cat-1',
        budget: budget.amount,
        spent,
        ratio,
        remaining,
        overBy: Math.max(0, spent - budget.amount),
        status,
      };
    })
    .sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      if (b.ratio !== a.ratio) return b.ratio - a.ratio;
      return b.spent - a.spent;
    });
}

export function getBudgetSummary(budgets, transactions, categories, month = isoMonth()) {
  const categoryData = getBudgetCategoryData(budgets, transactions, categories, month);
  const totalBudget = categoryData.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = categoryData.reduce((sum, item) => sum + item.spent, 0);
  const remaining = totalBudget - totalSpent;

  return {
    totalBudget,
    totalSpent,
    remaining,
    usedRatio: totalBudget > 0 ? totalSpent / totalBudget : 0,
    remainingRatio: totalBudget > 0 ? Math.max(0, remaining) / totalBudget : 0,
    overBudgetCount: categoryData.filter((item) => item.status === 'over').length,
    nearLimitCount: categoryData.filter((item) => item.status === 'warn').length,
  };
}

export function getBudgetBreakdown(categoryData) {
  const totalSpent = categoryData.reduce((sum, item) => sum + item.spent, 0);

  return categoryData
    .filter((item) => item.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .map((item) => ({
      categoryId: item.categoryId,
      name: item.name,
      colorVar: item.colorVar,
      amount: item.spent,
      share: totalSpent > 0 ? item.spent / totalSpent : 0,
      status: item.status,
    }));
}

export function groupByDay(transactions) {
  const map = new Map();
  for (const t of transactions) {
    if (!map.has(t.date)) map.set(t.date, []);
    map.get(t.date).push(t);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({
      date,
      total: items.reduce((s, t) => s + t.amount, 0),
      items,
    }));
}

export function uniqueId(prefix = 't') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// Build {nodes, links} for the Money Flow Sankey chart.
// 3 columns per DESIGN.md: income sources -> money pool -> destinations (+ savings).
// - Caps destinations at 7
// - Collapses categories under 4% of expenses into "Other"
// - Returns aggregate totals so the page can show KPI numbers next to the chart
export function getSankeyData(transactions, categories, { maxNodes = 7, smallShare = 0.04 } = {}) {
  const incomes = transactions.filter((t) => t.type === 'income' || (t.type !== 'expense' && t.amount > 0));
  const expenses = transactions.filter((t) => t.type === 'expense' || (t.type !== 'income' && t.amount < 0));

  const incomeBySource = new Map();
  for (const t of incomes) {
    const key = (t.merchant || 'Income').trim() || 'Income';
    incomeBySource.set(key, (incomeBySource.get(key) || 0) + Math.abs(Number(t.amount) || 0));
  }
  const incomeSources = [...incomeBySource.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const spendByCategory = new Map();
  for (const t of expenses) {
    const cat = categories.find((c) => c.id === t.categoryId);
    const key = cat?.name || 'Other';
    spendByCategory.set(key, (spendByCategory.get(key) || 0) + Math.abs(Number(t.amount) || 0));
  }
  let expenseCategories = [...spendByCategory.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalIncome = incomeSources.reduce((s, n) => s + n.value, 0);
  const totalExpenses = expenseCategories.reduce((s, n) => s + n.value, 0);
  const savings = Math.max(0, totalIncome - totalExpenses);

  const threshold = totalExpenses * smallShare;
  const big = expenseCategories.filter((c) => c.value >= threshold);
  const small = expenseCategories.filter((c) => c.value < threshold);
  const smallSum = small.reduce((s, c) => s + c.value, 0);
  if (smallSum > 0) {
    const existing = big.find((c) => c.name === 'Other');
    if (existing) existing.value += smallSum;
    else big.push({ name: 'Other', value: smallSum });
  }
  let limited = big.slice(0, maxNodes);
  if (big.length > maxNodes) {
    const overflow = big.slice(maxNodes).reduce((s, c) => s + c.value, 0);
    const existing = limited.find((c) => c.name === 'Other');
    if (existing) existing.value += overflow;
    else limited.push({ name: 'Other', value: overflow });
  }
  limited.sort((a, b) => b.value - a.value);

  const POOL = 'Money pool';
  const nodes = [];
  incomeSources.forEach((s) => nodes.push({ name: s.name, kind: 'income' }));
  const poolIdx = nodes.length;
  nodes.push({ name: POOL, kind: 'pool' });
  const catIdx = new Map();
  limited.forEach((c) => {
    catIdx.set(c.name, nodes.length);
    nodes.push({ name: c.name, kind: 'expense' });
  });
  let savingsIdx = -1;
  if (savings > 0) {
    savingsIdx = nodes.length;
    nodes.push({ name: 'Savings', kind: 'savings' });
  }

  const links = [];
  incomeSources.forEach((s, i) => {
    links.push({ source: i, target: poolIdx, value: s.value });
  });
  limited.forEach((c) => {
    links.push({ source: poolIdx, target: catIdx.get(c.name), value: c.value });
  });
  if (savingsIdx >= 0) {
    links.push({ source: poolIdx, target: savingsIdx, value: savings });
  }

  return { nodes, links, totalIncome, totalExpenses, savings };
}
