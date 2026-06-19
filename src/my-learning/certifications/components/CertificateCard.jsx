import React, { useState } from "react";
import { toast } from "react-toastify";
import { FiLoader, FiAward, FiDownload, FiLock, FiCalendar } from "react-icons/fi";
import { generateCertificate, purchaseCertificate, downloadCertificate } from "../api/certificateApi";
import CertificateGenerateModal from "./CertificateGenerateModal";
import { env } from "../../../shared/config/env";

export default function CertificateCard({ course, certificatePrice, updateCourseCertificate, onGenerate }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { title, trainerName, category, attendance = {}, eligibility, certificate } = course;
  const pct = attendance.pct || 0;
  const total = attendance.total || 0;
  const attended = attendance.attended || 0;

  const eligStatus = typeof eligibility === "string" ? eligibility : (eligibility?.status || "NONE");
  const requiredCount = typeof eligibility === "object" && eligibility?.required ? eligibility.required : 3;

  let badgeProps = {
    bg: "bg-slate-50 text-slate-600 border-slate-100",
    label: "Not eligible",
    progressColor: "from-rose-500 to-red-500",
    textColor: "text-slate-500"
  };
  
  const hasUrl = certificate?.certificateUrl || certificate?.pdfUrl || certificate?.data?.pdfUrl || certificate?.data?.certificateUrl;
  if (hasUrl) {
    badgeProps = {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
      label: eligStatus === "PAID" ? "Purchased" : "Downloaded",
      progressColor: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-700"
    };
  } else if (eligStatus === "FREE") {
    badgeProps = {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
      label: "Free eligible",
      progressColor: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-600"
    };
  } else if (eligStatus === "PAID") {
    badgeProps = {
      bg: "bg-amber-50 text-amber-700 border-amber-100",
      label: "Paid eligible",
      progressColor: "from-amber-500 to-orange-500",
      textColor: "text-amber-600"
    };
  } else if (eligStatus === "INCOMPLETE") {
    badgeProps = {
      bg: "bg-blue-50 text-blue-700 border-blue-100",
      label: "In Progress",
      progressColor: "from-blue-500 to-indigo-500",
      textColor: "text-blue-600"
    };
  } else if ((eligStatus === "NONE" || eligStatus === "NOT_ELIGIBLE") && (attended < requiredCount)) {
    badgeProps = {
      bg: "bg-rose-50 text-rose-700 border-rose-100",
      label: "Low attendance",
      progressColor: "from-rose-500 to-red-500",
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
        <button disabled className="w-full py-3 px-4 rounded-2xl bg-blue-50/50 text-blue-600 border border-blue-100/50 text-[10px] font-bold cursor-not-allowed flex items-center justify-center text-center gap-1.5 leading-relaxed">
          <FiCalendar className="text-xs" />
          Certificate will unlock once the trainer ends the session.
        </button>
      );
    }

    if (hasUrl) {
      return (
        <button 
          onClick={handleDownload} 
          disabled={loading}
          className="w-full h-11 rounded-2xl border-2 border-emerald-600 text-emerald-700 text-xs font-extrabold hover:bg-emerald-600 hover:text-white shadow-sm hover:shadow duration-200 flex items-center justify-center gap-1.5 transition-all"
        >
          {loading ? <FiLoader className="animate-spin" /> : <FiDownload className="text-sm" />}
          View certificate
        </button>
      );
    }

    if (eligStatus === "FREE" || (eligStatus === "PAID" && certificate?.paymentStatus === "PAID")) {
      return (
        <button 
          onClick={handleGenerateClick}
          disabled={loading}
          className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-emerald-600/10 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {loading ? <FiLoader className="animate-spin" /> : <FiAward className="text-sm" />}
          Generate Certificate
        </button>
      );
    }

    if (eligStatus === "PAID") {
      if (certificate?.paymentStatus === "PENDING") {
        return (
          <button disabled className="w-full h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold flex flex-col items-center justify-center cursor-not-allowed">
            <span className="flex items-center gap-1.5"><FiLoader className="animate-spin text-sm" /> Payment verification pending...</span>
            <span className="text-[10px] opacity-75">Checking payment status</span>
          </button>
        );
      }
      return (
        <button 
          onClick={handlePurchase}
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-amber-500/10 active:scale-[0.99] transition-all duration-200 flex flex-col items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-1.5 text-xs font-extrabold">
            {loading ? <FiLoader className="animate-spin" /> : null}
            Buy certificate — ₹{certificatePrice}
          </span>
          <span className="text-[9px] font-medium opacity-90 mt-0.5">One-time payment for this certificate</span>
        </button>
      );
    }

    if ((eligStatus === "NONE" || eligStatus === "NOT_ELIGIBLE") && attended < requiredCount) {
      return (
        <button disabled className="w-full py-3 px-4 rounded-2xl bg-rose-50/50 text-rose-600 border border-rose-100/50 text-[10px] font-bold cursor-not-allowed flex items-center justify-center text-center gap-1.5 leading-relaxed">
          <FiLock className="text-xs" />
          Requires at least {requiredCount} attended sessions (attended {attended}).
        </button>
      );
    }

    return (
      <button disabled className="w-full h-11 rounded-2xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5">
        <FiLock className="text-sm" />
        Not eligible
      </button>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <span className="inline-block text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50/70 border border-emerald-100/40 px-2 py-0.5 rounded-md mb-2">
              {category || "Session"}
            </span>
            <h3 className="font-extrabold text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors duration-200 text-[15px]">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">Trainer: {trainerName || "LurnStack Trainer"}</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full border text-[9px] font-extrabold tracking-wider uppercase ${badgeProps.bg} whitespace-nowrap shadow-sm`}>
            {badgeProps.label}
          </div>
        </div>
      </div>

      <div className="mt-6 mb-5">
        <div className={`text-[11px] font-bold mb-2 flex justify-between items-center ${badgeProps.textColor}`}>
          <span>Attendance Progress</span>
          <span>{attended} / {requiredCount} sessions</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${badgeProps.progressColor} transition-all duration-500`} 
            style={{ width: `${Math.min((attended / requiredCount) * 100, 100)}%` }} 
          />
        </div>
      </div>

      <div className="mt-auto">
        {renderButton()}
      </div>
    </div>
  );
}
