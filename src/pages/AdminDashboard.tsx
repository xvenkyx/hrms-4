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

  /* ===========================
     DERIVED DATA
  =========================== */
  const totalEmployees = employees.length;

  const maleCount = employees.filter(
    (e) => e.gender?.toLowerCase() === "male"
  ).length;

  const femaleCount = employees.filter(
    (e) => e.gender?.toLowerCase() === "female"
  ).length;

  const pendingLeaves = leaves.filter(
    (l) => l.status === "PENDING"
  );

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
          Overview of people, leaves, and upcoming events
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Employees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-emerald-600" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8" />
            ) : (
              <p className="text-3xl font-bold">
                {totalEmployees}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Male */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-blue-600" />
              Male
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8" />
            ) : (
              <p className="text-3xl font-bold">
                {maleCount}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Female */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <UserX className="h-4 w-4 text-pink-600" />
              Female
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8" />
            ) : (
              <p className="text-3xl font-bold">
                {femaleCount}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending leaves */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ClipboardList className="h-4 w-4 text-yellow-600" />
              Pending Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8" />
            ) : (
              <p className="text-3xl font-bold">
                {pendingLeaves.length}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Upcoming birthdays */}
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
                <div
                  key={e.EmployeeID}
                  className="flex justify-between text-sm"
                >
                  <span>{e.name}</span>
                  <span className="text-muted-foreground">
                    {e.dob}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Holidays (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Upcoming Holidays
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Republic Day</span>
              <span className="text-muted-foreground">
                Jan 26
              </span>
            </div>
            <div className="flex justify-between">
              <span>Holi</span>
              <span className="text-muted-foreground">
                Mar 14
              </span>
            </div>
            <div className="flex justify-between">
              <span>Independence Day</span>
              <span className="text-muted-foreground">
                Aug 15
              </span>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              Holiday calendar integration coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            HR Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Button
            variant="outline"
            onClick={() => window.location.href = "/admin/leave"}
          >
            Review Leave Requests
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/admin/employees"}
          >
            Manage Employees
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/admin/salary/generate"}
          >
            Generate Salary
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
