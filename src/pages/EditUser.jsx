import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminUserById, updateAdminUser } from "../api/adminUserService";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
        setUser(data.user || data);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [id]);

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

  const toggleTerms = () => {
    setUser((prev) => ({
      ...prev,
      termsAccepted: !prev.termsAccepted,
    }));
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

  const saveChanges = async () => {
    setSaving(true);
    setError("");

    try {
      const req = await updateAdminUser(id, user);
      if (req.success) {
        navigate(`/users/${id}`);
      }
      console.log("User updated:", req);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <p className="text-gray-600">Loading...</p>;

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="px-3 py-1 bg-gray-200 rounded"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold">Edit User</h2>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded shadow p-6">
        {/* LEFT SIDE FIELDS */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              className="border rounded px-3 py-2 w-full"
              placeholder="First Name"
              value={user.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              className="border rounded px-3 py-2 w-full"
              placeholder="Last Name"
              value={user.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="mobile">Mobile</label>
            <input
              id="mobile"
              className="border rounded px-3 py-2 w-full"
              placeholder="Phone"
              value={user.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="border rounded px-3 py-2 w-full"
              placeholder="Email"
              value={user.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="dateOfBirth">DateOfBirth</label>
            <input
              type="date"
              id="dateOfBirth"
              className="border rounded px-3 py-2 w-full"
              placeholder="DateOfBirth"
              value={user.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              className="border rounded px-3 py-2 w-full"
              placeholder="Country"
              value={user.country}
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="city">City</label>
            <input
              id="city"
              className="border rounded px-3 py-2 w-full"
              placeholder="City"
              value={user.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div className="flex flex-row gap-4 pt-10">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={user.promoChannels.sms.enabled}
                onChange={() => handleCheckboxChange("sms")}
              />
              <label>SMS Promotions</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={user.promoChannels.email.enabled}
                onChange={() => handleCheckboxChange("email")}
              />
              <label>Email Promotions</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={user.termsAccepted}
                onChange={toggleTerms}
              />
              <label>Terms/Conditions Accepted</label>
            </div>
          </div>
          <div>
            <p className="font-medium mb-3">Brands:</p>

            <div className="flex flex-wrap gap-2">
              {ALL_BRANDS.map((brand) => {
                const active = user.brands.includes(brand);

                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`
            px-3 py-1 rounded-full border text-sm transition
            ${
              active
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }
          `}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        disabled={saving}
        onClick={saveChanges}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
