import React from 'react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-600 mt-1">Manage system settings and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Settings Menu</h2>
          </div>
          <nav className="p-2">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
              General
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700">
              Departments
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700">
              Designations
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700">
              Leave Types
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700">
              Security
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">General Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="WorkZen HRMS"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Domain
              </label>
              <input
                type="text"
                defaultValue="@workzen.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time Zone
              </label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>GMT+5:30 (India Standard Time)</option>
                <option>GMT+0:00 (UTC)</option>
                <option>GMT-5:00 (Eastern Time)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Working Hours
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  defaultValue="09:00"
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="time"
                  defaultValue="18:00"
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Save Changes
              </button>
              <button className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
