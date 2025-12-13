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
            <span className="text-muted-foreground">
              Employee ID
            </span>
            <div className="font-mono">
              {employee.EmployeeID}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">
              Name
            </span>
            <div>{employee.name}</div>
          </div>
          <div>
            <span className="text-muted-foreground">
              Department
            </span>
            <div>{employee.department}</div>
          </div>
          <div>
            <span className="text-muted-foreground">
              Designation
            </span>
            <div>{employee.designation}</div>
          </div>
        </CardContent>
      </Card>

      {/* Salary & PF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Salary Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Base Salary
            </label>
            <Input
              type="number"
              value={form.baseSalary}
              onChange={(e) =>
                setForm({
                  ...form,
                  baseSalary: Number(e.target.value),
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
            <span className="text-sm">
              PF applicable
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Bank details */}
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
              setForm({
                ...form,
                bankAccount: e.target.value,
              })
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

        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>

      {/* Message */}
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
