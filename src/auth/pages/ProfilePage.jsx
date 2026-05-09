import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../model/AuthContext";
import { PATHS } from "../../app/router/paths";

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "U";
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: PATHS.PROFILE }} />;
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-16">
      <h1 className="font-h2 text-h2 text-primary">Profile</h1>
      <div className="mt-10 rounded-2xl border border-outline-variant bg-surface p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold">
          {initials(user.fullName)}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-extrabold text-on-surface truncate">
            {user.fullName || "Student"}
          </div>
          <div className="text-sm text-on-surface-variant truncate">
            {user.email}
          </div>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={async () => {
            await signOut();
              navigate(PATHS.HOME);
            }}
            className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}
