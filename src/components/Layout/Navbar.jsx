import { useLocation } from "react-router-dom";
import { PAGE_TITLES } from "../../config/pageTitles";

export default function Navbar({ onMenuClick, sidebarOpen }) {
  const { pathname } = useLocation();

  const pageTitle =
    PAGE_TITLES.find((p) => p.match.test(pathname))?.title || "Admin Panel";
  return (
    <header className="h-14 bg-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center">
        {!sidebarOpen && (
          <button
            onClick={onMenuClick}
            className="mr-4 text-xl cursor-pointer text-gray-200 hover:text-white"
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}

        <div className="text-sm text-gray-500">
          <p>CLIENTMATE</p>
        </div>
      </div>

      <h1 className="text-lg font-semibold text-gray-300">{pageTitle}</h1>
    </header>
  );
}
