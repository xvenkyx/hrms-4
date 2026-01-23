import { useState } from "react";
import { api } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEPARTMENTS = [
  "HR",
  "Sales",
  "Marketing",
  "Technical",
  "Admin",
  "Utility",
] as const;

const GENDERS = ["Male", "Female", "Other"] as const;

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    mobile: "+91",
    dob: "",
    gender: "",
    address: "",
    bankAcc: "",
    ifsc: "",
    pan: "",
    uan: "",
    department: "",
    designation: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) =>
    setForm({ ...form, [key]: value });

  /* ===========================
     VALIDATION
  =========================== */
  const validate = (): string | null => {
    if (!form.name) return "Name is required";

    if (!/^\+91\d{10}$/.test(form.mobile))
      return "Mobile number must be +91 followed by 10 digits";

    if (!form.dob) return "Date of birth is required";

    if (!form.gender) return "Please select gender";

    if (!form.department) return "Please select department";

    if (!/^\d{11}$/.test(form.bankAcc))
      return "Bank account number must be 11 digits";

    if (!/^[A-Z0-9]{10}$/i.test(form.pan))
      return "PAN must be exactly 10 characters";

    if (!/^\d{12}$/.test(form.uan)) return "UAN must be 12 digits";

    return null;
  };

  /* ===========================
     SUBMIT
  =========================== */
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.post("/profile/register", {
        ...form,
        bankAccount: {
          accountNumber: form.bankAcc,
          ifsc: form.ifsc,
        },
      });

      await api.get("/profile/me");

      window.location.href = "/";
    } catch (e: any) {
      setError(e?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Registration</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* NAME */}
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          {/* MOBILE */}
          <div>
            <Label>Mobile Number</Label>
            <Input
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
              placeholder="+91XXXXXXXXXX"
            />
          </div>

          {/* DOB */}
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={form.dob}
              onChange={(e) => update("dob", e.target.value)}
            />
          </div>

          {/* GENDER */}
          <div>
            <Label>Gender</Label>
            <Select
              value={form.gender}
              onValueChange={(v) => update("gender", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ADDRESS */}
          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          {/* BANK */}
          <div>
            <Label>Bank Account Number</Label>
            <Input
              value={form.bankAcc}
              onChange={(e) => update("bankAcc", e.target.value)}
            />
          </div>

          <div>
            <Label>IFSC Code</Label>
            <Input
              value={form.ifsc}
              onChange={(e) => update("ifsc", e.target.value)}
            />
          </div>

          {/* PAN / UAN */}
          <div>
            <Label>PAN</Label>
            <Input
              value={form.pan}
              onChange={(e) => update("pan", e.target.value.toUpperCase())}
            />
          </div>

          <div>
            <Label>UAN</Label>
            <Input
              value={form.uan}
              onChange={(e) => update("uan", e.target.value)}
            />
          </div>

          {/* DEPARTMENT */}
          <div>
            <Label>Department</Label>
            <Select
              value={form.department}
              onValueChange={(v) => update("department", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DESIGNATION */}
          <div>
            <Label>Designation</Label>
            <Input
              value={form.designation}
              onChange={(e) => update("designation", e.target.value)}
            />
          </div>

          {/* ERROR */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* ACTION */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800"
          >
            {loading ? "Submitting…" : "Complete Registration"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
