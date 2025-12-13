import { useState } from "react";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users } from "lucide-react";

export default function AdminSalaryGenerate() {
  const [month, setMonth] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [mode, setMode] = useState<"bulk" | "single">("bulk");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  async function handleGenerate() {
    if (!month) {
      setMessage({
        type: "error",
        text: "Please select a month",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === "bulk") {
        setMessage({
          type: "info",
          text:
            "Bulk salary generation is planned. Please use single employee generation for now.",
        });
      } else {
        if (!employeeId) {
          setMessage({
            type: "error",
            text: "Please enter an employee ID",
          });
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
            performanceBonus: 0,
          },
          deductions: {
            pfAmount: 0,
            professionalTax: 0,
            absentDeduction: 0,
          },
          pfNotApplicable: false,
        });

        setMessage({
          type: "success",
          text: `Salary generated for ${employeeId} (${month})`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.error ||
          "Salary generation failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Generate Salary
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate salary slips for employees
        </p>
      </div>

      {/* Month */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Select Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-emerald-600" />
            Generation Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={mode}
            onValueChange={(v) =>
              setMode(v as "bulk" | "single")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bulk">
                Bulk (All Employees)
              </SelectItem>
              <SelectItem value="single">
                Single Employee (Urgent)
              </SelectItem>
            </SelectContent>
          </Select>

          {mode === "single" && (
            <Input
              placeholder="Employee ID (e.g. emp-123)"
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(e.target.value)
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          {loading ? "Generating…" : "Generate Salary"}
        </Button>

        {message && (
          <p
            className={`text-sm ${
              message.type === "success"
                ? "text-emerald-700"
                : message.type === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
