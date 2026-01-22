// constanst/operators.js

export const OPERATORS = {
  text: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
    { value: "empty", label: "is empty" },
    { value: "not_empty", label: "is not empty" },
  ],
  enum: [
    { value: "in", label: "in" },
    { value: "not_in", label: "not in" },
    { value: "only", label: "only" },
    { value: "not_only", label: "not only" },
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "empty", label: "is empty" },
    { value: "not_empty", label: "is not empty" },
  ],

  boolean: [
    { value: "equals", label: "Is" },
    { value: "not_equals", label: "Is not" },
    { value: "empty", label: "Empty" }, // optional
    { value: "not_empty", label: "Not empty" }, // optional
  ],
  date: [
    { value: "on", label: "On" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
    { value: "empty", label: "Is empty" },
    { value: "not_empty", label: "Is not empty" },
  ],
};

export const FILTER_OPERATORS = {
  text: {
    contains: (cell, selected) =>
      selected.some((s) => cell.some((c) => c.includes(s))),
    not_contains: (cell, selected) =>
      selected.every((s) => cell.every((c) => !c.includes(s))),
    equals: (cell, selected) => selected.some((s) => cell.includes(s)),
    not_equals: (cell, selected) => selected.every((s) => !cell.includes(s)),
    empty: (cell) => cell.length === 0 || cell.every((v) => v === ""),
    not_empty: (cell) => cell.some((v) => v !== ""),
  },

  enum: {
    contains: (cell, selected) =>
      selected.some((s) => cell.some((c) => String(c).includes(s))),

    not_contains: (cell, selected) =>
      selected.every((s) => cell.every((c) => !String(c).includes(s))),

    equals: (cell, selected) => selected.some((s) => cell.includes(s)),

    not_equals: (cell, selected) => selected.every((s) => !cell.includes(s)),

    in: (cell, selected) => selected.some((s) => cell.includes(s)),

    not_in: (cell, selected) => selected.every((s) => !cell.includes(s)),
    only: (cell, selected) => {
      if (cell.length !== selected.length) return false;
      return selected.every((s) => cell.includes(s));
    },
    not_only: (cell, selected) => {
      if (cell.length !== selected.length) return true;
      return !selected.every((s) => cell.includes(s));
    },

    empty: (cell) => cell.length === 0,
    not_empty: (cell) => cell.length > 0,
  },

  date: {
    on: (cell, [from, to]) => cell.some((v) => v >= from && v < to),
    equals: (cell, selected) => selected.some((s) => cell.includes(s)),

    before: (cell, [d]) => cell.some((v) => v < d),

    after: (cell, [d]) => cell.some((v) => v > d),

    between: (cell, [from, to]) => cell.some((v) => v >= from && v <= to),

    empty: (cell) => cell.length === 0 || Number.isNaN(cell[0]),
    not_empty: (cell) => cell.length > 0 && !Number.isNaN(cell[0]),
  },
};
