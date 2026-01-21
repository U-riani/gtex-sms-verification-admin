// src/utils/runAdvancedFilter.js
import { FILTER_OPERATORS } from "../constanst/operators";
import normalizeCellValue from "./normalizeCellValue";

function getByPath(obj, path) {
  return path.split(".").reduce((acc, k) => acc?.[k], obj);
}

function runCondition(row, cond) {
  if (!cond?.field || !cond?.operator) return true;

  const rawValue = getByPath(row, cond.field);
  const cell = normalizeCellValue(rawValue, cond.type);
  const fn = FILTER_OPERATORS[cond.type]?.[cond.operator];

  if (!fn) return true;

  // operators using `value`
  if ("value" in cond && cond.value !== undefined) {
    return fn(cell, [cond.value]);
  }

  // operators using `values`
  if (Array.isArray(cond.values)) {
    return fn(cell, cond.values);
  }

  // empty / not_empty
  return fn(cell, []);
}

export function runAdvancedFilter(row, filter) {
  if (!filter?.groups?.length) return true;

  return filter.groups.every((group, gi) => {
    let groupResult = null;

    for (let ci = 0; ci < group.conditions.length; ci++) {
      const cond = group.conditions[ci];
      const res = runCondition(row, cond);

      if (groupResult === null) {
        groupResult = res;
      } else {
        const logic = cond.logic ?? "AND";
        groupResult = logic === "OR" ? groupResult || res : groupResult && res;
      }
    }

    return groupResult ?? true;
  });
}
