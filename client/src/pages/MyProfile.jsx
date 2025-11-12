import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MyProfile() {
  const userName = localStorage.getItem("userName") || "Admin User";
  const userEmail = localStorage.getItem("userEmail") || "admin@workzen.com";

  const [activeTab, setActiveTab] = useState("resume");
  const [skills, setSkills] = useState([
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
  ]);
  const [certifications, setCertifications] = useState([
    "AWS Certified",
    "PMP Certified",
  ]);
  const [newSkill, setNewSkill] = useState("");
  const [newCertification, setNewCertification] = useState("");

  // Functions
  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 space-y-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-3xl p-8 shadow-2xl"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10"
        >
          <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-emerald-100 text-lg">
            Manage your personal information and settings
          </p>
        </motion.div>
      </motion.section>

      {/* Profile Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100/50 p-8 relative z-10"
      >
        {/* Profile Header */}
        <div className="flex items-start gap-8 mb-8 pb-8 border-b-2 border-emerald-100/50">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl overflow-hidden relative">
              <span className="text-5xl">👤</span>
              <div className="absolute inset-0 bg-white/20 animate-ping rounded-full"></div>
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-50 transition-all border-2 border-emerald-200">
              ✏️
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">{userName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "Login ID", value: userEmail },
                { label: "Company", value: "WorkZen HRMS" },
                { label: "Email", value: userEmail },
                { label: "Department", value: "Administration" },
                { label: "Mobile", value: "+91 1234567890" },
                { label: "Location", value: "Mumbai, India" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 shadow-sm hover:shadow-md border border-emerald-100/50 transition-all"
                >
                  <p className="text-sm text-gray-600 mb-1 font-semibold">
                    {item.label}
                  </p>
                  <p className="text-gray-800 font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: "resume", label: "Resume", icon: "📄" },
            { id: "private", label: "Private Info", icon: "🔒" },
            { id: "salary", label: "Salary Info", icon: "💰" },
            { id: "security", label: "Security", icon: "🛡️" },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-sm transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Tabs Content */}
        <AnimatePresence mode="wait">
          {activeTab === "resume" && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-12 gap-8"
            >
              {/* About Me */}
              <div className="col-span-12 lg:col-span-7 space-y-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border-2 border-emerald-100/50 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                      ✨
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">About Me</h3>
                  </div>
                  <textarea
                    className="w-full px-6 py-4 border-2 border-emerald-200 rounded-2xl bg-white/50 resize-none"
                    rows="3"
                    defaultValue="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
                  />
                  <button className="w-full px-6 py-3 mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 font-semibold shadow-lg">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Skills & Certifications */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                {/* Skills */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-emerald-200/50 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    💪 Skills
                  </h3>
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex justify-between bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 rounded-2xl mb-3 border border-emerald-200/50"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-red-500 hover:text-red-600 font-bold text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      placeholder="Add a skill..."
                      className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-2xl bg-white/50"
                    />
                    <button
                      onClick={addSkill}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Certifications */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 border-emerald-200/50 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🏆 Certifications
                  </h3>
                  {certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex justify-between bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 rounded-2xl mb-3 border border-emerald-200/50"
                    >
                      <span>{cert}</span>
                      <button
                        onClick={() => removeCertification(index)}
                        className="text-red-500 hover:text-red-600 font-bold text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && addCertification()
                      }
                      placeholder="Add certification..."
                      className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-2xl bg-white/50"
                    />
                    <button
                      onClick={addCertification}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
