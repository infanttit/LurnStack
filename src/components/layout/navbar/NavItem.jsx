import { NavLink } from "react-router-dom";

export default function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "font-label-sm text-label-sm relative transition-colors duration-200 whitespace-nowrap",
          isActive
            ? "text-white font-semibold"
            : "text-white/80 hover:text-white",
        ].join(" ")
      }
      end
    >
      {children}
    </NavLink>
  );
}
