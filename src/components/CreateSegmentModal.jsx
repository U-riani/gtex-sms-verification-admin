// src/components/CreateSegmentModal.jsx

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSegment } from "../api/segmentService";

export default function CreateSegmentModal({ userIds, onClose }) {
  const [name, setName] = useState("");
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () =>
      createSegment({ name, userIds: Array.from(userIds) }),
    onSuccess: () => {
      qc.invalidateQueries(["segments"]);
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-4 rounded w-96 space-y-3">
        <h3 className="text-white font-semibold">Create segment</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Segment name"
          className="w-full px-3 py-2 rounded bg-slate-700 text-white"
        />

        <p className="text-xs text-gray-400">
          {userIds.size} users will be added
        </p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-400">
            Cancel
          </button>
          <button
            disabled={!name}
            onClick={() => mut.mutate()}
            className="bg-blue-600 px-3 py-1 rounded text-white"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
