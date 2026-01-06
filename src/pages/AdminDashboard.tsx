import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Gift,
  ClipboardList,
} from "lucide-react";

/* ===========================
   HOLIDAYS – 2026
=========================== */
const HOLIDAYS_2026 = [
  { name: "New Year’s Day", date: "Jan 1, 2026", region: "USA" },
  { name: "Makar Sankranti", date: "Jan 14, 2026", region: "India" },
  { name: "Memorial Day", date: "May 25, 2026", region: "USA" },
  { name: "Independence Day", date: "Jul 4, 2026", region: "USA" },
  { name: "Labor Day", date: "Sep 7, 2026", region: "USA" },
  {
    name: "Diwali / Deepavali",
    date: "Nov 6 – Nov 10, 2026",
    region: "India",
  },
  { name: "Thanksgiving Day", date: "Nov 26, 2026", region: "USA" },
  {
    name: "Christmas & Year-End Holidays",
    date: "Dec 25, 2026 – Jan 1, 2027",
    region: "USA",
  },
];

type Employee = {
  EmployeeID: string;
  name: string;
  gender?: string;
  dob?: string;
};

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [empRes, leaveRes] = await Promise.allSettled([
        api.get("/admin/employees"),
        api.get("/leave/admin/history"),
      ]);

      if (empRes.status === "fulfilled") {
        setEmployees(empRes.value.data || []);
      }

      if (leaveRes.status === "fulfilled") {
        setLeaves(leaveRes.value.data || []);
      }
    } catch (e) {
      console.error("Admin dashboard load failed", e);
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = employees.length;
  const maleCount = employees.filter(
    (e) => e.gender?.toLowerCase() === "male"
  ).length;
  const femaleCount = employees.filter(
    (e) => e.gender?.toLowerCase() === "female"
  ).length;
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");

  const today = new Date();
  const upcomingBirthdays = employees.filter((e) => {
    if (!e.dob) return false;
    const dob = new Date(e.dob);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      dob.getMonth(),
      dob.getDate()
    );
    const diff =
      (thisYearBirthday.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          HR / Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of people, leaves, and holidays
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat title="Total Employees" value={totalEmployees} loading={loading} icon={<Users className="h-4 w-4 text-emerald-600" />} />
        <Stat title="Male" value={maleCount} loading={loading} icon={<UserCheck className="h-4 w-4 text-blue-600" />} />
        <Stat title="Female" value={femaleCount} loading={loading} icon={<UserX className="h-4 w-4 text-pink-600" />} />
        <Stat title="Pending Leaves" value={pendingLeaves.length} loading={loading} icon={<ClipboardList className="h-4 w-4 text-yellow-600" />} />
      </div>

      {/* Middle */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Birthdays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Gift className="h-4 w-4 text-emerald-600" />
              Upcoming Birthdays (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <Skeleton className="h-20" />
            ) : upcomingBirthdays.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming birthdays
              </p>
            ) : (
              upcomingBirthdays.map((e) => (
                <div key={e.EmployeeID} className="flex justify-between text-sm">
                  <span>{e.name}</span>
                  <span className="text-muted-foreground">{e.dob}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Holidays – 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {HOLIDAYS_2026.map((h) => (
              <div key={h.name} className="flex justify-between">
                <span>{h.name}</span>
                <span className="text-muted-foreground">{h.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">HR Reminders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Button variant="outline" onClick={() => window.location.href = "/admin/leave"}>
            Review Leave Requests
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/admin/employees"}>
            Manage Employees
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/admin/salary/generate"}>
            Generate Salary
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===========================
   SMALL STAT COMPONENT
=========================== */
function Stat({
  title,
  value,
  loading,
  icon,
}: {
  title: string;
  value: number;
  loading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8" /> : <p className="text-3xl font-bold">{value}</p>}
      </CardContent>
    </Card>
  );
}
