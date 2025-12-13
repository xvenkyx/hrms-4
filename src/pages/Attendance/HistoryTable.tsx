import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function HistoryTable() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);

  const load = async () => {
    const res = await api.get(`/attendance/me/history?month=${month}&year=${year}`);
    setRecords(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const computeHours = (ci: string, co: string) => {
    if (!ci || !co) return "-";
    const start = new Date(`2000-01-01T${ci}`);
    const end = new Date(`2000-01-01T${co}`);
    return ((end.getTime() - start.getTime()) / 3600000).toFixed(2) + " hrs";
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Attendance History</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="number"
          className="border p-2 rounded w-20"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        />

        <input
          type="number"
          className="border p-2 rounded w-24"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />

        <button
          onClick={load}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Check-In</th>
            <th className="p-2 text-left">Check-Out</th>
            <th className="p-2 text-left">Hours</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r: any) => (
            <tr key={r.Date} className="border-t">
              <td className="p-2">{r.Date}</td>
              <td className="p-2">{r.CheckIn || "—"}</td>
              <td className="p-2">{r.CheckOut || "—"}</td>
              <td className="p-2">{computeHours(r.CheckIn, r.CheckOut)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
