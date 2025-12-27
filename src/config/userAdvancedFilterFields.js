export const USER_ADVANCED_FILTER_FIELDS = [
  {
    key: "firstName",
    label: "First name",
    type: "text",
    operators: ["contains", "not_contains", "eq", "neq"],
  },
  {
    key: "lastName",
    label: "Last name",
    type: "text",
    operators: ["contains", "not_contains", "eq", "neq"],
  },
  {
    key: "email",
    label: "Email",
    type: "text",
    operators: ["contains", "eq"],
  },
  {
    key: "phone",
    label: "Phone",
    type: "text",
    operators: ["contains", "eq"],
  },
  {
    key: "city",
    label: "City",
    type: "text",
    operators: ["contains", "eq"],
  },
  {
    key: "brands",
    label: "Brands",
    type: "array",
    operators: ["contains", "not_contains", "in", "not_in"],
    dynamicOptions: true,
  },
  {
    key: "promoChannels.sms.enabled",
    label: "SMS enabled",
    type: "boolean",
    operators: ["is_true", "is_false"],
  },
  {
    key: "promoChannels.email.enabled",
    label: "Email enabled",
    type: "boolean",
    operators: ["is_true", "is_false"],
  },
];
