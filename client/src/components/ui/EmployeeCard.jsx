import React from 'react'

const EmployeeCard = ({ employee, onClick }) => {
  // Determine status indicator
  const getStatusIndicator = () => {
    const status = employee.status?.toLowerCase();
    
    switch (status) {
      case 'present':
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" title="Present"></div>
        )
      case 'on leave':
      case 'leave':
        return (
          <div className="flex items-center justify-center" title="On Leave">
            <span className="text-lg">✈️</span>
          </div>
        )
      case 'absent':
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg" title="Absent"></div>
        )
      default:
        return (
          <div className="w-3 h-3 bg-gray-400 rounded-full shadow-lg" title="Unknown"></div>
        )
    }
  }

  // Generate initials for avatar if no image
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      onClick={() => onClick && onClick(employee)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200 overflow-hidden group hover:scale-105"
    >
      {/* Card Content */}
      <div className="p-6 relative">
        {/* Status Indicator - Top Right */}
        <div className="absolute top-4 right-4">
          {getStatusIndicator()}
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
            {employee.profilePicture ? (
              <img
                src={employee.profilePicture}
                alt={employee.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{getInitials(employee.name)}</span>
            )}
          </div>

          {/* Employee Name */}
          <h3 className="text-lg font-semibold text-slate-800 text-center mb-1">
            {employee.name}
          </h3>

          {/* Employee Details */}
          <p className="text-sm text-slate-600 text-center mb-1">
            {employee.designation || 'No designation'}
          </p>
          <p className="text-xs text-slate-500 text-center">
            {employee.department || 'No department'}
          </p>

          {/* Status Badge */}
          <div className="mt-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                employee.status?.toLowerCase() === 'present'
                  ? 'bg-green-100 text-green-800'
                  : employee.status?.toLowerCase() === 'on leave' || employee.status?.toLowerCase() === 'leave'
                  ? 'bg-blue-100 text-blue-800'
                  : employee.status?.toLowerCase() === 'absent'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {employee.status || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer - Hover Effect */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 group-hover:bg-indigo-50 transition-colors">
        <p className="text-xs text-slate-600 text-center group-hover:text-indigo-600">
          Click to view details
        </p>
      </div>
    </div>
  )
}

export default EmployeeCard
