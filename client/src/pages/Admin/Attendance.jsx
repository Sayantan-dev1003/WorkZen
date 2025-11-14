import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import {
  FaCalendarCheck,
  FaUserClock,
  FaUserTimes,
  FaUserCheck,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import attendanceService from "../../services/attendanceService";

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchAttendanceData();

    // Listen for attendance updates
    const handleAttendanceUpdate = () => {
      console.log("Attendance updated event received, refreshing data...");
      fetchAttendanceData();
    };

    window.addEventListener("attendanceUpdated", handleAttendanceUpdate);

    return () => {
      window.removeEventListener("attendanceUpdated", handleAttendanceUpdate);
    };
  }, [filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      console.log("Fetching attendance data with filters:", filters);

      const response = await attendanceService.getAll({
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 100,
      });

      console.log("Attendance API response:", response);
      console.log("response.data:", response.data);
      console.log("response.data.success:", response.data?.success);
      console.log("response.data.attendance:", response.data?.attendance);
      console.log(
        "Array.isArray(response.data.attendance):",
        Array.isArray(response.data?.attendance)
      );

      // The response structure is: response.data = { success: true, attendance: [...], pagination: {...} }
      if (
        response.data &&
        response.data.success &&
        response.data.attendance &&
        Array.isArray(response.data.attendance)
      ) {
        console.log("✅ Condition passed! Processing attendance records...");
        console.log("Attendance records:", response.data.attendance);

        const formattedData = response.data.attendance.map((record) => {
          const workHours = calculateWorkHours(record.checkIn, record.checkOut);
          const extraHours = calculateExtraHours(
            record.checkIn,
            record.checkOut,
            workHours
          );

          return {
            id: record._id,
            employee: record.empId?.name || record.userId?.name || "Unknown",
            employeeId:
              record.empId?.employeeId || record.userId?.email || "N/A",
            role: record.userId?.role || "Employee",
            date: new Date(record.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            checkIn: record.checkIn
              ? new Date(record.checkIn).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // AM/PM format
                })
              : "-",
            checkOut: record.checkOut
              ? new Date(record.checkOut).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // AM/PM format
                })
              : "-",
            status: record.status || "present",
            workHours,
            extraHours,
          };
        });

        console.log("Formatted attendance data:", formattedData);
        setAttendanceData(formattedData);

        // Calculate stats
        const present = formattedData.filter(
          (r) => r.status === "present" && r.checkIn !== "-"
        ).length;
        const absent = formattedData.filter(
          (r) => r.status === "absent" || r.checkIn === "-"
        ).length;
        const late = formattedData.filter(
          (r) => r.checkIn !== "-" && isLate(r.checkIn)
        ).length;

        setStats({ present, absent, late });
      } else {
        console.log("❌ Condition failed!");
        console.log("response.data exists?", !!response.data);
        console.log("response.data.success?", response.data?.success);
        console.log(
          "response.data.attendance exists?",
          !!response.data?.attendance
        );
        console.log("is array?", Array.isArray(response.data?.attendance));

        // Try alternative access patterns
        const attendanceArray =
          response.data?.attendance || response.attendance || [];
        console.log(
          "Trying alternative access - attendanceArray:",
          attendanceArray
        );

        if (attendanceArray && attendanceArray.length > 0) {
          console.log("Found attendance via alternative access, processing...");
          const formattedData = attendanceArray.map((record) => {
            const workHours = calculateWorkHours(
              record.checkIn,
              record.checkOut
            );
            const extraHours = calculateExtraHours(
              record.checkIn,
              record.checkOut,
              workHours
            );

            return {
              id: record._id,
              employee: record.empId?.name || record.userId?.name || "Unknown",
              employeeId:
                record.empId?.employeeId || record.userId?.email || "N/A",
              role: record.userId?.role || "Employee",
              date: new Date(record.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              checkIn: record.checkIn
                ? new Date(record.checkIn).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true, // AM/PM format
                  })
                : "-",
              checkOut: record.checkOut
                ? new Date(record.checkOut).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true, // AM/PM format
                  })
                : "-",
              status: record.status || "present",
              workHours,
              extraHours,
            };
          });

          console.log("Alternative formatted data:", formattedData);
          setAttendanceData(formattedData);

          const present = formattedData.filter(
            (r) => r.status === "present" && r.checkIn !== "-"
          ).length;
          const absent = formattedData.filter(
            (r) => r.status === "absent" || r.checkIn === "-"
          ).length;
          const late = formattedData.filter(
            (r) => r.checkIn !== "-" && isLate(r.checkIn)
          ).length;

          setStats({ present, absent, late });
        } else {
          console.log(
            "No attendance data in response or response not successful"
          );
          setAttendanceData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "00:00";
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const calculateExtraHours = (checkIn, checkOut, workHours) => {
    if (!checkIn || !checkOut) return "00:00";

    // Parse work hours
    const [hours, minutes] = workHours.split(":").map(Number);
    const totalWorkMinutes = hours * 60 + minutes;
    const totalWorkHours = totalWorkMinutes / 60;

    // If work hours <= 8, no extra hours
    if (totalWorkHours <= 8) return "00:00";

    // Calculate extra hours as (checkout time - 5:00 PM)
    const checkOutDate = new Date(checkOut);
    const endOfDay = new Date(checkOut);
    endOfDay.setHours(17, 0, 0, 0); // 5:00 PM

    if (checkOutDate <= endOfDay) return "00:00";

    const extraMs = checkOutDate - endOfDay;
    const extraHours = Math.floor(extraMs / 1000 / 60 / 60);
    const extraMinutes = Math.floor((extraMs / 1000 / 60) % 60);

    return `${String(extraHours).padStart(2, "0")}:${String(
      extraMinutes
    ).padStart(2, "0")}`;
  };

  const isLate = (checkInTime) => {
    // Assuming work starts at 9:00 AM
    const checkIn = new Date(`2000-01-01 ${checkInTime}`);
    const startTime = new Date("2000-01-01 09:00 AM");
    return checkIn > startTime;
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
  const totalPages = Math.ceil(attendanceData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = attendanceData.slice(indexOfFirstRow, indexOfLastRow);

  const columns = [
    { header: "Employee", accessor: "employee" },
    { header: "Date", accessor: "date" },
    { header: "Check In", accessor: "checkIn" },
    { header: "Check Out", accessor: "checkOut" },
    { header: "Work Hours", accessor: "workHours" },
    { header: "Extra Hours", accessor: "extraHours" },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "present"
              ? "bg-green-100 text-green-800"
              : value === "leave"
              ? "bg-yellow-100 text-yellow-800"
              : value === "absent"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
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
                <FaCalendarCheck className="text-white text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">
                  Attendance
                </h1>
                <p className="text-base text-blue-100">
                  Track and manage employee attendance records
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
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">
                  Present Today
                </span>
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <FaCheckCircle className="text-green-300 text-xl" />
                </div>
              </div>
              <div className="text-4xl font-bold">{stats.present}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">
                  Absent Today
                </span>
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <FaTimesCircle className="text-red-300 text-xl" />
                </div>
              </div>
              <div className="text-4xl font-bold">{stats.absent}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm font-medium">
                  Late Arrivals
                </span>
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <FaClock className="text-yellow-300 text-xl" />
                </div>
              </div>
              <div className="text-4xl font-bold">{stats.late}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <FaFilter className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Date Range Filter
              </h3>
              <p className="text-sm text-gray-600">
                Select date range to view attendance records
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center pt-7">
              <span className="text-gray-500 font-medium">to</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <FaUserClock className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Daily Attendance Overview
              </h3>
              <p className="text-sm text-gray-600">
                View detailed attendance records and work hours
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium">
                Loading attendance data...
              </p>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarCheck className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No attendance data available
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your date filter
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
                      {Math.min(indexOfLastRow, attendanceData.length)} of{" "}
                      {attendanceData.length} records
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
