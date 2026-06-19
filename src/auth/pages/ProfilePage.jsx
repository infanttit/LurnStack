import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../model/AuthContext";
import { PATHS } from "../../app/router/paths";
import { getAuthProfileApi } from "../api/authApi";
import {
  HiOutlineUserCircle,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineCalendarDays,
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCheckBadge,
} from "react-icons/hi2";

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "U";
}

function formatDate(raw) {
  const date = new Date(raw || "");
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg text-slate-500 shadow-sm ring-1 ring-slate-200/50">
        <Icon />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          {label}
        </div>
        <div className="mt-1 truncate text-sm font-semibold text-slate-900">
          {value || "Not provided"}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [remoteProfile, setRemoteProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    getAuthProfileApi()
      .then((data) => {
        if (active) {
          setRemoteProfile(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setNotice("Unable to fetch your latest profile details from the server. Showing cached data.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (!user) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: PATHS.PROFILE }} />;
  }

  const profile = remoteProfile || user;
  const roleLabel = String(profile.role || "Student").charAt(0).toUpperCase() + String(profile.role || "Student").slice(1);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f8fafc] py-8 sm:py-12">
      <section className="mx-auto max-w-[1000px] px-5">
        <div className="overflow-hidden rounded-3xl bg-[#00342b] text-white shadow-sm">
          <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-3xl font-black">
                {initials(profile.fullName)}
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">
                  <HiOutlineCheckBadge className="text-sm" />
                  Verified {roleLabel}
                </div>
                <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                  {profile.fullName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium text-white/70">
                  Manage your LurnStack identity, contact details, and account access from one place.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate(PATHS.HOME);
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-extrabold text-white transition-colors hover:bg-white/15"
            >
              <HiOutlineArrowRightOnRectangle className="text-lg" />
              Log out
            </button>
          </div>
        </div>

        {notice ? (
          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {notice}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Profile details</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {loading ? "Fetching latest account information..." : "Latest available account information."}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-emerald-800">
                {loading ? "Syncing" : "Active"}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailCard icon={HiOutlineUserCircle} label="Full name" value={profile.fullName} />
              <DetailCard icon={HiOutlineEnvelope} label="Email address" value={profile.email} />
              <DetailCard icon={HiOutlinePhone} label="Phone number" value={profile.phoneNumber} />
              <DetailCard icon={HiOutlineIdentification} label="Account role" value={roleLabel} />
              <DetailCard icon={HiOutlineCalendarDays} label="Joined on" value={formatDate(profile.createdAt)} />
              <DetailCard icon={HiOutlineShieldCheck} label="Security status" value="Protected session" />
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Account summary
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-600">Role</span>
                  <span className="text-sm font-black text-slate-950">{roleLabel}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-600">Profile source</span>
                  <span className="text-sm font-black text-slate-950">
                    {remoteProfile ? "API" : "Saved"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-bold text-slate-600">Updated</span>
                  <span className="text-sm font-black text-slate-950">
                    {formatDate(profile.updatedAt || profile.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="text-sm font-black text-emerald-950">Need changes?</div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-800">
                Profile editing can be enabled once the backend update endpoint is ready. For now, this page safely reads and displays your account details.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
