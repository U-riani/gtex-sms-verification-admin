import { useState, useMemo, useEffect } from "react";

export default function AdvancedFilterBar({ filters, onChange, fields }) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (!input) return [];
    return fields.filter(
      (f) =>
        f.key.toLowerCase().includes(input.toLowerCase()) && !filters[f.key]
    );
  }, [input, fields, filters]);

  const addFilter = (key) => {
    onChange({
      ...filters,
      [key]:
        fields.find((f) => f.key === key)?.type === "boolean"
          ? { type: "enum", values: [] }
          : { type: "text", value: "" },
    });

    setInput("");
    setOpen(false);
  };

  const removeFilter = (key) => {
    const next = { ...filters };
    delete next[key];
    onChange(next);
  };

  const truncate = (v, len = 6) =>
    String(v).length > len ? String(v).slice(0, len) + "…" : String(v);

  const formatValue = (f) => {
    if (f.type === "enum") {
      if (f.values.length === 0) return "any";

      const truncated = f.values.map((v) => truncate(v));

      if (truncated.length <= 2) return truncated.join(", ");

      return `${truncated.slice(0, 2).join(", ")} … ${f.values.length}`;
    }

    return truncate(f.value);
  };

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="bg-slate-700 rounded p-3 space-y-2">
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          placeholder="Add filter…"
          className="w-full px-3 py-2 rounded bg-slate-800 text-white"
        />

        {open && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-600 rounded shadow">
            {suggestions.map((f) => (
              <button
                key={f.key}
                onClick={() => addFilter(f.key)}
                className="block w-full text-left px-3 py-2 hover:bg-slate-600"
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, f]) => (
          <div
            key={key}
            className="flex items-center gap-2 bg-blue-600 text-white px-2 py-1 rounded text-sm"
          >
            <span className="font-semibold">
              {fields.find((x) => x.key === key)?.label ?? key}
            </span>
            <span className="opacity-90">({formatValue(f)})</span>
            <button
              onClick={() => removeFilter(key)}
              className="hover:text-red-300"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
