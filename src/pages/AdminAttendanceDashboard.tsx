import TodayAttendance from "../components/attendance/TodayAttendance";
import SummaryAttendance from "../components/attendance/SummaryAttendance";
import SearchAttendance from "../components/attendance/SearchAttendance";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminAttendanceDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Attendance Dashboard</h1>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TodayAttendance />
        </TabsContent>

        <TabsContent value="summary">
          <SummaryAttendance />
        </TabsContent>

        <TabsContent value="search">
          <SearchAttendance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
