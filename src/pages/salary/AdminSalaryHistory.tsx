import { api } from "@/lib/api";
import { downloadPayslip } from "@/utils/downloadPayslip";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Download } from "lucide-react";

export default function AdminSalaryHistory() {
  const [month, setMonth] = useState("");
  const [slips, setSlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchSlips() {
    if (!month) return;

    setLoading(true);
    try {
      const res = await api.get("/salary/admin/history", {
        params: { month },
      });
      setSlips(res.data || []);
    } catch (err) {
      console.error("Failed to fetch admin salary history", err);
      setSlips([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Salary History
        </h1>
        <p className="text-sm text-muted-foreground">
          View and download generated salary slips for employees
        </p>
      </div>

      {/* Filter */}
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
              setSlips([]);
            }}
            className="w-full sm:w-56"
          />

          <Button
            onClick={fetchSlips}
            disabled={!month}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            Fetch Records
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading && slips.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      {month
                        ? "No salary records found for this month"
                        : "Select a month to view salary history"}
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  slips.map((slip) => (
                    <TableRow key={slip.SlipID}>
                      <TableCell className="font-medium">
                        {slip.employeeName}
                      </TableCell>
                      <TableCell>{slip.Month}</TableCell>
                      <TableCell className="text-right">
                        ₹{slip.netSalary.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => downloadPayslip(slip)}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Download
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
