import { highlightMatch } from "../utils/highlightMatch";

export const clientColumns = (quickSearch = "") => [
  {
    key: "firstName",
    label: "First name",
    sortable: true,
    filterable: true,
    render: (u) => highlightMatch(u.firstName, quickSearch),
  },
  {
    key: "lastName",
    label: "Last name",
    sortable: true,
    filterable: true,
    render: (u) => highlightMatch(u.lastName, quickSearch),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    filterable: true,
    render: (u) => highlightMatch(u.email, quickSearch),
  },
  {
    key: "phone",
    label: "Phone",
    sortable: true,
    filterable: true,
    render: (u) => highlightMatch(u.phone, quickSearch),
  },
  {
    key: "city",
    label: "City",
    sortable: true,
    filterable: true,
    render: (u) => highlightMatch(u.city, quickSearch),
  },
  {
    key: "brands",
    label: "Brands",
    sortable: true,
    filterable: true,
    render: (u) => highlightMatch(u.brands, quickSearch),
  },
];
