import React, { useState, useEffect } from 'react'
import attendanceService from '../../services/attendanceService'

export default function EmployeeAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [stats, setStats] = useState({
    present: 0,
    leaves: 0,
    totalWorkingDays: 0
  })

  useEffect(() => {
    fetchAttendanceData()
    
    // Listen for attendance updates from navbar
    const handleAttendanceUpdate = () => {
      fetchAttendanceData()
    }
    
    window.addEventListener('attendanceUpdated', handleAttendanceUpdate)
    
    return () => {
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate)
    }
  }, [currentMonth])

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      // Get all attendance for current month (my records only)
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59)
      
      console.log('Fetching attendance for:', {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      })
      
      const response = await attendanceService.getMyRecords({
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
        limit: 100
      })

      console.log('Full Attendance response:', response)
      console.log('Response data:', response.data)

      // Handle Axios response structure (response.data contains the actual API response)
      const apiResponse = response.data || response
      console.log('API Response:', apiResponse)

      if (apiResponse.success !== false && apiResponse.attendance) {
        const records = apiResponse.attendance
        console.log('Attendance records found:', records.length, records)
        setAttendanceRecords(records)
        
        // Calculate stats
        const presentCount = records.filter(r => r.status === 'present' || r.checkIn).length
        const leaveCount = records.filter(r => r.status === 'leave').length
        const workingDays = getWorkingDaysInMonth(currentMonth)
        
        console.log('Stats:', { presentCount, leaveCount, workingDays })
        
        setStats({
          present: presentCount,
          leaves: leaveCount,
          totalWorkingDays: workingDays
        })
      } else if (apiResponse.data?.attendance) {
        // Alternative structure
        const records = apiResponse.data.attendance
        console.log('Attendance records found (nested):', records.length, records)
        setAttendanceRecords(records)
        
        const presentCount = records.filter(r => r.status === 'present' || r.checkIn).length
        const leaveCount = records.filter(r => r.status === 'leave').length
        const workingDays = getWorkingDaysInMonth(currentMonth)
        
        setStats({
          present: presentCount,
          leaves: leaveCount,
          totalWorkingDays: workingDays
        })
      } else {
        console.log('No attendance data in response')
        setAttendanceRecords([])
        setStats({
          present: 0,
          leaves: 0,
          totalWorkingDays: getWorkingDaysInMonth(currentMonth)
        })
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      console.error('Error response:', error.response?.data)
      setAttendanceRecords([])
      setStats({
        present: 0,
        leaves: 0,
        totalWorkingDays: getWorkingDaysInMonth(currentMonth)
      })
    } finally {
      setLoading(false)
    }
  }

  const getWorkingDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    let workingDays = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day)
      const dayOfWeek = currentDate.getDay()
      // Exclude Sundays (0)
      if (dayOfWeek !== 0) {
        workingDays++
      }
    }
    return workingDays
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true // AM/PM format
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-'
    const diff = new Date(checkOut) - new Date(checkIn)
    const hours = Math.floor(diff / 1000 / 60 / 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const calculateExtraHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-'
    const diff = new Date(checkOut) - new Date(checkIn)
    const totalHours = diff / 1000 / 60 / 60
    const extraHours = Math.max(0, totalHours - 9) // Assuming 9 hours is standard
    const hours = Math.floor(extraHours)
    const minutes = Math.floor((extraHours % 1) * 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleMonthSelect = (monthIndex) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1))
    setShowMonthPicker(false)
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonthName = monthNamesShort[currentMonth.getMonth()]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-xl p-8">
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-4xl font-bold">Attendance</h1>
              <div className="text-sm bg-white/20 px-4 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="font-semibold">{currentMonth.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]}</span>
              </div>
            </div>
            <p className="text-purple-100 text-base">Track your attendance records</p>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white rounded-xl shadow-md border border-purple-200 p-5">
        <div className="flex items-center justify-between">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousMonth}
              className="w-10 h-10 border-2 border-purple-300 rounded-lg hover:bg-purple-50 flex items-center justify-center transition-colors text-purple-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="w-10 h-10 border-2 border-purple-300 rounded-lg hover:bg-purple-50 flex items-center justify-center transition-colors text-purple-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Month Dropdown */}
            <div className="ml-2 relative">
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="px-6 py-2 border-2 border-purple-300 rounded-lg min-w-[120px] text-center hover:bg-purple-50 transition-colors text-purple-700 font-medium flex items-center justify-center gap-2"
              >
                {currentMonthName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Month Picker Dropdown */}
              {showMonthPicker && (
                <div className="absolute top-full mt-2 left-0 bg-white border-2 border-purple-300 rounded-lg shadow-lg z-50 grid grid-cols-3 gap-2 p-3 min-w-[300px]">
                  {monthNamesShort.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(index)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        index === currentMonth.getMonth()
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-purple-100 text-purple-700'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats with Purple Theme */}
          <div className="flex items-center gap-6">
            <div className="px-5 py-2.5 border-2 border-purple-300 rounded-lg bg-purple-50">
              <span className="text-purple-700">Count of days present: </span>
              <span className="font-bold text-purple-900">{stats.present}</span>
            </div>
            <div className="px-5 py-2.5 border-2 border-purple-300 rounded-lg bg-purple-50">
              <span className="text-purple-700">Leaves count: </span>
              <span className="font-bold text-purple-900">{stats.leaves}</span>
            </div>
            <div className="px-5 py-2.5 border-2 border-purple-300 rounded-lg bg-purple-50">
              <span className="text-purple-700">Total working days: </span>
              <span className="font-bold text-purple-900">{stats.totalWorkingDays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table with Purple Theme */}
      <div className="bg-white rounded-xl shadow-md border border-purple-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 border-b-2 border-purple-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">Work Hours</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">Extra hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-purple-600">
                    <div className="flex flex-col justify-center items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p>Loading attendance data...</p>
                    </div>
                  </td>
                </tr>
              ) : attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-purple-600">
                    No attendance records found for this month
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatTime(record.checkIn)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatTime(record.checkOut)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {calculateWorkHours(record.checkIn, record.checkOut)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {calculateExtraHours(record.checkIn, record.checkOut)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
