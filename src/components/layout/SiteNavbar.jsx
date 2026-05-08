import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import NavItem from "./navbar/NavItem";
import NavbarSearch from "./navbar/NavbarSearch";
import { useCart } from "../../cart";

export default function SiteNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { itemCount } = useCart();

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
    navigate(`/search?q=${encodeURIComponent(q)}`);
    closeMobileMenu();
  };

  return (
    <>
      <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant shadow-sm">
        <nav className="px-margin-desktop py-5 max-w-container-max mx-auto">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6">
            {/* Left: brand + primary nav */}
            <div className="flex items-center gap-12 min-w-0">
              <NavLink
                to="/"
                className="font-h3 text-h3 font-extrabold text-primary tracking-tight"
                onClick={closeMobileMenu}
              >
                LurnStack
              </NavLink>
              <div className="hidden md:flex items-center gap-8">
                <NavItem to="/courses">Courses</NavItem>
                <NavItem to="/categories">Categories</NavItem>
                <NavItem to="/plans">Plans</NavItem>
              </div>
            </div>

            {/* Center: search */}
            <div className="hidden md:flex justify-center min-w-0">
              <NavbarSearch
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSubmit={submitSearch}
                placeholder="Search courses, skills, instructors..."
                className="w-full max-w-[520px]"
              />
            </div>

            {/* Right: cart + auth + mobile toggle */}
            <div className="flex items-center justify-end gap-4">
              <NavLink
                to="/cart"
                className="w-11 h-11 rounded-full border border-outline-variant bg-surface-container-low hover:bg-surface-container-low/70 transition-colors flex items-center justify-center text-on-surface-variant hover:text-primary"
                aria-label="Cart"
              >
                <span id="cart-icon" className="relative inline-flex items-center justify-center">
                  <HiOutlineShoppingBag className="text-[20px]" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center shadow-md">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </span>
              </NavLink>

              <div className="hidden sm:flex items-center gap-4">
                <NavLink
                  to="/login"
                  className="font-label-sm text-label-sm px-6 py-2 text-primary hover:bg-surface-container-low rounded-full transition-all active:scale-95 duration-200"
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="font-label-sm text-label-sm px-8 py-3 bg-primary text-on-primary rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 duration-200"
                >
                  Sign Up
                </NavLink>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                aria-label="Toggle menu"
              >
                <span
                  className={`block w-6 h-0.5 bg-on-surface-variant transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-on-surface-variant transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-on-surface-variant transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu dropdown */}
      <div
        className={`md:hidden fixed top-[73px] left-0 right-0 bg-surface/95 backdrop-blur-md border-b border-outline-variant shadow-lg z-40 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-margin-desktop py-6 gap-4">
          <NavbarSearch
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={submitSearch}
            placeholder="Search courses..."
            className="sm:hidden"
          />
          <NavItem to="/courses" onClick={closeMobileMenu}>
            Courses
          </NavItem>
          <NavItem to="/categories" onClick={closeMobileMenu}>
            Categories
          </NavItem>
          <NavItem to="/plans" onClick={closeMobileMenu}>
            Plans
          </NavItem>
          <div className="flex flex-col gap-3 pt-2 border-t border-outline-variant">
            <NavLink
              to="/cart"
              onClick={closeMobileMenu}
              className="font-label-sm text-label-sm px-6 py-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all active:scale-95 duration-200 text-center"
            >
              Cart{itemCount > 0 ? ` (${itemCount > 99 ? "99+" : itemCount})` : ""}
            </NavLink>
            <NavLink
              to="/login"
              onClick={closeMobileMenu}
              className="font-label-sm text-label-sm px-6 py-2 text-primary hover:bg-surface-container-low rounded-full transition-all active:scale-95 duration-200 text-center"
            >
              Log In
            </NavLink>
            <NavLink
              to="/signup"
              onClick={closeMobileMenu}
              className="font-label-sm text-label-sm px-8 py-3 bg-primary text-on-primary rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 duration-200 text-center"
            >
              Sign Up
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}
