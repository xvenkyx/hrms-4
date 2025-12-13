import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    api.get("/leave/me/history").then((res) => {
      console.log("Leave history response:", res.data);
      setLeaves(res.data || []);
    });
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">My Leave History</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Month</th>
            <th>Type</th>
            <th>Days</th>
            <th>LOP</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((l) => (
            <tr key={l.LeaveID} className="border-t">
              <td>{l.Month}</td>
              <td>{l.leaveType}</td>
              <td>{l.requestedDays}</td>
              <td>{l.lopDays}</td>
              <td>{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
