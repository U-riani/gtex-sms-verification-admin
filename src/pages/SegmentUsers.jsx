import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useClientSelectionStore } from "../store/clientSelectionStore";
import { useUndoStore } from "../store/undoStore";

import Table from "../components/Table";
import Pagination from "../components/Pagination";
import { clientColumns } from "../config/clientColumns";
import {
  getSegmentUsers,
  removeUserFromSegment,
  addUsersToSegment,
  getSegments,
  undoRemoveUserFromSegment,
} from "../api/segmentService";
import { highlightMatch } from "../utils/highlightMatch";

export default function SegmentUsers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [action, setAction] = useState(null); // copy | move | remove
  const [targetSegmentId, setTargetSegmentId] = useState("");
  const [localBusy, setLocalBusy] = useState(false);

  const selectedIds = useClientSelectionStore((s) => s.selectedIds);
  const setSelectedIds = useClientSelectionStore((s) => s.setSelectedIds);
  const toggleRow = useClientSelectionStore((s) => s.toggleId);
  const clearSelection = useClientSelectionStore((s) => s.clear);
  const showUndo = useUndoStore((s) => s.showUndo);
  const columns = useMemo(
    () =>
      clientColumns({
        highlight: search,
      }),
    [search]
  );

  // ---------------------------
  // DATA
  // ---------------------------
  const { data, isLoading } = useQuery({
    queryKey: ["segment-users", id, page],
    queryFn: () =>
      getSegmentUsers({
        segmentId: id,
        page,
        limit: 20,
      }),
    keepPreviousData: true,
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["segments"],
    queryFn: getSegments,
  });

  useEffect(() => {
    console.log(">>> id", id, "page:", page);
    console.log("--data", data);
  }, [data]);
  const users = data?.users ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  // ---------------------------
  // SEARCH
  // ---------------------------
  const searchableKeys = ["firstName", "lastName", "email", "phone"];

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    const q = search.toLowerCase();
    return users.filter((u) =>
      searchableKeys.some((key) =>
        String(u[key] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [users, search]);

  useEffect(() => {
    clearSelection();
    setPage(1);
    setAction(null);
    setTargetSegmentId("");
  }, [id]);

  // ---------------------------
  // MUTATIONS
  // ---------------------------
  // const removeMut = useMutation({
  //   mutationFn: ({ userId }) =>
  //     removeUserFromSegment({ segmentId: id, userId }),

  //   onMutate: async ({ userId }) => {
  //     await qc.cancelQueries(["segment-users", id, page]);

  //     const prev = qc.getQueryData(["segment-users", id, page]);

  //     qc.setQueryData(["segment-users", id, page], (old) => {
  //       if (!old) return old;

  //       return {
  //         ...old,
  //         users: old.users.filter((u) => u._id !== userId),
  //         total: old.total - 1,
  //       };
  //     });

  //     return { prev };
  //   },

  //   onError: (_err, _vars, ctx) => {
  //     if (ctx?.prev) {
  //       qc.setQueryData(["segment-users", id, page], ctx.prev);
  //     }
  //   },

  //   onSettled: () => {
  //     qc.invalidateQueries(["segment-users", id]);
  //   },
  // });

  const addMut = useMutation({
    mutationFn: addUsersToSegment,
  });

  // ---------------------------
  // ACTION HANDLERS
  // ---------------------------
  // const removeMany = async (userIds) => {
  //   // 🔥 optimistic UI first
  //   qc.setQueryData(["segment-users", id, page], (old) => {
  //     if (!old) return old;

  //     return {
  //       ...old,
  //       users: old.users.filter((u) => !userIds.includes(u._id)),
  //       total: old.total - userIds.length,
  //     };
  //   });

  //   // fire-and-forget backend
  //   await Promise.all(
  //     userIds.map((uid) =>
  //       removeUserFromSegment({ segmentId: id, userId: uid })
  //     )
  //   );
  // };
  const bulkRemoveWithUndo = async (userIds) => {
    setLocalBusy(true);

    const prevData = qc.getQueryData(["segment-users", id, page]);

    qc.setQueryData(["segment-users", id, page], (old) => ({
      ...old,
      users: old.users.filter((u) => !userIds.includes(u._id)),
      total: old.total - userIds.length,
    }));

    const responses = await Promise.all(
      userIds.map((uid) =>
        removeUserFromSegment({ segmentId: id, userId: uid })
      )
    );

    const tokens = responses.map((r) => r.deleteToken);

    showUndo({
      message: `${tokens.length} users removed`,
      undo: async () => {
        await Promise.all(
          tokens.map((t) => undoRemoveUserFromSegment({ deleteToken: t }))
        );
        qc.invalidateQueries(["segment-users", id]);
        qc.invalidateQueries(["segments"]);
      },
    });

    clearSelection();
    setLocalBusy(false);
  };

  const removeOneWithUndo = async (row) => {
    // optimistic UI
    const prev = qc.getQueryData(["segment-users", id, page]);

    qc.setQueryData(["segment-users", id, page], (old) => ({
      ...old,
      users: old.users.filter((u) => u._id !== row._id),
      total: old.total - 1,
    }));

    try {
      const res = await removeUserFromSegment({
        segmentId: id,
        userId: row._id,
      });

      showUndo({
        message: "User removed",
        undo: async () => {
          await undoRemoveUserFromSegment({ deleteToken: res.deleteToken });
          qc.invalidateQueries(["segment-users", id]);
          qc.invalidateQueries(["segments"]);
        },
      });

      // ✅ NOW it's safe
      qc.invalidateQueries(["segments"]);
    } catch (err) {
      // rollback on failure
      qc.setQueryData(["segment-users", id, page], prev);
    }
  };

  const isBusy = localBusy || addMut.isLoading;

  const submitAction = async () => {
    const userIds = Array.from(selectedIds);
    if (!userIds.length) return;

    // COPY / MOVE
    if (action === "copy" || action === "move") {
      if (!targetSegmentId) return;

      await addMut.mutateAsync({
        segmentId: targetSegmentId,
        userIds,
      });

      qc.invalidateQueries(["segments"]);

      if (action === "move") {
        // optimistic remove from current segment
        qc.setQueryData(["segment-users", id, page], (old) => {
          if (!old) return old;

          return {
            ...old,
            users: old.users.filter((u) => !userIds.includes(u._id)),
            total: old.total - userIds.length,
          };
        });

        // backend cleanup
        await Promise.all(
          userIds.map((uid) =>
            removeUserFromSegment({ segmentId: id, userId: uid })
          )
        );
        qc.invalidateQueries(["segments"]);
      }
    }

    // REMOVE
    if (action === "remove") {
      if (userIds.length > 10) {
        const ok = window.prompt(
          `Type REMOVE to confirm deleting ${userIds.length} users`
        );
        if (ok !== "REMOVE") return;
      }

      bulkRemoveWithUndo(userIds);
    }

    clearSelection();
    setAction(null);
    setTargetSegmentId("");
  };

  // ---------------------------
  // UI HELPERS
  // ---------------------------
  const actionBtn = (type, color, label) => {
    const active = action === type;

    return (
      <button
        disabled={isBusy}
        onClick={() => setAction(active ? null : type)}
        className={`
          px-3 py-1 rounded text-sm transition text-white
          ${
            active
              ? `${color} ring-2 ring-white/30`
              : `${color}/70 hover:${color}`
          }
          disabled:opacity-40
        `}
      >
        {label}
      </button>
    );
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Segment users</h2>

        <button
          onClick={() => navigate("/clients/segments")}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to segments
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search in segment…"
        className="w-full bg-slate-700 text-white px-3 py-2 rounded"
      />

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800 border border-slate-600 rounded px-4 py-2">
          <span className="text-sm text-gray-200">
            {selectedIds.size} users selected
          </span>

          <div className="flex gap-2">
            {actionBtn("copy", "bg-blue-600", "Copy")}
            {actionBtn("move", "bg-orange-600", "Move")}
            {actionBtn("remove", "bg-red-600", "Remove")}
          </div>
        </div>
      )}

      {action && (
        <div className="bg-slate-800 border border-slate-700 rounded p-3 space-y-2">
          <div className="text-sm text-gray-300">
            {action === "copy" && "Copy users to another segment."}
            {action === "move" &&
              "Move users to another segment (removed here)."}
            {action === "remove" && "Remove users from this segment."}
          </div>

          {action !== "remove" && (
            <select
              value={targetSegmentId}
              onChange={(e) => setTargetSegmentId(e.target.value)}
              className="w-full bg-slate-700 text-white p-2 rounded"
            >
              <option value="">Select target segment</option>
              {segments
                .filter((s) => s._id !== id)
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setAction(null);
                setTargetSegmentId("");
              }}
              className="text-gray-400 hover:text-white text-sm"
            >
              Cancel
            </button>

            <button
              disabled={isBusy || (action !== "remove" && !targetSegmentId)}
              onClick={submitAction}
              className={`
                px-3 py-1 rounded text-sm text-white
                ${action === "remove" ? "bg-red-600" : "bg-green-600"}
                disabled:opacity-40
              `}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      <Table
        loading={isLoading}
        columns={columns}
        data={filteredUsers}
        selectable
        selectedIds={selectedIds}
        onToggleRow={toggleRow}
        onSetSelectedIds={setSelectedIds}
        filters={filters}
        onFilterChange={(key, payload) =>
          setFilters((prev) => ({ ...prev, [key]: payload }))
        }
        rowActions={(row) => (
          <button
            disabled={isBusy}
            onClick={() => removeOneWithUndo(row)}
            className="text-red-400 hover:text-red-300 disabled:opacity-40"
          >
            Remove
          </button>
        )}
      />

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <div className="text-xs text-gray-400">
        Bulk actions apply to selected users only.
      </div>
    </div>
  );
}
