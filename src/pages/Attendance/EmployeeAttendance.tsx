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
import { Clock, LogIn, LogOut, Loader2 } from "lucide-react";

export default function EmployeeAttendance() {
  // Holds today's attendance data from backend
  const [attendance, setAttendance] = useState<any>(null);

  // Page-level loading (initial fetch)
  const [loading, setLoading] = useState(true);

  // Action-level loading (check-in / check-out)
  const [actionLoading, setActionLoading] = useState<
    "checkin" | "checkout" | null
  >(null);

  // Fetch today's attendance
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

  // Load attendance on page mount
  useEffect(() => {
    load();
  }, []);

  // Handle Check-In click
  const handleCheckIn = async () => {
    try {
      // Mark check-in action as loading
      setActionLoading("checkin");

      // Call backend check-in API
      await api.post("/attendance/checkin");

      // Refresh attendance after success
      await load();
    } finally {
      // Reset action loading state
      setActionLoading(null);
    }
  };

  // Handle Check-Out click
  const handleCheckOut = async () => {
    try {
      // Mark check-out action as loading
      setActionLoading("checkout");

      // Call backend check-out API
      await api.post("/attendance/checkout");

      // Refresh attendance after success
      await load();
    } finally {
      // Reset action loading state
      setActionLoading(null);
    }
  };

  // Skeleton UI while page is loading
  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Extract check-in / check-out times
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
            <span className="text-muted-foreground">Check-In</span>
            <span className="font-medium">
              {checkedIn || "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-Out</span>
            <span className="font-medium">
              {checkedOut || "—"}
            </span>
          </div>

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

      {/* Action buttons */}
      <div className="flex gap-4">
        {/* Check-In Button */}
        <Button
          disabled={checkedIn || actionLoading !== null}
          onClick={handleCheckIn}
          className="flex-1 bg-emerald-700 hover:bg-emerald-800"
        >
          {actionLoading === "checkin" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking In...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              {checkedIn ? "Checked In" : "Check In"}
            </>
          )}
        </Button>

        {/* Check-Out Button */}
        <Button
          disabled={!checkedIn || checkedOut || actionLoading !== null}
          onClick={handleCheckOut}
          variant="outline"
          className="flex-1 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        >
          {actionLoading === "checkout" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              {checkedOut ? "Checked Out" : "Check Out"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
