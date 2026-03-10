// src/utils/datePicker.js
export const withDefaultEndOfDay = function (value) {
  if (!value) return "";

  // if user picked only date, force 23:59:00
  if (value.length === 10) {
    return `${value}T23:59:00`;
  }

  // if no seconds, append :00
  if (value.length === 16) {
    return `${value}:00`;
  }
console.log("+++")
  return value;
};

// export function withStartOfDay(date) {
//   if (!date) return "";
//   return date.replace(/T.*/, "T00:00:00");
// }

// export function withEndOfDay(date) {
//   if (!date) return "";
//   return date.replace(/T.*/, "T23:59:59");
// }

export function withStartOfDay(date) {
  if (!(date instanceof Date)) return null;
  return new Date(
    date.getFullYear(), 
    date.getMonth(),
    date.getDate(),
    0, 0, 0
  );
}

export function withEndOfDay(date) {
  if (!(date instanceof Date)) return null;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23, 59, 59
  );
}
