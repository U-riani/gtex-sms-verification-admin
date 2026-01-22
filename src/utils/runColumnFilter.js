// src/utils/runColumnFilter.js
import { FILTER_OPERATORS } from "../constanst/operators";
import normalizeCellValue from "./normalizeCellValue";

export function runColumnFilter(row, columnKey, filter) {
  console.log("runColumnFilter", columnKey, filter);

  if (!filter) return true;

  const cell = normalizeCellValue(row[columnKey], filter.type);

  /* ---------------- QUICK ---------------- */
  if (filter.type === "boolean" && filter.quick?.mode) {
    const mode = filter.quick.mode;

    if (mode === "yes") return cell.includes(true);
    if (mode === "no") return cell.includes(false);
    if (mode === "empty") return cell.length === 0;
    if (mode === "not_empty") return cell.length > 0;

    return true;
  }
  if (filter.quick?.values?.length) {
    // QUICK FILTER IS ALWAYS EQUALITY-BASED

    const quickOperator =
      filter.type === "text" ? "equals" : filter.quick.operator;

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
      (cond.operator === "between" || cond.operator === "on") &&
      (values.length < 2 || values[0] == null || values[1] == null)
    ) {
      continue;
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
