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
            ? "text-black font-extrabold"
            : "text-gray-900/75 hover:text-black",
        ].join(" ")
      }
      end
    >
      {children}
    </NavLink>
  );
}
