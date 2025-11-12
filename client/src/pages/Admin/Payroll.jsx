import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FaMoneyCheckAlt,
  FaTachometerAlt,
  FaFileInvoiceDollar,
} from 'react-icons/fa'
import PayrollDashboard from './PayrollDashboard'
import PayrollPayrun from './PayrollPayrun'

export default function Payroll() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') || 'dashboard'
  const [activeTab, setActiveTab] = useState(tabFromUrl)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && (tab === 'dashboard' || tab === 'payrun')) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'payrun', label: 'Payrun', icon: FaFileInvoiceDollar },
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-xl p-6">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <FaMoneyCheckAlt className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Payroll</h1>
              <p className="text-blue-100">Manage salaries and payroll operations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200">
        <div className="flex border-b border-slate-200">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="text-lg" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && <PayrollDashboard />}
          {activeTab === 'payrun' && <PayrollPayrun />}
        </div>
      </div>
    </div>
  )
}