import React, { useState, useEffect } from 'react'
import Table from '../../components/ui/Table'
import { FaCalendarCheck, FaUserClock, FaUserTimes, FaUserCheck } from 'react-icons/fa'
import attendanceService from '../../services/attendanceService'

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0
  })
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchAttendanceData()
    
    // Listen for attendance updates
    const handleAttendanceUpdate = () => {
      console.log('Attendance updated event received, refreshing data...')
      fetchAttendanceData()
    }

    window.addEventListener('attendanceUpdated', handleAttendanceUpdate)
    
    return () => {
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate)
    }
  }, [filters])

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      console.log('Fetching attendance data with filters:', filters)
      
      const response = await attendanceService.getAll({
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 100
      })
      
      console.log('Attendance API response:', response)
      console.log('response.data:', response.data)
      console.log('response.data.success:', response.data?.success)
      console.log('response.data.attendance:', response.data?.attendance)
      console.log('Array.isArray(response.data.attendance):', Array.isArray(response.data?.attendance))
      
      // The response structure is: response.data = { success: true, attendance: [...], pagination: {...} }
      if (response.data && response.data.success && response.data.attendance && Array.isArray(response.data.attendance)) {
        console.log('✅ Condition passed! Processing attendance records...')
        console.log('Attendance records:', response.data.attendance)
        
        const formattedData = response.data.attendance.map((record) => {
          const workHours = calculateWorkHours(record.checkIn, record.checkOut)
          const extraHours = calculateExtraHours(record.checkIn, record.checkOut, workHours)
          
          return {
            id: record._id,
            employee: record.empId?.name || record.userId?.name || 'Unknown',
            employeeId: record.empId?.employeeId || record.userId?.email || 'N/A',
            role: record.userId?.role || 'Employee',
            date: new Date(record.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true // AM/PM format
            }) : '-',
            checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true // AM/PM format
            }) : '-',
            status: record.status || 'present',
            workHours,
            extraHours
          }
        })
        
        console.log('Formatted attendance data:', formattedData)
        setAttendanceData(formattedData)
        
        // Calculate stats
        const present = formattedData.filter(r => r.status === 'present' && r.checkIn !== '-').length
        const absent = formattedData.filter(r => r.status === 'absent' || r.checkIn === '-').length
        const late = formattedData.filter(r => r.checkIn !== '-' && isLate(r.checkIn)).length
        
        setStats({ present, absent, late })
      } else {
        console.log('❌ Condition failed!')
        console.log('response.data exists?', !!response.data)
        console.log('response.data.success?', response.data?.success)
        console.log('response.data.attendance exists?', !!response.data?.attendance)
        console.log('is array?', Array.isArray(response.data?.attendance))
        
        // Try alternative access patterns
        const attendanceArray = response.data?.attendance || response.attendance || []
        console.log('Trying alternative access - attendanceArray:', attendanceArray)
        
        if (attendanceArray && attendanceArray.length > 0) {
          console.log('Found attendance via alternative access, processing...')
          const formattedData = attendanceArray.map((record) => {
            const workHours = calculateWorkHours(record.checkIn, record.checkOut)
            const extraHours = calculateExtraHours(record.checkIn, record.checkOut, workHours)
            
            return {
              id: record._id,
              employee: record.empId?.name || record.userId?.name || 'Unknown',
              employeeId: record.empId?.employeeId || record.userId?.email || 'N/A',
              role: record.userId?.role || 'Employee',
              date: new Date(record.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true // AM/PM format
              }) : '-',
              checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true // AM/PM format
              }) : '-',
              status: record.status || 'present',
              workHours,
              extraHours
            }
          })
          
          console.log('Alternative formatted data:', formattedData)
          setAttendanceData(formattedData)
          
          const present = formattedData.filter(r => r.status === 'present' && r.checkIn !== '-').length
          const absent = formattedData.filter(r => r.status === 'absent' || r.checkIn === '-').length
          const late = formattedData.filter(r => r.checkIn !== '-' && isLate(r.checkIn)).length
          
          setStats({ present, absent, late })
        } else {
          console.log('No attendance data in response or response not successful')
          setAttendanceData([])
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      setAttendanceData([])
    } finally {
      setLoading(false)
    }
  }

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '00:00'
    const diff = new Date(checkOut) - new Date(checkIn)
    const hours = Math.floor(diff / 1000 / 60 / 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const calculateExtraHours = (checkIn, checkOut, workHours) => {
    if (!checkIn || !checkOut) return '00:00'
    
    // Parse work hours
    const [hours, minutes] = workHours.split(':').map(Number)
    const totalWorkMinutes = hours * 60 + minutes
    const totalWorkHours = totalWorkMinutes / 60
    
    // If work hours <= 8, no extra hours
    if (totalWorkHours <= 8) return '00:00'
    
    // Calculate extra hours as (checkout time - 5:00 PM)
    const checkOutDate = new Date(checkOut)
    const endOfDay = new Date(checkOut)
    endOfDay.setHours(17, 0, 0, 0) // 5:00 PM
    
    if (checkOutDate <= endOfDay) return '00:00'
    
    const extraMs = checkOutDate - endOfDay
    const extraHours = Math.floor(extraMs / 1000 / 60 / 60)
    const extraMinutes = Math.floor((extraMs / 1000 / 60) % 60)
    
    return `${String(extraHours).padStart(2, '0')}:${String(extraMinutes).padStart(2, '0')}`
  }

  const isLate = (checkInTime) => {
    // Assuming work starts at 9:00 AM
    const checkIn = new Date(`2000-01-01 ${checkInTime}`)
    const startTime = new Date('2000-01-01 09:00 AM')
    return checkIn > startTime
  }

  const getCurrentDateInfo = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const now = new Date()
    const dayName = days[now.getDay()]
    const date = now.getDate()
    const month = months[now.getMonth()]
    const year = now.getFullYear()
    
    return { dayName, date, month, year }
  }

  const dateInfo = getCurrentDateInfo()

  const columns = [
    { header: 'Employee', accessor: 'employee' },
    { header: 'Date', accessor: 'date' },
    { header: 'Check In', accessor: 'checkIn' },
    { header: 'Check Out', accessor: 'checkOut' },
    { header: 'Work Hours', accessor: 'workHours' },
    { header: 'Extra Hours', accessor: 'extraHours' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'present'
              ? 'bg-green-100 text-green-800'
              : value === 'leave'
              ? 'bg-yellow-100 text-yellow-800'
              : value === 'absent'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl p-8">
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
            <FaCalendarCheck className="text-white text-3xl" />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-4xl font-bold">Attendance</h1>
              <div className="text-sm bg-white/20 px-4 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="font-semibold">{dateInfo.date} {dateInfo.month} {dateInfo.year}</span>
                <span className="mx-2">•</span>
                <span>{dateInfo.dayName}</span>
              </div>
            </div>
            <p className="text-blue-100 text-base">Track and manage employee attendance records</p>
          </div>
        </div>
      </section>

      {/* Date Filter */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Filter by Date:</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <span className="text-gray-600 font-medium">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaUserClock className="text-blue-500" /> Daily Attendance Overview
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Loading attendance data...</p>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No attendance data available</div>
          ) : (
            <Table columns={columns} data={attendanceData} />
          )}
        </div>
      </section>
    </div>
  )
}
