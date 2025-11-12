import React, { useState, useEffect } from 'react'
import { FaUserCircle, FaKey, FaBriefcase, FaLock, FaRegIdBadge } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'

export default function HR_MyProfile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('resume')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [skills, setSkills] = useState([])
  const [certifications, setCertifications] = useState([])
  const [about, setAbout] = useState('')
  const [editingAbout, setEditingAbout] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newCertification, setNewCertification] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Private Info state
  const [privateInfo, setPrivateInfo] = useState({
    dateOfBirth: '',
    address: '',
    nationality: 'Indian',
    personalEmail: '',
    gender: '',
    maritalStatus: '',
    joiningDate: '',
    bankDetails: {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      panNumber: '',
      uanNumber: '',
      employeeCode: ''
    }
  })
  const [editingPrivateInfo, setEditingPrivateInfo] = useState(false)

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/profile')
      if (response.data.success && response.data.profile) {
        const profileData = response.data.profile
        setProfile(profileData)
        setSkills(profileData.skills || [])
        setCertifications(profileData.certifications || [])
        setAbout(profileData.about || '')
        
        // Set user details if available
        if (response.data.user) {
          setUserDetails(response.data.user)
        }
        
        // Set employee data if available
        if (response.data.employee) {
          setEmployee(response.data.employee)
        }

        // Set private info with employee joining date and user email
        const empJoiningDate = response.data.employee?.joiningDate 
          ? new Date(response.data.employee.joiningDate).toISOString().split('T')[0] 
          : ''
        
        const userEmail = response.data.employee?.email || response.data.user?.email || ''
        const empCode = response.data.employee?.employeeId || ''

        setPrivateInfo({
          dateOfBirth: profileData.privateInfo?.dateOfBirth 
            ? new Date(profileData.privateInfo.dateOfBirth).toISOString().split('T')[0] 
            : '',
          address: profileData.privateInfo?.address || '',
          nationality: profileData.privateInfo?.nationality || 'Indian',
          personalEmail: profileData.privateInfo?.personalEmail || userEmail,
          gender: profileData.privateInfo?.gender || '',
          maritalStatus: profileData.privateInfo?.maritalStatus || '',
          joiningDate: empJoiningDate,
          bankDetails: {
            accountNumber: profileData.privateInfo?.bankDetails?.accountNumber || '',
            bankName: profileData.privateInfo?.bankDetails?.bankName || '',
            ifscCode: profileData.privateInfo?.bankDetails?.ifscCode || '',
            panNumber: profileData.privateInfo?.bankDetails?.panNumber || '',
            uanNumber: profileData.privateInfo?.bankDetails?.uanNumber || '',
            employeeCode: empCode
          }
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const saveResume = async () => {
    try {
      setSaving(true)
      const response = await api.put('/profile/resume', {
        skills,
        certifications,
        about
      })
      if (response.data.success) {
        showSuccess('Resume updated successfully!')
        setProfile(response.data.profile)
      }
    } catch (error) {
      console.error('Error saving resume:', error)
      alert('Failed to save resume. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = async () => {
    if (newSkill.trim()) {
      const updatedSkills = [...skills, newSkill.trim()]
      setSkills(updatedSkills)
      setNewSkill('')
      await saveResumeField('skills', updatedSkills)
    }
  }

  const addCertification = async () => {
    if (newCertification.trim()) {
      const updatedCertifications = [...certifications, newCertification.trim()]
      setCertifications(updatedCertifications)
      setNewCertification('')
      await saveResumeField('certifications', updatedCertifications)
    }
  }

  const removeSkill = async (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index)
    setSkills(updatedSkills)
    await saveResumeField('skills', updatedSkills)
  }

  const removeCertification = async (index) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index)
    setCertifications(updatedCertifications)
    await saveResumeField('certifications', updatedCertifications)
  }

  const saveResumeField = async (field, value) => {
    try {
      const updateData = { skills, certifications, about }
      updateData[field] = value
      const response = await api.put('/profile/resume', updateData)
      if (response.data.success) {
        showSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} updated!`)
      }
    } catch (error) {
      console.error('Error updating:', error)
    }
  }

  const saveAbout = async () => {
    await saveResumeField('about', about)
    setEditingAbout(false)
  }

  const savePrivateInfo = async () => {
    try {
      setSaving(true)
      const response = await api.put('/profile/private', privateInfo)
      if (response.data.success) {
        showSuccess('Private information updated successfully!')
        setProfile(response.data.profile)
        setEditingPrivateInfo(false)
      }
    } catch (error) {
      console.error('Error saving private info:', error)
      alert('Failed to save private information. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePrivateInfoChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setPrivateInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setPrivateInfo(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    // Validate fields
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match')
      return
    }

    try {
      setChangingPassword(true)
      const response = await api.put('/profile/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })

      if (response.data.success) {
        setPasswordSuccess('Password changed successfully!')
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setPasswordSuccess(''), 5000)
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="rounded-3xl space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative">
          {successMessage}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-blue-100 p-8">
          <div className="text-center text-gray-600">Loading profile...</div>
        </div>
      ) : (
        <>
          {/* Profile Info */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-green-100 p-8">
            <div className="flex items-start gap-6 mb-8 border-b border-green-100 pb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <div className="w-28 h-28 rounded-full bg-white/90 flex items-center justify-center text-4xl text-green-700 font-bold">
                    {employee?.name?.charAt(0) || user?.name?.charAt(0) || 'H'}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {employee?.name || user?.name || 'HR User'}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-500">Login ID</p>
                    <p>{userDetails?.loginId || userDetails?.email || 'HR-001'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p>{employee?.email || userDetails?.email || user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p>{employee?.phone || userDetails?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Company</p>
                    <p>Odoo India</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p>{employee?.department || 'Administration'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Manager</p>
                    <p>{employee?.manager || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p>{employee?.location || 'India'}</p>
                  </div>
                </div>
              </div>
            </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-green-100 mb-8">
          {[
            { key: 'resume', label: 'Resume', icon: <FaBriefcase /> },
            { key: 'private', label: 'Private Info', icon: <FaRegIdBadge /> },
            { key: 'security', label: 'Security', icon: <FaLock /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-green-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Resume Tab */}
        {activeTab === 'resume' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-7">
              <div className="bg-green-50 rounded-xl p-6 border border-green-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-green-700">About Me</h3>
                  {!editingAbout ? (
                    <button
                      onClick={() => setEditingAbout(true)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={saveAbout}
                        disabled={saving}
                        className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setAbout(profile?.about || '')
                          setEditingAbout(false)
                        }}
                        className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                {editingAbout ? (
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Tell us about yourself, what you love about your job, your hobbies and interests..."
                    className="w-full h-64 bg-white border border-green-200 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                ) : (
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {about || 'Click "Edit" to add information about yourself.'}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-5 space-y-6">
              {/* Skills */}
              <div className="bg-white rounded-xl p-6 border border-green-100 shadow-sm">
                <h3 className="text-xl font-semibold text-green-700 mb-4">Skills</h3>
                <div className="space-y-2 mb-4">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-green-50 px-3 py-2 rounded border border-green-100"
                    >
                      <span className="text-sm text-gray-700">{skill}</span>
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-red-500 hover:text-red-600 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add skill..."
                    className="flex-1 bg-white border border-green-200 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded hover:opacity-90 text-sm shadow-md"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-xl p-6 border border-green-100 shadow-sm">
                <h3 className="text-xl font-semibold text-green-700 mb-4">Certifications</h3>
                <div className="space-y-2 mb-4">
                  {certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-green-50 px-3 py-2 rounded border border-green-100"
                    >
                      <span className="text-sm text-gray-700">{cert}</span>
                      <button
                        onClick={() => removeCertification(index)}
                        className="text-red-500 hover:text-red-600 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                    placeholder="Add certification..."
                    className="flex-1 bg-white border border-green-200 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={addCertification}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded hover:opacity-90 text-sm shadow-md"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Private Info Tab */}
        {activeTab === 'private' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">Private Information</h3>
              {!editingPrivateInfo ? (
                <button
                  onClick={() => setEditingPrivateInfo(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:opacity-90 shadow-md"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={savePrivateInfo}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-md"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      fetchProfile()
                      setEditingPrivateInfo(false)
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Personal Details */}
              <div className="space-y-4">
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={privateInfo.dateOfBirth}
                    onChange={(e) => handlePrivateInfoChange('dateOfBirth', e.target.value)}
                    disabled={!editingPrivateInfo}
                    className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Residing Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Residing Address
                  </label>
                  <textarea
                    value={privateInfo.address}
                    onChange={(e) => handlePrivateInfoChange('address', e.target.value)}
                    disabled={!editingPrivateInfo}
                    rows="3"
                    className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    placeholder="Enter your complete address"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={privateInfo.nationality}
                    onChange={(e) => handlePrivateInfoChange('nationality', e.target.value)}
                    disabled={!editingPrivateInfo}
                    className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your nationality"
                  />
                </div>

                {/* Personal Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Email
                  </label>
                  <input
                    type="email"
                    value={privateInfo.personalEmail}
                    disabled
                    className="w-full bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={privateInfo.gender}
                    onChange={(e) => handlePrivateInfoChange('gender', e.target.value)}
                    disabled={!editingPrivateInfo}
                    className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <select
                    value={privateInfo.maritalStatus}
                    onChange={(e) => handlePrivateInfoChange('maritalStatus', e.target.value)}
                    disabled={!editingPrivateInfo}
                    className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                {/* Date of Joining (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={privateInfo.joiningDate}
                    disabled
                    className="w-full bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Right Column - Bank Details */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-lg font-semibold text-green-700 mb-4">Bank Details</h4>
                <div className="space-y-4">
                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={privateInfo.bankDetails.accountNumber}
                      onChange={(e) => handlePrivateInfoChange('bankDetails.accountNumber', e.target.value)}
                      disabled={!editingPrivateInfo}
                      className="w-full bg-white border border-green-200 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter account number"
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={privateInfo.bankDetails.bankName}
                      onChange={(e) => handlePrivateInfoChange('bankDetails.bankName', e.target.value)}
                      disabled={!editingPrivateInfo}
                      className="w-full bg-white border border-green-200 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter bank name"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={privateInfo.bankDetails.ifscCode}
                      onChange={(e) => handlePrivateInfoChange('bankDetails.ifscCode', e.target.value)}
                      disabled={!editingPrivateInfo}
                      className="w-full bg-white border border-green-200 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter IFSC code"
                    />
                  </div>

                  {/* PAN Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN No
                    </label>
                    <input
                      type="text"
                      value={privateInfo.bankDetails.panNumber}
                      onChange={(e) => handlePrivateInfoChange('bankDetails.panNumber', e.target.value.toUpperCase())}
                      disabled={!editingPrivateInfo}
                      className="w-full bg-white border border-green-200 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
                      placeholder="ENTER PAN NUMBER"
                      maxLength="10"
                    />
                  </div>

                  {/* UAN Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UAN NO
                    </label>
                    <input
                      type="text"
                      value={privateInfo.bankDetails.uanNumber}
                      onChange={(e) => handlePrivateInfoChange('bankDetails.uanNumber', e.target.value)}
                      disabled={!editingPrivateInfo}
                      className="w-full bg-white border border-green-200 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter UAN number"
                      maxLength="12"
                    />
                  </div>

                  {/* Employee Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emp Code
                    </label>
                    <input
                      type="text"
                      value={privateInfo.bankDetails.employeeCode}
                      disabled
                      className="w-full bg-gray-100 border border-green-200 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Change Password</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
              {/* Login ID (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login ID
                </label>
                <input
                  type="text"
                  value={userDetails?.loginId || profile?.userId?.loginId || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Old Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Old Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Enter your current password"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Enter new password (min. 6 characters)"
                  minLength={6}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              {/* Error Message */}
              {passwordError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                  {passwordError}
                </div>
              )}

              {/* Success Message */}
              {passwordSuccess && (
                <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
                  {passwordSuccess}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}
