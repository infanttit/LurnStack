import { HiMagnifyingGlass } from "react-icons/hi2";

export default function NavbarSearch({
  value,
  onChange,
  onSubmit,
  placeholder,
  className = "",
}) {
  return (
    <form onSubmit={onSubmit} className={className} role="search">
      <div className="relative w-full">
        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-11 rounded-full bg-gray-50 border border-gray-200 pl-11 pr-4 text-sm text-gray-950 outline-none placeholder:text-gray-400 focus:border-[#004d3d] focus:bg-white focus:ring-4 focus:ring-emerald-900/10 transition-all"
        />
      </div>
    </form>
  );
}
