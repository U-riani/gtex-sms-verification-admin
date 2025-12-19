import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export default function Table({
  columns,
  data,
  onRowClick,

  // 🔽 NEW (optional)
  selectable = false,
  selectedIds = new Set(),
  onToggleRow,
  onToggleAll,
}) {
  const allSelected =
    selectable &&
    data.length > 0 &&
    data.every((row) => selectedIds.has(row._id));

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {/* ✅ CHECKBOX HEADER */}
            {selectable && (
              <th className="px-4 py-3 border-b text-center w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                />
              </th>
            )}

            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 border-b font-semibold text-gray-700 text-left uppercase text-xs tracking-wide"
              >
                {col.label}
              </th>
            ))}

            <th className="px-4 py-3 border-b font-semibold text-gray-700 uppercase text-xs tracking-wide text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {data.map((row) => (
            <tr
              key={row._id}
              className="hover:bg-gray-100 transition"
            >
              {/* ✅ CHECKBOX CELL */}
              {selectable && (
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row._id)}
                    onChange={() => onToggleRow(row._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}

              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3"
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}

              {/* ACTION BUTTONS */}
              <td className="px-4 py-3 flex justify-center gap-3 text-lg">
                <button
                  className="text-slate-600 hover:text-blue-800 cursor-pointer"
                  onClick={() => onRowClick(row)}
                  title="View"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>

                <button
                  className="text-slate-600 hover:text-blue-800 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/users/${row._id}/edit`)
                  }
                  title="Edit"
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td
                colSpan={
                  columns.length + 1 + (selectable ? 1 : 0)
                }
                className="px-4 py-6 text-center text-gray-500"
              >
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
