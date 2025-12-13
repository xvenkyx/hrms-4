import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  useAuth();

  const [form, setForm] = useState({
    name: "",
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

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    await api.post("/profile/register", form);
    alert("Registration completed!");
    window.location.href = "/";
  };

  return (
    <div className="max-w-lg mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-semibold">Complete Registration</h1>

      {Object.keys(form).map((key) => (
        <Input
          key={key}
          name={key}
          placeholder={key}
          value={(form as any)[key]}
          onChange={handleChange}
        />
      ))}

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
