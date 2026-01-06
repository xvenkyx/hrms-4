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
  ClipboardList,
  Calendar,
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

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [att, bal] = await Promise.allSettled([
        api.get("/attendance/me/today"),
        api.get("/leave/me/balance"),
      ]);

      if (att.status === "fulfilled") {
        setAttendance(att.value.data);
      }

      if (bal.status === "fulfilled") {
        setBalance(bal.value.data);
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
          Attendance, leaves, and holiday overview
        </p>
      </div>

      {/* Main cards */}
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

        {/* Leave Balance */}
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
                  <div className="text-xs text-muted-foreground">CPL</div>
                  <div className="font-semibold">{balance.CPL ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">SL</div>
                  <div className="font-semibold">{balance.SL ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">LOP</div>
                  <div className="font-semibold">{balance.LOP ?? "—"}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Leave balance unavailable
              </p>
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
                <span className="text-muted-foreground">
                  {h.date}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Button variant="outline" onClick={() => navigate("/attendance")}>
            <CalendarCheck className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
          <Button variant="outline" onClick={() => navigate("/leave")}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Apply Leave
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
