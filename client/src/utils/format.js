import { format, parseISO, differenceInDays } from 'date-fns';

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'MMM d');
}

export function formatMonth(monthStr) {
  if (!monthStr) return '';
  return format(parseISO(monthStr + '-01'), 'MMMM yyyy');
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatPoints(points) {
  return new Intl.NumberFormat('en-US').format(points);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), new Date());
}

export function formatDurationStr(str) {
  if (!str) return '';
  // Handle "Xh Ym" or "X hr Y min" or ISO "PT2H30M" formats
  const isoMatch = str.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (isoMatch) {
    return `${isoMatch[1] || '0'}h ${isoMatch[2] || '0'}m`;
  }
  return str;
}

export function getMonthsOfYear(year) {
  return Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    return `${year}-${m}`;
  });
}

export const STATUS_COLORS = {
  planned: 'text-atlas-warning',
  booked: 'text-atlas-accent',
  completed: 'text-atlas-success',
};

export const STATUS_BG = {
  planned: 'bg-amber-100/60 border-amber-300/50 text-amber-800',
  booked: 'bg-blue-50/60 border-blue-200/50 text-blue-800',
  completed: 'bg-emerald-50/60 border-emerald-200/50 text-emerald-800',
};
