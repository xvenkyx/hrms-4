// src/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Clock,
  History,
  Users2,
  User,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { IndianRupee } from "lucide-react";

export default function Sidebar({ open, setOpen }: any) {
  const { roles } = useAuth();
  const location = useLocation();

  const isAdmin = roles.includes("v4-admin") || roles.includes("v4-hr");

  const nav = isAdmin
    ? [
        { label: "Dashboard", to: "/", icon: LayoutDashboard },
        { label: "Employees", to: "/admin/employees", icon: Users2 },
        { label: "Leave Management", to: "/admin/leave", icon: ClipboardList },
        {
          label: "Attendance Dashboard",
          to: "/admin/attendance",
          icon: Users2,
        },
        {
          label: "Generate Salary",
          to: "/admin/salary/generate",
          icon: IndianRupee,
        },
        { label: "Salary History", to: "/admin/salary/history", icon: History },
        { label: "Profile", to: "/profile", icon: User },
      ]
    : [
        { label: "Dashboard", to: "/", icon: LayoutDashboard },
        { label: "Today", to: "/attendance", icon: Clock },
        { label: "Apply Leave", to: "/leave", icon: Calendar },
        { label: "My Leave History", to: "/leave/history", icon: History },

        { label: "History", to: "/attendance/history", icon: History },
        { label: "Salary", to: "/salary/history", icon: IndianRupee },
        { label: "Profile", to: "/profile", icon: User },
      ];

  return (
    <>
      {/* BACKDROP for mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition ${
          open ? "block" : "hidden"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg
          transform transition-transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        <div className="p-4 text-xl font-bold border-b">HRMS v4</div>

        <nav className="p-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md 
                            ${
                              active
                                ? "bg-gray-200 font-semibold"
                                : "hover:bg-gray-100"
                            }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
