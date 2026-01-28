import { useEffect, useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardCheck, Eye, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminLeaveRequests() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leave/admin/history");
      const leavesData = res.data || [];
      
      // Sort leaves based on hierarchical order
      const sortedLeaves = sortLeavesByStatusHierarchy(leavesData);
      setLeaves(sortedLeaves);
    } catch (e) {
      console.error("Failed to load admin leave history", e);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     SORT LEAVES BY STATUS HIERARCHY
  =========================== */
  const sortLeavesByStatusHierarchy = (leavesData: any[]) => {
    const statusPriority: Record<string, number> = {
      "PENDING_HR": 3,
      "PENDING_TL": 2,
      "APPROVED": 1,
      "REJECTED": 0,
      "REJECTED_TL": 0,
    };

    return [...leavesData].sort((a, b) => {
      const priorityA = statusPriority[a.status] || 0;
      const priorityB = statusPriority[b.status] || 0;
      return priorityB - priorityA;
    });
  };

  /* ===========================
     FILTERED LEAVES
  =========================== */
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      // Filter by status
      if (statusFilter !== "ALL" && leave.status !== statusFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const employeeName = (leave.employeeName || leave.EmployeeName || "").toLowerCase();
        const employeeCode = (leave.employeeCode || leave.EmployeeCode || leave.EmployeeID || "").toLowerCase();
        
        return employeeName.includes(query) || employeeCode.includes(query);
      }

      return true;
    });
  }, [leaves, searchQuery, statusFilter]);

  /* ===========================
     STATUS BADGE
  =========================== */
  const statusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Approved
          </Badge>
        );
      case "REJECTED":
      case "REJECTED_TL":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        );
      case "PENDING_HR":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pending HR
          </Badge>
        );
      case "PENDING_TL":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending TL
          </Badge>
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

  const handleLeaveClick = (leaveId: string) => {
    navigate(`/admin/leave/${leaveId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const hasActiveFilters = searchQuery.trim() || statusFilter !== "ALL";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leave Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and take action on employee leave requests
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING_HR">Pending HR</SelectItem>
                    <SelectItem value="PENDING_TL">Pending TL</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="REJECTED_TL">Rejected by TL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing <span className="font-medium">{filteredLeaves.length}</span> of{" "}
                <span className="font-medium">{leaves.length}</span> requests
                {hasActiveFilters && (
                  <span className="ml-2">
                    (filtered)
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-emerald-600" />
              Pending & Processed Requests
            </div>
            {filteredLeaves.length === 0 && !loading && (
              <span className="text-sm font-normal text-muted-foreground">
                No matching results
              </span>
            )}
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

                {!loading && filteredLeaves.length === 0 && leaves.length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center"
                    >
                      <div className="space-y-2">
                        <Search className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          No leave requests match your search criteria
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="mt-2"
                        >
                          Clear filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && filteredLeaves.length === 0 && leaves.length === 0 && (
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
                  filteredLeaves.map((l) => {
                    const breakup = l.breakup || {};
                    const employeeName = l.EmployeeName || l.employeeName || "—";
                    const employeeCode = l.employeeCode || l.EmployeeCode || l.EmployeeID;

                    // Highlight search matches
                    const highlightText = (text: string) => {
                      if (!searchQuery.trim() || !text) return text;
                      
                      const lowerText = text.toLowerCase();
                      const lowerQuery = searchQuery.toLowerCase();
                      const index = lowerText.indexOf(lowerQuery);
                      
                      if (index === -1) return text;
                      
                      const before = text.substring(0, index);
                      const match = text.substring(index, index + searchQuery.length);
                      const after = text.substring(index + searchQuery.length);
                      
                      return (
                        <>
                          {before}
                          <mark className="bg-yellow-100 font-medium">{match}</mark>
                          {after}
                        </>
                      );
                    };

                    return (
                      <TableRow key={l.LeaveID}>
                        {/* Employee */}
                        <TableCell>
                          <div className="font-medium">
                            {highlightText(employeeName)}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {highlightText(employeeCode)}
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
                          <div className="flex justify-end gap-2">
                            {l.status === "PENDING_HR" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLeaveClick(l.LeaveID)}
                              >
                                Review
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleLeaveClick(l.LeaveID)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Edit
                              </Button>
                            )}
                          </div>
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