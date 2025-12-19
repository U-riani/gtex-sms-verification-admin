import { useEffect, useState } from "react";
import {
  getSmsTemplates,
  createSmsTemplate,
  deleteSmsTemplate,
} from "../api/adminSmsTemplateService";
import { SMS_BRANDS } from "../data/brands";

export default function SmsTemplates() {
  const [brand, setBrand] = useState("");
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!brand) return;
    getSmsTemplates(brand).then((res) => setTemplates(res.templates));
  }, [brand]);

  const create = async () => {
    if (!brand || !name || !content) {
      setError("All fields required");
      return;
    }

    await createSmsTemplate({ brand, name, content });
    setName("");
    setContent("");
    setError("");

    const res = await getSmsTemplates(brand);
    setTemplates(res.templates);
  };

  const remove = async (id) => {
    await deleteSmsTemplate(id);
    setTemplates((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">SMS Templates</h2>

      <select
        className="border px-3 py-2 rounded w-64"
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

      {brand && (
        <div className="bg-white p-4 rounded shadow space-y-3">
          <input
            className="border px-3 py-2 rounded w-full"
            placeholder="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="border px-3 py-2 rounded w-full"
            rows={4}
            placeholder="Template content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <p className="text-xs text-gray-500">
            Variables: {"{firstName}"} {"{lastName}"} {"{brand}"}
          </p>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={create}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Template
          </button>
        </div>
      )}

      {templates.length > 0 && (
        <div className="bg-white rounded shadow divide-y">
          {templates.map((t) => (
            <div
              key={t._id}
              className="p-4 flex justify-between items-start"
            >
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {t.content}
                </p>
              </div>

              <button
                onClick={() => remove(t._id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
