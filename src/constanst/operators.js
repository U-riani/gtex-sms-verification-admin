export const OPERATORS = {
  text: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "eq", label: "equals" },
    { value: "neq", label: "not equals" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
    { value: "empty", label: "is empty" },
    { value: "not_empty", label: "is not empty" },
  ],
  enum: [
    { value: "in", label: "is any of" },
    { value: "not_in", label: "is none of" },
  ],
};
