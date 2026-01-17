import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminUserById, updateAdminUser } from "../api/adminUserService";
import PhonePrefixSelect from "../components/editClientComponents/PhonePrefixSelect";
/* ---------- Small UI helpers ---------- */

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function DiffRow({ label, oldValue, newValue }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-sm py-2 border-b last:border-b-0">
      <span className="font-medium">{label}</span>
      <span className="text-red-600 line-through break-all">
        {String(oldValue)}
      </span>
      <span className="text-green-600 break-all">{String(newValue)}</span>
    </div>
  );
}

/* ---------- Main component ---------- */

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const ALL_BRANDS = [
    "Terranova",
    "English Home",
    "KIABI",
    "Enza Home",
    "Penti",
    "OVS",
    "Matalan",
    "Principe",
  ];

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminUserById(id);
        const u = data.user || data;
        setUser(u);
        setOriginalUser(JSON.parse(JSON.stringify(u))); // deep copy
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [id]);

  /* ---------- State helpers ---------- */

  const handleChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const toggleBrand = (brand) => {
    setUser((prev) => {
      const exists = prev.brands.includes(brand);
      return {
        ...prev,
        brands: exists
          ? prev.brands.filter((b) => b !== brand)
          : [...prev.brands, brand],
      };
    });
  };


  const handleCheckboxChange = (channel) => {
    setUser((prev) => ({
      ...prev,
      promoChannels: {
        ...prev.promoChannels,
        [channel]: {
          ...prev.promoChannels[channel],
          enabled: !prev.promoChannels[channel].enabled,
        },
      },
    }));
  };
  const handlePhoneChange = (number) => {
    setUser((prev) => {
      const prefix = prev.phone.prefix;

      return {
        ...prev,
        phone: {
          ...prev.phone,
          number,
          full: `${prefix.replace("+", "")}${number}`,
        },
      };
    });
  };

  const handlePrefixChange = (prefix) => {
    setUser((prev) => ({
      ...prev,
      phone: {
        ...prev.phone,
        prefix,
        full: `${prefix.replace("+", "")}${prev.phone.number}`,
      },
    }));
  };
  /* ---------- Diff calculation ---------- */

  const changes = useMemo(() => {
    if (!originalUser || !user) return [];

    const diffs = [];

    const simpleFields = [
      "firstName",
      "lastName",
      "email",
      "country",
      "city",
      "dateOfBirth",
    ];

    simpleFields.forEach((f) => {
      if (originalUser[f] !== user[f]) {
        diffs.push({
          label: f,
          oldValue: originalUser[f],
          newValue: user[f],
        });
      }
    });

    if (originalUser.phone?.full !== user.phone?.full) {
      diffs.push({
        label: "Phone",
        oldValue: originalUser.phone?.full,
        newValue: user.phone?.full,
      });
    }

    if (JSON.stringify(originalUser.brands) !== JSON.stringify(user.brands)) {
      diffs.push({
        label: "Brands",
        oldValue: originalUser.brands.join(", "),
        newValue: user.brands.join(", "),
      });
    }

    ["sms", "email"].forEach((c) => {
      if (
        originalUser.promoChannels[c].enabled !== user.promoChannels[c].enabled
      ) {
        diffs.push({
          label: `${c.toUpperCase()} Promotions`,
          oldValue: originalUser.promoChannels[c].enabled
            ? "Enabled"
            : "Disabled",
          newValue: user.promoChannels[c].enabled ? "Enabled" : "Disabled",
        });
      }
    });

    if (originalUser.terms.accepted !== user.terms.accepted) {
      diffs.push({
        label: "Terms Accepted",
        oldValue: originalUser.terms.accepted ? "Yes" : "No",
        newValue: user.terms.accepted ? "Yes" : "No",
      });
    }

    return diffs;
  }, [originalUser, user]);

  /* ---------- Save ---------- */

  const confirmSave = async () => {
    setSaving(true);
    setError("");

    try {
      const req = await updateAdminUser(id, user);
      if (req.success) {
        navigate(`/clients/${id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  if (!user) return <p className="text-gray-500">Loading…</p>;

  /* ---------- Render ---------- */

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Edit User</h1>
          <p className="text-sm text-gray-500">
            Update personal info and permissions
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          ← Back
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-2xl bg-white/80 backdrop-blur-xl border p-8 shadow-sm">
        {/* LEFT */}
        <div className="space-y-4">
          {[
            ["First Name", "firstName"],
            ["Last Name", "lastName"],
            ["Email", "email"],
            ["Country", "country"],
            ["City", "city"],
          ].map(([label, field]) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-sm font-medium">{label}</label>
              <input
                className="rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20"
                value={user[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center"> 
              <label className="text-sm font-medium">Mobile</label>
              <p className="text-xs text-gray-500">
                Full number: +{user.phone.full}
              </p>
            </div>
            <div className="flex gap-3">
              <PhonePrefixSelect
                value={user.phone.prefix}
                onChange={handlePrefixChange}
              />

              <input
                type="text"
                inputMode="numeric"
                className="flex-1 rounded-lg border px-4 py-2.5 text-sm
        focus:ring-2 focus:ring-blue-500/20"
                placeholder="Phone number"
                value={user.phone.number}
                onChange={(e) =>
                  handlePhoneChange(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>SMS Promotions</span>
              <Toggle
                checked={user.promoChannels.sms.enabled}
                onChange={() => handleCheckboxChange("sms")}
              />
            </div>
            <div className="flex justify-between items-center">
              <span>Email Promotions</span>
              <Toggle
                checked={user.promoChannels.email.enabled}
                onChange={() => handleCheckboxChange("email")}
              />
            </div>
          </div>

          <div>
            <p className="font-medium mb-3">Brands</p>
            <div className="flex flex-wrap gap-2">
              {ALL_BRANDS.map((b) => {
                const active = user.brands.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className={`px-4 py-1.5 rounded-full text-sm ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          disabled={!changes.length}
          onClick={() => setShowConfirm(true)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40"
        >
          Save Changes
        </button>
      </div>

      {/* ---------- Confirmation Modal ---------- */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-semibold">Confirm changes</h3>

            {changes.length === 0 ? (
              <p className="text-sm text-gray-500">No changes detected.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {changes.map((c) => (
                  <DiffRow key={c.label} {...c} />
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {saving ? "Saving…" : "Confirm Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
