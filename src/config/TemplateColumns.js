import { highlightMatch } from "../utils/highlightMatch";

export const templateColumns = ({ highlight } = {}) => [
  {
    key: "name",
    label: "Name",
    sortable: true,
    filterable: true,
    render: (u) => (highlight ? highlightMatch(u.name, highlight) : u.name),
  },
  {
    key: "brand",
    label: "Brand",
    sortable: true,
    filterable: true,
    render: (u) => (highlight ? highlightMatch(u.brand, highlight) : u.brand),
  },
  {
    key: "content",
    label: "Content",
    sortable: true,
    filterable: true,
    render: (u) => (highlight ? highlightMatch(u.content, highlight) : u.content),
  },
];
