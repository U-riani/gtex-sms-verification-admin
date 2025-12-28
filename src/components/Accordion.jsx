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
            <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-700 transition">
              <div className="flex-1">
                {item.header}
              </div>

              <button
                onClick={() => setOpenId(open ? null : item.id)}
                className="ml-3 text-gray-300 hover:text-white transition"
              >
                <span
                  className={`transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
            </div>

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


// {advancedFilter?.groups?.flatMap((group, gi) => {
//         const tokens = [];

//         // (
//         tokens.push(
//           <span
//             key={`open-${group.id}`}
//             className="text-purple-300 font-mono font-bold"
//           >
//             [{" "}
//           </span>
//         );

//         group.conditions.forEach((cond, ci) => {
//           tokens.push(
//             <Chip
//               key={cond.id}
//               color="purple"
//               label={`${cond.field} ${cond.operator} ${truncate(
//                 cond.value,
//                 10
//               )}`}
//               title={`${cond.field} ${cond.operator} ${cond.value}`}
//               onRemove={() => onRemoveAdvancedCondition(gi, ci)}
//               onEdit={() => onEditAdvancedFilter(gi, ci)}
//             />
//           );

//           if (ci < group.conditions.length - 1) {
//             tokens.push(
//               <span
//                 key={`cond-logic-${cond.id}`}
//                 className="text-purple-300 text-xs font-semibold"
//               >
//                 {cond.logic || "AND"}
//               </span>
//             );
//           }
//         });

//         // )
//         tokens.push(
//           <span
//             key={`close-${group.id}`}
//             className="text-purple-300 font-mono font-bold"
//           >
//             ]
//           </span>
//         );

//         // group logic (AND / OR) between groups
//         if (gi < advancedFilter.groups.length - 1) {
//           tokens.push(
//             <span
//               key={`group-logic-${group.id}`}
//               className="text-pink-400 text-xs font-bold"
//             >
//               {group.logic}
//             </span>
//           );
//         }

//         return tokens;
//       })}


// function Chip({ label, onRemove, onEdit, color, title }) {
//   const colors = {
//     blue: "bg-blue-700",
//     purple: "bg-purple-700",
//     green: "bg-green-700",
//     red: "bg-red-700",
//   };

//   return (
//     <span
//       title={title}
//       className={`inline-flex items-center gap-2 text-white text-sm px-3 py-1 rounded ${colors[color]}`}
//     >
//       <span>{label}</span>

//       {onEdit && (
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onEdit();
//           }}
//           className="text-xs opacity-80 hover:opacity-100"
//           title="Edit"
//         >
//           ✎
//         </button>
//       )}

//       <button
//         onClick={onRemove}
//         className="font-bold hover:opacity-70"
//         title="Remove"
//       >
//         ✕
//       </button>
//     </span>
//   );
// }
