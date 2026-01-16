import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(true);

  const [teamLeadId, setTeamLeadId] = useState<string>("");
  const [assigned, setAssigned] = useState<any[]>([]);
  const [, setSaving] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const res = await api.get("/admin/employees");
      setEmployees(res.data || []);
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

  async function assignEmployee(employeeId: string) {
    setSaving(true);
    try {
      await api.post("/admin/team-assignments", {
        employeeId,
        teamLeadId,
      });
      await loadAssignments(teamLeadId);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const teamLeads = employees;

  const availableEmployees = employees.filter(
    (e) =>
      e.EmployeeID !== teamLeadId &&
      !assigned.some(
        (a) => a.EmployeeID === e.EmployeeID
      )
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Team Assignments
        </h1>
        <p className="text-sm text-muted-foreground">
          Define reporting structure for approvals
        </p>
      </div>

      {/* Select Team Lead */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Select Team Lead
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={teamLeadId}
            onValueChange={(v) => {
              setTeamLeadId(v);
              loadAssignments(v);
            }}
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Choose team lead" />
            </SelectTrigger>
            <SelectContent>
              {teamLeads.map((e) => (
                <SelectItem
                  key={e.EmployeeID}
                  value={e.EmployeeID}
                >
                  {e.name} — {e.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Assigned Employees */}
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
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {assigned.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No employees assigned
                    </TableCell>
                  </TableRow>
                )}

                {assigned.map((e) => (
                  <TableRow key={e.EmployeeID}>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.department}</TableCell>
                    <TableCell />
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Add Employee */}
            <Select
              onValueChange={(v) =>
                assignEmployee(v)
              }
            >
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Add employee to this team" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees.map((e) => (
                  <SelectItem
                    key={e.EmployeeID}
                    value={e.EmployeeID}
                  >
                    {e.name} — {e.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
