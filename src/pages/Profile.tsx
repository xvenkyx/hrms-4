import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { User, Pencil, Save, X } from "lucide-react";

export default function Profile() {
  const { employee } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState<any>({});

  /* ===========================
     INIT FORM FROM EMPLOYEE
  =========================== */
  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || "",
        dob: employee.dob || "",
        gender: employee.gender || "",
        address: employee.address || "",

        bankName: employee.bankAccount?.bankName || "",
        bankAcc: employee.bankAccount?.accountNumber || "",
        ifsc: employee.bankAccount?.ifsc || "",

        pan: employee.pan || "",
        uan: employee.uan || "",
        department: employee.department || "",
        designation: employee.designation || "",
      });
    }
  }, [employee]);

  if (!employee) return null;

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ===========================
     DATE FORMATTER
  =========================== */
  const formatDateTime = (value?: string) => {
    if (!value) return "—";

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ===========================
     SAVE PROFILE
  =========================== */
  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await api.post("/profile/register", {
        ...form,
        bankAccount: {
          bankName: form.bankName,
          accountNumber: form.bankAcc,
          ifsc: form.ifsc,
        },
      });

      setMessage({
        type: "success",
        text: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Profile update failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const bank = employee.bankAccount || {};

  /* ===========================
     HELPERS
  =========================== */
  const view = (label: string, value: any) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">
        {label}
      </Label>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );

  const edit = (label: string, key: string, type = "text") => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        name={key}
        type={type}
        value={form[key] || ""}
        onChange={handleChange}
      />
    </div>
  );

  const employeeCode =
    employee.employeeCode ||
    employee.employeeID ||
    employee.EmployeeID;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-emerald-700" />
            <CardTitle className="text-2xl">
              Employee Profile
            </CardTitle>
          </div>

          {!isEditing ? (
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(true);
                setMessage(null);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setMessage(null);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-6">
            <h2 className="font-semibold text-lg text-emerald-700">
              Personal Details
            </h2>

            {!isEditing ? (
              <>
                {view("Name", employee.name)}
                {view("Email", employee.email)}
                {view("DOB", employee.dob)}
                {view("Gender", employee.gender)}
                {view("Address", employee.address)}
              </>
            ) : (
              <>
                {edit("Name", "name")}
                {edit("DOB", "dob")}
                {edit("Gender", "gender")}
                {edit("Address", "address")}
              </>
            )}

            <Separator />

            <h2 className="font-semibold text-lg text-emerald-700">
              Employment
            </h2>

            {!isEditing ? (
              <>
                {view("Department", employee.department)}
                {view("Designation", employee.designation)}
              </>
            ) : (
              <>
                {edit("Department", "department")}
                {edit("Designation", "designation")}
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <h2 className="font-semibold text-lg text-emerald-700">
              Banking Info
            </h2>

            {!isEditing ? (
              <>
                {view("Bank Name", bank.bankName)}
                {view("Account Number", bank.accountNumber)}
                {view("IFSC", bank.ifsc)}
                {view("PAN", employee.pan)}
                {view("UAN", employee.uan)}
              </>
            ) : (
              <>
                {edit("Bank Name", "bankName")}
                {edit("Account Number", "bankAcc")}
                {edit("IFSC", "ifsc")}
                {edit("PAN", "pan")}
                {edit("UAN", "uan")}
              </>
            )}

            <Separator />

            <h2 className="font-semibold text-lg text-emerald-700">
              System Info
            </h2>

            {view("Employee Code", employeeCode)}
            {view(
              "Created At",
              formatDateTime(employee.createdAt)
            )}
            {view(
              "Updated At",
              formatDateTime(employee.updatedAt)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status message */}
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
