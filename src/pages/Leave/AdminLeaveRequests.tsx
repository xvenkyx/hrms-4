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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardCheck } from "lucide-react";

export default function AdminLeaveRequests() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leave/admin/history");
      setLeaves(res.data || []);
    } catch (e) {
      console.error("Failed to load admin leave history", e);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const act = async (
    LeaveID: string,
    action: "APPROVE" | "REJECT"
  ) => {
    setActing(LeaveID);
    try {
      await api.post("/leave/approve", {
        LeaveID,
        action,
      });
      await load();
    } catch (e) {
      console.error("Leave action failed", e);
    } finally {
      setActing(null);
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
          Leave Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and take action on employee leave requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4 text-emerald-600" />
            Pending & Processed Requests
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Total</TableHead>

                  {/* Desktop only */}
                  <TableHead className="hidden md:table-cell">
                    CPL
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    SL
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    LOP
                  </TableHead>

                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading && leaves.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No leave requests found
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  leaves.map((l) => {
                    const breakup = l.breakup || {};

                    return (
                      <TableRow key={l.LeaveID}>
                        {/* Employee */}
                        <TableCell className="font-medium">
                          {l.EmployeeName ||
                            l.employeeName ||
                            l.EmployeeID}
                        </TableCell>

                        {/* Date Range */}
                        <TableCell className="whitespace-nowrap">
                          {formatDateRange(l)}
                        </TableCell>

                        {/* Total */}
                        <TableCell>
                          {l.totalDays ??
                            l.requestedDays ??
                            "—"}
                        </TableCell>

                        {/* Desktop breakup */}
                        <TableCell className="hidden md:table-cell">
                          {breakup.CPL ?? "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {breakup.SL ?? "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {breakup.LOP ??
                            l.lopDays ??
                            "—"}
                        </TableCell>

                        {/* Reason */}
                        <TableCell className="max-w-[260px]">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {l.reason || "—"}
                          </p>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {statusBadge(l.status)}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-right space-x-2">
                          {l.status === "PENDING" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={acting === l.LeaveID}
                                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                                onClick={() =>
                                  act(l.LeaveID, "APPROVE")
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={acting === l.LeaveID}
                                className="border-red-600 text-red-700 hover:bg-red-50"
                                onClick={() =>
                                  act(l.LeaveID, "REJECT")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
