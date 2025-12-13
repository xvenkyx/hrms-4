// src/pages/Attendance/EmployeeAttendance.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function EmployeeAttendance() {
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/attendance/me/today");
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
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

  if (loading) return <div>Loading...</div>;

  const checkedIn = attendance?.CheckIn;
  const checkedOut = attendance?.CheckOut;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Today's Attendance</h1>

      <div className="p-4 border rounded mb-6 bg-white">
        <p><strong>Check-In:</strong> {checkedIn || "—"}</p>
        <p><strong>Check-Out:</strong> {checkedOut || "—"}</p>

        {checkedIn && !checkedOut && (
          <p className="mt-2 text-sm text-green-600">You are checked-in ✓</p>
        )}
        {checkedOut && (
          <p className="mt-2 text-sm text-blue-600">Day Completed ✓</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          disabled={checkedIn}
          onClick={handleCheckIn}
          className="w-full"
        >
          {checkedIn ? "Checked-In" : "Check-In"}
        </Button>

        <Button
          disabled={!checkedIn || checkedOut}
          onClick={handleCheckOut}
          variant="secondary"
          className="w-full"
        >
          {checkedOut ? "Checked-Out" : "Check-Out"}
        </Button>
      </div>
    </div>
  );
}
