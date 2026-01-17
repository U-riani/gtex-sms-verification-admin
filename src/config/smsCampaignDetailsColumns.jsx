// src/config/smsCampaignDetailsColumns.js

export const smsCampaignDetailsColumns = () => [
  {
    key: "user",
    label: "User",
    sortable: true,
    filterable: true,

    render: (h) =>
      `${h.userId?.firstName ?? ""} ${h.userId?.lastName ?? ""}`.trim() || "—",
  },
  {
    key: "phone",
    label: "Phone",
    sortable: true,
    filterable: true,

    render: (h) => h.phone || "—",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,

    render: (h) => (
      <span
        className={
          h.status === "sent"
            ? "text-green-600 font-medium"
            : "text-red-600 font-medium"
        }
      >
        {h.status}
      </span>
    ),
  },
  {
    key: "error",
    label: "Error",
    sortable: false,
    filterable: true,

    render: (h) => h.error || "—",
  },
  {
    key: "createdAt",
    label: "Sent at",
    sortable: true,
    filterable: true,
    render: (h) => (h.createdAt ? new Date(h.createdAt).toLocaleString() : "—"),
  },
];
