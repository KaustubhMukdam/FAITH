export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthStart(monthString: string): Date {
  const [year, month] = monthString.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

export function getMonthEnd(monthString: string): Date {
  const [year, month] = monthString.split('-').map(Number);
  return new Date(year, month, 0, 23, 59, 59, 999);
}

export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  if (format === 'long') {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString('en-IN');
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}
