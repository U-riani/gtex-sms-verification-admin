// src/utils/runColumnFilter.js
import { FILTER_OPERATORS } from "../constanst/operators";
import normalizeCellValue from "./normalizeCellValue";

export function runColumnFilter(row, columnKey, filter) {
  console.log("runColumnFilter", columnKey, filter);

  if (!filter) return true;

  const cell = normalizeCellValue(row[columnKey], filter.type);

  /* ---------------- QUICK ---------------- */
  if (filter.quick?.values?.length) {
    // QUICK FILTER IS ALWAYS EQUALITY-BASED
    const quickOperator = filter.type === "text" ? "equals" : filter.quick.operator;

    const fn = FILTER_OPERATORS[filter.type]?.[quickOperator];

    if (fn && !fn(cell, filter.quick.values)) {
      return false;
    }
  }

  /* -------------- ADVANCED -------------- */
  const conditions = filter.advanced?.conditions;
  if (!conditions?.length) return true;

  let result = null;

  for (let i = 0; i < conditions.length; i++) {
    const cond = conditions[i];
    const fn = FILTER_OPERATORS[filter.type]?.[cond.operator];

    if (!fn) continue;

    const values = cond.values ?? [];

    if (
      cond.operator === "between" &&
      (values.length < 2 || values[0] == null || values[1] == null)
    ) {
      continue; // skip invalid between condition
    }

    const condResult = fn(cell, values);

    if (result === null) {
      result = condResult;
    } else {
      const join = cond.logic ?? "AND";
      result = join === "OR" ? result || condResult : result && condResult;
    }
  }

  return result ?? true;
}
