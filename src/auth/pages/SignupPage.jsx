import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import loginImage from "../../assets/Images/Signup.jpeg";
import { useAuth } from "../model/AuthContext";
import { PATHS } from "../../app/router/paths";

/* ─── Icons ─────────────────────────────────────────────────── */
const EyeIcon = ({ open }) =>
  open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );

/* ─── Logo ───────────────────────────────────────────────────── */
const Logo = ({ dark = false }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        dark ? "bg-[#004d3d]" : "bg-white/10 border border-white/20"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    </div>
    <span
      className={`text-lg font-bold tracking-tight ${
        dark ? "text-[#004d3d]" : "text-white"
      }`}
    >
      LurnStack
    </span>
  </div>
);

/* ─── Global Styles ──────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .anim-1 { animation: fade-in-up 0.3s ease-out both; }
    .anim-2 { animation: fade-in-up 0.3s ease-out 0.05s both; }
    .anim-3 { animation: fade-in-up 0.3s ease-out 0.1s both; }
    
    html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    .modal-anim {
      animation: modal-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes modal-slide-up {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `}</style>
);

/* ─── Policy Modal (Terms or Privacy) ─────────────────────────── */
const PolicyModal = ({ type, onClose, onAccept }) => {
  useEffect(() => {
    if (type) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "hidden";
  }, [type]);

  if (!type) return null;

  const isTerms = type === "terms";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden modal-anim">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-2xl font-extrabold text-[#004d3d]">
              {isTerms ? "Terms of Service" : "Privacy Policy"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isTerms ? "Please review our guidelines" : "How we handle your data"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-sm text-slate-600 leading-relaxed space-y-6 no-scrollbar">
          {isTerms ? (
            <>
              <section>
                <h3 className="font-bold text-slate-900 text-base mb-3">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By creating an account on LurnStack, you agree to be bound by these
                  Terms of Service and all applicable laws and regulations.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-slate-900 text-base mb-3">
                  2. User Account
                </h3>
                <p>
                  You agree to provide accurate, current, and complete information
                  during the registration process and to update such information as
                  needed.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-slate-900 text-base mb-3">
                  3. Educational Content
                </h3>
                <p>
                  All courses and materials are for educational purposes only. We do
                  not guarantee specific outcomes through platform use alone.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 className="font-bold text-slate-900 text-base mb-3">
                  1. Data Collection
                </h3>
                <p>
                  We collect information you provide directly to us, such as when you
                  create an account, update your profile, or communicate with us.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-slate-900 text-base mb-3">
                  2. How We Use Data
                </h3>
                <p>
                  We use the information we collect to provide, maintain, and improve
                  our services, and to personalize your learning experience.
                </p>
              </section>
              <section>
                <h3 className="font-bold text-slate-900 text-base mb-3">
                  3. Data Security
                </h3>
                <p>
                  We implement a variety of security measures to maintain the safety
                  of your personal information when you enter, submit, or access your
                  data.
                </p>
              </section>
            </>
          )}

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Document ID: {isTerms ? "LS-TOS-2026" : "LS-PP-2026"}
            </p>
            <p className="text-[10px] text-slate-400 italic">
              Last updated: May 07, 2026
            </p>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200/50 transition-all order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="px-10 py-2.5 rounded-xl bg-[#004d3d] hover:bg-[#00392d] text-white text-sm font-bold shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.95] order-1 sm:order-2"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
};

function Toast({ message, onClose, tone = "warn" }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200]">
      <div className="toast-slide w-[320px] max-w-[calc(100vw-2rem)] bg-[#121212] text-white rounded-[12px] shadow-2xl border border-white/10 overflow-hidden">
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {tone === "warn" ? (
              <div className="w-5 h-5 rounded-full bg-yellow-500/15 text-yellow-300 flex items-center justify-center text-[12px] font-black">
                !
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center text-[12px] font-black">
                ✓
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-widest font-bold text-white/70">
              {tone === "warn" ? "Warning" : "Success"}
            </div>
            <div className="mt-0.5 text-[12px] leading-snug text-white/95">
              {message}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close toast"
            className="shrink-0 w-8 h-8 rounded-lg hover:bg-white/5 transition-colors text-white/70 hover:text-white flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <div className="h-1 bg-white/10">
          <div className={`toast-bar h-full ${tone === "warn" ? "bg-yellow-500" : "bg-emerald-500"}`} />
        </div>
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .toast-slide { animation: toast-in 0.25s ease-out both; }
        @keyframes toast-bar {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .toast-bar {
          transform-origin: left;
          animation: toast-bar 4s linear both;
        }
      `}</style>
    </div>
  );
}

export default function SignupPage() {
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | null
  const [toastMessage, setToastMessage] = useState("");
  const [toastTone, setToastTone] = useState("warn");
  const [formError, setFormError] = useState("");

  if (isAuthenticated) {
    return <Navigate to={PATHS.HOME} replace />;
  }

  const handleAcceptPolicy = () => {
    setForm((p) => ({ ...p, agree: true }));
    setActiveModal(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!form.email) errs.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Required";
    else if (form.password.length < 8) errs.password = "Min. 8 chars";
    if (!form.confirmPassword) errs.confirmPassword = "Required";
    else if (form.confirmPassword !== form.password) errs.confirmPassword = "Does not match";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.agree) {
      setToastMessage("Please agree to the Terms & Privacy Policy.");
      setToastTone("warn");
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await signUp({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      navigate(PATHS.HOME, { replace: true });
    } catch (err) {
      setFormError(err?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden">
        {/* ── LEFT PANEL (Desktop Only) ── */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative flex-col justify-center p-12 overflow-hidden flex-shrink-0 h-full">
          <div className="absolute inset-0 z-0">
            <img src={loginImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0f2d1f]/95 via-[#0f2d1f]/85 to-[#0f2d1f]/40" />
          </div>
          
          <div className="absolute top-10 left-12 z-10"><Logo /></div>

          <div className="relative z-10 space-y-10">
            <div>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3 tracking-tight">
                Start your <span className="text-emerald-400">learning</span> <br />{" "}
                journey today.
              </h2>
              <p className="text-emerald-100/70 text-base max-w-md font-medium">
                Access the tools you need to build what's next.
              </p>
            </div>
            
            <div className="border-t border-white/10 pt-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-white text-xl font-bold">1K+</span>
                <span className="text-emerald-300/60 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                  Courses
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-white text-xl font-bold">98%</span>
                <span className="text-emerald-300/60 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                  Satisfaction
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (Mobile Friendly) ── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {/* Logo Bar (Mobile Only) */}
          <div className="lg:hidden flex justify-center py-3 border-b border-slate-50">
            <Logo dark />
          </div>

          <div className="flex-1 h-screen flex flex-col justify-start px-6 sm:px-10 lg:px-16 xl:px-24 overflow-y-auto no-scrollbar pt-8 lg:pt-12 bg-white">
            <div className="w-full max-w-md mx-auto">
              <div className="anim-1 mb-4">
                <h1 className="text-xl lg:text-2xl font-extrabold text-[#004d3d] mb-0.5">
                  Create Account
                </h1>
                <p className="text-slate-500 text-[11px] uppercase tracking-wider font-bold hidden sm:block">
                  Step into your portal.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-4 anim-2">
                <Link
                  to="/login"
                  className="flex-1 pb-1.5 text-center text-[12px] font-medium text-slate-400"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 pb-1.5 text-center text-[12px] font-bold text-[#004d3d] border-b-2 border-[#004d3d]"
                >
                  Sign Up
                </Link>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-3.5 anim-3">
                {formError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
                    {formError}
                  </div>
                ) : null}
                <div>
                  <label
                    htmlFor="signup-fullname"
                    className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 ml-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="signup-fullname"
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 rounded-xl bg-slate-50 border text-[13px] outline-none transition-all
                      ${
                        errors.fullName
                          ? "border-red-400"
                          : "border-slate-200 focus:border-[#004d3d] focus:ring-4 focus:ring-[#004d3d]/5"
                      }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 ml-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 rounded-xl bg-slate-50 border text-[13px] outline-none transition-all
                      ${
                        errors.email
                          ? "border-red-400"
                          : "border-slate-200 focus:border-[#004d3d] focus:ring-4 focus:ring-[#004d3d]/5"
                      }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 ml-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full h-11 px-4 pr-12 rounded-xl bg-slate-50 border text-[13px] outline-none transition-all
                        ${
                          errors.password
                            ? "border-red-400"
                            : "border-slate-200 focus:border-[#004d3d] focus:ring-4 focus:ring-[#004d3d]/5"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 px-4 text-slate-400"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 ml-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 rounded-xl bg-slate-50 border text-[13px] outline-none transition-all
                      ${
                        errors.confirmPassword
                          ? "border-red-400"
                          : "border-slate-200 focus:border-[#004d3d] focus:ring-4 focus:ring-[#004d3d]/5"
                      }`}
                  />
                </div>

                <div className="pt-0.5">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-[#004d3d] focus:ring-[#004d3d]/20"
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setActiveModal("terms")}
                        className="font-bold text-slate-600 hover:text-[#004d3d] transition-colors underline decoration-slate-200 underline-offset-2"
                      >
                        Terms
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => setActiveModal("privacy")}
                        className="font-bold text-slate-600 hover:text-[#004d3d] transition-colors underline decoration-slate-200 underline-offset-2"
                      >
                        Privacy
                      </button>
                      .
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#004d3d] hover:bg-[#00392d] active:scale-[0.98] text-white font-bold text-[13px] transition-all shadow-lg flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="mt-2 text-center text-[11px] text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-[#004d3d] hover:underline transition-colors"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <PolicyModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onAccept={handleAcceptPolicy}
      />
      <Toast message={toastMessage} tone={toastTone} onClose={() => setToastMessage("")} />
    </>
  );
}
