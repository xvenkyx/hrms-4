import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function SummaryAttendance() {
  const [month, setMonth] = useState(12);
  const [year, setYear] = useState(2025);
  
  const [data, setData] = useState<any>(null);

  const load = () => {
    api.get(`/attendance/admin/summary?month=${month}&year=${year}`)
      .then(res => setData(res.data));
  };

  useEffect(load, []);

  return (
    <div>
      <div className="flex gap-4">
        <input type="number" value={month} onChange={e => setMonth(+e.target.value)} />
        <input type="number" value={year} onChange={e => setYear(+e.target.value)} />
        <button onClick={load}>Search</button>
      </div>

      {data && (
        <div className="mt-4">
          {data.map((row: any) => (
            <div key={row.EmployeeID} className="border p-3 mb-2 rounded">
              {row.Name} — {row.daysPresent} days
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
