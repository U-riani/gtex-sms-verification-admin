import { adminFetch } from "./adminClient";

export function getSmsCampaigns() {
  return adminFetch("/admin/campaigns");
}