import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineShoppingBag } from "react-icons/hi2";
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
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, isAuthenticated, signOut, userRole } = useAuth();

  const isCheckout = location?.pathname === PATHS.CHECKOUT;

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
      <header className="fixed inset-x-0 top-0 z-50 h-[89px] overflow-visible border-b border-[#1a8003]/70 bg-[#1a8003] text-gray-950 shadow-sm">
        <nav className="mx-auto flex h-full max-w-container-max items-center px-4 sm:px-6 lg:px-margin-desktop">
          <div className="flex items-center justify-between gap-6">
            <NavLink
              to={PATHS.HOME}
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
              aria-label="LurnStack"
            >
              <img
                src={logo}
                alt="LurnStack"
                className="h-11 w-auto object-contain"
                loading="eager"
              />
            </NavLink>
            <button
              type="button"
              onClick={() => navigate(PATHS.HOME)}
              className="font-label-sm text-label-sm text-gray-900 hover:text-black hover:underline"
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
      <header className="fixed inset-x-0 top-0 z-50 h-[89px] overflow-visible border-b border-[#1a8003]/70 bg-[#1a8003] text-gray-950 shadow-sm">
        <nav className="mx-auto flex h-full max-w-container-max items-center px-4 sm:px-6 lg:px-margin-desktop">
          <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-12 min-w-0">
              <NavLink
                to={PATHS.HOME}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 sm:h-16 sm:w-16"
                onClick={closeMobileMenu}
                aria-label="LurnStack"
              >
                <img
                  src={logo}
                  alt="LurnStack"
                  className="h-10 w-auto object-contain sm:h-12"
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
                  />
                </div>
              ) : null}

              <div className="hidden md:flex items-center gap-8">
                <NavItem to={PATHS.COURSES}>Courses</NavItem>
                {isAuthenticated ? (
                  <NavItem to={PATHS.LIVE_CLASSES}>Live Classes</NavItem>
                ) : null}
                {isAuthenticated ? (
                  <NavItem to={PATHS.DASHBOARD}>My Learning</NavItem>
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
                />
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-4">
              <NavLink
                to={PATHS.CART}
                className="w-11 h-11 rounded-full border border-black/10 bg-white/85 hover:bg-white transition-colors flex items-center justify-center text-gray-900 hover:text-black"
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
                    className="w-11 h-11 rounded-full border border-white/90 bg-white shadow-sm hover:bg-white transition-colors flex items-center justify-center ring-1 ring-black/5"
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
                <div className="hidden sm:flex items-center gap-2">
                  <NavLink
                    to={PATHS.LOGIN}
                    className="font-label-sm text-label-sm px-4 py-2.5 rounded-full border border-black/10 bg-white/90 text-gray-900 hover:bg-white hover:shadow-md hover:shadow-black/10 transition-all active:scale-95 duration-200 text-[12px]"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to={PATHS.SIGNUP}
                    className="font-label-sm text-label-sm px-4 py-2.5 bg-black text-white rounded-full hover:bg-gray-900 hover:shadow-lg hover:shadow-black/10 transition-all active:scale-95 duration-200 text-[12px]"
                  >
                    Register
                  </NavLink>
                </div>
              )}

              <button
                onClick={toggleMobileMenu}
                className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-black/10 transition-colors"
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
                  mobileMenuView === "courses" ? "-translate-x-full" : "translate-x-0",
                ].join(" ")}
              >
                <div className="divide-y divide-gray-200 border-y border-gray-200">
                  <MobileDrawerButton onClick={() => setMobileMenuView("courses")}>
                    Courses
                  </MobileDrawerButton>
                  {isAuthenticated ? (
                    <MobileDrawerLink to={PATHS.LIVE_CLASSES} onClick={closeMobileMenu}>
                      Live Classes
                    </MobileDrawerLink>
                  ) : null}
                  {isAuthenticated ? (
                    <MobileDrawerLink to={PATHS.DASHBOARD} onClick={closeMobileMenu}>
                      My Learning
                    </MobileDrawerLink>
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
                        Register
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
