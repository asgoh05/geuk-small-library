export function AddDays(date: Date, days: number) {
  let _date = new Date(date);
  return new Date(_date.setDate(_date.getDate() + days));
}

export function SubstractDays(date: Date, days: number) {
  let _date = new Date(date);
  return new Date(_date.setDate(_date.getDate() - days));
}
