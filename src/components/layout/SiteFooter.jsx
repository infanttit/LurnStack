import { Link } from "react-router-dom";
import { FiGlobe, FiMail, FiTwitter, FiLinkedin, FiYoutube } from "react-icons/fi";

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-xs text-white/50 hover:text-white transition-colors duration-200"
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
      className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all duration-200"
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
    heading: "Categories",
    links: [
      { label: "Development", to: "/categories/development" },
      { label: "AI & Machine Learning", to: "/categories/ai-ml" },
      { label: "Design", to: "/categories/design" },
      { label: "Business", to: "/categories/business" },
      { label: "Marketing", to: "/categories/marketing" },
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
      { label: "Terms of Use", to: "/terms" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-primary text-on-primary">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-4 space-y-5">
            {/* Logo */}
            <div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Lurn<span className="text-secondary-fixed">Stack</span>
              </span>
              <p className="mt-3 text-[13px] text-white/45 leading-relaxed max-w-xs">
                Industry-aligned courses, expert mentors, and verified certificates to power your next career leap.
              </p>
            </div>

            {/* Rating badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-[11px] font-bold text-white">4.9</span>
              <span className="text-[11px] text-white/40">· 50,000+ students</span>
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
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                Weekly learning digest
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-white/8 border border-white/12 rounded-lg px-3 py-2 text-[12px] text-white placeholder-white/30 focus:outline-none focus:border-secondary-fixed/60 transition-colors"
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-secondary-fixed text-primary rounded-lg text-[12px] font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
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
                <h5 className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
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
        <div className="border-t border-white/8" />

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-white/25">
            © {new Date().getFullYear()} LurnStack Academy. All rights reserved.
          </p>

          <div className="flex items-center gap-1 text-[11px] text-white/25">
            <FiGlobe className="text-[12px]" />
            <span>English</span>
            <span className="mx-3 opacity-40">·</span>
            <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
            <span className="mx-3 opacity-40">·</span>
            <Link to="/cookies" className="hover:text-white/50 transition-colors">Cookies</Link>
            <span className="mx-3 opacity-40">·</span>
            <Link to="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
