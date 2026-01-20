import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ArrowLeft, Save } from "lucide-react";

export default function AdminEmployeeEdit() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [employee, setEmployee] = useState<any>(null);

  const [form, setForm] = useState({
    baseSalary: 0,
    pfApplicable: true,

    bankName: "",
    bankAccount: "",
    ifsc: "",

    employmentStatus: "REGULAR",
    leaveCPL: 4,
    leaveSL: 2,

    // ✅ NEW
    employeeCode: "",
    branch: "",
    dateOfJoining: "",
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
        setMessage({
          type: "error",
          text: "Employee not found",
        });
        return;
      }

      setEmployee(emp);

      setForm({
        baseSalary: emp.baseSalary || 0,
        pfApplicable: emp.pfApplicable !== false,

        bankName: emp.bankAccount?.bankName || "",
        bankAccount: emp.bankAccount?.accountNumber || "",
        ifsc: emp.bankAccount?.ifsc || "",

        employmentStatus: emp.employmentStatus || "REGULAR",
        leaveCPL: emp.leaveBalance?.CPL ?? 4,
        leaveSL: emp.leaveBalance?.SL ?? 2,

        // ✅ NEW
        employeeCode: emp.employeeCode || "",
        branch: emp.branch || "",
        dateOfJoining: emp.dateOfJoining || "",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to load employee details",
      });
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

        employmentStatus: form.employmentStatus,
        leaveBalance:
          form.employmentStatus === "REGULAR"
            ? { CPL: form.leaveCPL, SL: form.leaveSL }
            : { CPL: 0, SL: 0 },

        // ✅ NEW
        employeeCode: form.employeeCode,
        branch: form.branch,
        dateOfJoining: form.dateOfJoining,

        bankAccount: {
          bankName: form.bankName,
          accountNumber: form.bankAccount,
          ifsc: form.ifsc,
        },
      });

      setMessage({
        type: "success",
        text: "Employee updated successfully",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.error ||
          "Failed to update employee",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <p className="text-sm text-destructive">
        {message?.text}
      </p>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Employee
        </h1>
      </div>

      {/* Read-only info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Employee ID</span>
            <div className="font-mono">{employee.EmployeeID}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Name</span>
            <div>{employee.name}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Department</span>
            <div>{employee.department}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Designation</span>
            <div>{employee.designation}</div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Official Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Official Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Employee Code</label>
            <Input
              value={form.employeeCode}
              onChange={(e) =>
                setForm({ ...form, employeeCode: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Branch</label>
            <Select
              value={form.branch}
              onValueChange={(v) =>
                setForm({ ...form, branch: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visnagar, Gujarat">Visnagar, Gujarat</SelectItem>
                <SelectItem value="Ahmedabad, Gujarat">Ahmedabad, Gujarat</SelectItem>
                <SelectItem value="Pune, Maharashtra">Pune, Maharashtra</SelectItem>
                <SelectItem value="Mehsana, Gujarat">Mehsana, Gujarat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Date of Joining</label>
            <Input
              type="date"
              value={form.dateOfJoining}
              onChange={(e) =>
                setForm({ ...form, dateOfJoining: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Employment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Employment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={form.employmentStatus}
            onValueChange={(v) =>
              setForm({ ...form, employmentStatus: v })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROBATION">Probation</SelectItem>
              <SelectItem value="REGULAR">Regular</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Leave Balance */}
      {form.employmentStatus === "REGULAR" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Leave Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              min={0}
              placeholder="Casual Leave"
              value={form.leaveCPL}
              onChange={(e) =>
                setForm({
                  ...form,
                  leaveCPL: Math.max(0, Number(e.target.value)),
                })
              }
            />
            <Input
              type="number"
              min={0}
              placeholder="Sick Leave"
              value={form.leaveSL}
              onChange={(e) =>
                setForm({
                  ...form,
                  leaveSL: Math.max(0, Number(e.target.value)),
                })
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Salary & PF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Salary Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Base Salary</label>
            <Input
              type="number"
              min={0}
              value={form.baseSalary}
              onChange={(e) =>
                setForm({
                  ...form,
                  baseSalary: Math.max(0, Number(e.target.value)),
                })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.pfApplicable}
              onCheckedChange={(checked: any) =>
                setForm({
                  ...form,
                  pfApplicable: Boolean(checked),
                })
              }
            />
            <span className="text-sm">PF applicable</span>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Bank name"
            value={form.bankName}
            onChange={(e) =>
              setForm({ ...form, bankName: e.target.value })
            }
          />
          <Input
            placeholder="Account number"
            value={form.bankAccount}
            onChange={(e) =>
              setForm({ ...form, bankAccount: e.target.value })
            }
          />
          <Input
            placeholder="IFSC code"
            value={form.ifsc}
            onChange={(e) =>
              setForm({ ...form, ifsc: e.target.value })
            }
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save Changes"}
        </Button>

        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success"
              ? "text-emerald-700"
              : "text-destructive"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
