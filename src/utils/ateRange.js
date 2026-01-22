// src/utils/dateRange.js
export function dayRange(date) {
  if (!(date instanceof Date)) return [null, null];

  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0
  );

  const end = new Date(start);
  end.setDate(end.getDate() + 1); // next day 00:00:00

  return [start, end];
}
