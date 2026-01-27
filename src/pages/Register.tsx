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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    // Clear field error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  /* ===========================
     FIELD VALIDATIONS
  =========================== */
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return null;
      
      case "mobile":
        if (!value) return "Mobile number is required";
        if (!/^\+91\d{10}$/.test(value)) 
          return "Mobile must be +91 followed by 10 digits";
        return null;
      
      case "dob":
        if (!value) return "Date of birth is required";
        // Additional date validation
        const dobDate = new Date(value);
        const today = new Date();
        if (dobDate >= today) return "Date of birth must be in the past";
        return null;
      
      case "gender":
        if (!value) return "Please select gender";
        return null;
      
      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 10) return "Address must be at least 10 characters";
        return null;
      
      case "bankAcc":
        if (!value) return "Bank account number is required";
        if (!/^\d{11}$/.test(value)) return "Bank account must be 11 digits";
        return null;
      
      case "ifsc":
        if (!value.trim()) return "IFSC code is required";
        return null;
      
      case "pan":
        if (!value.trim()) return "PAN is required";
        return null;
      
      case "uan":
        if (!value) return "UAN is required";
        if (!/^\d{12}$/.test(value)) return "UAN must be 12 digits";
        return null;
      
      case "department":
        if (!value) return "Please select department";
        return null;
      
      case "designation":
        if (!value.trim()) return "Designation is required";
        if (value.trim().length < 2) return "Designation must be at least 2 characters";
        return null;
      
      default:
        return null;
    }
  };

  /* ===========================
     VALIDATE ALL FIELDS
  =========================== */
  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate each field
    Object.entries(form).forEach(([key, value]) => {
      const error = validateField(key, value as string);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  /* ===========================
     ORIGINAL VALIDATION (KEPT AS IS)
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
    // First validate all fields (frontend validation)
    if (!validateAllFields()) {
      setError("Please fix all errors before submitting");
      return;
    }

    // Then run the original validation
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
          <p className="text-sm text-muted-foreground mt-2">
            All fields are required. Please fill in all the details below.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* NAME */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>Name</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter your full name"
              className={fieldErrors.name ? "border-destructive" : ""}
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* MOBILE */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>Mobile Number</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className={fieldErrors.mobile ? "border-destructive" : ""}
            />
            {fieldErrors.mobile && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.mobile}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>Date of Birth</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              type="date"
              value={form.dob}
              onChange={(e) => update("dob", e.target.value)}
              className={fieldErrors.dob ? "border-destructive" : ""}
            />
            {fieldErrors.dob && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.dob}</p>
            )}
          </div>

          {/* GENDER */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>Gender</Label>
              <span className="text-destructive">*</span>
            </div>
            <Select
              value={form.gender}
              onValueChange={(v) => update("gender", v)}
            >
              <SelectTrigger className={fieldErrors.gender ? "border-destructive" : ""}>
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
            {fieldErrors.gender && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.gender}</p>
            )}
          </div>

          {/* ADDRESS */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>Address</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Enter your complete address"
              className={fieldErrors.address ? "border-destructive" : ""}
            />
            {fieldErrors.address && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.address}</p>
            )}
          </div>

          {/* BANK ACCOUNT */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>Bank Account Number</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              value={form.bankAcc}
              onChange={(e) => update("bankAcc", e.target.value)}
              placeholder="11-digit account number"
              className={fieldErrors.bankAcc ? "border-destructive" : ""}
            />
            {fieldErrors.bankAcc && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.bankAcc}</p>
            )}
          </div>

          {/* IFSC */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>IFSC Code</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              value={form.ifsc}
              onChange={(e) => update("ifsc", e.target.value.toUpperCase())}
              placeholder="e.g., SBIN0001234"
              className={fieldErrors.ifsc ? "border-destructive" : ""}
            />
            {fieldErrors.ifsc && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.ifsc}</p>
            )}
          </div>

          {/* PAN */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>PAN</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              value={form.pan}
              onChange={(e) => update("pan", e.target.value.toUpperCase())}
              placeholder="10-character PAN"
              className={fieldErrors.pan ? "border-destructive" : ""}
            />
            {fieldErrors.pan && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.pan}</p>
            )}
          </div>

          {/* UAN */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>UAN</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              value={form.uan}
              onChange={(e) => update("uan", e.target.value)}
              placeholder="12-digit UAN number"
              className={fieldErrors.uan ? "border-destructive" : ""}
            />
            {fieldErrors.uan && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.uan}</p>
            )}
          </div>

          {/* DEPARTMENT */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>Department</Label>
              <span className="text-destructive">*</span>
            </div>
            <Select
              value={form.department}
              onValueChange={(v) => update("department", v)}
            >
              <SelectTrigger className={fieldErrors.department ? "border-destructive" : ""}>
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
            {fieldErrors.department && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.department}</p>
            )}
          </div>

          {/* DESIGNATION */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Label>Designation</Label>
              <span className="text-destructive">*</span>
            </div>
            <Input
              value={form.designation}
              onChange={(e) => update("designation", e.target.value)}
              placeholder="Enter your designation"
              className={fieldErrors.designation ? "border-destructive" : ""}
            />
            {fieldErrors.designation && (
              <p className="text-xs text-destructive mt-1">{fieldErrors.designation}</p>
            )}
          </div>

          {/* ERROR */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* ACTION */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 mt-6"
          >
            {loading ? "Submitting…" : "Complete Registration"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}