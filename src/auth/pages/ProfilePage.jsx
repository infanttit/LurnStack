import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineAcademicCap,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineEnvelope,
  HiOutlineIdentification,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { useAuth } from "../model/AuthContext";
import { getAuthProfileApi, updateProfileApi, deleteAccountApi } from "../api/authApi";
import { PATHS } from "../../app/router/paths";
import {
  formatAttendanceStatus,
  getStudentAttendanceOverview,
} from "../../courses/api/studentAttendanceApi";

const ENABLE_REMOTE_PROFILE = String(process.env.REACT_APP_ENABLE_REMOTE_PROFILE || "").trim() === "true";
const DISABLE_STUDENT_ATTENDANCE_HISTORY =
  String(process.env.REACT_APP_ENABLE_STUDENT_ATTENDANCE_HISTORY || "").trim() === "false";

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "U";
}

function formatDate(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function mergeProfile(storedUser, remoteProfile) {
  return {
    id: remoteProfile?.id || storedUser?.id || "",
    fullName: remoteProfile?.fullName || storedUser?.fullName || "LurnStack Learner",
    email: remoteProfile?.email || storedUser?.email || "Not available",
    phoneNumber: remoteProfile?.phoneNumber || storedUser?.phoneNumber || "Not available",
    role: remoteProfile?.role || storedUser?.role || "student",
    createdAt: remoteProfile?.createdAt || storedUser?.createdAt || "",
    updatedAt: remoteProfile?.updatedAt || storedUser?.updatedAt || "",
  };
}

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#004d3d]">
          <Icon className="text-xl" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            {label}
          </div>
          <div className="mt-1 break-words text-sm font-bold text-slate-900">
            {value || "Not available"}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableDetailCard({ icon: Icon, label, value, onSave, onDelete, isRequired = false, placeholder = "" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (isRequired && !trimmed) {
      alert(`${label} cannot be empty.`);
      return;
    }
    setLoading(true);
    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch (err) {
      // Error is handled by parent, reset value
      setInputValue(value || "");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setInputValue(value || "");
    setIsEditing(false);
  };

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#004d3d]">
            <Icon className="text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              {label}
            </div>
            {isEditing ? (
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  type="text"
                  value={inputValue}
                  disabled={loading}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-sm font-semibold text-slate-900 focus:border-[#004d3d] focus:outline-none focus:ring-1 focus:ring-[#004d3d] disabled:opacity-50"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  title="Save"
                >
                  <HiOutlineCheck className="text-base" />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  title="Cancel"
                >
                  <HiOutlineXMark className="text-base" />
                </button>
              </div>
            ) : (
              <div className="mt-1 break-words text-sm font-bold text-slate-900">
                {value || <span className="text-slate-400 font-medium italic">Not available</span>}
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
              title={`Edit ${label}`}
            >
              <HiOutlinePencilSquare className="text-base" />
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                title={`Clear ${label}`}
              >
                <HiOutlineTrash className="text-base" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DeletionModal({ isOpen, onClose, onConfirm }) {
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmInput("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmInput !== "DELETE MY ACCOUNT") return;
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all duration-300 border border-slate-100 modal-anim">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4 ring-8 ring-red-50/50">
            <HiOutlineExclamationTriangle className="text-3xl" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Delete Account</h3>
          <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
            This action is irreversible. All of your course progress, attendance history, and certificates will be permanently deleted.
          </p>

          <div className="mt-4 w-full rounded-2xl bg-red-50/50 p-4 border border-red-100/50 text-left text-xs font-semibold text-red-800 space-y-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Your profile data will be permanently cleared.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>All active course enrollments will be terminated.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>You will be logged out of this session immediately.</span>
            </div>
          </div>

          <div className="mt-5 w-full text-left">
            <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              Type "DELETE MY ACCOUNT" to confirm
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/5"
            />
          </div>

          <div className="mt-6 flex w-full flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmInput !== "DELETE MY ACCOUNT" || loading}
              className="w-full rounded-2xl bg-red-600 py-3 text-sm font-bold text-white shadow-xl shadow-red-900/10 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Permanently Delete"}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-anim { animation: modal-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
    </div>
  );
}

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
              <div className="w-5 h-5 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center text-[12px] font-black">
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
          <div className={`toast-bar h-full ${tone === "warn" ? "bg-red-500" : "bg-emerald-500"}`} />
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

function formatDateTime(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AttendancePill({ status }) {
  const normalized = String(status || "").toLowerCase();
  const className =
    normalized === "late"
      ? "bg-amber-100 text-amber-800"
      : normalized === "absent"
        ? "bg-red-100 text-red-700"
        : "bg-emerald-100 text-emerald-800";
  return (
    <span className={["rounded-full px-2.5 py-1 text-[11px] font-extrabold", className].join(" ")}>
      {formatAttendanceStatus(normalized)}
    </span>
  );
}

function AttendanceMetric({ label, value, tone = "slate" }) {
  const tones = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
    slate: "text-slate-950",
  };
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className={["text-base font-black", tones[tone] || tones.slate].join(" ")}>{value}</div>
      <div className="mt-0.5 truncate text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
        {label}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [remoteProfile, setRemoteProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceCourses, setAttendanceCourses] = useState([]);
  const [attendanceNotice, setAttendanceNotice] = useState("");
  const [notice, setNotice] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [toastTone, setToastTone] = useState("warn");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUpdateName = async (newName) => {
    try {
      const updated = await updateProfileApi({ fullName: newName });
      setRemoteProfile(updated);
      setToastTone("success");
      setToastMessage("Name updated successfully!");
    } catch (err) {
      setToastTone("warn");
      setToastMessage(err.message || "Failed to update name.");
      throw err;
    }
  };

  const handleUpdateEmail = async (newEmail) => {
    try {
      const updated = await updateProfileApi({ email: newEmail });
      setRemoteProfile(updated);
      setToastTone("success");
      setToastMessage("Email address updated successfully!");
    } catch (err) {
      setToastTone("warn");
      setToastMessage(err.message || "Failed to update email address.");
      throw err;
    }
  };

  const handleUpdatePhone = async (newPhone) => {
    try {
      const updated = await updateProfileApi({ phoneNumber: newPhone });
      setRemoteProfile(updated);
      setToastTone("success");
      setToastMessage("Phone number updated successfully!");
    } catch (err) {
      setToastTone("warn");
      setToastMessage(err.message || "Failed to update phone number.");
      throw err;
    }
  };

  const handleClearPhone = async () => {
    if (!window.confirm("Are you sure you want to clear your phone number?")) return;
    try {
      const updated = await updateProfileApi({ phoneNumber: null });
      setRemoteProfile(updated);
      setToastTone("success");
      setToastMessage("Phone number cleared successfully!");
    } catch (err) {
      setToastTone("warn");
      setToastMessage(err.message || "Failed to clear phone number.");
    }
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteAccountApi();
      setToastTone("success");
      setToastMessage("Your account has been deleted successfully.");
      setTimeout(async () => {
        await signOut();
        navigate(PATHS.HOME);
      }, 1500);
    } catch (err) {
      setToastTone("warn");
      setToastMessage(err.message || "Failed to delete account. Please try again.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!user) return undefined;
    if (!ENABLE_REMOTE_PROFILE) {
      setLoading(false);
      setNotice("");
      return undefined;
    }

    setLoading(true);
    setNotice("");
    getAuthProfileApi()
      .then((profile) => {
        if (!cancelled) setRemoteProfile(profile);
      })
      .catch((err) => {
        if (!cancelled) {
          setNotice(err?.message || "Unable to fetch latest profile details. Showing saved account details.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    if (!user) return undefined;
    if (DISABLE_STUDENT_ATTENDANCE_HISTORY) {
      setAttendanceLoading(false);
      setAttendanceCourses([]);
      setAttendanceNotice("");
      return undefined;
    }

    setAttendanceLoading(true);
    setAttendanceNotice("");
    getStudentAttendanceOverview()
      .then((items) => {
        if (!cancelled) setAttendanceCourses(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setAttendanceCourses([]);
          setAttendanceNotice(err?.message || "Attendance history is not available yet.");
        }
      })
      .finally(() => {
        if (!cancelled) setAttendanceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const profile = useMemo(() => mergeProfile(user, remoteProfile), [user, remoteProfile]);
  const roleLabel = String(profile.role || "student").toUpperCase();
  const attendanceTotals = useMemo(() => {
    const totalSessions = attendanceCourses.reduce((sum, course) => sum + Number(course.totalSessions || 0), 0);
    const attendedCount = attendanceCourses.reduce((sum, course) => sum + Number(course.attendedCount || 0), 0);
    const presentCount = attendanceCourses.reduce((sum, course) => sum + Number(course.presentCount || 0), 0);
    const lateCount = attendanceCourses.reduce((sum, course) => sum + Number(course.lateCount || 0), 0);
    const absentCount = attendanceCourses.reduce((sum, course) => sum + Number(course.absentCount || 0), 0);
    return {
      totalSessions,
      attendedCount,
      presentCount,
      lateCount,
      absentCount,
      percentage: totalSessions ? Math.round((attendedCount / totalSessions) * 10000) / 100 : 0,
    };
  }, [attendanceCourses]);

  if (!user) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: PATHS.PROFILE }} />;
  }

  return (
    <main className="min-h-screen bg-[#f4f7f6]">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
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
          <div className="space-y-5">
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
                <EditableDetailCard
                  icon={HiOutlineUserCircle}
                  label="Full name"
                  value={profile.fullName}
                  onSave={handleUpdateName}
                  isRequired={true}
                  placeholder="Enter full name"
                />
                <EditableDetailCard
                  icon={HiOutlineEnvelope}
                  label="Email address"
                  value={profile.email}
                  onSave={handleUpdateEmail}
                  isRequired={true}
                  placeholder="Enter email address"
                />
                <EditableDetailCard
                  icon={HiOutlinePhone}
                  label="Phone number"
                  value={profile.phoneNumber === "Not available" ? "" : profile.phoneNumber}
                  onSave={handleUpdatePhone}
                  onDelete={profile.phoneNumber && profile.phoneNumber !== "Not available" ? handleClearPhone : null}
                  isRequired={false}
                  placeholder="Enter phone number"
                />
                <DetailCard icon={HiOutlineIdentification} label="Account role" value={roleLabel} />
                <DetailCard icon={HiOutlineCalendarDays} label="Joined on" value={formatDate(profile.createdAt)} />
                <DetailCard icon={HiOutlineShieldCheck} label="Security status" value="Protected session" />
              </div>
            </section>

            <section id="attendance" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">
                    Student attendance
                  </div>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Class history</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {attendanceLoading
                      ? "Loading your class records..."
                      : "Course-wise completed classes, attended classes, and session records."}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
                  <div className="text-xl font-black text-slate-950">{attendanceTotals.percentage}%</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Overall</div>
                </div>
              </div>

            {attendanceNotice ? (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {attendanceNotice}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {attendanceLoading ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {[0, 1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                  <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
                </div>
              ) : attendanceCourses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                  Attendance records will appear here after you join live sessions.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <AttendanceMetric label="Completed" value={attendanceTotals.totalSessions} />
                    <AttendanceMetric label="Attended" value={attendanceTotals.attendedCount} tone="emerald" />
                    <AttendanceMetric label="Present" value={attendanceTotals.presentCount} tone="emerald" />
                    <AttendanceMetric label="Late" value={attendanceTotals.lateCount} tone="amber" />
                    <AttendanceMetric label="Absent" value={attendanceTotals.absentCount} tone="red" />
                  </div>

                  <div className="border-y border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                      <div className="min-w-[720px]">
                        <div className="sticky top-0 z-10 grid grid-cols-[1.4fr_.55fr_.55fr_.55fr_.55fr_.65fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          <div>Course / trainer</div>
                          <div>Classes</div>
                          <div>Present</div>
                          <div>Late</div>
                          <div>Absent</div>
                          <div className="text-right">%</div>
                        </div>

                        <div className="max-h-[420px] overflow-y-auto overscroll-contain">
                          {attendanceCourses.map((course, index) => (
                            <div
                              key={course.summaryKey || course.courseId || `${course.courseTitle}-${index}`}
                              className="border-t border-slate-100 first:border-t-0"
                            >
                              <div className="grid grid-cols-[1.4fr_.55fr_.55fr_.55fr_.55fr_.65fr] items-center gap-3 px-4 py-3 text-sm">
                                <div className="min-w-0">
                                  <div className="truncate font-black text-slate-950">{course.courseTitle}</div>
                                  <div className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                                    {course.trainerName || "Trainer not assigned"}
                                  </div>
                                </div>
                                <div className="font-black text-slate-900">{course.totalSessions}</div>
                                <div className="font-black text-emerald-700">{course.presentCount}</div>
                                <div className="font-black text-amber-700">{course.lateCount}</div>
                                <div className="font-black text-red-700">{course.absentCount}</div>
                                <div className="text-right font-black text-slate-950">{course.attendancePercentage}%</div>
                              </div>

                              {course.sessions?.length ? (
                                <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2">
                                  <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                    Session history
                                  </div>
                                  <div className="divide-y divide-slate-200">
                                    {course.sessions.map((session, sessionIndex) => (
                                      <div
                                        key={session.id || `${session.sessionId}-${session.occurrenceDate}-${sessionIndex}`}
                                        className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2"
                                      >
                                        <div className="min-w-0">
                                          <div className="truncate text-[12px] font-bold text-slate-800">
                                            {session.sessionTitle || "Live session"}
                                          </div>
                                          <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                                            {session.occurrenceDate || formatDateTime(session.startsAt)}
                                            {session.firstJoinedAt ? ` - ${formatDateTime(session.firstJoinedAt)}` : ""}
                                          </div>
                                        </div>
                                        <div className="hidden text-[11px] font-bold text-slate-500 sm:block">
                                          Join {session.joinCount || 0}
                                        </div>
                                        <AttendancePill status={session.attendanceStatus || session.status} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            </section>

            {/* Danger Zone Section */}
            <section className="rounded-3xl border border-red-200 bg-red-50/20 p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-red-950 flex items-center gap-2">
                    <HiOutlineExclamationTriangle className="text-red-600" />
                    Danger Zone
                  </h2>
                  <p className="text-sm font-medium text-red-800/80">
                    Permanently delete your LurnStack account and all of your data. This action is irreversible.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-extrabold text-white transition-all hover:bg-red-700 shadow-md shadow-red-900/10 active:scale-[0.98]"
                >
                  <HiOutlineTrash className="text-base" />
                  Delete Account
                </button>
              </div>
            </section>
          </div>

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
              <div className="flex items-center gap-2 text-sm font-black text-emerald-950">
                <HiOutlineAcademicCap className="text-lg" />
                Attendance note
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-800">
                Present and late sessions are counted as attended. Absent sessions are finalized after each live occurrence ends.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Styled Confirmation Modal */}
      <DeletionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteAccount}
      />

      {/* Custom Toast Alerts */}
      <Toast
        message={toastMessage}
        tone={toastTone}
        onClose={() => setToastMessage("")}
      />
    </main>
  );
}
