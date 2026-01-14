import { highlightMatch } from "../utils/highlightMatch";

export const clientColumns = ({ highlight } = {}) => [
  {
    key: "firstName",
    label: "First name",
    sortable: true,
    filterable: true,
    render: (u) =>
      highlight ? highlightMatch(u.lastName, highlight) : u.lastName,
  },
  {
    key: "lastName",
    label: "Last name",
    sortable: true,
    filterable: true,
    render: (u) =>
      highlight ? highlightMatch(u.lastName, highlight) : u.lastName,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    filterable: true,
    render: (u) => (highlight ? highlightMatch(u.email, highlight) : u.email),
  },
  {
    key: "phone",
    label: "Phone",
    sortable: true,
    filterable: true,
    render: (u) => (highlight ? highlightMatch(u.phone.full, highlight) : u.phone.full),
  },
  {
    key: "dateOfBirth",
    label: "Birthdate",
    sortable: true,
    filterable: true,
    render: (u) => (highlight ? highlightMatch(u.dateOfBirth, highlight) : u.dateOfBirth),
  },
  {
    key: "city",
    label: "City",
    sortable: true,
    filterable: true,
    render: (u) => (highlight ? highlightMatch(u.city, highlight) : u.city),
  },
  {
    key: "country",
    label: "Country",
    sortable: true,
    filterable: true,
    render: (u) => (highlight ? highlightMatch(u.country, highlight) : u.country),
  },
  {
    key: "brands",
    label: "Brands",
    sortable: true,
    filterable: true,
    render: (u) => (highlight ? highlightMatch(u.brands, highlight) : u.brands),
  },
];
