import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiSearch, FiLoader } from "react-icons/fi";
import { verifyCertificate } from "../api/certificateApi";

export default function VerifyCertificatePage() {
  const { credentialId } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(credentialId || "");
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = useCallback(async (idToVerify) => {
    if (!idToVerify) return;
    
    setLoading(true);
    setError(null);
    setCertificateData(null);
    
    try {
      const data = await verifyCertificate(idToVerify);
      setCertificateData(data);
      // Sync URL if searched manually
      if (idToVerify !== credentialId) {
        navigate(`/verify/${idToVerify}`, { replace: true });
      }
    } catch (err) {
      setError("Certificate not found or invalid credential ID.");
    } finally {
      setLoading(false);
    }
  }, [credentialId, navigate]);

  useEffect(() => {
    if (credentialId) {
      handleVerify(credentialId);
    }
  }, [credentialId, handleVerify]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleVerify(searchInput.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-16 px-4">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-[#2D7A2D] tracking-tight mb-2">LURNSTACK</h1>
        <h2 className="text-xl font-bold text-slate-800">Credential Verification</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Verify the authenticity of a LurnStack certificate by entering its unique Credential ID below.
        </p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="text-slate-400 text-lg" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="e.g. LS-45-231015"
            className="w-full h-14 pl-12 pr-32 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold focus:border-[#2D7A2D] focus:ring-0 outline-none transition-colors"
          />
          <div className="absolute inset-y-1 right-1">
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="h-full px-6 rounded-xl bg-[#2D7A2D] text-white font-bold text-sm hover:bg-[#215A21] transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? <FiLoader className="animate-spin" /> : "Verify"}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center mt-12 text-slate-400">
          <FiLoader className="animate-spin text-4xl mb-4" />
          <p className="font-semibold">Searching records...</p>
        </div>
      )}

      {!loading && error && (
        <div className="w-full max-w-xl bg-red-50 rounded-3xl border border-red-100 p-8 text-center flex flex-col items-center">
          <FiXCircle className="text-red-500 text-6xl mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Verification Failed</h3>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {!loading && certificateData && (
        <div className="w-full max-w-xl bg-white rounded-3xl border border-emerald-100 shadow-lg shadow-emerald-900/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#2D7A2D]" />
          
          <div className="flex flex-col items-center text-center border-b border-slate-100 pb-8 mb-8">
            <div className="w-20 h-20 bg-emerald-100 text-[#2D7A2D] rounded-full flex items-center justify-center mb-6">
              <FiCheckCircle className="text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Verified Credential</h3>
            <p className="text-emerald-700 font-bold px-4 py-1.5 bg-emerald-50 rounded-full text-sm inline-block border border-emerald-200">
              ID: {certificateData.certificateId || certificateData.credentialId}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Recipient</div>
              <div className="text-lg font-bold text-slate-900 uppercase">{certificateData.studentName || certificateData.fullName}</div>
            </div>
            
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Course Name</div>
              <div className="text-lg font-bold text-slate-900">{certificateData.courseName || certificateData.courseTitle}</div>
            </div>

            {(certificateData.collegeName || certificateData.college) && (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Institution</div>
                <div className="text-base font-semibold text-slate-700">{certificateData.collegeName || certificateData.college}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</div>
                <div className="text-base font-semibold text-slate-700">{certificateData.issueDate}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Completion Date</div>
                <div className="text-base font-semibold text-slate-700">{certificateData.completionDate || certificateData.endDate}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
