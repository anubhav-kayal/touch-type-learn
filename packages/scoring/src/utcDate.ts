export function utcDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function previousUtcDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
