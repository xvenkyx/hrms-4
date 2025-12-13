import { useState } from "react";
import { generateSalaryPDF } from "../../utils/pdf";
import { mapSlipToPDF } from "../../utils/mapSlipToPDF";
import { api } from "../../lib/api";

export default function AdminSalaryHistory() {
  const [month, setMonth] = useState("");
  const [slips, setSlips] = useState<any[]>([]);

  async function fetchSlips() {
    if (!month) return;

    try {
      const res = await api.get("/salary/admin/history", {
        params: { month },
      });
      setSlips(res.data);
    } catch (err) {
      console.error("Failed to fetch admin salary history", err);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Salary History (Admin)</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-1"
        />
        <button className="border px-3 py-1" onClick={fetchSlips}>
          Fetch
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-2">Employee</th>
            <th className="border p-2">Month</th>
            <th className="border p-2 text-right">Net Salary</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {slips.map((slip) => (
            <tr key={slip.SlipID}>
              <td className="border p-2">{slip.employeeSnapshot.name}</td>
              <td className="border p-2">{slip.Month}</td>
              <td className="border p-2 text-right">
                ₹{slip.netSalary.toLocaleString("en-IN")}
              </td>
              <td className="border p-2">
                <button
                  className="text-blue-600 underline"
                  onClick={() => generateSalaryPDF(mapSlipToPDF(slip))}
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
