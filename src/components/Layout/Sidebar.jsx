import { NavLink } from "react-router-dom";

const linkBase =
  "block px-4 py-2 rounded hover:bg-blue-800 hover:text-white transition";
const linkActive = "bg-blue-900 text-white";

export default function Sidebar() {
  return (
    <aside className="w-56 bg-blue-950 text-gray-100 flex flex-col p-4">
      <div className="text-xl font-bold mb-6">KIABI Admin</div>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : ""}`
          }
        >
          Users
        </NavLink>
        <NavLink
          to="/sms-templates"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : ""}`
          }
        >
          Sms Template
        </NavLink>
        <NavLink
          to="/sms-history"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : ""}`
          }
        >
          Sms History
        </NavLink>
        <NavLink
          to="/sms-campaigns"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : ""}`
          }
        >
          Sms Campaigns
        </NavLink>
        <NavLink
          to="/sms-template-analytics"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : ""}`
          }
        >
          Template Analytics
        </NavLink>
      </nav>
    </aside>
  );
}
