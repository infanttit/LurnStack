import { NavLink } from "react-router-dom";

export default function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "font-label-sm text-label-sm relative transition-colors duration-200",
          isActive
            ? "text-primary after:content-[''] after:absolute after:bottom-[-22px] after:left-0 after:w-full after:h-[3px] after:bg-secondary-fixed"
            : "text-on-surface-variant hover:text-primary",
        ].join(" ")
      }
      end
    >
      {children}
    </NavLink>
  );
}

