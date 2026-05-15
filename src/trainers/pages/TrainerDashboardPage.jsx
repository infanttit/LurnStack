import { useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiLogOut,
  FiMenu,
  FiPlusCircle,
  FiSidebar,
  FiX,
  FiUploadCloud,
  FiUsers,
  FiVideo,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../app/router/paths";
import { useAuth } from "../../auth";
import SmartImage from "../../shared/components/SmartImage";
import {
  getTrainerLiveClasses,
  saveTrainerCourseLiveClass,
} from "../model/trainerContentStorage";

const initialForm = {
  courseTitle: "",
  category: "Trainer Courses",
  description: "",
  classTitle: "",
  scheduledDate: "",
  startTime: "",
  endTime: "",
  meetUrl: "",
  price: "499",
  thumbnail: "",
};

const tabs = [
  { id: "overview", label: "Overview", icon: FiBookOpen },
  { id: "create", label: "Create live class", icon: FiPlusCircle },
  { id: "classes", label: "Uploaded classes", icon: FiVideo },
];

function formatClassTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeOnly(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatClassTimeRange(liveClass) {
  const start = formatClassTime(liveClass?.scheduledAt);
  const end = formatTimeOnly(liveClass?.endsAt);
  return end ? `${start} to ${end}` : start;
}

function getDurationMinutes(startTime, endTime) {
  const [startHour, startMinute] = String(startTime || "").split(":").map(Number);
  const [endHour, endMinute] = String(endTime || "").split(":").map(Number);
  if (![startHour, startMinute, endHour, endMinute].every(Number.isFinite)) return 0;

  const startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;
  if (endTotal <= startTotal) endTotal += 24 * 60;
  return endTotal - startTotal;
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TrainerDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [liveClasses, setLiveClasses] = useState(() => getTrainerLiveClasses());
  const [message, setMessage] = useState("");

  const trainerClasses = useMemo(
    () => liveClasses.filter((liveClass) => liveClass.trainerEmail === user?.email),
    [liveClasses, user?.email]
  );

  const nextClass = useMemo(() => {
    const now = Date.now();
    return [...trainerClasses]
      .filter((liveClass) => new Date(liveClass.scheduledAt).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];
  }, [trainerClasses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please upload a valid image file.");
      return;
    }
    const dataUrl = await readImageFile(file);
    setForm((prev) => ({ ...prev, thumbnail: dataUrl }));
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = [
      "courseTitle",
      "category",
      "description",
      "classTitle",
      "scheduledDate",
      "startTime",
      "endTime",
      "meetUrl",
    ];
    const missing = required.find((key) => !String(form[key] || "").trim());
    if (missing) {
      setMessage("Please fill all class details before publishing.");
      return;
    }

    const durationMinutes = getDurationMinutes(form.startTime, form.endTime);
    if (durationMinutes <= 0) {
      setMessage("Please select a valid class time range.");
      return;
    }

    saveTrainerCourseLiveClass({
      ...form,
      scheduledTime: form.startTime,
      durationMinutes,
      trainer: user,
    });
    setLiveClasses(getTrainerLiveClasses());
    setForm(initialForm);
    setMessage("Live class published. Students can now see it in Courses, Categories, and Live Classes.");
    setActiveTab("classes");
  };

  const logout = async () => {
    await signOut();
    navigate(PATHS.LOGIN);
  };

  const renderTabButton = ({ id, label, icon: Icon }) => (
    <button
      key={id}
      type="button"
      onClick={() => {
        setActiveTab(id);
        setMobileSidebarOpen(false);
      }}
      className={[
        "w-full h-11 rounded-xl px-0 lg:px-4 text-sm font-extrabold inline-flex items-center justify-center gap-3 transition-colors",
        activeTab === id
          ? "bg-white text-[#00342b]"
          : "text-white/70 hover:bg-white/10 hover:text-white",
        sidebarCollapsed ? "justify-center" : "justify-start px-4",
      ].join(" ")}
      title={label}
    >
      <Icon className="flex-shrink-0" />
      <span className={sidebarCollapsed ? "hidden" : "inline truncate"}>{label}</span>
    </button>
  );

  return (
    <main className="h-dvh overflow-hidden bg-[#f4f7f6] text-slate-950">
      <div
        className={[
          "grid h-full min-h-0 grid-cols-1 transition-[grid-template-columns] duration-300",
          sidebarCollapsed ? "lg:grid-cols-[92px_1fr]" : "lg:grid-cols-[280px_1fr]",
        ].join(" ")}
      >
        {mobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Close trainer sidebar"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        ) : null}

        <aside
          className={[
            "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto h-dvh min-h-0 bg-[#00342b] text-white p-5 flex flex-col overflow-hidden transition-transform duration-300",
            mobileSidebarOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-[280px]",
            "lg:translate-x-0",
            sidebarCollapsed ? "lg:w-[92px]" : "lg:w-auto",
          ].join(" ")}
        >
          <div className={["flex items-center gap-3", sidebarCollapsed ? "justify-center" : "justify-between"].join(" ")}>
            {sidebarCollapsed ? (
              <div className="hidden lg:flex w-11 h-11 rounded-2xl bg-white/10 items-center justify-center text-sm font-black">
                LS
              </div>
            ) : (
              <div className="min-w-0">
                <div className="text-2xl font-extrabold leading-none">LurnStack</div>
                <div className="mt-1 text-xs text-white/60 font-semibold">Trainer Portal</div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden w-11 h-11 rounded-xl bg-white/10 text-white inline-flex items-center justify-center hover:bg-white/15 transition-colors flex-shrink-0"
              title="Close sidebar"
            >
              <FiX />
            </button>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="hidden lg:inline-flex w-11 h-11 rounded-xl bg-white/10 text-white items-center justify-center hover:bg-white/15 transition-colors flex-shrink-0"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FiSidebar />
            </button>
          </div>

          <nav className="mt-10 space-y-2">{tabs.map(renderTabButton)}</nav>

          <div className={["mt-auto rounded-2xl bg-white/10 p-2 lg:p-4", sidebarCollapsed ? "lg:px-2" : ""].join(" ")}>
            {sidebarCollapsed ? (
              <div className="mx-auto w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-sm font-extrabold">
                {(user?.fullName || "T").slice(0, 1).toUpperCase()}
              </div>
            ) : (
              <>
                <div className="text-sm font-extrabold truncate">{user?.fullName || "Trainer"}</div>
                <div className="mt-1 text-xs text-white/60 break-all line-clamp-2">{user?.email}</div>
              </>
            )}
            <button
              type="button"
              onClick={logout}
              className="mt-4 h-10 w-full rounded-xl border border-white/20 text-sm font-extrabold inline-flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              title="Log out"
            >
              <FiLogOut />
              <span className={sidebarCollapsed ? "hidden" : "inline"}>Log out</span>
            </button>
          </div>
        </aside>

        <section className="min-w-0 h-dvh min-h-0 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-5 flex-shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden mt-0.5 w-11 h-11 rounded-xl bg-[#00342b] text-white inline-flex items-center justify-center flex-shrink-0"
                  aria-label="Open trainer sidebar"
                >
                  <FiMenu />
                </button>
                <div>
                  <div className="lg:hidden text-xs font-extrabold uppercase tracking-[0.18em] text-[#006b58]">
                    Trainer Portal
                  </div>
                  <h1 className="text-xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
                    Live class management
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Create trainer-led classes and publish them directly to student Courses, Categories, and Live Classes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="lg:hidden h-10 px-4 rounded-xl border border-slate-200 text-sm font-extrabold inline-flex items-center justify-center gap-2"
              >
                <FiLogOut />
                Log out
              </button>
            </div>

          </header>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 lg:p-8">
            {activeTab === "overview" ? (
              <div className="space-y-6">
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    ["Published classes", trainerClasses.length, FiVideo],
                    ["Student visibility", "Courses + Categories", FiUsers],
                    ["Next class", nextClass ? formatClassTime(nextClass.scheduledAt) : "Not scheduled", FiClock],
                  ].map(([label, value, Icon]) => (
                    <div key={label} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                      <Icon className="text-[#006b58] text-xl" />
                      <div className="mt-4 text-xl font-extrabold">{value}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-500">{label}</div>
                    </div>
                  ))}
                </section>

                <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold">Publishing flow</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        A single upload creates the student-facing course card, category listing, course details live-class block, and student live-class card.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("create")}
                      className="h-11 px-5 rounded-xl bg-[#00342b] text-white text-sm font-extrabold inline-flex items-center justify-center gap-2"
                    >
                      <FiPlusCircle />
                      Create class
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                    {["Upload thumbnail", "Add class details", "Publish", "Students view"].map((item, index) => (
                      <div key={item} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <div className="w-8 h-8 rounded-full bg-[#00342b] text-white flex items-center justify-center text-sm font-extrabold">
                          {index + 1}
                        </div>
                        <div className="mt-3 text-sm font-extrabold">{item}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}

            {activeTab === "create" ? (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#00342b] text-white flex items-center justify-center">
                      <FiUploadCloud className="text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold">Create live class</h2>
                      <p className="text-sm text-slate-500">
                        Upload a thumbnail and class details for the student course pages.
                      </p>
                    </div>
                  </div>
                  {message ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                      {message}
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6 items-start">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 xl:sticky xl:top-0">
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-white border border-slate-200">
                      {form.thumbnail ? (
                        <img src={form.thumbnail} alt="Class thumbnail preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-teal-800 to-cyan-600 flex flex-col items-center justify-center text-white">
                          <FiImage className="text-4xl opacity-80" />
                          <div className="mt-2 text-sm font-extrabold">Thumbnail preview</div>
                        </div>
                      )}
                    </div>
                    <label className="mt-4 h-11 rounded-xl bg-white border border-slate-200 text-sm font-extrabold text-slate-700 flex items-center justify-center gap-2 cursor-pointer hover:border-[#006b58] transition-colors">
                      <FiImage />
                      Upload thumbnail
                      <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                    </label>
                    <p className="mt-2 text-xs text-slate-500">
                      This image appears on student course cards and live class cards.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="sm:col-span-2">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Course title</span>
                      <input name="courseTitle" value={form.courseTitle} onChange={handleChange} placeholder="Example: React Live Masterclass" className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5" />
                    </label>

                    <label>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Category</span>
                      <input name="category" value={form.category} onChange={handleChange} placeholder="Web Development" className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5" />
                    </label>

                    <label className="sm:col-span-2">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Course description</span>
                      <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="What will students learn in this class?" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5 resize-none" />
                    </label>

                    <label className="sm:col-span-2">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Live class title</span>
                      <input name="classTitle" value={form.classTitle} onChange={handleChange} placeholder="Example: Hooks and state management" className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5" />
                    </label>

                    <label>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Date</span>
                      <input name="scheduledDate" type="date" value={form.scheduledDate} onChange={handleChange} className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5" />
                    </label>

                    <label>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Start time</span>
                      <input name="startTime" type="time" value={form.startTime} onChange={handleChange} className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5" />
                    </label>

                    <label>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">End time</span>
                      <input name="endTime" type="time" value={form.endTime} onChange={handleChange} className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5" />
                    </label>

                    {form.startTime && form.endTime ? (
                      <div className="sm:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-950">
                        Class timing: {formatTimeOnly(`2026-01-01T${form.startTime}:00+05:30`)} to {formatTimeOnly(`2026-01-01T${form.endTime}:00+05:30`)}
                      </div>
                    ) : null}

                    <label>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Meeting link</span>
                      <input name="meetUrl" type="url" value={form.meetUrl} onChange={handleChange} placeholder="https://meet.google.com/..." className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#006b58] focus:ring-4 focus:ring-emerald-900/5" />
                    </label>
                  </div>
                </div>

                <button type="submit" className="mt-6 w-full h-12 rounded-xl bg-[#00342b] text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 hover:bg-[#004d40] transition-colors">
                  <FiCheckCircle className="text-lg" />
                  Publish for students
                </button>
              </form>
            ) : null}

            {activeTab === "classes" ? (
              <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold">Uploaded live classes</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      These classes are visible on the student Courses, Categories, Course Details, and Live Classes pages.
                    </p>
                  </div>
                  <button type="button" onClick={() => setActiveTab("create")} className="h-11 px-5 rounded-xl bg-[#00342b] text-white text-sm font-extrabold inline-flex items-center justify-center gap-2">
                    <FiPlusCircle />
                    New class
                  </button>
                </div>

                {message ? (
                  <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                    {message}
                  </div>
                ) : null}

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {trainerClasses.length === 0 ? (
                    <div className="md:col-span-2 xl:col-span-3 rounded-2xl bg-slate-50 border border-slate-100 p-8 text-center">
                      <FiVideo className="mx-auto text-4xl text-slate-300" />
                      <div className="mt-3 text-lg font-extrabold">No classes uploaded yet</div>
                      <p className="mt-1 text-sm text-slate-500">Create your first live class to publish it for students.</p>
                    </div>
                  ) : (
                    trainerClasses.map((liveClass) => (
                      <article key={liveClass.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                        <div className="aspect-[16/9] bg-slate-100">
                          <SmartImage
                            src={liveClass.thumbnail}
                            alt={liveClass.title}
                            className="w-full h-full object-cover"
                            fallbackClassName="w-full h-full bg-gradient-to-br from-emerald-950 via-teal-800 to-cyan-600"
                          />
                        </div>
                        <div className="p-4">
                          <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#006b58]">
                            {liveClass.courseName}
                          </div>
                          <h3 className="mt-1 text-base font-extrabold text-slate-950 line-clamp-2">
                            {liveClass.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                            {liveClass.description}
                          </p>
                          <div className="mt-4 space-y-2 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-2">
                              <FiClock />
                              {formatClassTimeRange(liveClass)} IST
                            </span>
                            <span className="flex items-center gap-2">
                              <FiCalendar />
                              {liveClass.durationMinutes} minutes
                            </span>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
