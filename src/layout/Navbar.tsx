// src/layout/Navbar.tsx
import { Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ESTClock from "./ESTClock";
import { logout } from "../lib/auth";

export default function Navbar({ setOpen }: any) {
  const { employee } = useAuth();

  return (
    <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
      {/* Mobile Sidebar Button */}
      <button className="lg:hidden p-2" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>

      <div className="font-semibold text-lg hidden lg:block">HRMS Dashboard</div>

      <div className="flex items-center gap-6">
        <ESTClock />
        <span className="text-gray-700">{employee?.name}</span>

        <button
          onClick={logout}
          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
