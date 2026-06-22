import React, { useState } from "react";
import { FiX, FiAward, FiLoader } from "react-icons/fi";
import { useAuth } from "../../../auth/model/AuthContext";

export default function CertificateGenerateModal({ course, onClose, onConfirm, isGenerating }) {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState(user?.fullName || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!course) return null;

  const handleConfirm = () => {
    const payload = { studentName };
    if (startDate) payload.startDate = startDate;
    if (endDate) payload.endDate = endDate;
    onConfirm(payload);
  };

  const isFormValid = studentName.trim() !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] border border-slate-100/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FiAward className="text-[#2D7A2D] text-base" />
            Generate Certificate
          </h2>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6">
          <p className="text-xs font-medium text-slate-500 mb-5 leading-relaxed">
            Please verify the details below to generate your certificate for <span className="font-semibold text-slate-700">{course.title}</span>.
          </p>

          <div className="space-y-4.5 mb-6">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Student Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled={isGenerating}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D7A2D]/10 focus:border-[#2D7A2D] focus:bg-white transition-all text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Start Date <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A2D]/10 focus:border-[#2D7A2D] focus:bg-white transition-all text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  End Date <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7A2D]/10 focus:border-[#2D7A2D] focus:bg-white transition-all text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isGenerating || !isFormValid}
              className="px-4 py-2 rounded-xl bg-[#2D7A2D] text-white text-xs font-bold hover:bg-[#215A21] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <FiLoader className="animate-spin text-xs" />
                  Generating...
                </>
              ) : (
                "Confirm & Generate"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
