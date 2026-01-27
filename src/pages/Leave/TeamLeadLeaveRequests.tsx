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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardCheck, Eye, Search, X, Users } from "lucide-react";

export default function TeamLeadLeaveRequests() {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leave/tl/pending");
      setLeaves(res.data || []);
    } catch (e) {
      console.error("Failed to load TL leave requests", e);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves = useMemo(() => {
    if (!searchQuery.trim()) return leaves;
    
    const query = searchQuery.toLowerCase().trim();
    return leaves.filter(leave => {
      const employeeName = (leave.employeeName || "").toLowerCase();
      const employeeCode = (leave.employeeCode || "").toLowerCase();
      return employeeName.includes(query) || employeeCode.includes(query);
    });
  }, [leaves, searchQuery]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    if (!start || !end) return "—";
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // const hasActiveSearch = searchQuery.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Team Leave Approvals
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and approve leave requests from your team
          </p>
        </div>
        
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {leaves.length} Pending
        </Badge>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
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

            <div className="text-sm text-muted-foreground">
              Showing {filteredLeaves.length} of {leaves.length} requests
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-yellow-600" />
              Pending Team Requests
            </div>
            {filteredLeaves.length === 0 && !loading && (
              <span className="text-sm font-normal text-muted-foreground">
                No matching requests
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
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))}

                {!loading && filteredLeaves.length === 0 && leaves.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      <div className="space-y-2">
                        <Search className="h-6 w-6 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          No matching requests found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && filteredLeaves.length === 0 && leaves.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      <div className="space-y-3">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                        <div>
                          <p className="font-medium text-foreground">All caught up!</p>
                          <p className="text-sm text-muted-foreground">
                            No pending leave requests
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  filteredLeaves.map((leave) => (
                    <TableRow key={leave.LeaveID} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">
                          {leave.employeeName || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {leave.employeeCode || leave.EmployeeID || "—"}
                        </div>
                      </TableCell>

                      <TableCell>
                        {formatDateRange(leave.startDate, leave.endDate)}
                      </TableCell>

                      <TableCell className="font-medium">
                        {leave.totalDays} {leave.totalDays === 1 ? "day" : "days"}
                      </TableCell>

                      <TableCell className="max-w-[200px]">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {leave.reason || "—"}
                        </p>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/tl/leave/${leave.LeaveID}`)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Review
                        </Button>
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