import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import {
  LayoutDashboard,
  History,
  Users2,
  User,
  ClipboardList,
  Calendar,
  IndianRupee,
} from "lucide-react";

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { roles } = useAuth();
  const location = useLocation();

  const isAdmin = roles.includes("v4-admin") || roles.includes("v4-hr");

  /* ===========================
   DERIVE TEAM LEAD STATUS
   (FROM EMPLOYEE PROFILE)
=========================== */
  const [isTeamLead, setIsTeamLead] = useState(false);
  const [loadingTL, setLoadingTL] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/employee/me");
        setIsTeamLead(res.data?.isTL === true);
      } catch {
        setIsTeamLead(false);
      } finally {
        setLoadingTL(false);
      }
    };

    if (!isAdmin) {
      loadProfile();
    } else {
      setLoadingTL(false);
    }
  }, [isAdmin]);

  /* ===========================
     NAV CONFIG
  =========================== */
  const adminNav = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "Employees", to: "/admin/employees", icon: Users2 },
    { label: "Leave Management", to: "/admin/leave", icon: ClipboardList },
    {
      label: "Team Assignments",
      to: "/admin/team-assignments",
      icon: Users2,
    },
    {
      label: "Generate Salary",
      to: "/admin/salary/generate",
      icon: IndianRupee,
    },
    { label: "Performance Bonus", to: "/performance/bonus", icon: IndianRupee },
    { label: "Salary History", to: "/admin/salary/history", icon: History },
    { label: "Profile", to: "/profile", icon: User },
  ];

  const employeeNav = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "Apply Leave", to: "/leave", icon: Calendar },
    { label: "Leave History", to: "/leave/history", icon: History },
    { label: "Salary", to: "/salary/history", icon: IndianRupee },
    { label: "Profile", to: "/profile", icon: User },
  ];

  const teamLeadNav = [
    {
      label: "Team Leave Approvals",
      to: "/tl/leave",
      icon: ClipboardList,
    },
  ];

  const nav = isAdmin
    ? adminNav
    : isTeamLead
      ? [...employeeNav, ...teamLeadNav]
      : employeeNav;

  /* ===========================
     RENDER
  =========================== */
  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-emerald-900 text-emerald-50
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-emerald-800 px-4 py-4">
          <img src="/image.png" alt="logo" className="h-8 w-8" />
          <span className="font-semibold tracking-wide">HRMS</span>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-1">
          {!loadingTL &&
            nav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-md px-3 py-2 text-sm
                    transition
                    ${
                      active
                        ? "bg-emerald-800 font-semibold"
                        : "hover:bg-emerald-800/70"
                    }
                  `}
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
