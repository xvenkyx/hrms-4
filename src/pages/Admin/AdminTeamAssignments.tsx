import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminTeamAssignments() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [allAssignedIds, setAllAssignedIds] = useState<Set<string>>(new Set());

  const [teamLeadId, setTeamLeadId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------
     INITIAL LOAD
  ----------------------------- */
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      const empRes = await api.get("/admin/employees");
      const emps = empRes.data || [];
      setEmployees(emps);

      // 🔑 Collect all active assignments once
      const assignedIds = new Set<string>();

      for (const emp of emps) {
        const res = await api.get(
          `/admin/team-assignments?teamLeadId=${emp.EmployeeID}`
        );
        (res.data || []).forEach((a: any) =>
          assignedIds.add(a.EmployeeID)
        );
      }

      setAllAssignedIds(assignedIds);
    } finally {
      setLoading(false);
    }
  }

  async function loadAssignments(tlId: string) {
    const res = await api.get(
      `/admin/team-assignments?teamLeadId=${tlId}`
    );
    setAssigned(res.data || []);
  }

  /* ----------------------------
     REMOVE FROM TEAM
  ----------------------------- */
  async function removeAssignedEmployee(employeeId: string) {
    await api.delete("/admin/team-assignments", {
      data: { employeeId, teamLeadId },
    });

    await loadAssignments(teamLeadId);
    await loadInitialData();
  }

  /* ----------------------------
     SEARCH + SELECT
  ----------------------------- */
  function addEmployee(emp: any) {
    setSelectedEmployees((prev) => [...prev, emp]);
    setSearch("");
  }

  function removeSelected(empId: string) {
    setSelectedEmployees((prev) =>
      prev.filter((e) => e.EmployeeID !== empId)
    );
  }

  /* ----------------------------
     SUBMIT ASSIGNMENTS
  ----------------------------- */
  async function submitAssignments() {
    try {
      setSaving(true);
      setError(null);

      for (const emp of selectedEmployees) {
        await api.post("/admin/team-assignments", {
          employeeId: emp.EmployeeID,
          teamLeadId,
        });
      }

      setSelectedEmployees([]);
      await loadAssignments(teamLeadId);
      await loadInitialData();
    } catch (e: any) {
      setError(
        e.response?.data?.error ||
          "Failed to assign employees"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  /* ----------------------------
     TEAM LEAD ELIGIBILITY RULE
  ----------------------------- */
  const eligibleTeamLeads = employees.filter(
    (e) => !allAssignedIds.has(e.EmployeeID)
  );

  /* ----------------------------
     AVAILABLE EMPLOYEES
  ----------------------------- */
  const availableEmployees = employees.filter(
    (e) =>
      e.EmployeeID !== teamLeadId &&
      !assigned.some((a) => a.EmployeeID === e.EmployeeID) &&
      !selectedEmployees.some(
        (s) => s.EmployeeID === e.EmployeeID
      ) &&
      (e.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
        e.department
          ?.toLowerCase()
          .includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Team Assignments
      </h1>

      {/* TEAM LEAD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Select Team Lead
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full max-w-sm rounded-md border px-3 py-2"
            value={teamLeadId}
            onChange={(e) => {
              setTeamLeadId(e.target.value);
              setSelectedEmployees([]);
              loadAssignments(e.target.value);
            }}
          >
            <option value="">Choose team lead</option>
            {eligibleTeamLeads.map((e) => (
              <option
                key={e.EmployeeID}
                value={e.EmployeeID}
              >
                {e.name} — {e.department}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {teamLeadId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Employees under Team Lead
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {assigned.map((e) => (
                  <TableRow key={e.EmployeeID}>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.department}</TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          removeAssignedEmployee(e.EmployeeID)
                        }
                        className="text-muted-foreground hover:text-red-500"
                        title="Remove from team"
                      >
                        ✕
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <label className="text-sm font-medium">
              Search employees to add
            </label>

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type name or department"
              className="max-w-sm"
            />

            {search && (
              <div className="rounded-md border">
                {availableEmployees.map((e) => (
                  <div
                    key={e.EmployeeID}
                    onClick={() => addEmployee(e)}
                    className="cursor-pointer px-3 py-2 hover:bg-muted"
                  >
                    {e.name} — {e.department}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {selectedEmployees.map((e) => (
                <div
                  key={e.EmployeeID}
                  className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {e.name}
                  <button
                    onClick={() =>
                      removeSelected(e.EmployeeID)
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <Button
              disabled={!selectedEmployees.length || saving}
              onClick={submitAssignments}
            >
              Assign {selectedEmployees.length} Employees
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
