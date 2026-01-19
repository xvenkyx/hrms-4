import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TeamLeadLeaveReview() {
  const { leaveId } = useParams();
  const navigate = useNavigate();

  const [leave, setLeave] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    api.get("/leave/tl/pending").then((res) => {
      const l = res.data.find((x: any) => x.LeaveID === leaveId);
      setLeave(l);
      setLoading(false);
    });
  }, [leaveId]);

  const approve = async () => {
    try {
      setSubmitting(true);
      await api.post("/leave/approve-tl", {
        LeaveID: leave.LeaveID,
        action: "APPROVE",
      });

      setSuccessMessage("Leave forwarded to HR for final approval");
      setTimeout(() => navigate("/tl/leave"), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    try {
      setSubmitting(true);
      await api.post("/leave/approve-tl", {
        LeaveID: leave.LeaveID,
        action: "REJECT",
      });

      setSuccessMessage("Leave request rejected");
      setTimeout(() => navigate("/tl/leave"), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !leave) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold">
        Review Leave
      </h1>

      {successMessage && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Employee:</span> {leave.employeeName}
          </div>
          <div>
            <span className="font-medium">Dates:</span> {leave.startDate} → {leave.endDate}
          </div>
          <div>
            <span className="font-medium">Total Days:</span> {leave.totalDays}
          </div>
          <div>
            <span className="font-medium">Reason:</span> {leave.reason}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="bg-emerald-700 hover:bg-emerald-800 w-full sm:w-auto"
          onClick={approve}
          disabled={submitting}
        >
          {submitting ? "Approving..." : "Approve"}
        </Button>

        <Button
          variant="outline"
          onClick={reject}
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          {submitting ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
