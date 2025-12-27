// src/config/pageTitles.js
export const PAGE_TITLES = [
  { match: /^\/$/, title: "Dashboard" },
  { match: /^\/users$/, title: "Users" },
  { match: /^\/users\/[^/]+$/, title: "User Details" },
  { match: /^\/users\/[^/]+\/edit$/, title: "Edit User" },
  { match: /^\/sms-templates$/, title: "SMS Templates" },
  { match: /^\/sms-history$/, title: "SMS History" },
  { match: /^\/sms-campaigns$/, title: "SMS Campaigns" },
  { match: /^\/sms-template-analytics$/, title: "Template Analytics" },
];
