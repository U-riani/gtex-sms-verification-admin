// src/config/userAdvancedFIlterFields.js
export const USER_ADVANCED_FILTER_FIELDS = [
  {
    key: "firstName",
    label: "First name",
    type: "text",
    operators: ["contains", "not_contains", "equals", "not_equals"],
  },
  {
    key: "lastName",
    label: "Last name",
    type: "text",
    operators: ["contains", "not_contains", "equals", "not_equals"],
  },
  {
    key: "email",
    label: "Email",
    type: "text",
    operators: ["contains", "equals"],
  },
  {
    key: "phone.full",
    label: "Phone",
    type: "text",
    operators: ["contains", "equals"],
  },
  {
    key: "city",
    label: "City",
    type: "text",
    operators: ["contains", "equals"],
  },
  {
    key: "brands",
    label: "Brands",
    type: "enum", // ✅ WAS "array"
    operators: ["in", "not_in"],
    dynamicOptions: true,
  },
  {
    key: "promoChannels.sms.enabled",
    label: "SMS enabled",
    type: "boolean",
    operators: ["equals"], // true / false
  },
  {
    key: "promoChannels.email.enabled",
    label: "Email enabled",
    type: "boolean",
    operators: ["equals"],
  },
];

