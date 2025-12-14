import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import {
  CalendarCheck,
  Clock,
  IndianRupee,
  ClipboardList,
} from "lucide-react";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [latestSalary, setLatestSalary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [att, bal, sal] = await Promise.allSettled([
        api.get("/attendance/me/today"),
        api.get("/leave/me/balance"),
        api.get("/salary/me/history"),
      ]);

      if (att.status === "fulfilled") {
        setAttendance(att.value.data);
      }

      if (bal.status === "fulfilled") {
        setBalance(bal.value.data);
      }

      if (sal.status === "fulfilled") {
        const slips = sal.value.data || [];
        setLatestSalary(slips[0] || null);
      }
    } catch (e) {
      console.error("Dashboard load failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Employee Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your attendance, leaves, and salary
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-emerald-600" />
              Today’s Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10" />
            ) : attendance ? (
              <div className="space-y-1 text-sm">
                <div>
                  Check-In:{" "}
                  <span className="font-medium">
                    {attendance.CheckIn || "—"}
                  </span>
                </div>
                <div>
                  Check-Out:{" "}
                  <span className="font-medium">
                    {attendance.CheckOut || "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No attendance recorded today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Leave balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ClipboardList className="h-4 w-4 text-emerald-600" />
              Leave Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10" />
            ) : balance ? (
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">
                    CPL
                  </div>
                  <div className="font-semibold">
                    {balance.CPL ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    SL
                  </div>
                  <div className="font-semibold">
                    {balance.SL ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    LOP
                  </div>
                  <div className="font-semibold">
                    {balance.LOP ?? "—"}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Leave balance unavailable
              </p>
            )}
          </CardContent>
        </Card>

        {/* Salary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              Latest Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10" />
            ) : latestSalary ? (
              <div className="space-y-1 text-sm">
                <div>
                  Month:{" "}
                  <span className="font-medium">
                    {latestSalary.Month}
                  </span>
                </div>
                <div>
                  Net Pay:{" "}
                  <span className="font-semibold">
                    ₹
                    {latestSalary.netSalary?.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No salary generated yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Button
            variant="outline"
            onClick={() => navigate("/attendance")}
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/leave")}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Apply Leave
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/salary/history")}
          >
            <IndianRupee className="mr-2 h-4 w-4" />
            View Salary
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
