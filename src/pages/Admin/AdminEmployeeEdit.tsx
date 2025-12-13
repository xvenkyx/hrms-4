import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function AdminEmployeeEdit() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [employee, setEmployee] = useState<any>(null);

  const [form, setForm] = useState({
    baseSalary: 0,
    pfApplicable: true,
    bankName: "",
    bankAccount: "",
    ifsc: ""
  });

  useEffect(() => {
    loadEmployee();
  }, []);

  async function loadEmployee() {
    try {
      const res = await api.get("/admin/employees");
      const emp = res.data.find(
        (e: any) => e.EmployeeID === employeeId
      );

      if (!emp) {
        setMessage("Employee not found");
        return;
      }

      setEmployee(emp);

      setForm({
        baseSalary: emp.baseSalary || 0,
        pfApplicable: emp.pfApplicable !== false,
        bankName: emp.bankAccount?.bankName || "",
        bankAccount: emp.bankAccount?.accountNumber || "",
        ifsc: emp.bankAccount?.ifsc || ""
      });
    } catch (err) {
      setMessage("Failed to load employee");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      await api.put(`/admin/employees/${employeeId}`, {
        baseSalary: form.baseSalary,
        pfApplicable: form.pfApplicable,
        bankAccount: {
          bankName: form.bankName,
          accountNumber: form.bankAccount,
          ifsc: form.ifsc
        }
      });

      setMessage("Employee updated successfully");
    } catch (err: any) {
      setMessage(
        err?.response?.data?.error || "Update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  if (!employee)
    return <div className="text-red-600">{message}</div>;

  return (
    <div className="max-w-xl p-6">
      <h1 className="text-xl font-bold mb-4">
        Edit Employee
      </h1>

      {/* READ ONLY INFO */}
      <div className="mb-4 text-sm text-gray-700">
        <div><b>ID:</b> {employee.EmployeeID}</div>
        <div><b>Name:</b> {employee.name}</div>
        <div><b>Department:</b> {employee.department}</div>
        <div><b>Designation:</b> {employee.designation}</div>
      </div>

      {/* BASE SALARY */}
      <label className="block text-sm mb-1">
        Base Salary
      </label>
      <input
        type="number"
        value={form.baseSalary}
        onChange={(e) =>
          setForm({
            ...form,
            baseSalary: Number(e.target.value)
          })
        }
        className="border px-2 py-1 w-full mb-4"
      />

      {/* PF */}
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={form.pfApplicable}
          onChange={(e) =>
            setForm({
              ...form,
              pfApplicable: e.target.checked
            })
          }
        />
        PF Applicable
      </label>

      {/* BANK DETAILS */}
      <h2 className="font-semibold mb-2">
        Bank Details
      </h2>

      <input
        placeholder="Bank Name"
        value={form.bankName}
        onChange={(e) =>
          setForm({ ...form, bankName: e.target.value })
        }
        className="border px-2 py-1 w-full mb-2"
      />

      <input
        placeholder="Account Number"
        value={form.bankAccount}
        onChange={(e) =>
          setForm({
            ...form,
            bankAccount: e.target.value
          })
        }
        className="border px-2 py-1 w-full mb-2"
      />

      <input
        placeholder="IFSC Code"
        value={form.ifsc}
        onChange={(e) =>
          setForm({ ...form, ifsc: e.target.value })
        }
        className="border px-2 py-1 w-full mb-4"
      />

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm">{message}</p>
      )}
    </div>
  );
}
