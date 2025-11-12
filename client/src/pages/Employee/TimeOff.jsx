import React, { useState, useEffect } from 'react'
import leaveService from '../../services/leaveService'

export default function EmployeeTimeOff() {
  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  const [formData, setFormData] = useState({
    leaveType: 'Paid time Off',
    startDate: '',
    endDate: '',
    numberOfDays: '',
    attachment: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Get user info
  let userName = 'Employee'
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      userName = user.name || 'Employee'
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log('Fetching employee leave data...')
      
      // Fetch leave requests
      const requestsResponse = await leaveService.getMyRequests({ 
        year: new Date().getFullYear(),
        limit: 100 
      })
      
      console.log('Leave requests response:', requestsResponse)
      console.log('Response data:', requestsResponse.data)
      console.log('Response leaves:', requestsResponse.leaves)
      
      // Handle both response patterns
      const leavesArray = requestsResponse.data?.leaves || requestsResponse.leaves || []
      
      if (leavesArray && leavesArray.length > 0) {
        console.log('Leave requests found:', leavesArray)
        setLeaveRequests(leavesArray)
      } else {
        console.log('No leave requests found')
        setLeaveRequests([])
      }

      // Fetch leave balance
      const balanceResponse = await leaveService.getBalance()
      console.log('Leave balance response:', balanceResponse)
      
      if (balanceResponse.success || balanceResponse.data) {
        const balance = balanceResponse.data?.balance || balanceResponse.balance
        console.log('Leave balance:', balance)
        setLeaveBalance(balance)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      console.error('Error response:', error.response?.data)
      setLeaveRequests([])
      setLeaveBalance(null)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Auto-calculate number of days when dates change
    if (name === 'startDate' || name === 'endDate') {
      const newFormData = { ...formData, [name]: value }
      const start = new Date(newFormData.startDate)
      const end = new Date(newFormData.endDate)
      
      if (newFormData.startDate && newFormData.endDate && end >= start) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
        setFormData({ ...newFormData, numberOfDays: days })
      } else {
        setFormData(newFormData)
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, attachment: 'File size must be less than 5MB' }))
        return
      }
      
      // Validate file type (images and PDFs only)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setFormErrors(prev => ({ ...prev, attachment: 'Only images (JPEG, PNG, GIF) and PDF files are allowed' }))
        return
      }
      
      setSelectedFile(file)
      if (formErrors.attachment) {
        setFormErrors(prev => ({ ...prev, attachment: '' }))
      }
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.leaveType) errors.leaveType = 'Please select leave type'
    if (!formData.startDate) errors.startDate = 'Start date is required'
    if (!formData.endDate) errors.endDate = 'End date is required'
    if (!formData.numberOfDays || formData.numberOfDays < 1) errors.numberOfDays = 'Number of days must be at least 1'
    
    // Validate dates
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      
      if (end < start) {
        errors.endDate = 'End date must be after start date'
      }
    }

    // Validate medical certificate for sick leave
    if (formData.leaveType === 'Sick time off' && !selectedFile) {
      errors.attachment = 'Medical certificate is required for sick leave'
    }

    // Validate against balance (not for Unpaid leave)
    if (leaveBalance && formData.leaveType && formData.numberOfDays && formData.leaveType !== 'Unpaid') {
      const type = formData.leaveType === 'Paid time Off' ? 'paidTimeOff' : 'sickTimeOff'
      if (formData.numberOfDays > leaveBalance[type].available) {
        errors.numberOfDays = `Insufficient balance. Available: ${leaveBalance[type].available} days`
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      // TODO: Implement file upload to server
      // For now, we'll just store the filename as placeholder
      let attachmentPath = ''
      if (selectedFile) {
        // In production, upload file to server and get path
        attachmentPath = selectedFile.name
        console.log('File to upload:', selectedFile)
      }

      const requestData = {
        ...formData,
        attachment: attachmentPath
      }

      const response = await leaveService.createMyRequest(requestData)
      
      if (response.success) {
        alert('✅ Leave request submitted successfully!')
        setShowNewRequestModal(false)
        setFormData({
          leaveType: 'Paid time Off',
          startDate: '',
          endDate: '',
          numberOfDays: '',
          attachment: ''
        })
        setSelectedFile(null)
        await fetchData()
      }
    } catch (error) {
      console.error('Error submitting leave request:', error)
      alert(error.response?.data?.message || 'Failed to submit leave request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
      return
    }

    try {
      const response = await leaveService.cancelMyRequest(id)
      if (response.success) {
        alert('✅ Leave request cancelled successfully!')
        await fetchData()
      }
    } catch (error) {
      console.error('Error cancelling leave request:', error)
      alert(error.response?.data?.message || 'Failed to cancel leave request.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-xl p-8">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-4xl font-bold">Time Off</h1>
                <div className="text-sm bg-white/20 px-4 py-1.5 rounded-lg backdrop-blur-sm">
                  <span className="font-semibold">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="mx-2">•</span>
                  <span>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]}</span>
                </div>
              </div>
              <p className="text-purple-100 text-base">Manage your leave requests</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="px-6 py-3 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors shadow-md flex items-center gap-2 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            NEW
          </button>
        </div>
      </section>

      {/* Leave Balance Cards */}
      {leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Paid Time Off */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-base font-semibold text-blue-600 mb-3">Paid time Off</h3>
            <div className="text-3xl font-bold text-slate-800 mb-3">
              {leaveBalance.paidTimeOff.available} Days Available
            </div>
            <div className="text-sm text-slate-600">
              <span>Total: {leaveBalance.paidTimeOff.total} days</span>
              <span className="mx-2">•</span>
              <span>Used: {leaveBalance.paidTimeOff.used} days</span>
            </div>
          </div>

          {/* Sick Time Off */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-base font-semibold text-orange-600 mb-3">Sick time off</h3>
            <div className="text-3xl font-bold text-slate-800 mb-3">
              {leaveBalance.sickTimeOff.available} Days Available
            </div>
            <div className="text-sm text-slate-600">
              <span>Total: {leaveBalance.sickTimeOff.total} days</span>
              <span className="mx-2">•</span>
              <span>Used: {leaveBalance.sickTimeOff.used} days</span>
            </div>
          </div>

          {/* Unpaid Leave */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-base font-semibold text-gray-600 mb-3">Unpaid</h3>
            <div className="text-3xl font-bold text-slate-800 mb-3">
              {leaveBalance.unpaid?.used || 0} Days Used
            </div>
            <div className="text-sm text-slate-600">
              <span>No limit on unpaid leave</span>
            </div>
          </div>
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl shadow-md border border-purple-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50 border-b-2 border-purple-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">Time off Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">Days</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-purple-600">
                    <div className="flex flex-col justify-center items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p>Loading leave requests...</p>
                    </div>
                  </td>
                </tr>
              ) : leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-purple-600">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {request.empId?.name || userName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatDate(request.startDate)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatDate(request.endDate)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        request.leaveType === 'Paid time Off' ? 'bg-blue-100 text-blue-700' : 
                        request.leaveType === 'Sick time off' ? 'bg-orange-100 text-orange-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{request.numberOfDays}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(request.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">New Time Off Request</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Employee Name (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Employee
                </label>
                <input
                  type="text"
                  value={userName}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                />
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time off type <span className="text-red-500">*</span>
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    formErrors.leaveType ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="Paid time Off">Paid time Off</option>
                  <option value="Sick time off">Sick time off</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
                {formErrors.leaveType && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.leaveType}</p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.startDate ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.startDate && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.endDate ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.endDate && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Number of Days (Auto-calculated) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Allocation (Number of days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Automatically calculated from start and end dates
                </p>
                {formErrors.numberOfDays && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.numberOfDays}</p>
                )}
              </div>

              {/* Attachment (Only for Sick Leave) */}
              {formData.leaveType === 'Sick time off' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Medical Certificate <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-indigo-500 transition-colors ${
                        formErrors.attachment ? 'border-red-500' : 'border-slate-300'
                      }`}>
                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm text-slate-600">
                          {selectedFile ? (
                            <span className="text-indigo-600 font-medium">{selectedFile.name}</span>
                          ) : (
                            <>
                              <span className="text-indigo-600 font-medium">Click to upload</span> or drag and drop
                            </>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG, GIF or PDF up to 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                        className="hidden"
                      />
                    </label>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null)
                          if (formErrors.attachment) {
                            setFormErrors(prev => ({ ...prev, attachment: '' }))
                          }
                        }}
                        className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {formErrors.attachment && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.attachment}</p>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewRequestModal(false)
                    setFormErrors({})
                    setSelectedFile(null)
                    setFormData({
                      leaveType: 'Paid time Off',
                      startDate: '',
                      endDate: '',
                      numberOfDays: '',
                      attachment: ''
                    })
                  }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
