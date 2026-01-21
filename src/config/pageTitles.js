// src/config/pageTitles.js
export const PAGE_TITLES = [
  { match: /^\/$/, title: "DASHBOARD" },
  { match: /^\/clients$/, title: "CLIENTS" },
  // 👇 LIST LAST
  { match: /^\/clients\/segments\/[^/]+(\/.*)?$/, title: "SEGMENTS DETAILS" },
  { match: /^\/clients\/segments(\/.*)?$/, title: "SEGMENTS" },
  // 👇 EDIT FIRST
  { match: /^\/clients\/[^/]+\/edit$/, title: "EDIT CLIENT" },

  // 👇 DETAILS SECOND
  { match: /^\/clients\/[^/]+$/, title: "CLIENT DETAILS" },

  {
    match: /^\/sms-templates\/[^/]+(\/.*)?$/,
    title: "EDIT TEMPLATES",
  },
  { match: /^\/sms-templates$/, title: "SMS TEMPLATES" },
  { match: /^\/sms-history$/, title: "SMS HISTORY" },
  {
    match: /^\/sms-campaigns\/[^/]+(\/.*)?$/,
    title: "CAMPAIGN DETAILS",
  },
  { match: /^\/sms-campaigns$/, title: "SMS CAMPAIGNS" },
  { match: /^\/sms-campaigns\/campaignid(\/.*)?$/, title: "CAMPAIGNS" },
];
