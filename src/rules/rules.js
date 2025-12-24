const matchRule = (rowValue, rule) => {
  if (rowValue == null) {
    return rule.operator === "empty";
  }

  const v = String(rowValue).toLowerCase();
  const r = rule.value?.toLowerCase();

  switch (rule.operator) {
    case "eq":
      return v === r;

    case "neq":
      return v !== r;

    case "contains":
      return v.includes(r);

    case "not_contains":
      return !v.includes(r);

    case "starts_with":
      return v.startsWith(r);

    case "ends_with":
      return v.endsWith(r);

    case "in":
      return rule.values.includes(String(rowValue));

    case "not_in":
      return !rule.values.includes(String(rowValue));

    case "empty":
      return v === "";

    case "not_empty":
      return v !== "";

    default:
      return true;
  }
};
