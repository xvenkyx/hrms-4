import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { generateSalaryPDF } from "@/utils/pdf";
import { mapSlipToPDF } from "@/utils/mapSlipToPDF";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, IndianRupee, Calendar, RefreshCcw } from "lucide-react";

export default function SalaryHistory() {
  const [slips, setSlips] = useState<any[]>([]);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await api.get("/salary/me/history");
      setSlips(res.data || []);
    } catch (e) {
      console.error(e);
      setSlips([]);
    } finally {
      setLoading(false);
    }
  }

  function handleView() {
    const slip = slips.find((s) => s.Month === month);
    console.log(slip)
    setSelectedSlip(slip || null);
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Salary</h1>
          <p className="text-sm text-muted-foreground">
            View and download your monthly salary slips
          </p>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={loadHistory}
          disabled={loading}
          title="Refresh salary history"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Month selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Select Month
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setSelectedSlip(null);
            }}
            className="w-full sm:w-56"
          />

          <Button
            onClick={handleView}
            disabled={!month}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            View Salary
          </Button>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {/* Not generated */}
      {!loading && month && !selectedSlip && (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Salary for <strong>{month}</strong> has not been generated yet.
          </CardContent>
        </Card>
      )}

      {/* Salary details */}
      {selectedSlip && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              Salary Details – {selectedSlip.Month}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Net Salary</span>
                <div className="text-lg font-semibold">
                  ₹{selectedSlip.netSalary.toLocaleString("en-IN")}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Generated On</span>
                <div>
                  {new Date(selectedSlip.generatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Button
              onClick={() => generateSalaryPDF(mapSlipToPDF(selectedSlip))}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Salary Slip
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
