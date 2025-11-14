import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import {
  FaUmbrellaBeach,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaFilter,
} from "react-icons/fa";
import leaveService from "../../services/leaveService";

export default function TimeOff() {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    leaveType: "",
    status: "",
  });
  const [stats, setStats] = useState({
    paidTimeOff: 24,
    sickTimeOff: 7,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchLeaveData();
  }, [filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      console.log("Fetching leave data with filters:", filters);

      const params = {
        limit: 100,
      };

      if (filters.leaveType) params.leaveType = filters.leaveType;
      if (filters.status) params.status = filters.status;

      const response = await leaveService.getAll(params);

      console.log("Leave API full response:", response);
      console.log("Response data:", response.data);
      console.log("Response leaves:", response.leaves);

      // Handle both response.data.leaves and response.leaves patterns
      const leavesArray = response.data?.leaves || response.leaves || [];

      if (leavesArray && leavesArray.length > 0) {
        console.log("Leave records found:", leavesArray);

        const formattedData = leavesArray.map((record) => {
          const startDate = new Date(record.startDate);
          const endDate = new Date(record.endDate);
          const days =
            record.numberOfDays ||
            Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

          return {
            id: record._id,
            employee: record.empId?.name || "Unknown",
            employeeId: record.empId?.employeeId || "N/A",
            leaveType: record.leaveType || "N/A",
            startDate: startDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            endDate: endDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            days,
            status: record.status || "pending",
            reason: record.reason || "",
            rawData: record,
          };
        });

        console.log("Formatted leave data:", formattedData);
        setLeaveData(formattedData);
      } else {
        console.log("No leave data in response");
        setLeaveData([]);
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
      console.error("Error response:", error.response?.data);
      setLeaveData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.updateStatus(id, "approved");
      alert("✅ Leave request approved!");
      fetchLeaveData();
    } catch (error) {
      console.error("Error approving leave:", error);
      alert(error.response?.data?.message || "Failed to approve leave request");
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveService.updateStatus(id, "rejected");
      alert("❌ Leave request rejected!");
      fetchLeaveData();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert(error.response?.data?.message || "Failed to reject leave request");
    }
  };

  const getCurrentDateInfo = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return { dayName, date, month, year };
  };

  const dateInfo = getCurrentDateInfo();

  // Pagination logic
  const totalPages = Math.ceil(leaveData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = leaveData.slice(indexOfFirstRow, indexOfLastRow);

  const columns = [
    { header: "Employee Name", accessor: "employee" },
    { header: "Start Date", accessor: "startDate" },
    { header: "End Date", accessor: "endDate" },
    { header: "Days", accessor: "days" },
    {
      header: "Time Off Type",
      accessor: "leaveType",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            value === "Paid time Off"
              ? "bg-blue-100 text-blue-700"
              : value === "Sick time off"
              ? "bg-orange-100 text-orange-700"
              : value === "Unpaid"
              ? "bg-gray-100 text-gray-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === "approved"
              ? "bg-green-100 text-green-800"
              : value === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "id",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.status === "pending" ? (
            <>
              <button
                onClick={() => handleApprove(value)}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Approve"
              >
                <FaCheckCircle className="text-lg" />
              </button>
              <button
                onClick={() => handleReject(value)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Reject"
              >
                <FaTimesCircle className="text-lg" />
              </button>
            </>
          ) : (
            <span className="text-gray-400 text-sm">
              {row.status === "approved" ? "✓ Approved" : "✗ Rejected"}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
                <FaUmbrellaBeach className="text-white text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">
                  Time Off
                </h1>
                <p className="text-base text-blue-100">
                  Manage and review employee leave requests
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

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">
                  Total Requests
                </span>
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <FaUmbrellaBeach className="text-blue-300 text-xl" />
                </div>
              </div>
              <div className="text-4xl font-bold">{leaveData.length}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">
                  Pending
                </span>
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <FaFilter className="text-yellow-300 text-xl" />
                </div>
              </div>
              <div className="text-4xl font-bold">
                {leaveData.filter((l) => l.status === "pending").length}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">
                  Approved
                </span>
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <FaCheckCircle className="text-green-300 text-xl" />
                </div>
              </div>
              <div className="text-4xl font-bold">
                {leaveData.filter((l) => l.status === "approved").length}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">
                  Rejected
                </span>
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <FaTimesCircle className="text-red-300 text-xl" />
                </div>
              </div>
              <div className="text-4xl font-bold">
                {leaveData.filter((l) => l.status === "rejected").length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <FaFilter className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Filter Requests
              </h3>
              <p className="text-sm text-gray-600">
                Filter by leave type and status
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                value={filters.leaveType}
                onChange={(e) =>
                  setFilters({ ...filters, leaveType: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">All Time Off Types</option>
                <option value="Paid time Off">Paid time Off</option>
                <option value="Sick time off">Sick time off</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {(filters.leaveType || filters.status) && (
              <div className="flex items-end pb-1">
                <button
                  onClick={() => setFilters({ leaveType: "", status: "" })}
                  className="px-6 py-3 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <FaUmbrellaBeach className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Leave Requests Overview
              </h3>
              <p className="text-sm text-gray-600">
                Review and manage all employee time off requests
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium">
                Loading leave requests...
              </p>
            </div>
          ) : leaveData.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUmbrellaBeach className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No leave requests found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Requests will appear here when submitted
              </p>
            </div>
          ) : (
            <>
              <Table columns={columns} data={currentRows} />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstRow + 1} to{" "}
                      {Math.min(indexOfLastRow, leaveData.length)} of{" "}
                      {leaveData.length} records
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`px-4 py-2 rounded-lg transition-all ${
                                currentPage === pageNumber
                                  ? "bg-blue-600 text-white font-semibold"
                                  : "bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="px-2 text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
