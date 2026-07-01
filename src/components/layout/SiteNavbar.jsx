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

const MEGA_MENU_COLUMNS = [
  {
    title: "Web & Full Stack",
    categories: [
      "Web Development",
      "Frontend Development",
      "Backend Development",
      "Full Stack Development",
    ]
  },
  {
    title: "Software & Mobile",
    categories: [
      "Programming",
      "Mobile App Development",
      "UI/UX Design",
    ]
  },
  {
    title: "Cloud & DevOps",
    categories: [
      "Cloud Computing",
      "DevOps",
      "Database",
    ]
  },
  {
    title: "Specialized Programs",
    categories: [
      "Trainer Courses",
    ]
  }
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

  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const coursesTimeoutRef = useRef(null);

  const handleCoursesMouseEnter = () => {
    if (coursesTimeoutRef.current) clearTimeout(coursesTimeoutRef.current);
    setCoursesDropdownOpen(true);
  };

  const handleCoursesMouseLeave = () => {
    coursesTimeoutRef.current = setTimeout(() => {
      setCoursesDropdownOpen(false);
    }, 150);
  };

  const closeCoursesDropdown = () => {
    if (coursesTimeoutRef.current) clearTimeout(coursesTimeoutRef.current);
    setCoursesDropdownOpen(false);
  };

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
      if (coursesTimeoutRef.current) clearTimeout(coursesTimeoutRef.current);
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
                width="192"
                height="64"
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
                  width="216"
                  height="72"
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
                <div
                  onMouseEnter={handleCoursesMouseEnter}
                  onMouseLeave={handleCoursesMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => {
                      closeCoursesDropdown();
                      navigate(PATHS.COURSES);
                    }}
                    className={`font-label-sm text-label-sm relative transition-colors duration-200 whitespace-nowrap outline-none ${
                      location.pathname.startsWith(PATHS.COURSES)
                        ? "text-black font-extrabold"
                        : "text-gray-900/75 hover:text-black"
                    }`}
                  >
                    <span>Courses</span>
                  </button>

                  {coursesDropdownOpen && (
                    <div
                      className="absolute left-0 right-0 top-full w-full bg-white border-t border-gray-200 shadow-[0_20px_50px_rgba(15,23,42,0.15)] z-50 py-8"
                      onMouseEnter={handleCoursesMouseEnter}
                      onMouseLeave={handleCoursesMouseLeave}
                    >
                      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-margin-desktop">
                        <div className="grid grid-cols-4 gap-8">
                          {MEGA_MENU_COLUMNS.map((col, idx) => (
                            <div key={idx} className="flex flex-col">
                              <h3 className="pl-3 border-l-4 border-[#004d3d] font-extrabold text-[12px] text-gray-900 tracking-wider uppercase mb-5">
                                {col.title}
                              </h3>
                              <ul className="space-y-3">
                                {col.categories.map((category) => (
                                  <li key={category}>
                                    <NavLink
                                      to={courseCategoryPath(category)}
                                      onClick={closeCoursesDropdown}
                                      className="group flex items-center gap-2 py-1 text-[14px] font-medium text-gray-600 hover:text-[#004d3d] transition-colors duration-200"
                                    >
                                      <HiOutlineChevronRight className="text-[12px] text-gray-400 group-hover:text-[#004d3d] transition-transform duration-200 group-hover:translate-x-0.5" />
                                      <span>{category}</span>
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 mt-8 pt-5 flex items-center justify-between text-[13px] text-gray-500 font-medium">
                          <NavLink
                            to={PATHS.COURSES}
                            onClick={closeCoursesDropdown}
                            className="group inline-flex items-center gap-1.5 font-bold text-[#004d3d] hover:underline"
                          >
                            <span>View All Courses</span>
                            <HiOutlineChevronRight className="text-[14px] transition-transform duration-200 group-hover:translate-x-0.5" />
                          </NavLink>
                          <div className="flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span>Need Help? Contact Us</span>
                          </div>
                          <div>
                            <span>11+ Course Categories Available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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

              {/* Desktop WhatsApp icon on the right side of the profile/login */}
              <a
                href="https://wa.me/919677794485?text=Hi%20LurnStack%20Support%2C%20I'd%20like%20to%20inquire%20about%20your%20courses%20and%20upcoming%20live%20classes."
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex w-11 h-11 rounded-full border border-gray-200 bg-gray-50 hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-200 items-center justify-center text-[#075E54] shadow-sm hover:scale-105 active:scale-95 shrink-0"
                aria-label="Chat on WhatsApp"
                title="Chat on WhatsApp"
              >
                <svg
                  className="w-[20px] h-[20px] fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>

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
        inert={!isMobileMenuOpen}
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
                  <MobileDrawerLink
                    to={PATHS.COURSES}
                    onClick={closeMobileMenu}
                    end={true}
                  >
                    All Courses
                  </MobileDrawerLink>
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
