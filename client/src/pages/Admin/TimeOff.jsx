import React, { useState, useEffect } from 'react'
import Table from '../../components/ui/Table'
import {
  FaUmbrellaBeach,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaFilter,
} from 'react-icons/fa'
import leaveService from '../../services/leaveService'

export default function TimeOff() {
  const [leaveData, setLeaveData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    leaveType: '',
    status: '',
  })
  const [stats, setStats] = useState({
    paidTimeOff: 24,
    sickTimeOff: 7,
  })

  useEffect(() => {
    fetchLeaveData()
  }, [filters])

  const fetchLeaveData = async () => {
    setLoading(true)
    try {
      console.log('Fetching leave data with filters:', filters)
      
      const params = {
        limit: 100
      }
      
      if (filters.leaveType) params.leaveType = filters.leaveType
      if (filters.status) params.status = filters.status
      
      const response = await leaveService.getAll(params)
      
      console.log('Leave API full response:', response)
      console.log('Response data:', response.data)
      console.log('Response leaves:', response.leaves)
      
      // Handle both response.data.leaves and response.leaves patterns
      const leavesArray = response.data?.leaves || response.leaves || []
      
      if (leavesArray && leavesArray.length > 0) {
        console.log('Leave records found:', leavesArray)
        
        const formattedData = leavesArray.map((record) => {
          const startDate = new Date(record.startDate)
          const endDate = new Date(record.endDate)
          const days = record.numberOfDays || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
          
          return {
            id: record._id,
            employee: record.empId?.name || 'Unknown',
            employeeId: record.empId?.employeeId || 'N/A',
            leaveType: record.leaveType || 'N/A',
            startDate: startDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            endDate: endDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            days,
            status: record.status || 'pending',
            reason: record.reason || '',
            rawData: record
          }
        })
        
        console.log('Formatted leave data:', formattedData)
        setLeaveData(formattedData)
      } else {
        console.log('No leave data in response')
        setLeaveData([])
      }
    } catch (error) {
      console.error('Error fetching leave data:', error)
      console.error('Error response:', error.response?.data)
      setLeaveData([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await leaveService.updateStatus(id, 'approved')
      alert('✅ Leave request approved!')
      fetchLeaveData()
    } catch (error) {
      console.error('Error approving leave:', error)
      alert(error.response?.data?.message || 'Failed to approve leave request')
    }
  }

  const handleReject = async (id) => {
    try {
      await leaveService.updateStatus(id, 'rejected')
      alert('❌ Leave request rejected!')
      fetchLeaveData()
    } catch (error) {
      console.error('Error rejecting leave:', error)
      alert(error.response?.data?.message || 'Failed to reject leave request')
    }
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
    { header: 'Employee Name', accessor: 'employee' },
    { header: 'Start Date', accessor: 'startDate' },
    { header: 'End Date', accessor: 'endDate' },
    { header: 'Days', accessor: 'days' },
    { 
      header: 'Time Off Type', 
      accessor: 'leaveType',
      render: (value) => (
        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
          value === 'Paid time Off' 
            ? 'bg-blue-100 text-blue-700'
            : value === 'Sick time off'
            ? 'bg-orange-100 text-orange-700'
            : value === 'Unpaid'
            ? 'bg-gray-100 text-gray-700'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === 'approved'
              ? 'bg-green-100 text-green-800'
              : value === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' ? (
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
              {row.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl p-8">
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
            <FaUmbrellaBeach className="text-white text-3xl" />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-4xl font-bold">Time Off</h1>
              <div className="text-sm bg-white/20 px-4 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="font-semibold">{dateInfo.date} {dateInfo.month} {dateInfo.year}</span>
                <span className="mx-2">•</span>
                <span>{dateInfo.dayName}</span>
              </div>
            </div>
            <p className="text-blue-100 text-base">Manage and review employee leave requests</p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <label className="text-sm font-semibold text-gray-700">Filters:</label>
          </div>
          
          <select
            value={filters.leaveType}
            onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">All Time Off Types</option>
            <option value="Paid time Off">Paid time Off</option>
            <option value="Sick time off">Sick time off</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          {(filters.leaveType || filters.status) && (
            <button
              onClick={() => setFilters({ leaveType: '', status: '' })}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaUmbrellaBeach className="text-blue-500" /> Leave Requests Overview
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">Loading leave requests...</p>
            </div>
          ) : leaveData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No leave requests found</div>
          ) : (
            <Table columns={columns} data={leaveData} />
          )}
        </div>
      </section>
    </div>
  )
}
