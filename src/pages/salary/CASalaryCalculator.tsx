// // pages/Salary/CASalaryCalculation.tsx
// import { useState, useMemo, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { api } from "@/lib/api";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Download,
//   Upload,
//   Filter,
//   Search,
//   Calendar,
//   Building,
//   Users,
//   FileSpreadsheet,
// } from "lucide-react";
// import { format } from "date-fns";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge";
// import React from "react";

// const ExcelImport = React.lazy(() => import("./components/ExcelImport"));

// interface CASalaryInfo {
//   id: string;
//   srNo: number;
//   uanNo: string;
//   employeeCode: string;
//   employeeName: string;
//   department: string;
//   branch: string;
//   salary: number;
//   totalDays: number;
//   presentDays: number;
//   exitEmpDate?: string;
//   status: 'active' | 'exited' | 'inactive';
// }

// export default function CASalaryCalculation() {
//   const [search, setSearch] = useState("");
//   const [department, setDepartment] = useState("");
//   const [branch, setBranch] = useState("");
//   const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
//   const [importOpen, setImportOpen] = useState(false);

//   // Fetch all data once
//   const { data: allData, isLoading, refetch } = useQuery({
//     queryKey: ['ca-salary-info'],
//     queryFn: async () => {
//       const res = await api.get('/ca-salary/calculation-info');
//       return res.data as CASalaryInfo[];
//     },
//   });

//   // Filter data on frontend
//   const filteredData = useMemo(() => {
//     if (!allData) return [];

//     const searchLower = search.toLowerCase().trim();

//     return allData.filter((item: CASalaryInfo) => {
//       // Filter by search
//       const matchesSearch = !searchLower ||
//         item.employeeName.toLowerCase().includes(searchLower) ||
//         item.employeeCode.toLowerCase().includes(searchLower) ||
//         item.uanNo?.toLowerCase().includes(searchLower) ||
//         item.department.toLowerCase().includes(searchLower) ||
//         item.branch.toLowerCase().includes(searchLower);

//       // Filter by department
//       const matchesDept = !department || item.department === department;

//       // Filter by branch
//       const matchesBranch = !branch || item.branch === branch;

//       // Note: Month filtering would need backend support
//       // For now, we assume all data is for current month

//       return matchesSearch && matchesDept && matchesBranch;
//     });
//   }, [allData, search, department, branch]);

//   // Extract unique departments and branches for dropdowns
//   const { departments, branches } = useMemo(() => {
//     if (!allData) return { departments: [], branches: [] };

//     const uniqueDepts = Array.from(new Set(allData.map(item => item.department))).filter(Boolean);
//     const uniqueBranches = Array.from(new Set(allData.map(item => item.branch))).filter(Boolean);

//     return {
//       departments: uniqueDepts,
//       branches: uniqueBranches
//     };
//   }, [allData]);

//   // Calculate totals
//   const totals = useMemo(() => {
//     if (!filteredData.length) return null;

//     return filteredData.reduce((acc, item) => ({
//       salary: acc.salary + item.salary,
//       presentDays: acc.presentDays + item.presentDays,
//       count: acc.count + 1,
//     }), { salary: 0, presentDays: 0, count: 0 });
//   }, [filteredData]);

