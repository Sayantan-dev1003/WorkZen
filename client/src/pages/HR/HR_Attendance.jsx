import React, { useState, useEffect } from 'react'
import Table from '../../components/ui/Table'
import { 
  FaCalendarCheck, 
  FaUserClock, 
  FaUserTimes, 
  FaUserCheck 
} from 'react-icons/fa'
import attendanceService from '../../services/attendanceService'

export default function HR_Attendance() {
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

    const handleAttendanceUpdate = () => fetchAttendanceData()
    window.addEventListener('attendanceUpdated', handleAttendanceUpdate)
    
    return () => {
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate)
    }
  }, [filters])

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const response = await attendanceService.getAllHR({
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 100
      })
      
      const attendanceArray = response?.attendance || []

      if (Array.isArray(attendanceArray) && attendanceArray.length > 0) {
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
            checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
            checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
            status: record.status || 'present',
            workHours,
            extraHours
          }
        })
        
        setAttendanceData(formattedData)
        
        const present = formattedData.filter(r => r.status === 'present' && r.checkIn !== '-').length
        const absent = formattedData.filter(r => r.status === 'absent' || r.checkIn === '-').length
        const late = formattedData.filter(r => r.checkIn !== '-' && isLate(r.checkIn)).length
        
        setStats({ present, absent, late })
      } else {
        setAttendanceData([])
        setStats({ present: 0, absent: 0, late: 0 })
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      setAttendanceData([])
      setStats({ present: 0, absent: 0, late: 0 })
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
    const [hours, minutes] = workHours.split(':').map(Number)
    const totalWorkMinutes = hours * 60 + minutes
    const totalWorkHours = totalWorkMinutes / 60
    if (totalWorkHours <= 8) return '00:00'
    
    const checkOutDate = new Date(checkOut)
    const endOfDay = new Date(checkOut)
    endOfDay.setHours(17, 0, 0, 0)
    if (checkOutDate <= endOfDay) return '00:00'
    
    const extraMs = checkOutDate - endOfDay
    const extraHours = Math.floor(extraMs / 1000 / 60 / 60)
    const extraMinutes = Math.floor((extraMs / 1000 / 60) % 60)
    return `${String(extraHours).padStart(2, '0')}:${String(extraMinutes).padStart(2, '0')}`
  }

  const isLate = (checkInTime) => {
    const checkIn = new Date(`2000-01-01 ${checkInTime}`)
    const startTime = new Date('2000-01-01 09:00 AM')
    return checkIn > startTime
  }

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
    <div className="rounded-3xl space-y-8">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-xl p-6">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <FaCalendarCheck className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Attendance Overview</h1>
              <p className="text-green-100">Monitor employee attendance in real time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Date Filter */}
      <section className="bg-white/90 backdrop-blur-sm border border-green-100 rounded-2xl shadow-md p-4 flex flex-wrap gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">Filter by Date:</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </section>

      {/* Table Section */}
      <section className="bg-white/90 backdrop-blur-sm border border-green-100 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaUserClock className="text-green-500" /> Daily Attendance Records
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading attendance data...</div>
        ) : attendanceData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No attendance data available</div>
        ) : (
          <Table columns={columns} data={attendanceData} />
        )}
      </section>
    </div>
  )
}
