import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiAward } from "react-icons/fi";
import { toast } from "react-toastify";
import { PATHS } from "../../../app/router/paths";
import { useCertifications } from "../hooks/useCertifications";
import { generateCertificate } from "../api/certificateApi";
import CertificationStats from "../components/CertificationStats";
import CertificateCard from "../components/CertificateCard";

import PaymentReturnBanner from "../components/PaymentReturnBanner";
import { env } from "../../../shared/config/env";

export default function CertificationsPage() {
  const { settings, courses, loading, error, refetch, updateCourseCertificate } = useCertifications();
  const [activeFilter, setActiveFilter] = useState("ALL");

  const hasCertificateUrl = (c) => {
    const cert = c?.certificate;
    return !!(cert?.certificateUrl || cert?.pdfUrl || cert?.data?.pdfUrl || cert?.data?.certificateUrl);
  };

  const handleGenerate = async (course, userData) => {
    try {
      const newCert = await generateCertificate(course.courseId, userData);
      updateCourseCertificate(course.courseId, newCert);
      toast.success("Certificate generated successfully!");
      
      const pdfLink = newCert?.pdfUrl || newCert?.certificateUrl || newCert?.data?.pdfUrl || newCert?.data?.certificateUrl;
      if (pdfLink) {
        let finalUrl = pdfLink;
        if (finalUrl.startsWith("/")) {
          const baseURL = String(env.apiBaseUrl || "").replace(/\/+$/, "");
          finalUrl = `${baseURL}${finalUrl}`;
        }
        window.open(finalUrl, "_blank");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to generate certificate.");
    }
  };



  const getStatus = (c) => typeof c.eligibility === "string" ? c.eligibility : (c.eligibility?.status || "NONE");

  // Filtering list for remaining courses
  const filteredCourses = useMemo(() => {
    const ungenerated = courses.filter(c => !hasCertificateUrl(c));
    if (activeFilter === "ALL") return ungenerated;
    if (activeFilter === "FREE") return ungenerated.filter(c => getStatus(c) === "FREE");
    if (activeFilter === "PAID") return ungenerated.filter(c => getStatus(c) === "PAID");
    if (activeFilter === "IN_PROGRESS") return ungenerated.filter(c => getStatus(c) === "INCOMPLETE");
    if (activeFilter === "INELIGIBLE") {
      return ungenerated.filter(c => {
        const s = getStatus(c);
        return s === "NONE" || s === "NOT_ELIGIBLE" || s === "INELIGIBLE";
      });
    }
    return ungenerated;
  }, [courses, activeFilter]);

  const lastUpdatedAt = useMemo(() => new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  }), []);

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop py-10 sm:py-12">
      {/* Header section with fine sub-text */}
      <div className="flex items-end justify-between gap-6 flex-wrap mb-8 pb-5 border-b border-slate-100">
        <div>
          <Link
            to={PATHS.DASHBOARD}
            className="text-xs font-bold text-[#2D7A2D] hover:text-[#1E521E] transition-colors flex items-center gap-1.5 mb-3"
          >
            <FiArrowLeft className="text-xs" />
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Certifications</h1>
          <p className="mt-1 text-xs font-medium text-slate-400">
            View, download, and purchase certificates for your completed courses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-bold text-slate-400">
            Last updated: <span className="text-slate-600 font-extrabold">{lastUpdatedAt}</span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 mb-8 animate-in fade-in duration-200">
          {error}
        </div>
      ) : null}

      <PaymentReturnBanner refetch={refetch} />

      <CertificationStats courses={courses} loading={loading} />

      {/* Main Content Panels */}
      <div className="space-y-8">
        {courses.filter(hasCertificateUrl).length > 0 && (
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] sm:p-6">
            <h2 className="text-sm font-extrabold text-slate-700 mb-5 flex items-center gap-2 uppercase tracking-wider">
              <FiAward className="text-[#2D7A2D] text-base" />
              My Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses.filter(hasCertificateUrl).map((course) => (
                <CertificateCard
                  key={course.courseId}
                  course={course}
                  certificatePrice={settings?.certificatePrice || 299}
                  updateCourseCertificate={updateCourseCertificate}
                  onGenerate={handleGenerate}
                />
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Completed Courses</h2>
            
            {/* Redesigned Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "ALL", label: "All Completed" },
                { id: "FREE", label: "Free Eligible" },
                { id: "PAID", label: "Paid Eligible" },
                { id: "IN_PROGRESS", label: "In Progress" },
                { id: "INELIGIBLE", label: "Not Eligible" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase transition-all duration-200 border ${
                    activeFilter === tab.id
                      ? "bg-[#2D7A2D] text-white border-[#2D7A2D] shadow-sm"
                      : "bg-slate-50 text-slate-400 border-slate-100/80 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl border border-slate-100 bg-slate-50/50" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
                <FiAward className="text-xl" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-600 mb-1">No courses found</h3>
              <p className="text-[11px] font-medium text-slate-400 max-w-[200px] leading-relaxed">
                No completed courses match the selected category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <CertificateCard
                  key={course.courseId}
                  course={course}
                  certificatePrice={settings?.certificatePrice || 299}
                  updateCourseCertificate={updateCourseCertificate}
                  onGenerate={handleGenerate}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
