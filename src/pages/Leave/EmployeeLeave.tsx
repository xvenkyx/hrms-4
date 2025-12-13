import { useState } from "react";
import { api } from "@/lib/api";

export default function EmployeeLeave() {
  const [leaveType, setLeaveType] = useState<"CPL" | "SL" | "LOP">("CPL");
  const [days, setDays] = useState<number>(1);
  const [month, setMonth] = useState<string>("");
  const [consumePaid, setConsumePaid] = useState<boolean>(true);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async () => {
    if (!month) {
      alert("Select month");
      return;
    }

    if (days <= 0 || Number.isNaN(days)) {
      alert("Enter valid number of days");
      return;
    }

    setLoading(true);
    try {
      await api.post("/leave/request", {
        leaveType,
        requestedDays: days,
        month,
        consumePaidLeavesFirst: consumePaid,
        reason
      });

      alert("Leave request submitted");
      setReason("");
      setDays(1);
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to submit leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Apply Leave</h1>

      {/* Leave Type */}
      <select
        className="border p-2 w-full"
        value={leaveType}
        onChange={(e) =>
          setLeaveType(e.target.value as "CPL" | "SL" | "LOP")
        }
      >
        <option value="CPL">Casual Paid Leave</option>
        <option value="SL">Sick Leave</option>
        <option value="LOP">Loss of Pay</option>
      </select>

      {/* Days */}
      <input
        type="number"
        min={1}
        className="border p-2 w-full"
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        placeholder="Number of days"
      />

      {/* Month */}
      <input
        type="month"
        className="border p-2 w-full"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      />

      {/* Consume Paid Leaves */}
      {leaveType !== "LOP" && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={consumePaid}
            onChange={(e) => setConsumePaid(e.target.checked)}
          />
          Consume paid leaves first
        </label>
      )}

      {/* Reason */}
      <textarea
        className="border p-2 w-full"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      {/* Submit */}
      <button
        onClick={submit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Leave"}
      </button>
    </div>
  );
}
