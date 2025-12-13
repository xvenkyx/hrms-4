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

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ===========================
     SAVE PROFILE
  =========================== */
  const saveProfile = async () => {
    setSaving(true);

    try {
      await api.post("/profile/register", {
        ...form,
        bankAccount: {
          bankName: form.bankName,
          accountNumber: form.bankAcc,
          ifsc: form.ifsc,
        },
      });

      alert("Profile updated successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }

    setSaving(false);
  };

  if (!employee) return null;

  const bank = employee.bankAccount || {};

  /* ===========================
     HELPERS
  =========================== */
  const view = (label: string, value: any) => (
    <div className="space-y-1">
      <Label className="text-gray-600 text-sm">{label}</Label>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );

  const edit = (label: string, key: string, type = "text") => (
    <div className="flex flex-col space-y-1">
      <Label className="text-gray-600 text-sm">{label}</Label>
      <Input
        name={key}
        type={type}
        value={form[key] || ""}
        onChange={handleChange}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-10 h-10 text-blue-600" />
            <CardTitle className="text-2xl">Employee Profile</CardTitle>
          </div>

          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={saveProfile} disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <h2 className="font-semibold text-lg text-blue-700">
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
                {edit("DOB (DDMMYYYY)", "dob")}
                {edit("Gender", "gender")}
                {edit("Address", "address")}
              </>
            )}

            <Separator />

            <h2 className="font-semibold text-lg text-blue-700">
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

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <h2 className="font-semibold text-lg text-blue-700">
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

            <h2 className="font-semibold text-lg text-blue-700">
              System Info
            </h2>

            {view("Employee ID", employee.employeeID || employee.EmployeeID)}
            {view("Created At", employee.createdAt)}
            {view("Updated At", employee.updatedAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
