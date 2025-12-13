import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function TodayCard() {
  const [data, setData] = useState<any>(null);

  const load = async () => {
    const res = await api.get("/attendance/me/today");
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const checkIn = async () => {
    await api.post("/attendance/checkin");
    load();
  };

  const checkOut = async () => {
    await api.post("/attendance/checkout");
    load();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Today's Attendance</h2>

      <p><b>Check-In:</b> {data?.CheckIn || "—"}</p>
      <p><b>Check-Out:</b> {data?.CheckOut || "—"}</p>

      <div className="flex gap-4 mt-4">
        <Button onClick={checkIn} disabled={data?.CheckIn}>
          {data?.CheckIn ? "Checked-In" : "Check-In"}
        </Button>

        <Button
          onClick={checkOut}
          variant="secondary"
          disabled={!data?.CheckIn || data?.CheckOut}
        >
          {data?.CheckOut ? "Checked-Out" : "Check-Out"}
        </Button>
      </div>
    </div>
  );
}
