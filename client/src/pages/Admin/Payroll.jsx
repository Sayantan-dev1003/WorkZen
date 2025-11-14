import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaMoneyCheckAlt,
  FaTachometerAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import PayrollDashboard from "./PayrollDashboard";
import PayrollPayrun from "./PayrollPayrun";

export default function Payroll() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "dashboard" || tab === "payrun")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "payrun", label: "Payrun", icon: FaFileInvoiceDollar },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg">
              <FaMoneyCheckAlt className="text-white text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">
                Payroll
              </h1>
              <p className="text-base text-blue-100">
                Manage salaries and payroll operations
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-xs py-1 font-bold text-white">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-gradient-to-r from-gray-50 to-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 font-semibold transition-all ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-3 border-blue-600 bg-white shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                <Icon className="text-xl" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-gray-50">
          {activeTab === "dashboard" && <PayrollDashboard />}
          {activeTab === "payrun" && <PayrollPayrun />}
        </div>
      </div>
    </div>
  );
}
