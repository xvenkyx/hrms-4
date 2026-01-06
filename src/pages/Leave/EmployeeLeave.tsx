import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import { Calendar, ClipboardList } from "lucide-react";

export default function EmployeeLeave() {
  /* ===========================
     STATE
  =========================== */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [casual, setCasual] = useState(0);
  const [sick, setSick] = useState(0);
  const [lop, setLop] = useState(0);

  const [totalDays, setTotalDays] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const [balance, setBalance] = useState<any>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [existingLeaves, setExistingLeaves] = useState<any[]>([]);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /* ===========================
     LOAD BASE BALANCE
  =========================== */
  useEffect(() => {
    api.get("/leave/me/balance")
      .then(res => setBalance(res.data))
      .catch(() => setBalance(null))
      .finally(() => setBalanceLoading(false));
  }, []);

  /* ===========================
     LOAD EXISTING LEAVES
  =========================== */
  useEffect(() => {
    api.get("/leave/me/history")
      .then(res => setExistingLeaves(res.data || []))
      .catch(() => setExistingLeaves([]));
  }, []);

  /* ===========================
     CALCULATE TOTAL DAYS
  =========================== */
  useEffect(() => {
    if (!startDate || !endDate) {
      setTotalDays(null);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setTotalDays(null);
      return;
    }

    const days =
      Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

    setTotalDays(days);
  }, [startDate, endDate]);

  /* ===========================
     OVERLAP CHECK
  =========================== */
  useEffect(() => {
    if (!startDate || !endDate) {
      setOverlapError(null);
      return;
    }

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    for (const l of existingLeaves) {
      if (!["PENDING", "APPROVED"].includes(l.status)) continue;
      if (!l.startDate || !l.endDate) continue;

      const es = new Date(l.startDate);
      const ee = new Date(l.endDate);

      if (newStart <= ee && es <= newEnd) {
        setOverlapError(
          "You already have a leave overlapping these dates"
        );
        return;
      }
    }

    setOverlapError(null);
  }, [startDate, endDate, existingLeaves]);

  /* ===========================
     RESERVED + EFFECTIVE BALANCE
  =========================== */
  const {
    reservedCPL,
    reservedSL,
    effectiveCPL,
    effectiveSL
  } = useMemo(() => {
    let rCPL = 0;
    let rSL = 0;

    for (const l of existingLeaves) {
      if (l.status !== "PENDING") continue;
      if (!l.breakup) continue;

      rCPL += l.breakup.CPL || 0;
      rSL += l.breakup.SL || 0;
    }

    return {
      reservedCPL: rCPL,
      reservedSL: rSL,
      effectiveCPL: Math.max((balance?.CPL ?? 0) - rCPL, 0),
      effectiveSL: Math.max((balance?.SL ?? 0) - rSL, 0)
    };
  }, [existingLeaves, balance]);

  /* ===========================
     AUTO LOP
  =========================== */
  useEffect(() => {
    if (totalDays === null) {
      setLop(0);
      return;
    }

    const remaining = totalDays - (casual + sick);
    setLop(remaining > 0 ? remaining : 0);
  }, [casual, sick, totalDays]);

  /* ===========================
     VALIDATION
  =========================== */
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!startDate || !endDate) {
      errs.dates = "Start date and end date are required";
    }

    if (overlapError) {
      errs.overlap = overlapError;
    }

    if (casual > effectiveCPL) {
      errs.casual = `Only ${effectiveCPL} casual leave(s) available (${reservedCPL} reserved)`;
    }

    if (sick > effectiveSL) {
      errs.sick = `Only ${effectiveSL} sick leave(s) available (${reservedSL} reserved)`;
    }

    if (totalDays !== null && casual + sick > totalDays) {
      errs.total = "Casual + Sick cannot exceed total leave days";
    }

    if (!reason.trim()) {
      errs.reason = "Reason is mandatory";
    }

    return errs;
  }, [
    startDate,
    endDate,
    overlapError,
    casual,
    sick,
    totalDays,
    reason,
    effectiveCPL,
    effectiveSL,
    reservedCPL,
    reservedSL
  ]);

  const isFormValid =
    Object.keys(errors).length === 0 && totalDays !== null;

  /* ===========================
     SUBMIT
  =========================== */
  const submit = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setSubmitError(null);
    setSuccessMsg(null);

    try {
      await api.post("/leave/request", {
        startDate,
        endDate,
        casualDays: casual,
        sickDays: sick,
        month: startDate.slice(0, 7),
        reason
      });

      setSuccessMsg("Leave request submitted successfully");
      setStartDate("");
      setEndDate("");
      setCasual(0);
      setSick(0);
      setReason("");
    } catch (e: any) {
      setSubmitError(
        e?.response?.data?.error || "Submission failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Apply Leave</h1>

      {/* LEAVE BALANCE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Leave Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <Skeleton className="h-16" />
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                Casual: {effectiveCPL} available
                {reservedCPL > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    ({reservedCPL} reserved)
                  </span>
                )}
              </div>
              <div>
                Sick: {effectiveSL} available
                {reservedSL > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    ({reservedSL} reserved)
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* LEAVE DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            Leave Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          {(errors.dates || errors.overlap) && (
            <p className="text-xs text-red-600">
              {errors.dates || errors.overlap}
            </p>
          )}

          {totalDays !== null && (
            <p className="text-sm text-emerald-700">
              Total Leave Days: {totalDays}
            </p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Input
              type="number"
              min={0}
              max={effectiveCPL}
              value={casual}
              onChange={e => setCasual(Number(e.target.value))}
            />
            <Input
              type="number"
              min={0}
              max={effectiveSL}
              value={sick}
              onChange={e => setSick(Number(e.target.value))}
            />
            <Input value={lop} disabled />
          </div>

          {errors.casual && (
            <p className="text-xs text-red-600">{errors.casual}</p>
          )}
          {errors.sick && (
            <p className="text-xs text-red-600">{errors.sick}</p>
          )}
          {errors.total && (
            <p className="text-xs text-red-600">{errors.total}</p>
          )}

          <Textarea
            placeholder="Reason (mandatory)"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />

          {errors.reason && (
            <p className="text-xs text-red-600">{errors.reason}</p>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={submit}
        disabled={!isFormValid || loading}
        className="w-full bg-emerald-700 hover:bg-emerald-800"
      >
        {loading ? "Submitting…" : "Submit Leave"}
      </Button>

      {submitError && (
        <p className="text-sm text-red-600">{submitError}</p>
      )}
      {successMsg && (
        <p className="text-sm text-emerald-700">{successMsg}</p>
      )}
    </div>
  );
}
