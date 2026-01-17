// src/config/smsCampaignColumns.js
import { highlightMatch } from "../utils/highlightMatch";

export const smsCampaignColumns = ({ highlight, onDetails } = {}) => [
  {
    key: "templateName",
    label: "Template",
    sortable: true,
    filterable: true,
    render: (c) =>
      highlight ? highlightMatch(c.templateName, highlight) : c.templateName,
  },
  {
    key: "brand",
    label: "BRAND",
    sortable: true,
    filterable: true,
    render: (c) => (highlight ? highlightMatch(c.brand, highlight) : c.brand),
  },

  {
    key: "templateContent",
    label: "Message",
    sortable: false,
    filterable: true,
    render: (c) => (
      <span title={c.templateContent}>
        {c.templateContent.slice(0, 40)}
        {c.templateContent.length > 40 && "…"}
      </span>
    ),
  },

  {
    key: "segmentName",
    label: "Segment",
    sortable: true,
    filterable: true,
    render: (c) =>
      highlight ? highlightMatch(c.segmentName, highlight) : c.segmentName,
  },

  {
    key: "segmentUsers",
    label: "Users",
    sortable: true,
    filterable: true,
    type: "number",
  },

  {
    key: "sent",
    label: "Sent",
    sortable: true,
    filterable: true,
    type: "number",
  },

  {
    key: "failed",
    label: "Failed",
    sortable: true,
    filterable: true,
    type: "number",
  },

  {
    key: "startedAt",
    label: "Started",
    sortable: true,
    filterable: true,
    type: "date",
    render: (c) => (c.startedAt ? new Date(c.startedAt).toLocaleString() : "—"),
  },
];
