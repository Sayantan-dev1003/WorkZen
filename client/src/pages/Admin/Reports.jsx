import React, { useState, useEffect } from "react";
import { FaFileAlt, FaDownload } from "react-icons/fa";
import api from "../../api";

export default function Reports() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/admin/employees");
      if (response.data.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const generatePDF = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        "/admin/payroll/detailed-salary-statement",
        {
          params: { employeeId: selectedEmployee, year: selectedYear },
        }
      );

      if (response.data.success) {
        const data = response.data;
        const printWindow = document.createElement("iframe");
        printWindow.style.position = "absolute";
        printWindow.style.width = "0";
        printWindow.style.height = "0";
        printWindow.style.border = "none";
        document.body.appendChild(printWindow);

        const doc =
          printWindow.contentDocument || printWindow.contentWindow.document;
        doc.open();
        doc.write(generatePrintHTML(data));
        doc.close();

        setTimeout(() => {
          printWindow.contentWindow.print();
          setTimeout(() => document.body.removeChild(printWindow), 100);
        }, 250);

        alert("PDF generation initiated.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate salary statement");
    } finally {
      setLoading(false);
    }
  };

  const generatePrintHTML = (data) => {
    const fmt = (amount) => `₹ ${amount.toLocaleString("en-IN")}`;

    const earningsHTML =
      data.earnings && data.earnings.length > 0
        ? data.earnings
            .map(
              (e) => `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
          <div>${e.component}</div>
          <div style="text-align:right">${fmt(e.monthlyAmount)}</div>
          <div style="text-align:right">${fmt(e.yearlyAmount)}</div>
        </div>`
            )
            .join("")
        : '<div style="padding-left:32px;color:#999">No earnings data</div>';

    const deductionsHTML =
      data.deductions && data.deductions.length > 0
        ? data.deductions
            .map(
              (d) => `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
          <div>${d.component}</div>
          <div style="text-align:right">${fmt(d.monthlyAmount)}</div>
          <div style="text-align:right">${fmt(d.yearlyAmount)}</div>
        </div>`
            )
            .join("")
        : '<div style="padding-left:32px;color:#999">No deductions data</div>';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Salary Statement - ${data.employee.name}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:14px; padding:40px; }
    @media print { @page { size:A4; margin:1cm; } body { padding:0; } }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;">
    <h1 style="font-size:24px;font-weight:600;margin-bottom:32px;color:#4A90E2;">Salary Statement Report Print</h1>
    <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #E53935;">
      <h2 style="font-size:18px;font-weight:600;color:#E53935;">[Company]</h2>
    </div>
    <div style="margin-bottom:16px;">
      <h3 style="font-size:16px;font-weight:600;color:#E53935;">Salary Statement Report</h3>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #ccc;">
      <div>
        <p style="color:#E53935;margin-bottom:4px;">Employee Name</p>
        <p style="margin-bottom:12px;">${data.employee.name}</p>
        <p style="color:#E53935;margin-bottom:4px;">Designation</p>
        <p>${data.employee.designation || "N/A"}</p>
      </div>
      <div style="text-align:right;">
        <p style="color:#E53935;margin-bottom:4px;">Date Of Joining</p>
        <p style="margin-bottom:12px;">${data.employee.dateOfJoining}</p>
        <p style="color:#E53935;margin-bottom:4px;">Salary Effective From</p>
        <p>${data.employee.salaryEffectiveFrom}</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid #ccc;">
      <div style="color:#E53935;">Salary Components</div>
      <div style="text-align:right;color:#E53935;">Monthly Amount</div>
      <div style="text-align:right;color:#E53935;">Yearly Amount</div>
    </div>
    <h4 style="font-weight:600;margin-bottom:8px;color:#E53935;">Earnings</h4>
    ${earningsHTML}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
      <div style="color:#999;">:</div><div style="text-align:right;color:#999;">:</div><div style="text-align:right;color:#999;">:</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
      <div style="color:#999;">:</div><div style="text-align:right;color:#999;">:</div><div style="text-align:right;color:#999;">:</div>
    </div>
    <h4 style="font-weight:600;margin:12px 0 8px 0;color:#E53935;">Deduction</h4>
    ${deductionsHTML}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
      <div style="color:#999;">:</div><div style="text-align:right;color:#999;">:</div><div style="text-align:right;color:#999;">:</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
      <div style="color:#999;">:</div><div style="text-align:right;color:#999;">:</div><div style="text-align:right;color:#999;">:</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:12px 0;padding-top:12px;border-top:1px solid #ccc;">
      <div style="font-weight:600;color:#E53935;">Net Salary</div>
      <div style="text-align:right;font-weight:600;">${fmt(
        data.monthlyNet
      )}</div>
      <div style="text-align:right;font-weight:600;">${fmt(
        data.yearlyNet
      )}</div>
    </div>
  </div>
</body>
</html>`;
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 6; i++) years.push(currentYear - i);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
              <FaFileAlt className="text-white text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">
                Reports
              </h1>
              <p className="text-base text-blue-100">
                Generate and download salary statement reports
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-xs py-1 font-bold text-white">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Generation Section */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <FaFileAlt className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Salary Statement Report
              </h3>
              <p className="text-sm text-gray-600">
                Select an employee and year to generate a PDF report
              </p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee Name
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generatePDF}
                disabled={loading || !selectedEmployee}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600"
              >
                <FaDownload className="text-lg" />
                {loading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
