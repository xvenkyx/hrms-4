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
    await api.post("/leave/approve", {
      LeaveID: leave.LeaveID,
      action: "APPROVE",
      breakup: { CPL: cpl, SL: sl, LOP: lop },
    });
    navigate("/admin/leave");
  };

  const reject = async () => {
    await api.post("/leave/approve", {
      LeaveID: leave.LeaveID,
      action: "REJECT",
    });
    navigate("/admin/leave");
  };

  if (loading || !leave) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Review Leave</h1>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Allocate Leave</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <Input type="number" value={cpl} onChange={(e) => setCpl(+e.target.value)} />
          <Input type="number" value={sl} onChange={(e) => setSl(+e.target.value)} />
          <Input disabled value={lop} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="bg-emerald-700" onClick={approve}>
          Approve
        </Button>
        <Button variant="outline" onClick={reject}>
          Reject
        </Button>
      </div>
    </div>
  );
}
