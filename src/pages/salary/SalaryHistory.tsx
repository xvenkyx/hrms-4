import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { generateSalaryPDF } from "../../utils/pdf";
import { mapSlipToPDF } from "../../utils/mapSlipToPDF";

export default function SalaryHistory() {
  const [slips, setSlips] = useState<any[]>([]);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await api.get("/salary/me/history");
      setSlips(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleView() {
    const slip = slips.find((s) => s.Month === month);
    setSelectedSlip(slip || null);
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold mb-4">My Salary</h1>

      {/* Month selector */}
      <div className="flex gap-3 mb-6">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-2 py-1"
        />
        <button
          onClick={handleView}
          className="px-4 py-1 bg-blue-600 text-white rounded"
          disabled={!month}
        >
          View
        </button>
      </div>

      {loading && <p>Loading salary history...</p>}

      {/* No payroll yet */}
      {!loading && month && !selectedSlip && (
        <p className="text-gray-600">
          Salary for <strong>{month}</strong> has not been generated yet.
        </p>
      )}

      {/* Salary details */}
      {selectedSlip && (
        <div className="border p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">
            Salary Details – {selectedSlip.Month}
          </h2>

          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>Net Salary:</div>
            <div className="font-semibold">
              ₹{selectedSlip.netSalary.toLocaleString("en-IN")}
            </div>

            <div>Generated On:</div>
            <div>
              {new Date(selectedSlip.generatedAt).toLocaleDateString()}
            </div>
          </div>

          <button
            onClick={() =>
              generateSalaryPDF(mapSlipToPDF(selectedSlip))
            }
            className="px-4 py-1 bg-green-600 text-white rounded"
          >
            Download Salary Slip
          </button>
        </div>
      )}
    </div>
  );
}
