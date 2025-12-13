import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, LogIn, LogOut } from "lucide-react";

export default function EmployeeAttendance() {
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/attendance/me/today");
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCheckIn = async () => {
    await api.post("/attendance/checkin");
    await load();
  };

  const handleCheckOut = async () => {
    await api.post("/attendance/checkout");
    await load();
  };

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const checkedIn = attendance?.CheckIn;
  const checkedOut = attendance?.CheckOut;

  return (
    <div className="max-w-xl space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Today’s Attendance
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your workday check-in and check-out
        </p>
      </div>

      {/* Attendance card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-emerald-600" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Check-In
            </span>
            <span className="font-medium">
              {checkedIn || "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Check-Out
            </span>
            <span className="font-medium">
              {checkedOut || "—"}
            </span>
          </div>

          {/* Status message */}
          {checkedIn && !checkedOut && (
            <p className="pt-2 text-sm text-emerald-700">
              You are currently checked in
            </p>
          )}

          {checkedOut && (
            <p className="pt-2 text-sm text-blue-600">
              Your workday is completed
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          disabled={checkedIn}
          onClick={handleCheckIn}
          className="flex-1 bg-emerald-700 hover:bg-emerald-800"
        >
          <LogIn className="mr-2 h-4 w-4" />
          {checkedIn ? "Checked In" : "Check In"}
        </Button>

        <Button
          disabled={!checkedIn || checkedOut}
          onClick={handleCheckOut}
          variant="outline"
          className="flex-1 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {checkedOut ? "Checked Out" : "Check Out"}
        </Button>
      </div>
    </div>
  );
}
