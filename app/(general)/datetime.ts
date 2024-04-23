export function AddDays(date: Date, days: number): Date {
  let _date = new Date(date);
  return new Date(_date.setDate(_date.getDate() + days));
}

export function SubstractDays(date: Date, days: number): Date {
  let _date = new Date(date);
  return new Date(_date.setDate(_date.getDate() - days));
}

export function SubstractDate(dateA: Date, dateB: Date): number {
  const _dateA = new Date(dateA).getTime();
  const _dateB = new Date(dateB).getTime();
  return Math.floor((_dateA - _dateB) / (24 * 60 * 60 * 1000));
}

export function RemainingDays(future_date: Date): number {
  return Math.floor(
    (future_date.getTime() - new Date(Date.now()).getTime()) /
      (24 * 60 * 60 * 1000)
  );
}

export function IsSameDate(dateA: Date, dateB: Date): boolean {
  return getDateString(dateA) === getDateString(dateB);
}

export function getDateString(date: Date): string {
  if (!(date instanceof Date)) {
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(
      d.getDay(),
      2
    )}`;
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(
    date.getDay(),
    2
  )}`;
}

export function pad(num: number, size: number): string {
  let n = num.toString();
  while (n.length < size) n = "0" + n;
  return n;
}
