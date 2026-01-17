// src/config/smsHistoryCOlumns.js
import { highlightMatch } from "../utils/highlightMatch";

export const smsHistoryColumns = ({ highlight } = {}) => [
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    filterable: true,
    type: "date",
    render: (r) => new Date(r.createdAt).toLocaleString(),
  },

  {
    key: "brand",
    label: "Brand",
    sortable: true,
    filterable: true,
    render: (r) =>
      highlight
        ? highlightMatch(r.brand, highlight)
        : r.brand,
  },

  {
    key: "user",
    label: "User",
    sortable: true,
    filterable: true,
    render: (r) => {
      const name = r.userId
        ? `${r.userId.firstName ?? ""} ${r.userId.lastName ?? ""}`.trim()
        : "—";

      return highlight
        ? highlightMatch(name, highlight)
        : name;
    },
  },

  {
    key: "phone",
    label: "Phone",
    sortable: true,
    filterable: true,
    render: (r) =>
      highlight
        ? highlightMatch(r.phone, highlight)
        : r.phone,
  },

  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    type: "enum",
    render: (r) => (
      <span
        className={
          r.status === "sent"
            ? "text-green-600"
            : "text-red-600"
        }
      >
        {r.status}
      </span>
    ),
  },

  {
    key: "error",
    label: "Error",
    sortable: true,
    filterable: true,
    render: (r) =>
      r.error
        ? highlight
          ? highlightMatch(r.error, highlight)
          : r.error
        : "—",
  },
];
