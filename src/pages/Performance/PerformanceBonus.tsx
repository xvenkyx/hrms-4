import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Employee = {
  EmployeeID: string;
  name: string;
  department: string;
};

type BonusEntry = {
  employeeID: string;
  employeeName: string;
  bonusAmount: number;
};

export default function PerformanceBonus() {
  const [month, setMonth] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [existingBonuses, setExistingBonuses] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [amount, setAmount] = useState<number | "">("");

  const [entries, setEntries] = useState<BonusEntry[]>([]);
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
     LOAD EXISTING BONUSES (MONTH)
  =========================== */

  useEffect(() => {
    if (!month) {
      setExistingBonuses([]);
      return;
    }

    api.get("/performance/bonus", { params: { month } }).then((res) => {
      setExistingBonuses(res.data || []);
    });
  }, [month]);

  /* ===========================
     DERIVED DATA
  =========================== */

  const alreadySavedIds = useMemo(
    () => new Set(existingBonuses.map((b) => b.EmployeeID)),
    [existingBonuses]
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
     ADD ENTRY
  =========================== */

  const addEntry = () => {
    if (!selectedEmployee || amount === "") return;

    setEntries((prev) => [
      ...prev,
      {
        employeeID: selectedEmployee.EmployeeID,
        employeeName: selectedEmployee.name,
        bonusAmount: Number(amount),
      },
    ]);

    setSelectedEmployee(null);
    setSearch("");
    setAmount("");
  };

  const removeEntry = (employeeID: string) => {
    setEntries((prev) => prev.filter((e) => e.employeeID !== employeeID));
  };

  /* ===========================
     SAVE ALL
  =========================== */

  const saveAll = async () => {
    if (!month || entries.length === 0) return;

    setSaving(true);
    try {
      for (const e of entries) {
        await api.post("/performance/bonus", {
          employeeID: e.employeeID,
          month,
          bonusAmount: e.bonusAmount,
        });
      }

      setEntries([]);
      const res = await api.get("/performance/bonus", {
        params: { month },
      });
      setExistingBonuses(res.data || []);
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
          <CardTitle>Performance Bonus</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
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
          <CardTitle>Add Bonus Entries</CardTitle>
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
                setShowDropdown(true)
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
                      setShowDropdown(false)
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

          {/* Bonus Input */}
          <div className="flex gap-3 items-center">
            <Input
              type="number"
              placeholder="Bonus amount"
              className="w-48"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={!selectedEmployee}
            />

            <Button
              onClick={addEntry}
              disabled={!selectedEmployee || amount === ""}
            >
              Add Entry
            </Button>
          </div>

          {/* Pending Entries */}
          {entries.length > 0 && (
            <div className="border rounded">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Employee</th>
                    <th className="p-2 text-left">Bonus</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.employeeID} className="border-t">
                      <td className="p-2">{e.employeeName}</td>
                      <td className="p-2">
                        ₹{e.bonusAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(e.employeeID)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* ===== Existing Bonuses ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Bonuses {month && `(${month})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {existingBonuses.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No bonuses saved for this month.
            </div>
          ) : (
            <table className="w-full border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Employee</th>
                  <th className="p-2 text-left">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {existingBonuses.map((b) => (
                  <tr key={b.EmployeeID} className="border-t">
                    <td className="p-2">{b.EmployeeID}</td>
                    <td className="p-2">
                      ₹{Number(b.BonusAmount).toLocaleString("en-IN")}
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
