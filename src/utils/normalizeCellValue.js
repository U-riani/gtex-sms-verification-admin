// src/utils/normalizeCellValue.js
const normalizeCellValue = (value, type) => {
  if (value == null) return [];

  switch (type) {
    case "text":
      return [String(value).trim().toLowerCase()];

    case "enum":
      return Array.isArray(value)
        ? value.map((v) => String(v).toLowerCase())
        : [String(value).toLowerCase()];

    case "number":
      return [Number(value)].filter((v) => !Number.isNaN(v));

    case "date":
      return [new Date(value).getTime()].filter((v) => !Number.isNaN(v));

    case "boolean":
      // 🔑 THIS IS THE IMPORTANT PART
      return [Boolean(value)];
      
    default:
      return [String(value)];
  }
};
export default normalizeCellValue;
