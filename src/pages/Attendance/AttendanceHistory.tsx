// src/pages/Attendance/AttendanceHistory.tsx
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AttendanceHistory() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/attendance/history?month=${month}&year=${year}`
      );
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const computeHours = (ci: string, co: string) => {
    if (!ci || !co) return "-";
    const start = new Date(`2025-01-01T${ci}`);
    const end = new Date(`2025-01-01T${co}`);
    const diff = (end.getTime() - start.getTime()) / 36e5;
    return diff.toFixed(2) + " hrs";
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Attendance History</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="number"
          className="border p-2 rounded w-24"
          min={1}
          max={12}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        />

        <input
          type="number"
          className="border p-2 rounded w-28"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />

        <Button onClick={load}>Search</Button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table className="w-full border bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Check-In</th>
              <th className="p-2 text-left">Check-Out</th>
              <th className="p-2 text-left">Hours</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.Date} className="border-b">
                <td className="p-2">{r.Date}</td>
                <td className="p-2">{r.CheckIn || "—"}</td>
                <td className="p-2">{r.CheckOut || "—"}</td>
                <td className="p-2">
                  {computeHours(r.CheckIn, r.CheckOut)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
