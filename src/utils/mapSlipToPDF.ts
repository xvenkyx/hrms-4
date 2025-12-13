export function mapSlipToPDF(slip: any) {
  return {
    monthName: formatMonth(slip.Month),

    employeeId: slip.EmployeeID,
    employeeName: slip.employeeName,
    department: slip.department,
    designation: slip.designation,

    bankName: slip.bankAccount?.bankName || "—",
    accountNumber: slip.bankAccount?.accountNumber || "—",
    ifscCode: slip.bankAccount?.ifsc || "—",

    panNumber: slip.pan || "—",
    uanNumber: slip.uan || "—",

    baseSalary: slip.baseSalary,

    basic: slip.basic,
    hra: slip.hra,
    fuelAllowance: slip.fuelAllowance,
    bonus: slip.bonus || 0, // future-proof

    pfAmount: slip.pfAmount,
    professionalTax: slip.professionalTax,
    absentDeduction: slip.absentDeduction || 0,

    totalEarning: slip.totalEarning,
    netSalary: slip.netSalary,

    daysInMonth: 30,
    daysPresent: 30,
    lopDays: 0,
    arrearDays: 0
  };
}

function formatMonth(month: string) {
  const [y, m] = month.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric"
  });
}
