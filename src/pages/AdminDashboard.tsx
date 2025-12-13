import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  useAuth();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        HR/Admin Dashboard
      </h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Total Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">48</p>
            <p className="text-gray-600 text-sm">Across all departments</p>
          </CardContent>
        </Card>

        {/* Pending Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">6</p>
            <p className="text-gray-600 text-sm">Need your approval</p>
          </CardContent>
        </Card>

        {/* Payroll Status */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">₹12,40,000</p>
            <p className="text-gray-600 text-sm">This month pending</p>
          </CardContent>
        </Card>

      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600">
            Coming Soon — full searchable, filterable table.
          </div>
        </CardContent>
      </Card>

      {/* Leave Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600">
            Coming Soon — approve/reject leave requests.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
