import React, { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import brandLogo from "../../assets/Logo/Logo4.png";
import { PATHS } from "../../app/router/paths";
import { resetPasswordApi } from "../api/authApi";

const Logo = () => (
  <Link to="/" className="inline-flex items-center" aria-label="LurnStack home">
    <img src={brandLogo} alt="LurnStack" className="h-16 w-auto object-contain" loading="eager" />
  </Link>
);

const GlobalStyles = () => (
  <style>{`
    html, body, #root { min-height: 100%; margin: 0; padding: 0; overflow-x: hidden; }
    .auth-shell {
      position: relative;
      isolation: isolate;
      background:
        radial-gradient(circle at 16% 10%, rgba(84, 212, 16, 0.24), transparent 28%),
        radial-gradient(circle at 90% 18%, rgba(0, 77, 61, 0.13), transparent 34%),
        linear-gradient(135deg, #f7fff3 0%, #ffffff 46%, #f2fbf6 100%);
    }
    .auth-shell::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(0, 77, 61, 0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 77, 61, 0.045) 1px, transparent 1px);
      background-size: 46px 46px;
      mask-image: linear-gradient(to bottom, rgba(0,0,0,0.78), transparent 78%);
    }
    .auth-card {
      position: relative;
      border: 1px solid rgba(0, 77, 61, 0.1);
      background: rgba(255, 255, 255, 0.92);
      box-shadow: 0 28px 80px rgba(0, 77, 61, 0.13);
      backdrop-filter: blur(18px);
    }
    .auth-card::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background: linear-gradient(135deg, rgba(84, 212, 16, 0.16), transparent 32%, rgba(0, 77, 61, 0.08));
    }
    .auth-content { position: relative; z-index: 1; }
    .auth-mark { box-shadow: 0 18px 38px rgba(84, 212, 16, 0.2); }
  `}</style>
);

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!token) {
    return <Navigate to={PATHS.FORGOT_PASSWORD} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({ token, newPassword });
      setSuccessMessage("Password reset successful. Redirecting to login...");
      window.setTimeout(() => {
        navigate(PATHS.LOGIN, { replace: true });
      }, 1800);
    } catch (error) {
      setErrorMessage(error?.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="auth-shell flex min-h-dvh w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="auth-card relative w-full max-w-[540px] rounded-[28px] p-5 sm:p-7">
          <div className="auth-content">
            <div className="flex justify-center mb-5">
              <div className="auth-mark rounded-full bg-white p-2 ring-1 ring-[#004d3d]/10">
                <Logo />
              </div>
            </div>

            <div className="mb-6 text-center">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#54d410]">
                Account Recovery
              </p>
              <h1 className="text-2xl lg:text-3xl font-black text-[#004d3d] mb-2">
                Set New Password
              </h1>
              <p className="text-slate-500 text-[12px] font-semibold leading-relaxed">
                Choose a strong password to secure your LurnStack account.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {errorMessage ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
                  {errorMessage}
                </div>
              ) : null}
              {successMessage ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-semibold text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1 ml-1 block text-[8px] font-bold uppercase tracking-widest text-slate-500"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter new password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[16px] sm:text-[16px] outline-none transition-all focus:border-[#004d3d] focus:ring-4 focus:ring-[#004d3d]/5"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1 ml-1 block text-[8px] font-bold uppercase tracking-widest text-slate-500"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[16px] sm:text-[16px] outline-none transition-all focus:border-[#004d3d] focus:ring-4 focus:ring-[#004d3d]/5"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#004d3d] text-[13px] font-bold text-white shadow-[0_16px_36px_rgba(0,77,61,0.22)] transition-all hover:bg-[#00392d] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] text-slate-500">
              Need another reset link?{" "}
              <Link
                to={PATHS.FORGOT_PASSWORD}
                className="font-bold text-[#004d3d] hover:underline transition-colors"
              >
                Request again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
