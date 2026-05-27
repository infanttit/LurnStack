import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../app/router/paths";

export default function AuthRequiredModal({
  open,
  onClose,
  title = "Sign in to continue",
  message = "Create an account or log in to continue with this session.",
  from: fromOverride = "",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!open) return null;

  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const from = typeof fromOverride === "string" && fromOverride.trim() ? fromOverride : currentPath;
  const goTo = (path) => {
    onClose?.();
    navigate(path, { state: { from } });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close login prompt"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 sm:p-7">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-[#004d3d] font-black">
            LS
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => goTo(PATHS.LOGIN)}
              className="h-11 rounded-xl bg-[#004d3d] text-white text-sm font-extrabold hover:bg-[#00392d] transition-colors"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => goTo(PATHS.SIGNUP)}
              className="h-11 rounded-xl border border-slate-200 text-slate-900 text-sm font-extrabold hover:bg-slate-50 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 h-9 w-9 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
