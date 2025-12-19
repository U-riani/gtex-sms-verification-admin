import { useState } from "react";
import { sendBulkSms } from "../api/adminSmsService";
import { SMS_BRANDS } from "../data/brands";

export default function SmsModal({ userIds, onClose }) {
  const [message, setMessage] = useState("");
  const [brand, setBrand] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const submit = async () => {
    setError("");

    if (!brand) {
      setError("Please select a brand");
      return;
    }

    setSending(true);

    try {
      const res = await sendBulkSms({
        userIds: Array.from(userIds),
        message,
        brand,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">
          Send SMS ({userIds.size})
        </h3>

        <select
          className="w-full border rounded px-3 py-2"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="" disabled>
            Select brand
          </option>
          {SMS_BRANDS.map((b) => (
            <option key={b.key} value={b.key}>
              {b.label}
            </option>
          ))}
        </select>

        <textarea
          rows={5}
          className="w-full border rounded px-3 py-2"
          placeholder="Type your SMS message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {result && (
          <div className="text-sm bg-gray-100 rounded p-3">
            <p>Sent: {result.sent}</p>
            <p>Failed: {result.failed}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Close
          </button>

          <button
            disabled={sending || message.trim().length < 2}
            onClick={submit}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
