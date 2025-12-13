export function mapSlipToPDF(slip: any) {
  const daysInMonth = Number(slip.daysInMonth ?? 30);

  // LOP days affect salary deduction
  const lopDays = Number(slip.lopDays ?? 0);

  // Total approved leave days (CPL + SL + LOP)
  // Backend may or may not send this, so derive safely
  const approvedLeaveDays =
    Number(slip.approvedLeaveDays ??
      slip.totalLeaveDays ??
      lopDays // fallback: at least LOP
    );

  // Presence = total days - all approved leave days
  const daysPresent = Math.max(
    daysInMonth - approvedLeaveDays,
    0
  );

  return {
    /* -------- Meta -------- */
    monthName: formatMonth(slip.Month),

    employeeId: slip.EmployeeID,
    employeeName: slip.employeeName,
    department: slip.department,
    designation: slip.designation,

    /* -------- Bank -------- */
    bankName: slip.bankAccount?.bankName || "—",
    accountNumber: slip.bankAccount?.accountNumber || "—",
    ifscCode: slip.bankAccount?.ifsc || "—",

    /* -------- Statutory -------- */
    panNumber: slip.pan || "—",
    uanNumber: slip.uan || "—",

    /* -------- Salary -------- */
    baseSalary: Number(slip.baseSalary ?? 0),

    basic: Number(slip.basic ?? 0),
    hra: Number(slip.hra ?? 0),
    fuelAllowance: Number(slip.fuelAllowance ?? 0),
    bonus: Number(slip.bonus ?? 0),

    pfAmount: Number(slip.pfAmount ?? 0),
    professionalTax: Number(slip.professionalTax ?? 0),
    absentDeduction: Number(slip.absentDeduction ?? 0),

    totalEarning: Number(slip.totalEarning ?? 0),
    netSalary: Number(slip.netSalary ?? 0),

    /* -------- Attendance -------- */
    daysInMonth,
    daysPresent,
    lopDays,
    arrearDays: Number(slip.arrearDays ?? 0)
  };
}

/* ---------- Helpers ---------- */

function formatMonth(month: string) {
  if (!month) return "—";
  const [y, m] = month.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric"
  });
}
