import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className=" flex flex-col w-full h-screen">
        <Navbar />
        <main className="p-6 h-full  w-full overflow-x-hidden bg-gray-600">{children}</main>
      </div>
    </div>
  );
}
