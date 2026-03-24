export const CUSTOM_EXPENSE_CATEGORY_TRIGGER = "Other";

export const BUILT_IN_EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Bills",
  "Transport",
  "Subscription",
  "Learning",
  "Health",
  "Entertainment",
  "Investments"
];

export const CATEGORY_OPTIONS = [...BUILT_IN_EXPENSE_CATEGORIES, CUSTOM_EXPENSE_CATEGORY_TRIGGER];

export const INCOME_SOURCE_OPTIONS = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"];

export const RECURRING_FREQUENCY_OPTIONS = ["weekly", "monthly", "yearly"];

export const CATEGORY_ICONS = {
  Food: "🍽️",
  Rent: "🏠",
  Bills: "🧾",
  Transport: "🚌",
  Subscription: "🔁",
  Learning: "📚",
  Health: "💊",
  Entertainment: "🎬",
  Investments: "📈",
  Salary: "💼",
  Freelance: "🧑‍💻",
  Other: "🧩"
};

export function normalizeCategoryName(value) {
  return String(value || "").trim();
}

export function isSameCategoryName(left, right) {
  return normalizeCategoryName(left).toLowerCase() === normalizeCategoryName(right).toLowerCase();
}

function findCanonicalCategoryName(value, categories) {
  const normalizedValue = normalizeCategoryName(value);

  if (!normalizedValue) {
    return "";
  }

  return categories.find((category) => isSameCategoryName(category, normalizedValue)) || "";
}

function getTransactionCustomExpenseCategories(transactions) {
  if (!Array.isArray(transactions)) {
    return [];
  }

  return transactions
    .filter((item) => item?.type === "expense")
    .map((item) => normalizeCategoryName(item?.category))
    .filter((category) => {
      if (!category || isSameCategoryName(category, CUSTOM_EXPENSE_CATEGORY_TRIGGER)) {
        return false;
      }

      return !findCanonicalCategoryName(category, BUILT_IN_EXPENSE_CATEGORIES);
    });
}

export function coerceCustomExpenseCategories(values, transactions = []) {
  const result = [];
  const candidates = [
    ...(Array.isArray(values) ? values : []),
    ...getTransactionCustomExpenseCategories(transactions)
  ];

  candidates.forEach((value) => {
    const normalizedValue = normalizeCategoryName(value);

    if (!normalizedValue || isSameCategoryName(normalizedValue, CUSTOM_EXPENSE_CATEGORY_TRIGGER)) {
      return;
    }

    if (findCanonicalCategoryName(normalizedValue, BUILT_IN_EXPENSE_CATEGORIES)) {
      return;
    }

    if (findCanonicalCategoryName(normalizedValue, result)) {
      return;
    }

    result.push(normalizedValue);
  });

  return result;
}

export function resolveExpenseCategoryName(value, customCategories = []) {
  const normalizedValue = normalizeCategoryName(value);

  if (!normalizedValue || isSameCategoryName(normalizedValue, CUSTOM_EXPENSE_CATEGORY_TRIGGER)) {
    return "";
  }

  return (
    findCanonicalCategoryName(normalizedValue, BUILT_IN_EXPENSE_CATEGORIES) ||
    findCanonicalCategoryName(normalizedValue, coerceCustomExpenseCategories(customCategories)) ||
    normalizedValue
  );
}

export function getExpenseCategoryOptions(customCategories = []) {
  return [
    ...BUILT_IN_EXPENSE_CATEGORIES,
    ...coerceCustomExpenseCategories(customCategories),
    CUSTOM_EXPENSE_CATEGORY_TRIGGER
  ];
}

export function formatCurrency(value, currency = "USD", options = {}) {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      ...options
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(dateString));
}

export function formatRecurringFrequency(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) {
    return "Not set";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getSummaryMetrics(transactions) {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  return {
    income,
    expenses,
    balance,
    savingsRate
  };
}

export function getExpenseCategoryData(transactions) {
  const categoryMap = transactions
    .filter((item) => item.type === "expense")
    .reduce((map, item) => {
      const key = item.category || "Other";
      map[key] = (map[key] || 0) + Number(item.amount);
      return map;
    }, {});

  return Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value);
}

function toMonthKey(dateValue) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthlyIncomeExpenseData(transactions) {
  const monthlyMap = transactions.reduce((map, item) => {
    const key = toMonthKey(item.date);
    if (!map[key]) {
      map[key] = { month: key, income: 0, expenses: 0 };
    }
    if (item.type === "income") {
      map[key].income += Number(item.amount);
    } else {
      map[key].expenses += Number(item.amount);
    }
    return map;
  }, {});

  return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
}

