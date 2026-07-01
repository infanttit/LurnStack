import { Link } from "react-router-dom";
import { FiGlobe, FiMail, FiTwitter, FiLinkedin, FiYoutube } from "react-icons/fi";
import logo from "../../assets/Logo/Logo4.png";
import { PATHS } from "../../app/router/paths";

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
      { label: "Courses", to: PATHS.COURSES },
      { label: "TIT class", to: PATHS.LIVE_CLASSES },
      { label: "My learning", to: PATHS.DASHBOARD },
      { label: "Paid session", to: `${PATHS.DASHBOARD}?view=paid` },
      { label: "Certificate", to: `${PATHS.DASHBOARD}?view=certifications` },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: PATHS.ABOUT_COMPANY },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "Privacy Policy", to: PATHS.PRIVACY },
      { label: "Terms and Conditions", to: PATHS.TERMS },
    ],
  },
  {
    heading: "Locations",
    links: [
      { label: "Software Courses in Chennai", to: PATHS.CHENNAI },
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
            &copy; {new Date().getFullYear()} Tamil Info Technology. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-gray-500 sm:justify-end">
            <FiGlobe className="text-[12px]" />
            <span>English</span>
            <span className="mx-3">&middot;</span>
            <Link to={PATHS.PRIVACY} className="hover:text-gray-950 transition-colors">Privacy Policy</Link>
            <span className="mx-3">&middot;</span>
            <Link to={PATHS.COOKIES} className="hover:text-gray-950 transition-colors">Cookies</Link>
            <span className="mx-3">&middot;</span>
            <Link to={PATHS.TERMS} className="hover:text-gray-950 transition-colors">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

