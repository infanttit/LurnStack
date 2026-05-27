import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import NavItem from "./navbar/NavItem";
import NavbarSearch from "./navbar/NavbarSearch";
import { useCart } from "../../cart";
import { PATHS } from "../../app/router/paths";
import { useAuth } from "../../auth";
import logo from "../../assets/Logo/Logo4.png";

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "U";
}

export default function SiteNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, isAuthenticated, signOut, userRole } = useAuth();

  const isCheckout = location?.pathname === PATHS.CHECKOUT;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
                <NavItem to={PATHS.CATEGORIES}>Categories</NavItem>
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
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
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
                          className="w-full text-left px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
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
                          className="w-full text-left px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
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
                          className="w-full text-left px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
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
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
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
        className={`md:hidden fixed top-[89px] left-0 right-0 max-w-full border-b border-[#1a8003]/70 bg-[#1a8003] text-gray-950 shadow-lg z-40 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex min-w-0 flex-col gap-4 px-4 py-6 sm:px-6">
          <NavbarSearch
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={submitSearch}
            placeholder="Search courses..."
            className="sm:hidden"
          />
          <NavItem to={PATHS.COURSES} onClick={closeMobileMenu}>
            Courses
          </NavItem>
          {isAuthenticated ? (
            <NavItem to={PATHS.LIVE_CLASSES} onClick={closeMobileMenu}>
              Live Classes
            </NavItem>
          ) : null}
          <NavItem to={PATHS.CATEGORIES} onClick={closeMobileMenu}>
            Categories
          </NavItem>
          <NavItem to={PATHS.PLANS} onClick={closeMobileMenu}>
            Plans
          </NavItem>

          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
            <NavLink
              to={PATHS.CART}
              onClick={closeMobileMenu}
              className="font-label-sm text-label-sm px-6 py-2 text-gray-900 hover:bg-black/10 rounded-full transition-all active:scale-95 duration-200 text-center"
            >
              Cart{itemCount > 0 ? ` (${itemCount > 99 ? "99+" : itemCount})` : ""}
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to={PATHS.PROFILE}
                  onClick={closeMobileMenu}
                  className="font-label-sm text-label-sm px-6 py-2 text-gray-900 hover:bg-black/10 rounded-full transition-all active:scale-95 duration-200 text-center"
                >
                  Profile
                </NavLink>
                {userRole === "student" ? (
                  <NavLink
                    to={PATHS.STUDENT_ATTENDANCE}
                    onClick={closeMobileMenu}
                    className="font-label-sm text-label-sm px-6 py-2 text-gray-900 hover:bg-black/10 rounded-full transition-all active:scale-95 duration-200 text-center"
                  >
                    My Attendance
                  </NavLink>
                ) : null}
                {userRole === "trainer" ? (
                  <NavLink
                    to={PATHS.TRAINER_ATTENDANCE}
                    onClick={closeMobileMenu}
                    className="font-label-sm text-label-sm px-6 py-2 text-gray-900 hover:bg-black/10 rounded-full transition-all active:scale-95 duration-200 text-center"
                  >
                    Attendance
                  </NavLink>
                ) : null}
                {userRole === "admin" ? (
                  <NavLink
                    to={PATHS.ADMIN_ATTENDANCE}
                    onClick={closeMobileMenu}
                    className="font-label-sm text-label-sm px-6 py-2 text-gray-900 hover:bg-black/10 rounded-full transition-all active:scale-95 duration-200 text-center"
                  >
                    Admin Attendance
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  onClick={async () => {
                    closeMobileMenu();
                    await signOut();
                    navigate(PATHS.HOME);
                  }}
                  className="font-label-sm text-label-sm px-6 py-2 text-gray-900 hover:bg-black/10 rounded-full transition-all active:scale-95 duration-200 text-center"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <NavLink
                  to={PATHS.LOGIN}
                  onClick={closeMobileMenu}
                  className="font-label-sm text-label-sm px-4 py-2.5 rounded-full border border-black/10 bg-white/90 text-gray-900 hover:bg-white transition-all active:scale-95 duration-200 text-center text-[12px]"
                >
                  Login
                </NavLink>
                <NavLink
                  to={PATHS.SIGNUP}
                  onClick={closeMobileMenu}
                  className="font-label-sm text-label-sm px-4 py-2.5 bg-black text-white rounded-full hover:bg-gray-900 hover:shadow-lg hover:shadow-black/10 transition-all active:scale-95 duration-200 text-center text-[12px]"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
