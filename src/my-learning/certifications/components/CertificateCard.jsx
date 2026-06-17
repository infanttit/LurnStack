import React, { useState } from "react";
import { toast } from "react-toastify";
import { FiLoader } from "react-icons/fi";
import { generateCertificate, purchaseCertificate, downloadCertificate } from "../api/certificateApi";
import CertificateGenerateModal from "./CertificateGenerateModal";
import { env } from "../../../shared/config/env";

export default function CertificateCard({ course, certificatePrice, updateCourseCertificate, onGenerate }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { title, trainerName, attendance = {}, eligibility, certificate } = course;
  const pct = attendance.pct || 0;
  const total = attendance.total || 0;
  const attended = attendance.attended || 0;

  let badgeProps = { bg: "bg-[#F1EFE8]", text: "text-[#444441]", label: "Not eligible", progressColor: "bg-[#A32D2D]", textColor: "text-[#A32D2D]" };
  
  const hasUrl = certificate?.certificateUrl || certificate?.pdfUrl || certificate?.data?.pdfUrl || certificate?.data?.certificateUrl;
  if (hasUrl) {
    badgeProps = { bg: "bg-[#EAF3DE]", text: "text-[#27500A]", label: eligibility === "PAID" ? "Purchased" : "Downloaded", progressColor: "bg-[#3B6D11]", textColor: "text-[#3B6D11]" };
  } else if (eligibility === "FREE") {
    badgeProps = { bg: "bg-[#EAF3DE]", text: "text-[#27500A]", label: "Free certificate", progressColor: "bg-[#3B6D11]", textColor: "text-[#3B6D11]" };
  } else if (eligibility === "PAID") {
    badgeProps = { bg: "bg-[#FAEEDA]", text: "text-[#633806]", label: "Paid certificate", progressColor: "bg-[#854F0B]", textColor: "text-[#854F0B]" };
  } else if (eligibility === "INCOMPLETE") {
    badgeProps = { bg: "bg-blue-50", text: "text-blue-700", label: "Course in progress", progressColor: "bg-blue-600", textColor: "text-blue-700" };
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
    if (eligibility === "INCOMPLETE") {
      return (
        <button disabled className="w-full h-10 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed">
          Complete the course first
        </button>
      );
    }

    if (hasUrl) {
      return (
        <button 
          onClick={handleDownload} 
          disabled={loading}
          className="w-full h-10 rounded-xl border-2 border-emerald-600 text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <FiLoader className="animate-spin" /> : null}
          View certificate
        </button>
      );
    }

    if (eligibility === "FREE" || (eligibility === "PAID" && certificate?.paymentStatus === "PAID")) {
      return (
        <button 
          onClick={handleGenerateClick}
          disabled={loading}
          className="w-full h-10 rounded-xl bg-[#2D7A2D] text-white text-sm font-bold hover:bg-[#215A21] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Generate Certificate
        </button>
      );
    }

    if (eligibility === "PAID") {
      if (certificate?.paymentStatus === "PENDING") {
        return (
          <button disabled className="w-full h-12 rounded-xl bg-amber-100 text-amber-700 text-sm font-semibold flex flex-col items-center justify-center cursor-not-allowed">
            <span className="flex items-center gap-2"><FiLoader className="animate-spin" /> Payment verification pending...</span>
            <span className="text-xs opacity-75">Checking payment status</span>
          </button>
        );
      }
      return (
        <button 
          onClick={handlePurchase}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors flex flex-col items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            {loading ? <FiLoader className="animate-spin" /> : null}
            Buy certificate — ₹{certificatePrice}
          </span>
          <span className="text-[10px] font-medium opacity-90">One-time payment for this certificate</span>
        </button>
      );
    }

    return (
      <button disabled className="w-full h-10 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed">
        Not eligible
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-medium text-slate-900 leading-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">Trainer: {trainerName || "LurnStack Trainer"}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeProps.bg} ${badgeProps.text} whitespace-nowrap`}>
          {badgeProps.label}
        </div>
      </div>

      <div className="mt-auto mb-5">
        <div className={`text-xs font-semibold mb-2 ${badgeProps.textColor}`}>
          Attended {pct}% of {total} sessions
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${badgeProps.progressColor}`} 
            style={{ width: `${Math.min(pct, 100)}%` }} 
          />
        </div>
      </div>

      <div>
        {renderButton()}
      </div>

      {isModalOpen && (
        <CertificateGenerateModal 
          course={course}
          isGenerating={loading}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmGenerate}
        />
      )}
    </div>
  );
}
