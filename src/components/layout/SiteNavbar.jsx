import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShoppingBag,
  HiOutlineChatBubbleLeftRight,
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineCalendar,
  HiOutlinePlayCircle,
  HiOutlineCheckCircle,
  HiOutlineTrophy,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
} from "react-icons/hi2";
import NavItem from "./navbar/NavItem";
import NavbarSearch from "./navbar/NavbarSearch";
import { useCart } from "../../cart";
import { PATHS } from "../../app/router/paths";
import { useAuth } from "../../auth";
import logo from "../../assets/Logo/Logo4.png";

const COURSE_CATEGORIES = [
  "Trainer Courses",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Web Development",
  "Mobile App Development",
  "Programming",
  "Database",
  "DevOps",
  "Cloud Computing",
  "UI/UX Design",
];

const MY_LEARNING_LINKS = [
  { label: "All courses", view: "all", description: "Every active course", icon: HiOutlineAcademicCap },
  { label: "Paid sessions", view: "paid", description: "Purchased classes", icon: HiOutlineCreditCard },
  { label: "Upcoming live sessions", view: "upcoming", description: "Next scheduled classes", icon: HiOutlineCalendar },
  { label: "Recently joined", view: "recent", description: "Latest activity", icon: HiOutlinePlayCircle },
  { label: "Completed sessions", view: "completed", description: "Finished classes", icon: HiOutlineCheckCircle },
  { label: "Certifications", view: "certifications", description: "Certificates and awards", icon: HiOutlineTrophy },
];

const ABOUT_US_LINKS = [
  {
    label: "LurnStack Company",
    path: PATHS.ABOUT_COMPANY,
    description: "Learn about our vision and training mission",
    icon: HiOutlineBuildingOffice2,
  },
  {
    label: "Our Projects",
    path: PATHS.ABOUT_PROJECTS,
    description: "Explore our in-house systems and tools",
    icon: HiOutlineBriefcase,
  },
];

function learningViewPath(view) {
  if (view === "certifications") return PATHS.CERTIFICATIONS;
  return `${PATHS.DASHBOARD}?view=${view}`;
}

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "U";
}

function courseCategoryPath(category) {
  return `${PATHS.COURSES}?category=${encodeURIComponent(category)}`;
}

function MobileDrawerLink({ to, onClick, children, end = false }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={end}
      className={({ isActive }) =>
        [
          "flex items-center justify-between py-3 text-[15px] font-medium transition-colors",
          isActive ? "text-black" : "text-gray-900/80 hover:text-black",
        ].join(" ")
      }
    >
      <span>{children}</span>
      <HiOutlineChevronRight className="text-[18px] text-gray-400" />
    </NavLink>
  );
}

function MobileDrawerButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between py-3 text-left text-[15px] font-medium text-gray-900/80 transition-colors hover:text-black"
    >
      <span>{children}</span>
      <HiOutlineChevronRight className="text-[18px] text-gray-400" />
    </button>
  );
}

