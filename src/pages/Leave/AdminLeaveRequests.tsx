import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardCheck } from "lucide-react";

export default function AdminLeaveRequests() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  /* ===========================
     STATUS BADGE
  =========================== */
  const statusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            Approved
          </span>
        );
      case "REJECTED":
      case "REJECTED_TL":
        return (
          <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            Rejected
          </span>
        );
      case "PENDING_HR":
        return (
          <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            Pending HR
          </span>
        );
      case "PENDING_TL":
        return (
          <span className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
            Pending TL
          </span>
        );
      default:
        return null;
    }
  };

  /* ===========================
     DATE RANGE
  =========================== */
  const formatDate = (d?: string) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (l: any) => {
    if (l.startDate && l.endDate) {
      return `${formatDate(l.startDate)} → ${formatDate(l.endDate)}`;
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
                  <TableHead className="hidden md:table-cell">CPL</TableHead>
                  <TableHead className="hidden md:table-cell">SL</TableHead>
                  <TableHead className="hidden md:table-cell">LOP</TableHead>

                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
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

                    const employeeName =
                      l.EmployeeName || l.employeeName || "—";

                    const employeeCode =
                      l.employeeCode || l.EmployeeCode || l.EmployeeID;

                    return (
                      <TableRow key={l.LeaveID}>
                        {/* Employee */}
                        <TableCell>
                          <div className="font-medium">{employeeName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {employeeCode}
                          </div>
                        </TableCell>

                        {/* Date Range */}
                        <TableCell className="whitespace-nowrap">
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
                        <TableCell className="max-w-[260px]">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {l.reason || "—"}
                          </p>
                        </TableCell>

                        {/* Status */}
                        <TableCell>{statusBadge(l.status)}</TableCell>

                        {/* Action */}
                        <TableCell className="text-right">
                          {l.status === "PENDING_HR" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/admin/leave/${l.LeaveID}`)
                              }
                            >
                              Review
                            </Button>
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
