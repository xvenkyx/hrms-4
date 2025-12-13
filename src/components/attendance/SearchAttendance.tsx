import { useState } from "react";
import { api } from "@/lib/api";

export default function SearchAttendance() {
  const [query, setQuery] = useState({ name: "", department: "", date: "" });
  const [results, setResults] = useState<any[]>([]);

  const search = () => {
    const params = new URLSearchParams();

    if (query.name) params.append("name", query.name);
    if (query.department) params.append("department", query.department);
    if (query.date) params.append("date", query.date);

    api.get(`/attendance/admin/search?${params.toString()}`)
      .then(res => setResults(res.data));
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-4">
        <input placeholder="Name" onChange={e => setQuery({ ...query, name: e.target.value })} />
        <input placeholder="Department" onChange={e => setQuery({ ...query, department: e.target.value })} />
        <input type="date" onChange={e => setQuery({ ...query, date: e.target.value })} />
        <button onClick={search}>Search</button>
      </div>

      <ul>
        {results.map((r: any) => (
          <li key={r.AttendanceID}>
            {r.Name} — {r.Date} — {r.CheckIn} → {r.CheckOut || "Not Out"}
          </li>
        ))}
      </ul>
    </div>
  );
}
