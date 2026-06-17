import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAward, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { PATHS } from "../../../app/router/paths";
import { useCertifications } from "../hooks/useCertifications";
import { generateCertificate } from "../api/certificateApi";
import CertificationStats from "../components/CertificationStats";
import CertificateCard from "../components/CertificateCard";
import CertificateGenerateModal from "../components/CertificateGenerateModal";
import PaymentReturnBanner from "../components/PaymentReturnBanner";

export default function CertificationsPage() {
  const navigate = useNavigate();
  const { settings, courses, loading, error, refetch, updateCourseCertificate } = useCertifications();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  const handleGenerate = async (course, userData) => {
    try {
      const newCert = await generateCertificate(course.courseId, userData);
      updateCourseCertificate(course.courseId, newCert);
      toast.success("Certificate generated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to generate certificate.");
    }
  };

  const handleCustomGenerate = async (userData) => {
    setIsGeneratingCustom(true);
    try {
      const newCert = await generateCertificate("CUSTOM", userData);
      toast.success("Custom certificate generated successfully!");
      if (newCert?.pdfUrl || newCert?.certificateUrl) {
        let pdfLink = newCert.pdfUrl || newCert.certificateUrl;
        window.open(pdfLink, "_blank");
      }
      setIsCustomModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to generate custom certificate.");
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const lastUpdatedAt = useMemo(() => new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  }), []);

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop py-10 sm:py-14">
      {/* Header matching StudentDashboardPage style */}
      <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
        <div>
          <Link
            to={PATHS.DASHBOARD}
            className="text-xs font-bold text-[#2D7A2D] hover:underline flex items-center gap-1.5 mb-3"
          >
            <FiArrowLeft />
            Back to dashboard
          </Link>
          <h1 className="font-h2 text-h2 text-on-surface">My Certifications</h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            View, download, and purchase certificates for your completed courses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-on-surface-variant">
            Last updated: <span className="text-on-surface">{lastUpdatedAt}</span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 mb-8">
          {error}
        </div>
      ) : null}

      <PaymentReturnBanner refetch={refetch} />

      <CertificationStats courses={courses} loading={loading} />

      {/* Main Content Area */}
      <div className="space-y-8">
        {courses.filter(c => c.certificate?.certificateUrl).length > 0 && (
          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <FiAward className="text-[#2D7A2D]" />
              My Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses.filter(c => c.certificate?.certificateUrl).map((course) => (
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

        <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6">Completed Courses</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
              ))}
            </div>
          ) : courses.filter(c => !c.certificate?.certificateUrl).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-t border-slate-100 mt-4 pt-10">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                <FiAward className="text-4xl" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">No remaining courses</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                All your completed courses have their certificates generated!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses.filter(c => !c.certificate?.certificateUrl).map((course) => (
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
