import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminLeaveRequests() {
  const [leaves, setLeaves] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get("/leave/admin/history");
    setLeaves(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (LeaveID: string, action: "APPROVE" | "REJECT") => {
    await api.post("/leave/approve", { LeaveID, action });
    load();
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Leave Requests</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Employee</th>
            <th>Month</th>
            <th>Type</th>
            <th>Days</th>
            <th>LOP</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {leaves.map(l => (
            <tr key={l.LeaveID} className="border-t">
              <td>{l.EmployeeID}</td>
              <td>{l.Month}</td>
              <td>{l.leaveType}</td>
              <td>{l.requestedDays}</td>
              <td>{l.lopDays}</td>
              <td>{l.status}</td>
              <td className="space-x-2">
                {l.status === "PENDING" && (
                  <>
                    <button
                      className="text-green-600"
                      onClick={() => act(l.LeaveID, "APPROVE")}
                    >
                      Approve
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => act(l.LeaveID, "REJECT")}
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
