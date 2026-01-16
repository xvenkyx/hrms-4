import { useState, useEffect } from "react";
import { api } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import { Calendar, ClipboardList } from "lucide-react";

export default function EmployeeLeave() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [balance, setBalance] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/leave/me/balance")
      .then((res) => setBalance(res.data))
      .finally(() => setLoadingBalance(false));
  }, []);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/leave/request", {
        startDate,
        endDate,
        reason,
        month: startDate.slice(0, 7),
      });

      setSuccess("Leave request submitted");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = startDate && endDate && reason.trim();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Apply Leave</h1>

      {/* Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Leave Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBalance ? (
            <Skeleton className="h-12" />
          ) : (
            <div className="grid grid-cols-2 text-sm">
              <div>Casual: {balance?.CPL ?? 0}</div>
              <div>Sick: {balance?.SL ?? 0}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            Leave Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <Textarea
            placeholder="Reason (mandatory)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </CardContent>
      </Card>

      <Button
        onClick={submit}
        disabled={!isValid || submitting}
        className="w-full bg-emerald-700 hover:bg-emerald-800"
      >
        {submitting ? "Submitting…" : "Submit Leave"}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}
    </div>
  );
}
