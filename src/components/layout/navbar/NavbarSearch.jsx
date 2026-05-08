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
        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-lg" />
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-11 rounded-full bg-surface-container-low border border-outline-variant pl-11 pr-4 text-sm text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
        />
      </div>
    </form>
  );
}

