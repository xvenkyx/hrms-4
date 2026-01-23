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
import { Calendar, Clock, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ---------------- Status Badge ---------------- */

function LeaveStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING_TL":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending TL
        </Badge>
      );
    case "PENDING_HR":
      return (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending HR
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    case "REJECTED_TL":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected by TL
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
  }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatDateRange = (l: any) => {
    if (l.startDate && l.endDate) {
      const start = formatDate(l.startDate);
      const end = formatDate(l.endDate);
      return `${start} – ${end}`;
    }
    return l.Month || "—";
  };

  // Sort leaves by date (newest first)
  const sortedLeaves = [...leaves].sort((a, b) => {
    return new Date(b.startDate || b.createdAt || 0).getTime() - 
           new Date(a.startDate || a.createdAt || 0).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Leave History
        </h1>
        <p className="text-sm text-muted-foreground">
          Track the status of all your leave requests
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leaves</p>
                <p className="text-2xl font-bold">{sortedLeaves.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {sortedLeaves.filter(l => l.status === "APPROVED").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {sortedLeaves.filter(l => ["PENDING_HR", "PENDING_TL"].includes(l.status)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Leave Records
            <Badge variant="secondary" className="ml-2">
              {sortedLeaves.length} records
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Date Range</TableHead>
                  <TableHead className="w-20 text-center">Days</TableHead>
                  <TableHead className="w-20 text-center">CPL</TableHead>
                  <TableHead className="w-20 text-center">SL</TableHead>
                  <TableHead className="w-20 text-center">LOP</TableHead>
                  <TableHead className="min-w-[200px]">Reason</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Loading */}
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    </TableRow>
                  ))}

                {/* Empty */}
                {!loading && sortedLeaves.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center"
                    >
                      <div className="space-y-3">
                        <Calendar className="h-12 w-12 mx-auto text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">No leave requests found</p>
                          <p className="text-sm text-gray-500 mt-1">Your leave history will appear here</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Data */}
                {!loading &&
                  sortedLeaves.map((l) => {
                    const breakup = l.breakup || {};
                    const totalDays = l.totalDays ?? l.requestedDays ?? 0;

                    return (
                      <TableRow key={l.LeaveID} className="hover:bg-gray-50">
                        {/* Date Range */}
                        <TableCell>
                          <div className="font-medium">
                            {formatDateRange(l)}
                          </div>
                          {l.startDate && l.endDate && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(l.startDate).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </div>
                          )}
                        </TableCell>

                        {/* Total Days */}
                        <TableCell>
                          <div className="text-center font-semibold">
                            {totalDays}
                          </div>
                          <div className="text-xs text-center text-muted-foreground">
                            days
                          </div>
                        </TableCell>

                        {/* CPL */}
                        <TableCell>
                          <div className={`text-center font-medium ${breakup.CPL > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                            {breakup.CPL ?? "0"}
                          </div>
                        </TableCell>

                        {/* SL */}
                        <TableCell>
                          <div className={`text-center font-medium ${breakup.SL > 0 ? "text-blue-600" : "text-gray-400"}`}>
                            {breakup.SL ?? "0"}
                          </div>
                        </TableCell>

                        {/* LOP */}
                        <TableCell>
                          <div className={`text-center font-medium ${breakup.LOP > 0 ? "text-amber-600" : "text-gray-400"}`}>
                            {breakup.LOP ?? "0"}
                          </div>
                        </TableCell>

                        {/* Reason */}
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm line-clamp-2 text-gray-700">
                                {l.reason || "No reason provided"}
                              </p>
                              {l.status === "APPROVED" && breakup && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Allocated: {breakup.CPL || 0} CPL • {breakup.SL || 0} SL • {breakup.LOP || 0} LOP
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <div className="flex items-center justify-start">
                            <LeaveStatusBadge status={l.status} />
                          </div>
                          {l.updatedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(l.updatedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short"
                              })}
                            </div>
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