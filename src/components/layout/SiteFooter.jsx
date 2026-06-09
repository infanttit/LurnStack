import { Link } from "react-router-dom";
import { FiGlobe, FiMail, FiTwitter, FiLinkedin, FiYoutube } from "react-icons/fi";
import logo from "../../assets/Logo/Logo4.png";

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-gray-600 hover:text-gray-950 transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

function SocialBtn({ to, label, children }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-[#004d3d] hover:border-[#004d3d]/30 hover:bg-emerald-50 transition-all duration-200"
    >
      {children}
    </Link>
  );
}

const NAV = [
  {
    heading: "Platform",
    links: [
      { label: "All Courses", to: "/courses" },
      { label: "Certificates", to: "/certificates" },
      { label: "Learning Paths", to: "/paths" },
      { label: "For Teams", to: "/plans" },
      { label: "Mobile App", to: "/app" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Partners", to: "/partners" },
      { label: "Blog", to: "/blog" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "Community", to: "/community" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms and Conditions", to: "/terms" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="max-w-full overflow-hidden border-t border-gray-200/80 bg-[#fbfcfd] text-gray-950 shadow-[0_-12px_36px_rgba(15,23,42,0.06)]">
      {/* Top section */}
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-4 space-y-5">
            {/* Logo */}
            <div>
              <div className="inline-flex items-center">
                <img
                  src={logo}
                  alt="LurnStack"
                  className="h-20 w-auto object-contain"
                  loading="lazy"
                />
                <span className="sr-only">LurnStack</span>
              </div>
              <p className="mt-3 max-w-xs break-words text-sm leading-relaxed text-gray-600">
                Industry-aligned courses, expert mentors, and verified certificates to power your next career leap.
              </p>
            </div>

            {/* Rating badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-xs font-bold text-gray-950">4.9</span>
              <span className="text-xs text-gray-600">&middot; 50,000+ students</span>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              <SocialBtn to="/" label="Twitter / X">
                <FiTwitter className="text-[14px]" />
              </SocialBtn>
              <SocialBtn to="/" label="LinkedIn">
                <FiLinkedin className="text-[14px]" />
              </SocialBtn>
              <SocialBtn to="/" label="YouTube">
                <FiYoutube className="text-[14px]" />
              </SocialBtn>
              <SocialBtn to="/" label="Email">
                <FiMail className="text-[14px]" />
              </SocialBtn>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold text-gray-950 uppercase tracking-wider mb-2">
                Weekly learning digest
              </p>
              <div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-[1fr_auto]">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="min-w-0 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none focus:border-[#004d3d] focus:ring-4 focus:ring-emerald-900/10 transition-colors"
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-[#004d3d] text-white rounded-lg text-sm font-bold hover:bg-[#003d31] transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {NAV.map((col) => (
              <div key={col.heading} className="space-y-3">
                <h5 className="text-xs font-bold text-gray-950 uppercase tracking-widest">
                  {col.heading}
                </h5>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <FooterLink to={l.to}>{l.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} LurnStack. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-gray-500 sm:justify-end">
            <FiGlobe className="text-[12px]" />
            <span>English</span>
            <span className="mx-3">&middot;</span>
            <Link to="/privacy" className="hover:text-gray-950 transition-colors">Privacy Policy</Link>
            <span className="mx-3">&middot;</span>
            <Link to="/cookies" className="hover:text-gray-950 transition-colors">Cookies</Link>
            <span className="mx-3">&middot;</span>
            <Link to="/terms" className="hover:text-gray-950 transition-colors">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

