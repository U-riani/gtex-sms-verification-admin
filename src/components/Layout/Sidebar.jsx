import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [clientsOpen, setClientsOpen] = useState(false);

  const linkBase =
    "block px-4 py-2 rounded hover:bg-blue-800 hover:text-white transition";
  const linkActive = "bg-blue-900 text-white";
  const subLinkBase =
    "block ml-6 px-4 py-2 rounded text-sm text-gray-300 hover:bg-blue-700 hover:text-white transition";

  // Auto-open accordion when inside /clients/*
  useEffect(() => {
    if (!open) {
      setClientsOpen(false);
    } else if (location.pathname.startsWith("/clients/segment")) {
      setClientsOpen(true);
    }
  }, [open, location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          bg-slate-800 text-gray-100 transition-all duration-300
          fixed top-0 left-0 z-50 h-full w-56 overflow-y-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:h-auto 
          ${open ? "lg:w-56" : "lg:w-0"}
        `}
      >
        <div
          className={` p-4 pt-0 ${
            open ? "opacity-100" : "opacity-0 lg:hidden"
          }`}
        >
          <div className="sticky top-0 bg-slate-800 text-xl font-bold py-4 flex justify-between items-center">
            <h5>MENU</h5>

            {/* Close ALWAYS visible */}
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

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

            {/* Clients row */}
            <div
              className={`flex items-center justify-between rounded transition hover:bg-blue-800 ${
                location.pathname.startsWith("/clients") ? linkActive : ""
              }`}
            >
              {/* Clients link */}
              <NavLink
                to="/clients"
                className={({ isActive }) =>
                  `flex-1 ${linkBase} ${isActive ? "text-white" : ""}`
                }
              >
                Clients
              </NavLink>

              {/* Accordion toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setClientsOpen((p) => !p);
                }}
                className="px-3 py-2 h-full bg-stone-100/10 text-gray-300 hover:text-white transition"
                aria-label="Toggle clients menu"
              >
                <span
                  className={`inline-block transition-transform duration-200 ${
                    clientsOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>
            </div>
            {/* Accordion content */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                clientsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <NavLink
                to="/clients/segments"
                className={({ isActive }) =>
                  `${subLinkBase} ${isActive ? linkActive : ""}`
                }
              >
                Segments
              </NavLink>
            </div>
            <NavLink
              to="/sms-templates"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ""} text-nowrap`
              }
            >
              Sms Template
            </NavLink>

            <NavLink
              to="/sms-history"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ""} text-nowrap`
              }
            >
              Sms History
            </NavLink>

            <NavLink
              to="/sms-campaigns"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ""} text-nowrap`
              }
            >
              Sms Campaigns
            </NavLink>

            <NavLink
              to="/sms-template-analytics"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ""} text-nowrap`
              }
            >
              Template Analytics
            </NavLink>
          </nav>
        </div>
      </aside>
    </>
  );
}
