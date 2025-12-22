import { useEffect, useState } from "react";
import { sendBulkSms } from "../api/adminSmsService";
import { getSmsTemplates } from "../api/adminSmsTemplateService";
import { SMS_BRANDS } from "../data/brands";

export default function SmsModalCopy1({ userIds, onClose }) {
  const [brand, setBrand] = useState("");
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [channels, setChannels] = useState(["sms"]);

  useEffect(() => {
    if (!brand) return;

    getSmsTemplates(brand).then((res) => {
      setTemplates(res.templates);
    });
  }, [brand]);

  const applyTemplate = (id) => {
    const tpl = templates.find((t) => t._id === id);
    if (tpl) setMessage(tpl.content);
  };

  const submit = async () => {
    if (!brand) return setError("Select brand");
    if (message.trim().length < 2) return setError("Message too short");

    setSending(true);
    setError("");

    try {
      const res = await sendBulkSms({
        userIds: Array.from(userIds),
        brand,
        message,
        channels,
      });
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded p-6 space-y-4">
        <h3 className="text-xl font-semibold">Send SMS ({userIds.size})</h3>
        <select
          multiple
          className="w-full border px-3 py-2 rounded"
          value={channels}
          onChange={(e) =>
            setChannels([...e.target.selectedOptions].map((o) => o.value))
          }
        >
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        <select
          className="w-full border px-3 py-2 rounded"
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setTemplateId("");
            setMessage("");
          }}
        >
          <option value="">Select brand</option>
          {SMS_BRANDS.map((b) => (
            <option key={b.key} value={b.key}>
              {b.label}
            </option>
          ))}
        </select>

        {templates.length > 0 && (
          <select
            className="w-full border px-3 py-2 rounded"
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value);
              applyTemplate(e.target.value);
            }}
          >
            <option value="">Select template</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        <textarea
          rows={5}
          className="w-full border px-3 py-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message text…"
        />

        <p className="text-xs text-gray-500">
          Variables: {"{firstName}"} {"{lastName}"} {"{brand}"}
        </p>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {result && (
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p>Sent: {result.sent}</p>
            <p>Failed: {result.failed}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Close
          </button>
          <button
            onClick={submit}
            disabled={sending}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
