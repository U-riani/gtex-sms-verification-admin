// src/utils/normalizeCellValue.js
export default function normalizeCellValue(value, type) {
  if (value == null) return [];

  switch (type) {
    case "boolean":
      if (value === true) return [true];
      if (value === false) return [false];
      return []; // EMPTY

    case "date":
      if (Array.isArray(value)) {
        return value.map((v) =>
          v instanceof Date ? v.getTime() : new Date(v).getTime(),
        );
      }
      return [
        value instanceof Date ? value.getTime() : new Date(value).getTime(),
      ];

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
