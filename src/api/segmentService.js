// api/segmentService,js
import { adminFetch } from "./adminClient";

export const getSegments = () => adminFetch("/admin/segments");

export const createSegment = ({ name, userIds }) =>
  adminFetch("/admin/segments", {
    method: "POST",
    body: JSON.stringify({ name, userIds }),
  });

export const addUsersToSegment = ({ segmentId, userIds }) =>
  adminFetch(`/admin/segments/${segmentId}/users`, {
    method: "POST",
    body: JSON.stringify({ userIds }),
  });

export const deleteSegment = (id) =>
  adminFetch(`/admin/segments/${id}`, {
    method: "DELETE",
  });
/**
 * Get users of a segment (paginated)
 */
export const getSegmentUsers = ({ segmentId, page = 1, limit = 20 }) =>
  adminFetch(`/admin/segments/${segmentId}/users?page=${page}&limit=${limit}`);

/**
 * Remove single user from segment
 */
export const removeUserFromSegment = ({ segmentId, userId }) =>
  adminFetch(`/admin/segments/${segmentId}/users/${userId}`, {
    method: "DELETE",
  });

export const undoRemoveUserFromSegment = ({ deleteToken }) =>
  adminFetch(`/admin/segments/undo`, {
    method: "POST",
    body: JSON.stringify({ deleteToken }),
  });