export function getSpendingTrendData(transactions) {
  const groupedByDate = transactions
    .filter((item) => item.type === "expense")
    .reduce((map, item) => {
      map[item.date] = (map[item.date] || 0) + Number(item.amount);
      return map;
    }, {});

  return Object.entries(groupedByDate)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function getSankeyData(transactions) {
  const incomeTotal = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenseCategories = getExpenseCategoryData(transactions);

  const nodes = [{ name: "Income" }, { name: "Expenses" }, ...expenseCategories.map((item) => ({ name: item.name }))];
  const links = [];

  if (incomeTotal > 0) {
    links.push({
      source: 0,
      target: 1,
      value: incomeTotal
    });
  }

  expenseCategories.forEach((item, index) => {
    links.push({
      source: 1,
      target: index + 2,
      value: item.value
    });
  });

  return { nodes, links };
}

export function filterAndSortTransactions(transactions, filters = {}) {
  const {
    query = "",
    category = "all",
    type = "all",
    sortBy = "date"
  } = filters;

  const filtered = transactions.filter((item) => {
    const textMatch = query
      ? item.description.toLowerCase().includes(query.toLowerCase())
      : true;
    const categoryMatch = category === "all" ? true : item.category === category;
    const typeMatch = type === "all" ? true : item.type === type;
    return textMatch && categoryMatch && typeMatch;
  });

  return filtered.sort((a, b) => {
    if (sortBy === "amount") {
      return Number(b.amount) - Number(a.amount);
    }
    return new Date(b.date) - new Date(a.date);
  });
}

export function buildCsv(transactions) {
  const header = [
    "id",
    "description",
    "amount",
    "category",
    "type",
    "incomeSource",
    "isRecurring",
    "recurringFrequency",
    "date"
  ];
  const rows = transactions.map((item) =>
    [
      item.id,
      item.description,
      item.amount,
      item.category,
      item.type,
      item.incomeSource || "",
      item.isRecurring ? "true" : "false",
      item.recurringFrequency || "",
      item.date
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

export function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getSpendingInsights(transactions) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const top = getExpenseCategoryData(transactions)[0];

  return {
    totalExpenses,
    topCategory: top?.name || "N/A",
    topCategorySpend: top?.value || 0
  };
}

export function validateTransaction(formValues) {
  const errors = {};

  if (!formValues.description.trim()) {
    errors.description = "Description is required.";
  }
  if (!formValues.amount || Number(formValues.amount) <= 0) {
    errors.amount = "Amount must be greater than zero.";
  }
  if (!formValues.category.trim()) {
    errors.category = "Category is required.";
  }
  if (!["income", "expense"].includes(formValues.type)) {
    errors.type = "Type must be income or expense.";
  }
  if (!formValues.date) {
    errors.date = "Date is required.";
  }
  if (formValues.type === "income" && !formValues.incomeSource.trim()) {
    errors.incomeSource = "Income source is required for income transactions.";
  }
  if (formValues.type === "expense" && formValues.isRecurring && !formValues.recurringFrequency) {
    errors.recurringFrequency = "Select a recurrence frequency.";
  }

  return errors;
}

export function validateExpense(formValues, customCategories = []) {
  const errors = {};
  const category = normalizeCategoryName(formValues.category);

  if (!formValues.description.trim()) {
    errors.description = "Description is required.";
  }
  if (!formValues.amount || Number(formValues.amount) <= 0) {
    errors.amount = "Amount must be greater than zero.";
  }
  if (!category) {
    errors.category = "Category is required.";
  }
  if (isSameCategoryName(category, CUSTOM_EXPENSE_CATEGORY_TRIGGER) && !resolveExpenseCategoryName(formValues.customCategory, customCategories)) {
    errors.customCategory = "Enter a custom category.";
  }
  if (!formValues.date) {
    errors.date = "Date is required.";
  }
  if (formValues.isRecurring && !formValues.recurringFrequency) {
    errors.recurringFrequency = "Select a recurrence frequency.";
  }

  return errors;
}

export function validateIncomeSource(formValues) {
  const errors = {};

  if (!String(formValues.sourceName || "").trim()) {
    errors.sourceName = "Source name is required.";
  }
  if (!formValues.amount || Number(formValues.amount) <= 0) {
    errors.amount = "Amount must be greater than zero.";
  }

  return errors;
}
