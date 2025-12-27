// src/components/Accordion.jsx
import { useState } from "react";

export function Accordion({ items, defaultOpenId }) {
  const [openId, setOpenId] = useState(defaultOpenId ?? null);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const open = openId === item.id;

        return (
          <div
            key={item.id}
            className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden"
          >
            {/* HEADER */}
            <button
              onClick={() => setOpenId(open ? null : item.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-200 hover:bg-slate-700 transition"
            >
              <div className="flex items-center gap-2">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span className="font-medium">{item.title}</span>
              </div>

              <span
                className={`transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {/* CONTENT */}
            <div
              className={`transition-all duration-300 ${
                open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              } overflow-hidden`}
            >
              <div className="p-4 border-t border-slate-700">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
