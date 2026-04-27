const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(value, { compact = false } = {}) {
  if (Number.isNaN(value) || value == null) return '$0.00';
  return compact ? currencyCompact.format(value) : currency.format(value);
}

export function formatPercent(ratio, digits = 1) {
  if (!Number.isFinite(ratio)) return '0%';
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function isoMonth(date = new Date()) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
}

export function todayIso(date = new Date()) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatDayLabel(iso, today = new Date()) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((t - d) / 86_400_000);
  if (diff === 0) return `Today · ${shortDate(d)}`;
  if (diff === 1) return `Yesterday · ${shortDate(d)}`;
  return `${weekday(d)} · ${shortDate(d)}`;
}

export function shortDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function weekday(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

export function fullDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
