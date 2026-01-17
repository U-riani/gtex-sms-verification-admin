// src/types/filters.js

/**
 * ColumnFilter
 *
 * ALWAYS this shape.
 * Simple filter = conditions.length === 1
 */
export const createEmptyColumnFilter = (type) => ({
  type,
  base: {
    operator: defaultOperatorForType(type),
    values: [],
  },
  baseLogic: "AND",
  conditions: [],
});

export const defaultOperatorForType = (type) => {
  switch (type) {
    case "enum":
      return "in";
    case "boolean":
      return "equals";
    case "date":
      return "on";
    default:
      return "contains";
  }
};
