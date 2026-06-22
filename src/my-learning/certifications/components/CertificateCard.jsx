import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { FiLoader, FiAward, FiDownload, FiLock, FiCalendar } from "react-icons/fi";
import { purchaseCertificate, downloadCertificate } from "../api/certificateApi";
import CertificateGenerateModal from "./CertificateGenerateModal";
import { env } from "../../../shared/config/env";

export default function CertificateCard({ course, certificatePrice, updateCourseCertificate, onGenerate }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { title, trainerName, category, attendance = {}, eligibility, certificate } = course;
  const attended = attendance.attended || 0;

  const eligStatus = typeof eligibility === "string" ? eligibility : (eligibility?.status || "NONE");
  const requiredCount = typeof eligibility === "object" && eligibility?.required ? eligibility.required : 3;

  let badgeProps = {
    bg: "bg-slate-50 text-slate-500 border-slate-200/50",
    label: "Not eligible",
    progressColor: "bg-slate-300",
    textColor: "text-slate-500"
  };
  
  const hasUrl = certificate?.certificateUrl || certificate?.pdfUrl || certificate?.data?.pdfUrl || certificate?.data?.certificateUrl;
  if (hasUrl) {
    badgeProps = {
      bg: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      label: eligStatus === "PAID" ? "Purchased" : "Downloaded",
      progressColor: "bg-emerald-500",
      textColor: "text-emerald-700"
    };
  } else if (eligStatus === "FREE") {
    badgeProps = {
      bg: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      label: "Free eligible",
      progressColor: "bg-[#2D7A2D]",
      textColor: "text-emerald-600"
    };
  } else if (eligStatus === "PAID") {
    badgeProps = {
      bg: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      label: "Paid eligible",
      progressColor: "bg-amber-500",
      textColor: "text-amber-600"
    };
  } else if (eligStatus === "INCOMPLETE") {
    badgeProps = {
      bg: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      label: "In Progress",
      progressColor: "bg-blue-500",
      textColor: "text-blue-600"
    };
  } else if ((eligStatus === "NONE" || eligStatus === "NOT_ELIGIBLE") && (attended < requiredCount)) {
    badgeProps = {
      bg: "bg-rose-500/10 text-rose-700 border-rose-500/20",
      label: "Low attendance",
      progressColor: "bg-rose-500",
      textColor: "text-rose-600"
    };
  }

  const handleDownload = async () => {
    let pdfLink = certificate?.pdfUrl || certificate?.certificateUrl || certificate?.data?.pdfUrl || certificate?.data?.certificateUrl;
    if (pdfLink) {
      if (pdfLink.startsWith("/")) {
        const baseURL = String(env.apiBaseUrl || "").replace(/\/+$/, "");
        pdfLink = `${baseURL}${pdfLink}`;
      } else {
        pdfLink = pdfLink.replace(/^http:\/\/localhost:\d+/, "");
      }
      window.open(pdfLink, "_blank");
      return;
    }

    setLoading(true);
    try {
      let certId = certificate?.certificateId || certificate?.data?.certificateId;
      if (!certId) {
        toast.error("Certificate ID is missing.");
        return;
      }
      const { signedUrl, pdfUrl } = await downloadCertificate(certId);
      window.open(signedUrl || pdfUrl, "_blank");
      toast.success("Certificate downloaded!");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to download certificate.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { paymentUrl, orderId } = await purchaseCertificate(course.courseId);
      localStorage.setItem("pendingOrderId", orderId);
      localStorage.setItem("pendingCourseId", course.courseId);
      window.location.href = paymentUrl;
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to initiate purchase.");
      setLoading(false);
    }
  };

  const handleGenerateClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmGenerate = async (userData) => {
    setLoading(true);
    try {
      await onGenerate(course, userData);
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const renderButton = () => {
    if (eligStatus === "INCOMPLETE") {
      return (
        <button disabled className="w-full py-2.5 px-4 rounded-xl bg-blue-50/50 text-blue-600 border border-blue-100/50 text-[10px] font-bold cursor-not-allowed flex items-center justify-center text-center gap-1.5 leading-relaxed">
          <FiCalendar className="text-xs shrink-0" />
          Certificate will unlock once the trainer ends the session.
        </button>
      );
    }

    if (hasUrl) {
      return (
        <button 
          onClick={handleDownload} 
          disabled={loading}
          className="w-full h-10 rounded-xl border border-emerald-600 text-emerald-700 text-xs font-bold hover:bg-emerald-50/40 active:scale-[0.99] duration-200 flex items-center justify-center gap-1.5 transition-all"
        >
          {loading ? <FiLoader className="animate-spin text-sm" /> : <FiDownload className="text-sm" />}
          View certificate
        </button>
      );
    }

    if (eligStatus === "FREE" || (eligStatus === "PAID" && certificate?.paymentStatus === "PAID")) {
      return (
        <button 
          onClick={handleGenerateClick}
          disabled={loading}
          className="w-full h-10 rounded-xl bg-[#2D7A2D] text-white text-xs font-bold hover:bg-[#225C22] shadow-sm hover:shadow active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {loading ? <FiLoader className="animate-spin text-sm" /> : <FiAward className="text-sm" />}
          Generate Certificate
        </button>
      );
    }

    if (eligStatus === "PAID") {
      if (certificate?.paymentStatus === "PENDING") {
        return (
          <button disabled className="w-full h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-100/50 text-xs font-semibold flex flex-col items-center justify-center cursor-not-allowed">
            <span className="flex items-center gap-1.5"><FiLoader className="animate-spin text-xs" /> Payment verification pending...</span>
            <span className="text-[9px] opacity-75">Checking payment status</span>
          </button>
        );
      }
      return (
        <button 
          onClick={handlePurchase}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm active:scale-[0.99] transition-all duration-200 flex flex-col items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-1.5 text-xs font-bold">
            {loading ? <FiLoader className="animate-spin text-xs" /> : null}
            Buy certificate — ₹{certificatePrice}
          </span>
          <span className="text-[9px] font-medium opacity-90 mt-0.5">One-time payment for this certificate</span>
        </button>
      );
    }

    if ((eligStatus === "NONE" || eligStatus === "NOT_ELIGIBLE") && attended < requiredCount) {
      return (
        <button disabled className="w-full py-2.5 px-4 rounded-xl bg-rose-50/50 text-rose-600 border border-rose-100/50 text-[10px] font-bold cursor-not-allowed flex items-center justify-center text-center gap-1.5 leading-relaxed">
          <FiLock className="text-xs shrink-0" />
          Requires at least {requiredCount} attended sessions (attended {attended}).
        </button>
      );
    }

    return (
      <button disabled className="w-full h-10 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5">
        <FiLock className="text-sm" />
        Not eligible
      </button>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_40px_-8px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full group">
      {/* Background soft glow decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/[0.02] to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <span className="inline-block text-[9px] font-extrabold text-[#2D7A2D] uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mb-2">
              {category || "Session"}
            </span>
            <h3 className="font-bold text-slate-800 leading-snug group-hover:text-[#2D7A2D] transition-colors duration-200 text-sm truncate-2-lines">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Trainer: {trainerName || "LurnStack Trainer"}</p>
          </div>
          <div className={`px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold tracking-wider uppercase whitespace-nowrap shadow-sm shrink-0 ${badgeProps.bg}`}>
            {badgeProps.label}
          </div>
        </div>
      </div>

      {eligStatus !== "PAID" && (
        <div className="mt-5 mb-4">
          <div className={`text-[11px] font-bold mb-1.5 flex justify-between items-center ${badgeProps.textColor}`}>
            <span>Attendance Progress</span>
            <span>
              {String(course.courseId || "").startsWith("mock-")
                ? Math.min(attended, requiredCount)
                : attended}{" "}
              / {requiredCount} sessions
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${badgeProps.progressColor}`} 
              style={{ width: `${Math.min((attended / requiredCount) * 100, 100)}%` }} 
            />
          </div>
        </div>
      )}

      <div className="mt-auto pt-2">
        {renderButton()}
      </div>

      {isModalOpen && createPortal(
        <CertificateGenerateModal
          course={course}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmGenerate}
          isGenerating={loading}
        />,
        document.body
      )}
    </div>
  );
}
