import TodayCard from "./TodayCard.tsx";
import HistoryTable from "./HistoryTable.tsx";

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      <TodayCard />
      <HistoryTable />
    </div>
  );
}
