// utils/pdf.ts – Perfect payslip generator using HTML + window.print()

export function generateSalaryPDF(slip: any) {
  const normalizedSlip = normalizeSlip(slip);
  const html = buildPayslipHTML(normalizedSlip);

  const printWindow = window.open(
    "about:blank",
    "_blank",
    "width=800,height=1000"
  );

  if (!printWindow) {
    alert("Popup blocked! Allow popups to download salary slip.");
    return;
  }

  setTimeout(() => {
    printWindow.document.write(html);
    printWindow.document.close();
  }, 20);

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

/** Normalize slip values so nothing is undefined */
function normalizeSlip(slip: any) {
  const basic = Number(slip.basic ?? 0);
  const hra = Number(slip.hra ?? 0);
  const fuelAllowance = Number(slip.fuelAllowance ?? 0);

  // Backend sends performanceBonus, PDF expects bonus
  const bonus = Number(slip.bonus ?? slip.performanceBonus ?? 0);

  const pfAmount = Number(slip.pfAmount ?? 0);
  const professionalTax = Number(slip.professionalTax ?? 0);
  const absentDeduction = Number(slip.absentDeduction ?? 0);

  const totalEarning = basic + hra + fuelAllowance + bonus;

  const totalDeduction = pfAmount + professionalTax + absentDeduction;

  const netSalary = Number(slip.netSalary ?? 0);

  return {
    ...slip,

    // Earnings
    basic,
    hra,
    fuelAllowance,
    bonus,

    // Deductions
    pfAmount,
    professionalTax,
    absentDeduction,

    // Totals (🔥 THIS FIXES YOUR ERROR)
    totalEarning,
    totalDeduction,

    // Attendance
    daysInMonth: Number(slip.daysInMonth ?? 30),
    lopDays: Number(slip.lopDays ?? 0),
    daysPresent: Number(
      slip.daysPresent ?? (slip.daysInMonth ?? 30) - (slip.lopDays ?? 0)
    ),

    // Net
    netSalary,
    amountInWords: convertToWords(netSalary),
  };
}

function buildPayslipHTML(slip: any) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Payslip</title>

<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 40px;
    background: #fff;
  }

  .payslip-container {
    width: 100%;
    border: 1px solid #000;
    padding: 20px 25px;
    box-sizing: border-box;
  }

  /* ---------- HEADER ---------- */

  .header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .logo {
    width: 150px;
    height: auto;
    margin-right: 12px;
  }

  .company-details {
    flex: 1;
    text-align: center;
  }

  .header-title {
    font-size: 16px;
    font-weight: bold;
  }

  .sub-header {
    font-size: 12px;
    margin-top: 4px;
  }

  .title-box {
    border: 1px solid #000;
    padding: 6px;
    text-align: center;
    font-weight: bold;
    font-size: 13px;
    margin: 14px 0;
  }

  /* ---------- TABLE STYLES ---------- */

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }

  th, td {
    border: 1px solid #000;
    padding: 6px;
  }

  .no-border td {
    border: none;
    padding: 4px 0;
  }

  .right { text-align: right; }
  .center { text-align: center; }

  /* ---------- EARNINGS / DEDUCTIONS ---------- */

  .salary-split {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  .salary-box {
    width: 50%;
  }

  .salary-box th {
    background: #f2f2f2;
    text-align: left;
  }

  /* ---------- NET PAY ---------- */

  .netpay-title {
    margin-top: 12px;
    text-align: center;
    font-weight: bold;
    font-size: 13px;
  }

  .netpay-amount {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .footer {
    font-size: 10px;
    text-align: center;
    margin-top: 10px;
  }
</style>

</head>

<body>

<div class="payslip-container">

  <!-- HEADER WITH LOGO -->
  <div class="header">
    <img src="/image.png" class="logo" alt="Company Logo" />
    <div class="company-details">
      <div class="header-title">JHEX Consulting LLP</div>
      <div class="sub-header">
        FF-Block-A-103, Ganesh Meridian, Opp High Court,<br>
        SG Highway, Ghatlodiya Ahmedabad – (380061)
      </div>
    </div>
  </div>

  <div class="title-box">Pay slip for the month of ${slip.monthName}</div>

  <!-- EMPLOYEE INFO -->
  <table class="no-border">
    <tr>
      <td><strong>EMP Code:</strong> ${slip.employeeId}</td>
      <td><strong>Name:</strong> ${slip.employeeName}</td>
      <td><strong>DOJ:</strong> ${slip.joiningDate || "Not specified"}</td>
    </tr>
    <tr>
      <td><strong>Bank:</strong> ${slip.bankName}</td>
      <td><strong>A/C No:</strong> ${slip.accountNumber}</td>
      <td><strong>IFSC Code:</strong> ${slip.ifscCode}</td>
    </tr>
    <tr>
      <td><strong>Designation:</strong> ${slip.designation}</td>
      <td><strong>Department:</strong> ${slip.department}</td>
      <td><strong>Total Salary:</strong> ₹${slip.baseSalary.toLocaleString(
        "en-IN"
      )}</td>
    </tr>
    <tr>
      <td><strong>UAN No:</strong> ${slip.uanNumber}</td>
      <td><strong>PAN No:</strong> ${slip.panNumber}</td>
    </tr>
  </table>

  <!-- ATTENDANCE -->
  <table class="no-border">
    <tr>
      <td><strong>Total Days:</strong> ${slip.daysInMonth}</td>
      <td><strong>Days Present:</strong> ${slip.daysPresent}</td>
      <td><strong>Arrear Days:</strong> ${slip.arrearDays}</td>
      <td><strong>LOP/Absent:</strong> ${slip.lopDays}.0</td>
    </tr>
  </table>

  <!-- EARNINGS & DEDUCTIONS SPLIT -->
  <div class="salary-split">

    <!-- EARNINGS -->
    <table>
  <tr>
    <th>Earnings</th>
    <th class="right">Amount</th>
    <th>Deductions</th>
    <th class="right">Amount</th>
  </tr>

  <tr>
    <td>Basic</td>
    <td class="right">₹${slip.basic.toLocaleString("en-IN")}</td>
    <td>PF</td>
    <td class="right">₹${slip.pfAmount.toLocaleString("en-IN")}</td>
  </tr>

  <tr>
    <td>HRA</td>
    <td class="right">₹${slip.hra.toLocaleString("en-IN")}</td>
    <td>PT</td>
    <td class="right">₹${slip.professionalTax.toLocaleString("en-IN")}</td>
  </tr>

  <tr>
    <td>Fuel Allowance</td>
    <td class="right">₹${slip.fuelAllowance.toLocaleString("en-IN")}</td>
    <td>
      ${slip.absentDeduction > 0 ? "Absent Deduction" : ""}
    </td>
    <td class="right">
      ${
        slip.absentDeduction > 0
          ? `₹${slip.absentDeduction.toLocaleString("en-IN")}`
          : ""
      }
    </td>
  </tr>

  ${
    slip.bonus > 0
      ? `
    <tr>
      <td>Performance Incentive</td>
      <td class="right">₹${slip.bonus.toLocaleString("en-IN")}</td>
      <td></td>
      <td></td>
    </tr>
  `
      : ""
  }

  <tr>
    <th>Total Earnings</th>
    <th class="right">₹${slip.totalEarning.toLocaleString("en-IN")}</th>
    <th>Total Deductions</th>
    <th class="right">₹${slip.totalDeduction.toLocaleString("en-IN")}</th>
  </tr>
</table>


  </div>

  <!-- NET PAY -->
  <div class="netpay-title">Net Pay</div>
  <div class="netpay-amount">₹${slip.netSalary.toLocaleString("en-IN")}</div>

  <div><strong>In words:</strong> ${slip.amountInWords}</div>

  <div class="footer">
    This is a system-generated pay slip. Signature not required.
  </div>

</div>

</body>
</html>
`;
}

/* Convert number to words (Indian format) */
function convertToWords(num: number): string {
  if (num === 0) return "ZERO ONLY";

  return convert(num).trim().toUpperCase() + " ONLY";
}

/* Internal recursive converter — NO 'ONLY' here */
function convert(num: number): string {
  const a = [
    "",
    "one ",
    "two ",
    "three ",
    "four ",
    "five ",
    "six ",
    "seven ",
    "eight ",
    "nine ",
    "ten ",
    "eleven ",
    "twelve ",
    "thirteen ",
    "fourteen ",
    "fifteen ",
    "sixteen ",
    "seventeen ",
    "eighteen ",
    "nineteen ",
  ];

  const b = [
    "",
    "",
    "twenty ",
    "thirty ",
    "forty ",
    "fifty ",
    "sixty ",
    "seventy ",
    "eighty ",
    "ninety ",
  ];

  let words = "";

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const tens = num % 100;

  if (crore > 0) words += convert(crore) + "crore ";
  if (lakh > 0) words += convert(lakh) + "lakh ";
  if (thousand > 0) words += convert(thousand) + "thousand ";
  if (hundred > 0) words += convert(hundred) + "hundred ";

  if (tens > 0) {
    if (tens < 20) {
      words += a[tens];
    } else {
      words += b[Math.floor(tens / 10)] + a[tens % 10];
    }
  }

  return words;
}
