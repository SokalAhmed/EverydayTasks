/**
 * Date utility functions for daily study planner and rollover management
 */

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return formatDateToISO(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToISO(date);
}

export function isPastDate(dateStr: string, referenceDateStr: string): boolean {
  return dateStr < referenceDateStr;
}

export function isToday(dateStr: string, referenceDateStr: string): boolean {
  return dateStr === referenceDateStr;
}

export function isFutureDate(dateStr: string, referenceDateStr: string): boolean {
  return dateStr > referenceDateStr;
}

export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = date.getDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

  return `${weekday}, ${monthName} ${dayNum}`;
}

export function getDayName(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function formatShortWeekday(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDayNumber(dateStr: string): number {
  const date = parseDate(dateStr);
  return date.getDate();
}

export function getWeekDaysRange(centerDateStr: string): string[] {
  const days: string[] = [];
  for (let i = -3; i <= 3; i++) {
    days.push(addDays(centerDateStr, i));
  }
  return days;
}
