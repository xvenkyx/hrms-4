import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/leave/me/history");
      setLeaves(res.data || []);
    } catch (e) {
      console.error("Failed to load leave history", e);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            Rejected
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Leave History
        </h1>
        <p className="text-sm text-muted-foreground">
          Track the status of your submitted leave requests
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Leave Records
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>LOP</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading && leaves.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No leave requests found
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  leaves.map((l) => (
                    <TableRow key={l.LeaveID}>
                      <TableCell className="font-medium">
                        {l.Month}
                      </TableCell>
                      <TableCell>{l.leaveType}</TableCell>
                      <TableCell>{l.requestedDays}</TableCell>
                      <TableCell>{l.lopDays || "—"}</TableCell>
                      <TableCell>
                        {statusBadge(l.status)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
