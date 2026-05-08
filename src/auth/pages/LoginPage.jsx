import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginImage from "../../assets/Images/Signup.jpeg";


const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

/* ─── Logo ───────────────────────────────────────────────────── */
const Logo = ({ dark = false }) => (
  <div className="flex items-center gap-2">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-[#1A3A2A]" : "bg-white/10 border border-white/20"}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    </div>
    <span className={`text-xl font-bold tracking-tight ${dark ? "text-[#1A3A2A]" : "text-white"}`}>LurnStack</span>
  </div>
);

/* ─── Global Styles ──────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .anim-1 { animation: fade-in-up 0.4s ease-out both; }
    .anim-2 { animation: fade-in-up 0.4s ease-out 0.1s both; }
    .anim-3 { animation: fade-in-up 0.4s ease-out 0.2s both; }
    
    html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    navigate("/");
  };

  return (
    <>
      <GlobalStyles />
      <div className="h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden">

        {/* ── LEFT PANEL (Desktop Only) ── */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative flex-col justify-between p-12 overflow-hidden flex-shrink-0 h-full">
          <div className="absolute inset-0 z-0">
            <img src={loginImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f2d1f]/95 via-[#0f2d1f]/85 to-transparent" />
          </div>
          <div className="relative z-10"><Logo /></div>
          <div className="relative z-10">
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Master your craft <br /> with <span className="text-emerald-400">structured</span> learning.
            </h2>
            <p className="text-emerald-100/70 text-lg max-w-md">Join 50,000+ professionals.</p>
          </div>
          <div className="relative z-10 border-t border-white/10 pt-6 flex items-center gap-8">
            <div className="flex flex-col"><span className="text-white text-xl font-bold">50K+</span><span className="text-emerald-300/60 text-[10px] uppercase font-bold mt-0.5 tracking-wider">Learners</span></div>
            <div className="flex flex-col"><span className="text-white text-xl font-bold">500+</span><span className="text-emerald-300/60 text-[10px] uppercase font-bold mt-0.5 tracking-wider">Courses</span></div>
          </div>
        </div>

        {/* ── RIGHT PANEL (Mobile Friendly) ── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          
          {/* Logo Bar (Mobile Only) */}
          <div className="lg:hidden flex justify-center py-6 border-b border-slate-50">
            <Logo dark />
          </div>

          <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-24 overflow-y-auto no-scrollbar py-8">
            <div className="w-full max-w-md mx-auto">
              
              <div className="mb-6 lg:mb-8 anim-1">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1A3A2A] mb-1">Welcome back</h1>
                <p className="text-slate-500 text-sm">Please enter your details to continue.</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-6 anim-2">
                <Link to="/login" className="flex-1 pb-3 text-center text-sm font-bold text-[#1B4332] border-b-2 border-[#1B4332]">Login</Link>
                <Link to="/signup" className="flex-1 pb-3 text-center text-sm font-medium text-slate-400">Sign Up</Link>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4 anim-3">
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Email Address</label>
                  <input
                    id="email" type="email" name="email" placeholder="name@company.com"
                    value={form.email} onChange={handleChange}
                    className={`w-full h-12 px-4 rounded-xl bg-slate-50 border text-sm outline-none transition-all
                      ${errors.email ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-[#1B4332] focus:ring-4 focus:ring-[#1B4332]/5"}`}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Password</label>
                  <div className="relative">
                    <input
                      id="password" type={showPassword ? "text" : "password"} name="password" placeholder="••••••••"
                      value={form.password} onChange={handleChange}
                      className={`w-full h-12 px-4 pr-12 rounded-xl bg-slate-50 border text-sm outline-none transition-all
                        ${errors.password ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-[#1B4332] focus:ring-4 focus:ring-[#1B4332]/5"}`}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 px-4 text-slate-400"><EyeIcon open={showPassword} /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-[#1B4332]" />
                    <span className="text-xs text-slate-600 font-medium">Remember me</span>
                  </label>
                  <Link to="/forgot-password" hidden className="text-xs font-bold text-[#1B4332]">Forgot password?</Link>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-12 rounded-xl bg-[#1A3A2A] hover:bg-[#25523a] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}
                </button>
              </form>

              <div className="relative my-6 anim-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center"><span className="px-3 bg-white text-slate-400 text-[10px] uppercase tracking-widest font-bold">Or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3 anim-3">
                <button type="button" className="h-11 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold transition-all"><GoogleIcon /> Google</button>
                <button type="button" className="h-11 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold transition-all"><FacebookIcon /> Facebook</button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}
