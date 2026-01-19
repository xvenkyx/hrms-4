import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLeaveReview() {
  const { leaveId } = useParams();
  const navigate = useNavigate();

  const [leave, setLeave] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [cpl, setCpl] = useState(0);
  const [sl, setSl] = useState(0);
  const [lop, setLop] = useState(0);

  useEffect(() => {
    api.get("/leave/admin/history").then((res) => {
      const l = res.data.find((x: any) => x.LeaveID === leaveId);
      setLeave(l);
      setLoading(false);
    });
  }, [leaveId]);

  useEffect(() => {
    if (!leave) return;
    const total = leave.totalDays;
    const remaining = total - (cpl + sl);
    setLop(remaining > 0 ? remaining : 0);
  }, [cpl, sl, leave]);

  const approve = async () => {
    try {
      setSubmitting(true);
      await api.post("/leave/approve", {
        LeaveID: leave.LeaveID,
        action: "APPROVE",
        breakup: { CPL: cpl, SL: sl, LOP: lop },
      });

      setSuccessMessage("Leave approved successfully");
      setTimeout(() => navigate("/admin/leave"), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    try {
      setSubmitting(true);
      await api.post("/leave/approve", {
        LeaveID: leave.LeaveID,
        action: "REJECT",
      });

      setSuccessMessage("Leave rejected successfully");
      setTimeout(() => navigate("/admin/leave"), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !leave) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold">Review Leave</h1>

      {successMessage && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Employee:</span> {leave.employeeName}
          </div>
          <div>
            <span className="font-medium">Dates:</span> {leave.startDate} →{" "}
            {leave.endDate}
          </div>
          <div>
            <span className="font-medium">Total Days:</span> {leave.totalDays}
          </div>
          <div>
            <span className="font-medium">Reason:</span> {leave.reason}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allocate Leave</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              CPL (Casual Paid Leave)
            </label>
            <Input
              type="number"
              value={cpl}
              onChange={(e) => setCpl(+e.target.value)}
              disabled={submitting}
              min={0}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              SL (Sick Leave)
            </label>
            <Input
              type="number"
              value={sl}
              onChange={(e) => setSl(+e.target.value)}
              disabled={submitting}
              min={0}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              LOP (Loss of Pay)
            </label>
            <Input disabled value={lop} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="bg-emerald-700 w-full sm:w-auto"
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
