import { useEffect, useState } from "react";
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
import { Calendar, Users, X } from "lucide-react";

export default function AdminSalaryGenerate() {
  const [month, setMonth] = useState("");

  // 🔑 employee resolution
  const [employees, setEmployees] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<any>(null);

  const [mode, setMode] =
    useState<"bulk" | "single">("bulk");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  /* ===========================
     LOAD EMPLOYEES (ONCE)
  =========================== */
  useEffect(() => {
    api
      .get("/admin/employees")
      .then((res) => setEmployees(res.data || []))
      .catch(() => setEmployees([]));
  }, []);

  /* ===========================
     FILTER BY PARTIAL CODE
  =========================== */
  const suggestions =
    query.length >= 2
      ? employees.filter((e) =>
          e.employeeCode
            ?.toLowerCase()
            .includes(query.toLowerCase())
        )
      : [];

  /* ===========================
     GENERATE SALARY
  =========================== */
  async function handleGenerate() {
    if (!month) {
      setMessage({
        type: "error",
        text: "Please select a month",
      });
      return;
    }

    if (mode === "single" && !selectedEmployee) {
      setMessage({
        type: "error",
        text: "Please select an employee",
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
        await api.post("/salary/generate", {
          employeeID: selectedEmployee.EmployeeID,
          month,
        });

        setMessage({
          type: "success",
          text: `Salary generated for ${selectedEmployee.name} (${month})`,
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

  /* ===========================
     CLEAR SELECTION
  =========================== */
  const clearEmployee = () => {
    setSelectedEmployee(null);
    setQuery("");
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
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
                Single Employee
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Employee picker */}
          {mode === "single" && (
            <div className="relative">
              {!selectedEmployee ? (
                <>
                  <Input
                    placeholder="Type employee code (e.g. 0178)"
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                  />

                  {suggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow">
                      {suggestions.map((e) => (
                        <div
                          key={e.EmployeeID}
                          className="cursor-pointer px-3 py-2 hover:bg-emerald-50"
                          onClick={() => {
                            setSelectedEmployee(e);
                            setQuery("");
                          }}
                        >
                          <div className="font-medium">
                            {e.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {e.employeeCode}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <div className="font-medium">
                      {selectedEmployee.name}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {selectedEmployee.employeeCode}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearEmployee}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action */}
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
  );
}
