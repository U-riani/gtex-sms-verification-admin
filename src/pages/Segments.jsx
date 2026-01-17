// src/pages/Segments.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getSegments,
  createSegment,
  addUsersToSegment,
  deleteSegment,
} from "../api/segmentService.js";

import { useClientSelectionStore } from "../store/clientSelectionStore";

export default function Segments() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["segments"] });
  }, []);

  const fromSelection =
    new URLSearchParams(location.search).get("from") === "selection";

  const selectedIds = useClientSelectionStore((s) => s.selectedIds);
  const clearSelection = useClientSelectionStore((s) => s.clear);

  const [mode, setMode] = useState("existing"); // existing | new
  const [name, setName] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] = useState("");

  // ---------------------------
  // DATA
  // ---------------------------
  const { data: segments = [] } = useQuery({
    queryKey: ["segments"],
    queryFn: getSegments,
  });

  // ---------------------------
  // MUTATIONS
  // ---------------------------
  const createMut = useMutation({
    mutationFn: createSegment,
    onSuccess: () => {
      qc.invalidateQueries(["segments"]);
      clearSelection();
      navigate("/clients/segments");
    },
  });

  const addMut = useMutation({
    mutationFn: addUsersToSegment,
    onSuccess: () => {
      qc.invalidateQueries(["segments"]);
      clearSelection();
      navigate("/clients/segments");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteSegment,
    onSuccess: () => qc.invalidateQueries(["segments"]),
  });

  // ---------------------------
  // SUBMIT
  // ---------------------------
  const submit = () => {
    const userIds = Array.from(selectedIds);

    if (!userIds.length) return;

    if (mode === "new") {
      createMut.mutate({
        name,
        userIds,
      });
    } else {
      if (!selectedSegmentId) return;

      addMut.mutate({
        segmentId: selectedSegmentId,
        userIds,
      });
    }
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="p-4 space-y-4 w">
      <h2 className="text-xl font-semibold text-white">Segments</h2>

      {fromSelection && selectedIds.size > 0 && (
        <div className="bg-slate-800 p-4 rounded space-y-3">
          <div className="flex gap-4">
            <label className="flex gap-2 items-center">
              <input
                type="radio"
                checked={mode === "existing"}
                onChange={() => setMode("existing")}
              />
              Add to existing segment
            </label>

            <label className="flex gap-2 items-center">
              <input
                type="radio"
                checked={mode === "new"}
                onChange={() => setMode("new")}
              />
              Create new segment
            </label>
          </div>

          {mode === "existing" && (
            <select
              value={selectedSegmentId}
              onChange={(e) => setSelectedSegmentId(e.target.value)}
              className="w-full bg-slate-700 text-white p-2 rounded"
            >
              <option value="">Select segment</option>
              {segments.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.count})
                </option>
              ))}
            </select>
          )}

          {mode === "new" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Segment name"
              className="w-full bg-slate-700 text-white p-2 rounded"
            />
          )}

          <button
            onClick={submit}
            disabled={
              (mode === "new" && !name.trim()) ||
              (mode === "existing" && !selectedSegmentId)
            }
            className="bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      )}

      {/* SEGMENT LIST */}
      <div className="space-y-2">
        {segments.map((s) => (
          <div
            key={s._id}
            className="flex justify-between items-center bg-slate-800 p-3 rounded"
          >
            <div
              className="cursor-pointer flex-1 "
              onClick={() => navigate(`/clients/segments/${s._id}`)}
            >
              <div className="text-white">{s.name}</div>
              <div className="text-xs text-gray-400">{s.count} users</div>
            </div>
            <button
              onClick={() =>
                navigate(`/sms-campaigns?segmentId=${s._id}`)
              }
              className="px-4 py-2 rounded-lg bg-green-600 text-white"
            >
              Send SMS to segment
            </button>
            <button
              onClick={() => {
                if (!confirm(`Delete segment "${s.name}"?`)) return;
                deleteMut.mutate(s._id);
              }}
              className="text-red-400 bg-red-400/10 py-2 px-2 rounded hover:text-red-300 hover:bg-red-300/30 text-sm cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
