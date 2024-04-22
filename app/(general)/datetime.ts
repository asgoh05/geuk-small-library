export function AddDays(date: Date, days: number): Date {
  let _date = new Date(date);
  return new Date(_date.setDate(_date.getDate() + days));
}

export function SubstractDays(date: Date, days: number): Date {
  let _date = new Date(date);
  return new Date(_date.setDate(_date.getDate() - days));
}

export function RemainingDays(future_date: Date): Number {
  return Math.floor(
    (future_date.getTime() - new Date(Date.now()).getTime()) /
      (24 * 60 * 60 * 1000)
  );
}
