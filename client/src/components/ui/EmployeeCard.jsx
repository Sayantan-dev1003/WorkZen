import React from 'react'

const EmployeeCard = ({ employee, onClick }) => {
  // Determine status indicator
  const getStatusIndicator = () => {
    const status = employee.status?.toLowerCase();
    
    switch (status) {
      case 'present':
        return (
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg animate-pulse" title="Present"></div>
        )
      case 'on leave':
      case 'leave':
        return (
          <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg" title="On Leave"></div>
        )
      case 'absent':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg" title="Absent"></div>
        )
      default:
        return (
          <div className="w-4 h-4 bg-gray-400 rounded-full shadow-lg" title="Unknown"></div>
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

  // Get avatar gradient based on name
  const getAvatarGradient = (name) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-violet-500 to-purple-600',
    ]
    const index = name.length % gradients.length
    return gradients[index]
  }

  return (
    <div
      onClick={() => onClick && onClick(employee)}
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden group relative"
    >
      {/* Decorative top border */}
      <div className={`h-1.5 bg-gradient-to-r ${getAvatarGradient(employee.name)}`}></div>
      
      {/* Card Content */}
      <div className="p-6 relative">
        {/* Status Indicator - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          {getStatusIndicator()}
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center">
          {/* Profile Picture with Ring */}
          <div className="relative mb-4">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getAvatarGradient(employee.name)} flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
              {employee.profilePicture ? (
                <img
                  src={employee.profilePicture}
                  alt={employee.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span>{getInitials(employee.name)}</span>
              )}
            </div>
            {/* Decorative ring */}
            <div className={`absolute inset-0 rounded-2xl border-4 border-transparent group-hover:border-blue-100 transition-all duration-300`}></div>
          </div>

          {/* Employee Name */}
          <h3 className="text-lg font-bold text-gray-900 text-center mb-1.5 group-hover:text-blue-600 transition-colors">
            {employee.name}
          </h3>

          {/* Employee Details */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600 font-medium text-center">
              {employee.designation || 'No designation'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 mb-4">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-sm text-gray-500 text-center">
              {employee.department || 'No department'}
            </p>
          </div>

          {/* Status Badge */}
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                employee.status?.toLowerCase() === 'present'
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                  : employee.status?.toLowerCase() === 'on leave' || employee.status?.toLowerCase() === 'leave'
                  ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200'
                  : employee.status?.toLowerCase() === 'absent'
                  ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200'
                  : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200'
              }`}
            >
              {employee.status?.toLowerCase() === 'present' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {(employee.status?.toLowerCase() === 'on leave' || employee.status?.toLowerCase() === 'leave') && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                </svg>
              )}
              {employee.status?.toLowerCase() === 'absent' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {employee.status || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer - Hover Effect */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-3.5 border-t border-gray-200 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300">
        <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-blue-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p className="text-xs font-semibold">
            View Details
          </p>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  )
}

export default EmployeeCard