//   // Export to Excel
//   const handleExport = async () => {
//     try {
//       const response = await api.get(`/ca-salary/export-excel`, {
//         params: {
//           month,
//           department: department || undefined,
//           branch: branch || undefined,
//           search: search || undefined,
//         },
//         responseType: 'blob',
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `CA_Salary_Calculation_${month}.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       console.error('Export failed:', error);
//     }
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setSearch("");
//     setDepartment("");
//     setBranch("");
//     setMonth(format(new Date(), 'yyyy-MM'));
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">CA Salary Calculation</h1>
//           <p className="text-sm text-muted-foreground">
//             Information for Chartered Accountant - End of Month Processing
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <Dialog open={importOpen} onOpenChange={setImportOpen}>
//             <DialogTrigger asChild>
//               <Button variant="outline" size="sm" className="gap-2">
//                 <Upload size={16} />
//                 Import
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-4xl">
//               <DialogHeader>
//                 <DialogTitle>Import Excel File</DialogTitle>
//               </DialogHeader>
//               <React.Suspense fallback={<div>Loading...</div>}>
//                 <ExcelImport
//                   onSuccess={() => {
//                     setImportOpen(false);
//                     refetch();
//                   }}
//                 />
//               </React.Suspense>
//             </DialogContent>
//           </Dialog>

//           <Button
//             onClick={handleExport}
//             size="sm"
//             className="gap-2 bg-emerald-600 hover:bg-emerald-700"
//           >
//             <Download size={16} />
//             Export
//           </Button>
//         </div>
//       </div>

//       {/* Filters Card */}
//       <Card>
//         <CardHeader className="pb-3">
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-lg flex items-center gap-2">
//               <Filter size={18} />
//               Filters
//             </CardTitle>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={resetFilters}
//               className="h-8"
//             >
//               Clear Filters
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {/* Month Selector */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium flex items-center gap-2">
//                 <Calendar size={14} />
//                 Month
//               </label>
//               <Input
//                 type="month"
//                 value={month}
//                 onChange={(e) => setMonth(e.target.value)}
//                 className="h-9"
//               />
//             </div>

//             {/* Department Filter */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium flex items-center gap-2">
//                 <Users size={14} />
//                 Department
//               </label>
//               <Select
//                 value={department}
//                 onValueChange={(value) => setDepartment(value)}
//               >
//                 <SelectTrigger className="h-9">
//                   <SelectValue placeholder="All Departments" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Departments</SelectItem>
//                   {departments.map((dept) => (
//                     <SelectItem key={dept} value={dept}>
//                       {dept}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Branch Filter */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium flex items-center gap-2">
//                 <Building size={14} />
//                 Branch
//               </label>
//               <Select
//                 value={branch}
//                 onValueChange={(value) => setBranch(value)}
//               >
//                 <SelectTrigger className="h-9">
//                   <SelectValue placeholder="All Branches" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Branches</SelectItem>
//                   {branches.map((branch) => (
//                     <SelectItem key={branch} value={branch}>
//                       {branch}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Search */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium flex items-center gap-2">
//                 <Search size={14} />
//                 Search Employee
//               </label>
//               <Input
//                 placeholder="Search by name, code, UAN..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="h-9"
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Summary Stats */}
//       {totals && (
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <Card>
//             <CardContent className="pt-6">
//               <div className="text-sm font-medium text-muted-foreground">Total Employees</div>
//               <div className="text-2xl font-bold mt-2">{totals.count}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="pt-6">
//               <div className="text-sm font-medium text-muted-foreground">Total Salary</div>
//               <div className="text-2xl font-bold mt-2">
//                 ₹{totals.salary.toLocaleString()}
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="pt-6">
//               <div className="text-sm font-medium text-muted-foreground">Total Present Days</div>
//               <div className="text-2xl font-bold mt-2">
//                 {totals.presentDays}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Data Table - Responsive container */}
//       <Card className="overflow-hidden">
//         <CardContent className="p-0">
//           {isLoading ? (
//             <div className="p-6 space-y-3">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <Skeleton key={i} className="h-12 w-full" />
//               ))}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <div className="min-w-[1000px]">
//                 <Table>
//                   <TableHeader className="bg-muted/50">
//                     <TableRow>
//                       <TableHead className="w-16">SR No</TableHead>
//                       <TableHead className="min-w-28">UAN No</TableHead>
//                       <TableHead className="min-w-28">Emp Code</TableHead>
//                       <TableHead className="min-w-36">Employee Name</TableHead>
//                       <TableHead className="min-w-28">Department</TableHead>
//                       <TableHead className="min-w-28">Branch</TableHead>
//                       <TableHead className="min-w-28">Salary (₹)</TableHead>
//                       <TableHead className="w-20">Total Days</TableHead>
//                       <TableHead className="w-24">Present Days</TableHead>
//                       <TableHead className="min-w-28">Exit Date</TableHead>
//                       <TableHead className="w-24">Status</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredData.map((item) => (
//                       <TableRow key={item.id}>
//                         <TableCell className="font-medium text-center">{item.srNo}</TableCell>
//                         <TableCell className="font-mono text-sm">
//                           {item.uanNo || '-'}
//                         </TableCell>
//                         <TableCell className="font-mono">
//                           {item.employeeCode}
//                         </TableCell>
//                         <TableCell className="font-medium">{item.employeeName}</TableCell>
//                         <TableCell>{item.department}</TableCell>
//                         <TableCell>{item.branch}</TableCell>
//                         <TableCell className="text-right font-medium">
//                           ₹{item.salary.toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-center">{item.totalDays}</TableCell>
//                         <TableCell className="text-center text-emerald-600 font-medium">
//                           {item.presentDays}
//                         </TableCell>
//                         <TableCell>
//                           {item.exitEmpDate ? (
//                             <span className="text-red-600">
//                               {format(new Date(item.exitEmpDate), 'dd/MM/yy')}
//                             </span>
//                           ) : (
//                             <span className="text-muted-foreground">-</span>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <Badge
//                             variant={
//                               item.status === 'active'
//                                 ? 'default'
//                                 : item.status === 'exited'
//                                 ? 'destructive'
//                                 : 'secondary'
//                             }
//                             className="text-xs"
//                           >
//                             {item.status}
//                           </Badge>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>

//                 {filteredData.length === 0 && (
//                   <div className="p-12 text-center">
//                     <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//                     <h3 className="text-lg font-medium">No data found</h3>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       {allData?.length === 0
//                         ? "No salary calculation data available. Import data from Excel."
//                         : "Try adjusting your filters."}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Show count */}
//       {filteredData.length > 0 && (
//         <div className="text-sm text-muted-foreground">
//           Showing {filteredData.length} of {allData?.length || 0} employees
//         </div>
//       )}
//     </div>
//   );
// }

// pages/Salary/CASalaryCalculation.tsx
export default function CASalaryCalculation() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            CA Salary Calculation
          </h1>
          <p className="text-sm text-muted-foreground">Under Construction</p>
        </div>
      </div>
    </div>
  );
}
