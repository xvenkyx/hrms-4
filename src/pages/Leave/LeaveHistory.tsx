import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

/* ---------------- Status Badge ---------------- */

function LeaveStatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; className: string }
  > = {
    PENDING_TL: {
      label: "Pending – TL",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    PENDING_HR: {
      label: "Pending – HR",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    APPROVED: {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    REJECTED_TL: {
      label: "Rejected – TL",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const config = map[status] || {
    label: status.replace("_", " "),
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${config.className}`}
    >
      {config.label}
    </span>
  );
}

/* ---------------- Main Component ---------------- */

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

  const formatDateRange = (l: any) => {
    if (l.startDate && l.endDate) {
      return `${l.startDate} → ${l.endDate}`;
    }
    return l.Month || "—";
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

        <CardContent className="p-0 overflow-x-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Date Range</TableHead>
                <TableHead>Total</TableHead>

                {/* Desktop only */}
                <TableHead className="hidden md:table-cell">Casual</TableHead>
                <TableHead className="hidden md:table-cell">Sick</TableHead>
                <TableHead className="hidden md:table-cell">LOP</TableHead>

                <TableHead>Reason</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading */}
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {/* Empty */}
              {!loading && leaves.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No leave requests found
                  </TableCell>
                </TableRow>
              )}

              {/* Data */}
              {!loading &&
                leaves.map((l) => {
                  const breakup = l.breakup || {};

                  return (
                    <TableRow key={l.LeaveID}>
                      {/* Date Range */}
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDateRange(l)}
                      </TableCell>

                      {/* Total */}
                      <TableCell>
                        {l.totalDays ?? l.requestedDays ?? "—"}
                      </TableCell>

                      {/* Desktop breakup */}
                      <TableCell className="hidden md:table-cell">
                        {breakup.CPL ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {breakup.SL ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {breakup.LOP ?? l.lopDays ?? "—"}
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="max-w-60">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {l.reason || "—"}
                        </p>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <LeaveStatusBadge status={l.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
