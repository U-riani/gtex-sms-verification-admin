import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminUserById  } from "../api/adminUserService";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getAdminUserById (id);
        setUser(data.user || data); // depending how backend returns it
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) return <p className="text-gray-600">Loading user...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!user) return <p className="text-gray-600">User not found.</p>;

  const sms = user.promoChannels?.sms;
  const email = user.promoChannels?.email;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 bg-gray-200 rounded"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-semibold mb-4">
        {user.firstName} {user.lastName}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow">
        <div>
          <h3 className="font-semibold mb-2">Basic info</h3>
          <div>
            <p>
              <span className="font-medium">Name:</span> {user.firstName}
            </p>
            <p>
              <span className="font-medium">Lastname:</span> {user.lastName}
            </p>
          </div>
          <p>
            <span className="font-medium">Branch:</span> {user.branch}
          </p>
          <p>
            <span className="font-medium">Gender:</span> {user.gender}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {user.phone}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email || "-"}
          </p>
          <p>
            <span className="font-medium">City:</span> {user.city}
          </p>
          <p>
            <span className="font-medium">Country:</span> {user.country}
          </p>
          <p>
            <span className="font-medium">Date Of Birth:</span>{" "}
            {user.dateOfBirth}
          </p>
          <div>
            <p className="font-medium">Selected Brands:</p>
            {user.brands && user.brands.length > 0 ? (
              <ul className="list-disc list-inside">
                {user.brands.map((brand, index) => (
                  <li key={index}>{brand}</li>
                ))}
              </ul>
            ) : (
              <p>-</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Promo Channels</h3>

          <div className="mb-3">
            <p className="font-medium">SMS</p>
            <p>Status: {sms?.enabled ? "Enabled" : "Disabled"}</p>
            <p>
              Created:{" "}
              {sms?.createdAt ? new Date(sms.createdAt).toLocaleString() : "-"}
            </p>
            <p>
              Updated:{" "}
              {sms?.updatedAt ? new Date(sms.updatedAt).toLocaleString() : "-"}
            </p>
          </div>

          <div>
            <p className="font-medium">Email</p>
            <p>Status: {email?.enabled ? "Enabled" : "Disabled"}</p>
            <p>
              Created:{" "}
              {email?.createdAt
                ? new Date(email.createdAt).toLocaleString()
                : "-"}
            </p>
            <p>
              Updated:{" "}
              {email?.updatedAt
                ? new Date(email.updatedAt).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
