import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function AdminEmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const res = await api.get("/admin/employees");
    setEmployees(res.data);
  }

  const filtered = employees.filter((e) => {
    const name = (e.name || "").toLowerCase();
    const id = (e.EmployeeID || e.employeeID || "").toLowerCase();
    const searchText = search.toLowerCase();

    const matchesSearch = name.includes(searchText) || id.includes(searchText);

    const matchesDept = !department || e.department === department;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Employees</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search by name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1"
        />

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">All Departments</option>
          <option value="Technical">Technical</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full border text-sm">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Base Salary</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((emp) => (
            <tr key={emp.EmployeeID}>
              <td className="border p-2">{emp.EmployeeID}</td>
              <td className="border p-2">{emp.name}</td>
              <td className="border p-2">{emp.department}</td>
              <td className="border p-2">
                ₹{emp.baseSalary?.toLocaleString("en-IN")}
              </td>
              <td className="border p-2">
                <button
                  className="text-blue-600 underline"
                  onClick={() => navigate(`/admin/employees/${emp.EmployeeID}`)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
