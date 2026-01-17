// src/api/adminSmsCampaignService.js
import { adminFetch } from "./adminClient";

/**
 * Start new SMS campaign
 */
export function startSmsCampaign(payload) {
  return adminFetch("/admin/sms/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * List recent campaigns
 */
export function getSmsCampaigns() {
  return adminFetch("/admin/sms/campaigns");
}

/**
 * Get single campaign + history
 */
export function getSmsCampaignDetails(id) {
  return adminFetch(`/admin/sms/campaigns/${id}`);
}
