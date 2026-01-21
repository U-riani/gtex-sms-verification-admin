// src/pages/SmsTemplateEdit.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSmsTemplateById,
  updateSmsTemplate,
  deleteSmsTemplate,
} from "../api/adminSmsTemplateService";
import { SMS_BRANDS } from "../data/brands";

export default function SmsTemplateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["sms-template", id],
    queryFn: () => getSmsTemplateById(id),
  });

  const template = data?.template;

  const [name, setName] = useState(template?.name ?? "");
  const [brand, setBrand] = useState(template?.brand ?? "");
  const [content, setContent] = useState(template?.content ?? "");
  const [error, setError] = useState("");

  const [showDeletePopUp, setShowDeletePopUp] = useState(false);

  // sync when data arrives

  useEffect(() => {
    if (!template) return;

    setName(template.name);
    setBrand(template.brand);
    setContent(template.content);
  }, [template]);

  const save = async () => {
    if (!name || !brand || !content) {
      setError("All fields are required");
      return;
    }

    await updateSmsTemplate(id, {
      name,
      brand,
      content,
    });

    queryClient.invalidateQueries(["sms-templates"]);
    navigate("/sms-templates");
  };

  if (isLoading) {
    return <div className="p-6">Loading…</div>;
  }

  const handleDelete = async () => {
    await deleteSmsTemplate(id);
    queryClient.invalidateQueries(["sms-templates"]);
    navigate("/sms-templates");
  };

  return (
    <div className="relative max-w-3xl mx-auto px-6 space-y-6">
      {showDeletePopUp && (
        <div className="absolute w-full h-full inset-0 flex items-center justify-center bg-slate-900/70 rounded-lg z-5">
          <div className="bg-white p-5 rounded-lg w-[420px]">
            <h4 className="mb-5">
              Are you sure you want to delete template{" "}
              <span className="font-bold">{template?.name}</span>?
            </h4>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-3 py-1 rounded cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeletePopUp(false)}
                className="bg-gray-300 px-3 py-1 rounded cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-semibold">Edit SMS Template</h1>

      <div className="rounded-xl bg-white p-6 space-y-4 shadow">
        <div>
          <label className="text-sm font-medium">Template name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Brand</label>
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">Select brand</option>
            {SMS_BRANDS.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Content</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded border px-3 py-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between">
          <div>
            <button
              onClick={() => setShowDeletePopUp(true)}
              className="px-4 py-2 rounded bg-red-600/60 text-white cursor-pointer"
            >
              Delete
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="px-4 py-2 rounded bg-blue-600 text-white cursor-pointer"
            >
              Save
            </button>
          </div>{" "}
        </div>
      </div>
    </div>
  );
}
