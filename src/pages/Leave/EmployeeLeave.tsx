import { useState, useEffect } from "react";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar, ClipboardList } from "lucide-react";

type LeaveType = "CPL" | "SL" | "LOP";

export default function EmployeeLeave() {
  /* ===========================
     FORM STATE
  =========================== */
  const [leaveType, setLeaveType] = useState<LeaveType>("CPL");
  const [days, setDays] = useState<number>(1);
  const [month, setMonth] = useState<string>("");
  const [consumePaid, setConsumePaid] = useState<boolean>(true);
  const [reason, setReason] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* ===========================
     LEAVE BALANCE
  =========================== */
  const [balance, setBalance] = useState<any | null>(null);
  const [balanceLoading, setBalanceLoading] =
    useState<boolean>(true);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await api.get("/leave/me/balance");
      setBalance(res.data);
    } catch (e) {
      console.error("Failed to load leave balance", e);
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  /* ===========================
     SUBMIT LEAVE
  =========================== */
  const submit = async () => {
    setMessage(null);

    if (!month) {
      setMessage({
        type: "error",
        text: "Please select a month",
      });
      return;
    }

    if (days <= 0 || Number.isNaN(days)) {
      setMessage({
        type: "error",
        text: "Enter a valid number of days",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/leave/request", {
        leaveType,
        requestedDays: days,
        month,
        consumePaidLeavesFirst: consumePaid,
        reason,
      });

      setMessage({
        type: "success",
        text: "Leave request submitted successfully",
      });

      setDays(1);
      setReason("");

      // refresh balance after submission
      loadBalance();
    } catch (e: any) {
      setMessage({
        type: "error",
        text:
          e?.response?.data?.error ||
          "Failed to submit leave request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Apply Leave
        </h1>
        <p className="text-sm text-muted-foreground">
          Submit a leave request for approval
        </p>
      </div>

      {/* LEAVE BALANCE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Leave Balance
          </CardTitle>
        </CardHeader>

        <CardContent>
          {balanceLoading ? (
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : balance ? (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  Casual Paid Leave
                </p>
                <p className="text-lg font-semibold">
                  {balance.CPL ?? "—"}
                </p>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  Sick Leave
                </p>
                <p className="text-lg font-semibold">
                  {balance.SL ?? "—"}
                </p>
              </div>

              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">
                  Loss of Pay
                </p>
                <p className="text-lg font-semibold">
                  {balance.LOP ?? "—"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Unable to load leave balance
            </p>
          )}
        </CardContent>
      </Card>

      {/* LEAVE DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            Leave Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Leave type */}
          <Select
            value={leaveType}
            onValueChange={(v) =>
              setLeaveType(v as LeaveType)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Leave type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CPL">
                Casual Paid Leave
              </SelectItem>
              <SelectItem value="SL">
                Sick Leave
              </SelectItem>
              <SelectItem value="LOP">
                Loss of Pay
              </SelectItem>
            </SelectContent>
          </Select>

          {leaveType === "LOP" && (
            <p className="text-xs text-muted-foreground">
              Loss of Pay does not consume leave balance
            </p>
          )}

          {/* Days */}
          <Input
            type="number"
            min={1}
            value={days}
            onChange={(e) =>
              setDays(Number(e.target.value))
            }
            placeholder="Number of days"
          />

          {/* Month */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Leave month
            </label>
            <Input
              type="month"
              value={month}
              onChange={(e) =>
                setMonth(e.target.value)
              }
            />
          </div>

          {/* Consume paid leaves */}
          {leaveType !== "LOP" && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={consumePaid}
                onCheckedChange={(v) =>
                  setConsumePaid(Boolean(v))
                }
              />
              <span className="text-sm">
                Consume paid leaves first
              </span>
            </div>
          )}

          {/* Reason */}
          <Textarea
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
          />
        </CardContent>
      </Card>

      {/* ACTION */}
      <div className="space-y-2">
        <Button
          onClick={submit}
          disabled={loading}
          className="w-full bg-emerald-700 hover:bg-emerald-800"
        >
          {loading ? "Submitting…" : "Submit Leave"}
        </Button>

        {message && (
          <p
            className={`text-sm ${
              message.type === "success"
                ? "text-emerald-700"
                : "text-destructive"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
