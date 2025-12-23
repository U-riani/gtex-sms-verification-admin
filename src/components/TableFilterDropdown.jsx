import { createPortal } from "react-dom";
import { useMemo, useState, useEffect } from "react";

export default function TableFilterDropdown({
  columnKey,
  data,
  value,
  onChange,
  onClose,
  position, // { top, left }
}) {
  const [search, setSearch] = useState(value?.search || "");
  const [selected, setSelected] = useState([]);

  const uniqueValues = useMemo(
    () => [...new Set(data.map((r) => String(r[columnKey] ?? "")))],
    [data, columnKey]
  );

  const visibleValues = useMemo(() => {
    if (!search) return uniqueValues;
    return uniqueValues.filter((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    );
  }, [uniqueValues, search]);

  useEffect(() => {
    setSelected(value?.values ?? uniqueValues);
  }, [value, uniqueValues]);

  const allSelected =
    visibleValues.length > 0 &&
    visibleValues.every((v) => selected.includes(v));

  const toggleAll = () => {
    setSelected((prev) =>
      allSelected
        ? prev.filter((v) => !visibleValues.includes(v))
        : [...new Set([...prev, ...visibleValues])]
    );
  };

  const apply = () => {
    onChange({ search, values: selected });
    onClose();
  };

  return createPortal(
    <div
      style={{ top: position.top, left: position.left }}
      className="fixed z-50 w-56 bg-slate-800 border border-slate-600 rounded shadow-lg p-2 text-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="w-full mb-2 px-2 py-1 rounded bg-slate-700 text-white"
      />

      <label className="flex items-center gap-2 mb-2 border-b border-slate-600 pb-1">
        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
        <span className="font-semibold">Select All</span>
      </label>

      <div className="max-h-40 overflow-auto space-y-1">
        {visibleValues.map((v) => (
          <label key={v} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(v)}
              onChange={() =>
                setSelected((p) =>
                  p.includes(v) ? p.filter((x) => x !== v) : [...p, v]
                )
              }
            />
            <span>{v || "(empty)"}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onClose} className="text-xs text-gray-300">
          Cancel
        </button>
        <button onClick={apply} className="text-xs bg-blue-600 px-2 py-1 rounded">
          Apply
        </button>
      </div>
    </div>,
    document.getElementById("portal-root")
  );
}
