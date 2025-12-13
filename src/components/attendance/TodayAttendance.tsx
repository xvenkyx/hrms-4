import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TodayAttendance() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/attendance/admin/today").then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Today</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3>Checked In</h3>
          <ul>
            {data.checkedIn.map((e: any) => (
              <li key={e.EmployeeID}>{e.Name} — {e.CheckIn}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h3>Not Checked In</h3>
          <ul>
            {data.notCheckedIn.map((e: any) => (
              <li key={e.EmployeeID}>{e.Name}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h3>Checked Out</h3>
          <ul>
            {data.checkedOut.map((e: any) => (
              <li key={e.EmployeeID}>{e.Name} — {e.CheckOut}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
