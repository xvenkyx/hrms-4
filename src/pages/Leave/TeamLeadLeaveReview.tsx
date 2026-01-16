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

  useEffect(() => {
    api.get("/leave/tl/pending").then((res) => {
      const l = res.data.find((x: any) => x.LeaveID === leaveId);
      setLeave(l);
      setLoading(false);
    });
  }, [leaveId]);

  const approve = async () => {
    await api.post("/leave/approve-tl", {
      LeaveID: leave.LeaveID,
      action: "APPROVE",
    });
    navigate("/tl/leave");
  };

  const reject = async () => {
    await api.post("/leave/approve-tl", {
      LeaveID: leave.LeaveID,
      action: "REJECT",
    });
    navigate("/tl/leave");
  };

  if (loading || !leave) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Review Leave</h1>

      <Card>
        <CardHeader>
          <CardTitle>Leave Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>Employee: {leave.employeeName}</div>
          <div>
            Dates: {leave.startDate} → {leave.endDate}
          </div>
          <div>Total Days: {leave.totalDays}</div>
          <div>Reason: {leave.reason}</div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          className="bg-emerald-700 hover:bg-emerald-800"
          onClick={approve}
        >
          Approve
        </Button>
        <Button variant="outline" onClick={reject}>
          Reject
        </Button>
      </div>
    </div>
  );
}