export default function SiteNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuView, setMobileMenuView] = useState("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [learningDropdownOpen, setLearningDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, isAuthenticated, signOut, userRole } = useAuth();

  const learningTimeoutRef = useRef(null);
  const aboutTimeoutRef = useRef(null);

  const handleLearningMouseEnter = () => {
    if (learningTimeoutRef.current) clearTimeout(learningTimeoutRef.current);
    setLearningDropdownOpen(true);
  };

  const handleLearningMouseLeave = () => {
    learningTimeoutRef.current = setTimeout(() => {
      setLearningDropdownOpen(false);
    }, 150);
  };

  const closeLearningDropdown = () => {
    if (learningTimeoutRef.current) clearTimeout(learningTimeoutRef.current);
    setLearningDropdownOpen(false);
  };

  const handleAboutMouseEnter = () => {
    if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
    setAboutDropdownOpen(true);
  };

  const handleAboutMouseLeave = () => {
    aboutTimeoutRef.current = setTimeout(() => {
      setAboutDropdownOpen(false);
    }, 150);
  };

  const closeAboutDropdown = () => {
    if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
    setAboutDropdownOpen(false);
  };

  useEffect(() => {
    return () => {
      if (learningTimeoutRef.current) clearTimeout(learningTimeoutRef.current);
      if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
    };
  }, []);

  const isCheckout = location?.pathname === PATHS.CHECKOUT;

  const openAiChat = () => {
    window.dispatchEvent(new Event("lurnstack:open-ai-chat"));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((open) => {
      if (open) setMobileMenuView("main");
      return !open;
    });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setMobileMenuView("main");
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`${PATHS.COURSES}?q=${encodeURIComponent(q)}`);
    closeMobileMenu();
  };

  if (isCheckout) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 h-[89px] overflow-visible border-b border-gray-200/80 bg-[#fbfcfd] text-gray-950 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <nav className="mx-auto flex h-full max-w-container-max items-center px-4 sm:px-6 lg:px-margin-desktop">
          <div className="flex items-center justify-between gap-6">
            <NavLink
              to={PATHS.HOME}
              className="inline-flex items-center"
              aria-label="LurnStack"
            >
              <img
                src={logo}
                alt="LurnStack"
                className="h-16 w-auto object-contain"
                loading="eager"
              />
            </NavLink>
            <button
              type="button"
              onClick={() => navigate(PATHS.HOME)}
              className="font-label-sm text-label-sm text-gray-700 hover:text-gray-950 hover:underline"
            >
              Cancel
            </button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-[89px] overflow-visible border-b border-gray-200/80 bg-[#fbfcfd] text-gray-950 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <nav className="mx-auto flex h-full max-w-container-max items-center px-4 sm:px-6 lg:px-margin-desktop">
          <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-12 min-w-0">
              <NavLink
                to={PATHS.HOME}
                className="inline-flex shrink-0 items-center"
                onClick={closeMobileMenu}
                aria-label="LurnStack"
              >
                <img
                  src={logo}
                  alt="LurnStack"
                  className="h-14 w-auto object-contain sm:h-[72px]"
                  loading="eager"
                />
              </NavLink>

              {isAuthenticated ? (
                <div className="hidden md:flex min-w-0">
                  <NavbarSearch
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSubmit={submitSearch}
                    placeholder="What would you like to learn?"
                    className="w-[360px] max-w-[40vw]"
                    isAuthenticated={isAuthenticated}
                    onSuggestionSelect={() => {
                      setSearchQuery("");
                      closeMobileMenu();
                    }}
                  />
                </div>
              ) : null}

              <div className="hidden md:flex items-center gap-8">
                <NavItem to={PATHS.COURSES}>Courses</NavItem>
                {isAuthenticated ? (
                  <NavItem to={PATHS.LIVE_CLASSES}>TIT class</NavItem>
                ) : null}
                {isAuthenticated ? (
                  <div
                    className="relative group"
                    onMouseEnter={handleLearningMouseEnter}
                    onMouseLeave={handleLearningMouseLeave}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1 font-label-sm text-label-sm text-gray-900/75 hover:text-black transition-colors duration-200 whitespace-nowrap outline-none"
                    >
                      <span>My Learning</span>
                    </button>

                    {learningDropdownOpen && (
                      <div className="absolute left-0 top-full pt-2 w-72 z-50 origin-top-left transition-all duration-200">
                        <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.12)] py-2 overflow-hidden">
                          {MY_LEARNING_LINKS.map((item) => (
                            <NavLink
                              key={item.view}
                              to={learningViewPath(item.view)}
                              onClick={closeLearningDropdown}
                              className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#004d3d]/5 border-l-2 border-transparent hover:border-[#004d3d] transition-all duration-200 group/item"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover/item:bg-emerald-50 group-hover/item:text-[#004d3d] transition-colors">
                                <item.icon className="text-[18px]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="block text-[13px] font-bold text-gray-800 group-hover/item:text-[#004d3d] transition-colors">
                                  {item.label}
                                </span>
                                <span className="block text-[11px] font-medium text-gray-400 mt-0.5">
                                  {item.description}
                                </span>
                              </div>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
                {!isAuthenticated ? (
                  <div
                    className="relative group"
                    onMouseEnter={handleAboutMouseEnter}
                    onMouseLeave={handleAboutMouseLeave}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1 font-label-sm text-label-sm text-gray-900/75 hover:text-black transition-colors duration-200 whitespace-nowrap outline-none"
                    >
                      <span>About Us</span>
                    </button>

                    {aboutDropdownOpen && (
                      <div className="absolute left-0 top-full pt-2 w-72 z-50 origin-top-left transition-all duration-200">
                        <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.12)] py-2 overflow-hidden">
                          {ABOUT_US_LINKS.map((item) => (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              onClick={closeAboutDropdown}
                              className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#004d3d]/5 border-l-2 border-transparent hover:border-[#004d3d] transition-all duration-200 group/item"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover/item:bg-emerald-50 group-hover/item:text-[#004d3d] transition-colors">
                                <item.icon className="text-[18px]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="block text-[13px] font-bold text-gray-800 group-hover/item:text-[#004d3d] transition-colors">
                                  {item.label}
                                </span>
                                <span className="block text-[11px] font-medium text-gray-400 mt-0.5">
                                  {item.description}
                                </span>
                              </div>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
                <NavItem to={PATHS.PLANS}>Plans</NavItem>
              </div>
            </div>

            <div className="hidden md:flex justify-center min-w-0">
              {!isAuthenticated ? (
                  <NavbarSearch
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSubmit={submitSearch}
                    placeholder="Search courses, skills, instructors..."
                    className="w-full max-w-[520px]"
                    isAuthenticated={isAuthenticated}
                    onSuggestionSelect={() => {
                      setSearchQuery("");
                      closeMobileMenu();
                    }}
                  />
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-4">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={openAiChat}
                  className="group relative hidden h-11 w-11 items-center justify-center overflow-visible rounded-full bg-transparent text-sm font-semibold text-[#004d3d] transition-all duration-300 hover:bg-emerald-50 focus-visible:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900/10 lg:inline-flex"
                  aria-label="Ask AI"
                  title="Ask AI"
                >
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-lime-400 shadow-[0_0_0_2px_white]"
                    style={{ animation: "ai-dot-blink 1.2s ease-in-out infinite" }}
                  />
                  <HiOutlineChatBubbleLeftRight className="text-[20px]" />
                </button>
              ) : null}

              <NavLink
                to={PATHS.CART}
                className="w-11 h-11 rounded-full border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 transition-colors flex items-center justify-center text-gray-800 hover:text-gray-950"
                aria-label="Cart"
              >
                <span id="cart-icon" className="relative inline-flex items-center justify-center">
                  <HiOutlineShoppingBag className="text-[20px]" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#004d3d] text-white text-[11px] font-extrabold flex items-center justify-center shadow-md">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </span>
              </NavLink>

              {isAuthenticated ? (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="w-11 h-11 rounded-full transition-colors flex items-center justify-center"
                    aria-label="Profile menu"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#004d3d] text-white flex items-center justify-center font-extrabold text-xs">
                      {initials(user?.fullName)}
                    </span>
                  </button>

                  {profileOpen ? (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-2xl border border-outline-variant bg-surface shadow-lg overflow-hidden"
                      onMouseLeave={() => setProfileOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate(PATHS.PROFILE);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900/75 hover:bg-black/5 hover:text-black transition-colors"
                      >
                        Profile
                      </button>
                      {userRole === "student" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate(PATHS.STUDENT_ATTENDANCE);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900/75 hover:bg-black/5 hover:text-black transition-colors"
                        >
                          My Attendance
                        </button>
                      ) : null}
                      {userRole === "trainer" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate(PATHS.TRAINER_ATTENDANCE);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900/75 hover:bg-black/5 hover:text-black transition-colors"
                        >
                          Attendance
                        </button>
                      ) : null}
                      {userRole === "admin" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate(PATHS.ADMIN_ATTENDANCE);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900/75 hover:bg-black/5 hover:text-black transition-colors"
                        >
                          Admin Attendance
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileOpen(false);
                          await signOut();
                          navigate(PATHS.HOME);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900/75 hover:bg-black/5 hover:text-black transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <NavLink
                    to={PATHS.LOGIN}
                    className="font-label-sm text-label-sm px-4 py-2.5 rounded-full border border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:text-gray-950 hover:shadow-sm transition-all active:scale-95 duration-200 text-[12px]"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to={PATHS.SIGNUP}
                    className="hidden sm:inline-flex font-label-sm text-label-sm px-4 py-2.5 bg-[#004d3d] text-white rounded-full hover:bg-[#003d31] hover:shadow-lg hover:shadow-emerald-950/10 transition-all active:scale-95 duration-200 text-[12px]"
                  >
                    Sign up
                  </NavLink>
                </div>
              )}

              <button
                onClick={toggleMobileMenu}
                className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <span
                  className={`block w-6 h-0.5 bg-gray-900 transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-gray-900 transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-gray-900 transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
        />

        <aside
          className={`absolute left-0 top-[89px] h-[calc(100vh-89px)] w-[86vw] max-w-[340px] transform border-r border-gray-200 bg-white text-gray-900 shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full min-w-0 flex-col overflow-y-auto px-4 py-4 sm:px-6">
            {isAuthenticated ? (
              <NavLink
                to={PATHS.PROFILE}
                onClick={closeMobileMenu}
                className="mb-4 flex items-center gap-3 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#111827] text-lg font-extrabold text-white">
                  {initials(user?.fullName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold leading-5 text-gray-900">
                    Hi, {user?.fullName || "Learner"}
                  </span>
                  <span className="block text-[12px] text-gray-500">Welcome back</span>
                </span>
                <HiOutlineChevronRight className="text-[18px] text-gray-400" />
              </NavLink>
            ) : (
              <div className="mb-4 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 shadow-sm">
                <p className="text-[15px] font-bold text-gray-900">Welcome to LurnStack</p>
                <p className="mt-1 text-[12px] text-gray-500">Sign in to continue learning</p>
              </div>
            )}

            <div className="relative min-h-[360px] flex-1 overflow-hidden">
              <div
                className={[
                  "absolute inset-0 overflow-y-auto pb-4 transition-transform duration-300 ease-out",
                  mobileMenuView !== "main" ? "-translate-x-full" : "translate-x-0",
                ].join(" ")}
              >
                <div className="divide-y divide-gray-200 border-y border-gray-200">
                  <MobileDrawerButton onClick={() => setMobileMenuView("courses")}>
                    Courses
                  </MobileDrawerButton>
                  {isAuthenticated ? (
                    <MobileDrawerLink to={PATHS.LIVE_CLASSES} onClick={closeMobileMenu}>
                      TIT class
                    </MobileDrawerLink>
                  ) : null}
                  {isAuthenticated ? (
                    <MobileDrawerButton onClick={() => setMobileMenuView("learning")}>
                      My Learning
                    </MobileDrawerButton>
                  ) : null}
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        openAiChat();
                      }}
                      className="flex w-full items-center justify-between py-3 text-left text-[15px] font-medium text-gray-900/80 transition-colors hover:text-black"
                    >
                      <span className="flex items-center gap-2">
                        <span>Ask AI</span>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                        </span>
                      </span>
                      <HiOutlineChevronRight className="text-[18px] text-gray-400" />
                    </button>
                  ) : null}
                  {!isAuthenticated ? (
                    <MobileDrawerButton onClick={() => setMobileMenuView("about")}>
                      About Us
                    </MobileDrawerButton>
                  ) : null}
                  <MobileDrawerLink to={PATHS.PLANS} onClick={closeMobileMenu}>
                    Plans
                  </MobileDrawerLink>
                  <MobileDrawerLink to={PATHS.CART} onClick={closeMobileMenu}>
                    Cart{itemCount > 0 ? ` (${itemCount > 99 ? "99+" : itemCount})` : ""}
                  </MobileDrawerLink>
                  <MobileDrawerLink to={PATHS.PROFILE} onClick={closeMobileMenu}>
                    Profile
                  </MobileDrawerLink>
                  {isAuthenticated ? (
                    userRole === "student" ? (
                      <MobileDrawerLink to={PATHS.STUDENT_ATTENDANCE} onClick={closeMobileMenu}>
                        My Attendance
                      </MobileDrawerLink>
                    ) : userRole === "trainer" ? (
                      <MobileDrawerLink to={PATHS.TRAINER_ATTENDANCE} onClick={closeMobileMenu}>
                        Attendance
                      </MobileDrawerLink>
                    ) : userRole === "admin" ? (
                      <MobileDrawerLink to={PATHS.ADMIN_ATTENDANCE} onClick={closeMobileMenu}>
                        Admin Attendance
                      </MobileDrawerLink>
                    ) : null
                  ) : (
                    <>
                      <MobileDrawerLink to={PATHS.LOGIN} onClick={closeMobileMenu}>
                        Login
                      </MobileDrawerLink>
                      <MobileDrawerLink to={PATHS.SIGNUP} onClick={closeMobileMenu}>
                        Sign up
                      </MobileDrawerLink>
                    </>
                  )}
                </div>
              </div>

              <div
                className={[
                  "absolute inset-0 overflow-y-auto pb-4 transition-transform duration-300 ease-out",
                  mobileMenuView === "courses" ? "translate-x-0" : "translate-x-full",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => setMobileMenuView("main")}
                  className="mb-3 flex items-center gap-2 py-2 text-[14px] font-bold text-gray-600"
                >
                  <HiOutlineChevronLeft className="text-[18px]" />
                  Menu
                </button>
                <div className="px-1 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                  Course Categories
                </div>
                <div className="divide-y divide-gray-200 border-y border-gray-200">
                  {COURSE_CATEGORIES.map((category) => (
                    <MobileDrawerLink
                      key={category}
                      to={courseCategoryPath(category)}
                      onClick={closeMobileMenu}
                    >
                      {category}
                    </MobileDrawerLink>
                  ))}
                </div>
              </div>

              <div
                className={[
                  "absolute inset-0 overflow-y-auto pb-4 transition-transform duration-300 ease-out",
                  mobileMenuView === "learning" ? "translate-x-0" : "translate-x-full",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => setMobileMenuView("main")}
                  className="mb-3 flex items-center gap-2 py-2 text-[14px] font-bold text-gray-600"
                >
                  <HiOutlineChevronLeft className="text-[18px]" />
                  Menu
                </button>
                <div className="px-1 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                  My Learning
                </div>
                <div className="divide-y divide-gray-200 border-y border-gray-200">
                  {MY_LEARNING_LINKS.map((item) => (
                    <MobileDrawerLink
                      key={item.view}
                      to={learningViewPath(item.view)}
                      onClick={closeMobileMenu}
                      end={item.view === "all"}
                    >
                      {item.label}
                    </MobileDrawerLink>
                  ))}
                </div>
              </div>

              <div
                className={[
                  "absolute inset-0 overflow-y-auto pb-4 transition-transform duration-300 ease-out",
                  mobileMenuView === "about" ? "translate-x-0" : "translate-x-full",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => setMobileMenuView("main")}
                  className="mb-3 flex items-center gap-2 py-2 text-[14px] font-bold text-gray-600"
                >
                  <HiOutlineChevronLeft className="text-[18px]" />
                  Menu
                </button>
                <div className="px-1 pb-2 text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                  About Us
                </div>
                <div className="divide-y divide-gray-200 border-y border-gray-200">
                  {ABOUT_US_LINKS.map((item) => (
                    <MobileDrawerLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </MobileDrawerLink>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <div className="border-t border-gray-200 pt-3">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={async () => {
                      closeMobileMenu();
                      await signOut();
                      navigate(PATHS.HOME);
                    }}
                    className="flex w-full items-center justify-between py-3 text-[15px] font-medium text-gray-900/80 transition-colors hover:text-black"
                  >
                    <span>Log out</span>
                    <HiOutlineChevronRight className="text-[18px] text-gray-400" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
