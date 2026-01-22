// src/constanst/filterDefinition.js
export const FILTER_DEFINITION = {
  text: {
    quick: "equals",
    advanced: [
      "contains",
      "not_contains",
      "equals",
      "not_equals",
      "starts_with",
      "ends_with",
      "empty",
      "not_empty",
    ],
  },

  number: {
    quick: "contains",
    advanced: [
      "contains",
      "not_contains",
      "equals",
      "not_equals",
      "gt",
      "lt",
      "between",
      "empty",
      "not_empty",
    ],
  },

  date: {
    quick: "on",
    advanced: ["on", "before", "after", "between", "empty", "not_empty"],
  },

  enum: {
    quick: "in",
    advanced: [
      "contains",
      "not_contains",
      "equals",
      "not_equals",
      "in",
      "not_in",
      "only", 
      "not_only", 
      "empty",
      "not_empty",
    ],
  },

  boolean: {
    quick: "equals",
    advanced: ["equals", "not_equals", "empty", "not_empty"],
  },
};
