import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiLoader, FiRefreshCcw } from "react-icons/fi";
import { getCourseCertificate, downloadCertificate } from "../api/certificateApi";

export default function PaymentReturnBanner({ refetch }) {
  const [status, setStatus] = useState("idle"); // idle, polling, timeout
  const [pendingCourseId, setPendingCourseId] = useState(null);

  useEffect(() => {
    const orderId = localStorage.getItem("pendingOrderId");
    const courseId = localStorage.getItem("pendingCourseId");

    if (orderId && courseId) {
      setPendingCourseId(courseId);
      setStatus("polling");
      
      let attempts = 0;
      const maxAttempts = 10;
      
      const pollTimer = setInterval(async () => {
        attempts++;
        try {
          // Poll certificate endpoint which returns paymentStatus
          const certStatus = await getCourseCertificate(courseId);
          const paymentStatus = certStatus?.paymentStatus;
          
          if (paymentStatus === "PAID") {
            clearInterval(pollTimer);
            localStorage.removeItem("pendingOrderId");
            localStorage.removeItem("pendingCourseId");
            toast.success("Payment successful! Certificate ready.");
            setStatus("idle");
            refetch(); // Refresh the main page data
            
            // Auto-trigger download
            if (certStatus?.certificateId) {
              const { signedUrl } = await downloadCertificate(certStatus.certificateId);
              window.open(signedUrl, "_blank");
            }
          } else if (paymentStatus === "FAILED") {
            clearInterval(pollTimer);
            localStorage.removeItem("pendingOrderId");
            localStorage.removeItem("pendingCourseId");
            toast.error("Payment failed. Please try again.");
            setStatus("idle");
            refetch();
          } else if (attempts >= maxAttempts) {
            clearInterval(pollTimer);
            setStatus("timeout");
          }
        } catch (err) {
          if (attempts >= maxAttempts) {
            clearInterval(pollTimer);
            setStatus("timeout");
          }
        }
      }, 3000);

      return () => clearInterval(pollTimer);
    }
  }, [refetch]);

  const handleRefresh = () => {
    setStatus("idle");
    refetch();
    // Restart polling by just remounting/relying on the effect 
    // Actually the effect won't re-run just for handleRefresh unless we change a dependency.
    // For simplicity, we just reload the page on refresh button click
    window.location.reload();
  };

  if (status === "idle") return null;

  return (
    <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {status === "polling" ? (
          <FiLoader className="text-amber-600 animate-spin text-xl" />
        ) : null}
        <div>
          <h4 className="text-sm font-bold text-amber-800">
            {status === "polling" ? "Verifying your payment..." : "Payment is being verified. Check back soon."}
          </h4>
          <p className="text-xs text-amber-700 mt-0.5">
            {status === "polling" ? "Please do not close this page." : "We're still confirming with the gateway."}
          </p>
        </div>
      </div>
      {status === "timeout" ? (
        <button
          onClick={handleRefresh}
          className="h-9 px-4 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-2"
        >
          <FiRefreshCcw />
          Refresh
        </button>
      ) : null}
    </div>
  );
}
