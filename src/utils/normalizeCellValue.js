// src/utils/normalizeCellValue.js
export default function normalizeCellValue(value, type) {
  if (value == null) return [];

  switch (type) {
    case "boolean":
      return [Boolean(value)];

    case "date":
      // always store dates as timestamps
      if (Array.isArray(value)) {
        return value.map((v) => new Date(v).getTime());
      }
      return [new Date(value).getTime()];

    case "number":
      return [Number(value)];

    case "enum":
      if (Array.isArray(value)) {
        return value.map((v) => String(v).toLowerCase());
      }
      return [String(value).toLowerCase()];

    case "text":
    default:
      return [String(value).toLowerCase()];
  }
}
