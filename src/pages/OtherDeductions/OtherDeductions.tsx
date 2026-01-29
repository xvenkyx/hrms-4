import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ===========================
   TYPES
=========================== */

type Employee = {
  EmployeeID: string;
  name: string;
  department: string;
};

type DeductionRow = {
  type: string;
  amount: number;
};

type Entry = {
  employeeID: string;
  employeeName: string;
  deductions: DeductionRow[];
};

export default function OtherDeductions() {
  const [month, setMonth] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [existing, setExisting] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [deductionType, setDeductionType] = useState("");
  const [deductionAmount, setDeductionAmount] = useState<number | "">("");

  const [entries, setEntries] = useState<Entry[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  /* ===========================
     LOAD EMPLOYEES (ONCE)
  =========================== */

  useEffect(() => {
    api.get("/admin/employees").then((res) => {
      setEmployees(res.data || []);
    });
  }, []);

  /* ===========================
     LOAD EXISTING DEDUCTIONS
  =========================== */

  useEffect(() => {
    if (!month) {
      setExisting([]);
      return;
    }

    api
      .get("/performance/deductions", { params: { month } })
      .then((res) => {
        setExisting(res.data || []);
      });
  }, [month]);

  /* ===========================
     DERIVED DATA
  =========================== */

  const alreadySavedIds = useMemo(
    () => new Set(existing.map((e) => e.EmployeeID)),
    [existing]
  );

  const filteredEmployees = useMemo(() => {
    if (!search) return [];

    const lower = search.toLowerCase();

    return employees.filter((e) => {
      const name = (e.name || "").toLowerCase();

      return (
        name.includes(lower) &&
        !entries.some((en) => en.employeeID === e.EmployeeID) &&
        !alreadySavedIds.has(e.EmployeeID)
      );
    });
  }, [search, employees, entries, alreadySavedIds]);

  /* ===========================
     ADD DEDUCTION ROW
  =========================== */

  const addDeductionRow = () => {
    if (
      !selectedEmployee ||
      !deductionType ||
      deductionAmount === ""
    )
      return;

    setEntries((prev) => {
      const existingEntry = prev.find(
        (e) => e.employeeID === selectedEmployee.EmployeeID
      );

      if (existingEntry) {
        return prev.map((e) =>
          e.employeeID === selectedEmployee.EmployeeID
            ? {
                ...e,
                deductions: [
                  ...e.deductions,
                  {
                    type: deductionType,
                    amount: Number(deductionAmount),
                  },
                ],
              }
            : e
        );
      }

      return [
        ...prev,
        {
          employeeID: selectedEmployee.EmployeeID,
          employeeName: selectedEmployee.name,
          deductions: [
            {
              type: deductionType,
              amount: Number(deductionAmount),
            },
          ],
        },
      ];
    });

    setDeductionType("");
    setDeductionAmount("");
  };

  const removeEmployeeEntry = (employeeID: string) => {
    setEntries((prev) => prev.filter((e) => e.employeeID !== employeeID));
  };

  const removeDeductionRow = (employeeID: string, index: number) => {
    setEntries((prev) =>
      prev
        .map((e) =>
          e.employeeID === employeeID
            ? {
                ...e,
                deductions: e.deductions.filter((_, i) => i !== index),
              }
            : e
        )
        .filter((e) => e.deductions.length > 0)
    );
  };

  /* ===========================
     SAVE ALL
  =========================== */

  const saveAll = async () => {
    if (!month || entries.length === 0) return;

    setSaving(true);
    try {
      for (const e of entries) {
        await api.post("/performance/deductions", {
          employeeID: e.employeeID,
          month,
          deductions: e.deductions,
        });
      }

      setEntries([]);
      const res = await api.get("/performance/deductions", {
        params: { month },
      });
      setExisting(res.data || []);
    } finally {
      setSaving(false);
    }
  };

  /* ===========================
     UI
  =========================== */

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Other Deductions</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="month"
            className="w-56"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* ===== Add Entries ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Add Deductions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Employee Search */}
          <div className="relative w-96">
            <Input
              placeholder="Search employee by name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedEmployee(null);
                setShowDropdown(true);
              }}
              disabled={!month}
            />

            {showDropdown && filteredEmployees.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-background border rounded shadow">
                {filteredEmployees.slice(0, 5).map((e) => (
                  <div
                    key={e.EmployeeID}
                    className="px-3 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setSelectedEmployee(e);
                      setSearch(e.name);
                      setShowDropdown(false);
                    }}
                  >
                    <div className="text-sm font-medium">{e.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {e.department}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deduction Inputs */}
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Deduction type (e.g. Loan EMI)"
              className="w-64"
              value={deductionType}
              onChange={(e) => setDeductionType(e.target.value)}
              disabled={!selectedEmployee}
            />

            <Input
              type="number"
              placeholder="Amount"
              className="w-40"
              value={deductionAmount}
              onChange={(e) =>
                setDeductionAmount(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              disabled={!selectedEmployee}
            />

            <Button
              onClick={addDeductionRow}
              disabled={
                !selectedEmployee ||
                !deductionType ||
                deductionAmount === ""
              }
            >
              Add
            </Button>
          </div>

          {/* Pending Entries */}
          {entries.length > 0 && (
            <div className="border rounded space-y-4 p-3">
              {entries.map((e) => (
                <div key={e.employeeID} className="border rounded">
                  <div className="flex justify-between items-center p-2 bg-muted">
                    <div className="font-medium">{e.employeeName}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmployeeEntry(e.employeeID)}
                    >
                      Remove Employee
                    </Button>
                  </div>

                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm">
                        <th className="p-2">Type</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {e.deductions.map((d, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{d.type}</td>
                          <td className="p-2">
                            ₹{d.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeDeductionRow(e.employeeID, i)
                              }
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={saveAll}
            disabled={!month || entries.length === 0 || saving}
          >
            Save All
          </Button>
        </CardContent>
      </Card>

      {/* ===== Existing Deductions ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Deductions {month && `(${month})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {existing.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No deductions saved for this month.
            </div>
          ) : (
            <table className="w-full border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Employee</th>
                  <th className="p-2 text-left">Total Deduction</th>
                </tr>
              </thead>
              <tbody>
                {existing.map((e) => (
                  <tr key={e.EmployeeID} className="border-t">
                    <td className="p-2">{e.EmployeeID}</td>
                    <td className="p-2">
                      ₹{Number(e.TotalDeduction).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
