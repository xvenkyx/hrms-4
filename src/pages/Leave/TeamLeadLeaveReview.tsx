import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  AlertCircle,
  Clock,
  FileText,
} from "lucide-react";

export default function TeamLeadLeaveReview() {
  const { leaveId } = useParams();
  const navigate = useNavigate();

  const [leave, setLeave] = useState<any>(null);
  const [balance, setBalance] = useState<{ CPL: number; SL: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First, get the specific leave from pending TL requests
        const pendingRes = await api.get("/leave/tl/pending");
        const leavesData = pendingRes.data || [];
        const currentLeave = leavesData.find((x: any) => x.LeaveID === leaveId);

        if (currentLeave) {
          setLeave(currentLeave);

          // Optimized: Try multiple sources for balance in order of preference
          // 1. First check if balance is already in the leave data
          if (currentLeave.employeeLeaveBalance) {
            setBalance(currentLeave.employeeLeaveBalance);
          }
          // 2. If not, check if admin history endpoint is accessible
          else {
            try {
              const adminRes = await api.get("/leave/admin/history");
              const allLeaves = adminRes.data || [];

              // Find this specific employee's leave record to extract balance
              const employeeLeaves = allLeaves.filter(
                (l: any) => l.EmployeeID === currentLeave.EmployeeID,
              );

              if (employeeLeaves.length > 0) {
                // Take the first record that has balance info
                const leaveWithBalance = employeeLeaves.find(
                  (l: any) => l.employeeLeaveBalance,
                );

                if (leaveWithBalance?.employeeLeaveBalance) {
                  setBalance(leaveWithBalance.employeeLeaveBalance);
                } else if (employeeLeaves[0]?.employeeLeaveBalance) {
                  setBalance(employeeLeaves[0].employeeLeaveBalance);
                } else {
                  // If no balance found in admin history, check if original leave has balance
                  if (currentLeave.leaveBalance) {
                    setBalance(currentLeave.leaveBalance);
                  }
                }
              }
            } catch (adminError) {
              console.warn("Admin history not accessible:", adminError);
              // Fallback to local balance if available
              if (currentLeave.leaveBalance) {
                setBalance(currentLeave.leaveBalance);
              }
            }
          }
        } else {
          // Leave not found in pending requests
          setErrorMessage("Leave request not found or already processed");
        }
      } catch (error: any) {
        console.error("Failed to fetch leave data:", error);
        setErrorMessage("Failed to load leave details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leaveId]);

  const approve = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      await api.post("/leave/approve-tl", {
        LeaveID: leave.LeaveID,
        action: "APPROVE",
      });

      setSuccessMessage("Leave forwarded to HR for final approval");
      setTimeout(() => navigate("/tl/leave"), 1500);
    } catch (error: any) {
      console.error("Failed to approve leave:", error);
      setErrorMessage("Failed to approve leave");
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this leave request?",
    );

    if (!confirmed) return;

    setSubmitting(true);
    setErrorMessage("");
    try {
      await api.post("/leave/approve-tl", {
        LeaveID: leave.LeaveID,
        action: "REJECT",
      });

      setSuccessMessage("Leave request rejected");
      setTimeout(() => navigate("/tl/leave"), 1500);
    } catch (error: any) {
      console.error("Failed to reject leave:", error);
      setErrorMessage("Failed to reject leave");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate if balance is sufficient
  const isBalanceSufficient = balance
    ? balance.CPL + balance.SL >= leave?.totalDays
    : false;

  // Calculate estimated LOP days
  const estimatedLOP =
    balance && leave
      ? Math.max(0, leave.totalDays - (balance.CPL + balance.SL))
      : 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tl/leave")}
            disabled
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tl/leave")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Leave Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This leave request could not be found or has been processed.
            </p>
            <Button onClick={() => navigate("/tl/leave")}>
              Return to Leave Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tl/leave")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Review Leave Request</h1>
        </div>
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Pending TL Approval
        </Badge>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="font-medium">{leave.employeeName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Employee Code
              </p>
              <p className="font-medium">
                {leave.employeeCode || leave.EmployeeID}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Leave Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Start Date
              </p>
              <p className="font-medium">{formatDate(leave.startDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                End Date
              </p>
              <p className="font-medium">{formatDate(leave.endDate)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Days
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-medium text-lg">{leave.totalDays} days</p>
              <Badge variant="outline" className="bg-gray-50">
                <Clock className="h-3 w-3 mr-1" />
                {leave.startDate === leave.endDate
                  ? "Single day"
                  : "Multiple days"}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reason
            </p>
            <div className="mt-1 p-3 bg-gray-50 rounded border">
              <p className="text-sm">{leave.reason || "No reason provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Leave Balance (View Only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employee Leave Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {balance ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-sm font-medium text-emerald-800 mb-1">
                    Casual Paid Leave
                  </p>
                  <p className="font-bold text-lg text-emerald-700">
                    {balance.CPL} days
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Sick Leave
                  </p>
                  <p className="font-bold text-lg text-blue-700">
                    {balance.SL} days
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Total Balance
                    </p>
                    <p className="font-bold text-lg">
                      {balance.CPL + balance.SL} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Requested
                    </p>
                    <p className="font-bold text-lg">{leave.totalDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Estimated LOP
                    </p>
                    <p
                      className={`font-bold text-lg ${estimatedLOP > 0 ? "text-amber-700" : "text-emerald-700"}`}
                    >
                      {estimatedLOP} days
                    </p>
                  </div>
                </div>
              </div>

              {!isBalanceSufficient && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 text-sm">
                    Employee may need {estimatedLOP} LOP days as balance is
                    insufficient.
                  </AlertDescription>
                </Alert>
              )}

              {isBalanceSufficient && (
                <Alert className="border-emerald-200 bg-emerald-50">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-700 text-sm">
                    Sufficient leave balance available.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Balance information not available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-700 text-sm">
              As Team Lead, you can approve or reject leave requests. Final
              allocation will be done by HR.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-emerald-700 hover:bg-emerald-800"
              onClick={approve}
              disabled={submitting}
              size="lg"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Approving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              onClick={reject}
              disabled={submitting}
              size="lg"
            >
              {submitting ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
