import { useState } from "react";
import { api } from "../../lib/api";

export default function AdminSalaryGenerate() {
  const [month, setMonth] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [mode, setMode] = useState<"bulk" | "single">("bulk");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate() {
    if (!month) {
      setMessage("Please select a month");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === "bulk") {
        // Placeholder: backend bulk endpoint later
        setMessage(
          "Bulk generation is planned. Use single generation for now."
        );
      } else {
        if (!employeeId) {
          setMessage("Please enter employee ID");
          setLoading(false);
          return;
        }

        await api.post("/salary/generate", {
          employeeID: employeeId,
          month,
          earnings: {
            basic: 0,
            hra: 0,
            fuelAllowance: 0,
            performanceBonus: 0
          },
          deductions: {
            pfAmount: 0,
            professionalTax: 0,
            absentDeduction: 0
          },
          pfNotApplicable: false
        });

        setMessage(
          `Salary generated for ${employeeId} (${month})`
        );
      }
    } catch (err: any) {
      setMessage(
        err?.response?.data?.error || "Salary generation failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-4">Generate Salary</h1>

      {/* Month */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Month</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-2 py-1 w-full"
        />
      </div>

      {/* Mode */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Generation Mode</label>
        <select
          value={mode}
          onChange={(e) =>
            setMode(e.target.value as "bulk" | "single")
          }
          className="border px-2 py-1 w-full"
        >
          <option value="bulk">Bulk (All Employees)</option>
          <option value="single">Single Employee (Urgent)</option>
        </select>
      </div>

      {/* Single employee */}
      {mode === "single" && (
        <div className="mb-4">
          <label className="block text-sm mb-1">Employee ID</label>
          <input
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="emp-123"
            className="border px-2 py-1 w-full"
          />
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Generating..." : "Generate Salary"}
      </button>

      {message && (
        <p className="mt-4 text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}
