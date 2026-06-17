import React, { useState } from "react";
import { FiX, FiAward, FiLoader } from "react-icons/fi";

export default function CertificateGenerateModal({ course, onClose, onConfirm, isGenerating }) {
  const [studentName, setStudentName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!course) return null;

  const handleConfirm = () => {
    onConfirm({ studentName, startDate, endDate });
  };

  const isFormValid = studentName.trim() !== "" && startDate !== "" && endDate !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FiAward className="text-[#2D7A2D]" />
            Generate Certificate
          </h2>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
          <p className="text-sm text-slate-600 mb-6">
            Please verify the details below to generate your certificate for <span className="font-semibold">{course.title}</span>.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled={isGenerating}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D7A2D]/20 focus:border-[#2D7A2D] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D7A2D]/20 focus:border-[#2D7A2D] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D7A2D]/20 focus:border-[#2D7A2D] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isGenerating || !isFormValid}
              className="px-5 py-2.5 rounded-xl bg-[#2D7A2D] text-white text-sm font-bold hover:bg-[#215A21] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
            >
              {isGenerating ? (
                <>
                  <FiLoader className="animate-spin" />
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
