import { useState, useEffect, useRef } from "react";
import { useSEO } from "../shared/hooks/useSEO";
import {
  FiSearch,
  FiChevronDown,
  FiMessageSquare,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiVideo,
  FiAward,
  FiCreditCard,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";

const HELP_CATEGORIES = [
  {
    id: "general",
    title: "General FAQ",
    icon: FiBookOpen,
    faqs: [
      {
        q: "What is LurnStack?",
        a: "LurnStack is an industry-aligned learning platform offering professional trainer-led courses, live virtual sessions, interactive workshops, and certificates to help you master new software skills.",
      },
      {
        q: "How do I enroll in a course?",
        a: "Browse the 'Courses' page, choose your preferred course, click 'Add to Cart', and complete checkout. Once processed, the course will immediately appear in your 'My Learning' dashboard.",
      },
      {
        q: "Can I access course materials on mobile?",
        a: "Yes! LurnStack is fully responsive. You can log into your account and access dashboard sessions, attendance reports, and certificates on any desktop, tablet, or mobile browser.",
      },
    ],
  },
  {
    id: "live-classes",
    title: "Live Classes",
    icon: FiVideo,
    faqs: [
      {
        q: "How do I join my scheduled live class?",
        a: "Log in, open your 'My Learning' dashboard, select the 'Upcoming' tab, and click the 'Join' button. Join buttons activate automatically 5 minutes before your class is scheduled to begin.",
      },
      {
        q: "What if I miss a live class session?",
        a: "All completed live sessions are cataloged under your 'My Learning' dashboard. You can review class notes, attendance records, and trainer instructions in the details section of the course.",
      },
      {
        q: "Are the live session times adjustable?",
        a: "Scheduled live class timings are fixed by the trainer and admin. They are displayed in Indian Standard Time (IST). Please check your class schedule under the 'TIT class' or 'My Learning' page.",
      },
    ],
  },
  {
    id: "certificates",
    title: "Certificates",
    icon: FiAward,
    faqs: [
      {
        q: "How do I unlock my course certificate?",
        a: "You must complete the course lectures and maintain regular attendance. For free sessions, attending the full duration of the class unlocks the option to generate your verified certificate.",
      },
      {
        q: "Why does my certificate show a 'Buy' option?",
        a: "Paid courses require a certificate registration fee or package purchase before you can generate the PDF. Free classes can be generated immediately without payment once your attendance criteria is met.",
      },
      {
        q: "How can employers verify my LurnStack certificate?",
        a: "Every certificate contains a unique QR code. Employers can scan this QR code or visit our verification page at lurnstack.com/verify to view the secure completion records stored in our database.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Billing",
    icon: FiCreditCard,
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We process payments securely through Razorpay, accepting all major credit/debit cards, UPI apps, Net Banking, and digital wallets.",
      },
      {
        q: "Is my payment information stored on LurnStack?",
        a: "No. All transactions are handled directly by Razorpay's PCI-DSS compliant secure servers. LurnStack never stores UPI PINs, CVVs, or card credentials on our platform.",
      },
      {
        q: "Can I get a refund for a paid course?",
        a: "Please refer to our Refund Policy or contact our support team at lurnstack@gmail.com with your transaction ID for assistance regarding refund eligibility.",
      },
    ],
  },
  {
    id: "security",
    title: "Account Security",
    icon: FiShield,
    faqs: [
      {
        q: "How do I reset my account password?",
        a: "Go to the Login page, click 'Forgot Password', enter your registered email address, and follow the link sent to your inbox to securely set a new password.",
      },
      {
        q: "Can I share my LurnStack account?",
        a: "Accounts are personal and non-transferable. Sharing credentials may trigger security flags or suspend access, as attendance tracking is linked specifically to your unique user account.",
      },
    ],
  },
];

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");
  const [expandedFaq, setExpandedFaq] = useState({});
  const sectionRefs = useRef({});

  useSEO({
    title: "Help & Support Center",
    description: "Get immediate answers to your LurnStack questions about courses, joining live classes, certificates, and secure payments.",
    keywords: "LurnStack help center, student support, live class guide, certificate verification",
    canonical: "/help",
  });

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (const cat of HELP_CATEGORIES) {
        const element = sectionRefs.current[cat.id];
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          const elementTop = top + window.scrollY;
          const elementBottom = bottom + window.scrollY;

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveCategory(id);
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const toggleFaq = (catId, index) => {
    const key = `${catId}-${index}`;
    setExpandedFaq((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openAiChat = () => {
    window.dispatchEvent(new CustomEvent("lurnstack:open-ai-chat"));
  };

  // Filter FAQs based on search query
  const getFilteredFaqs = () => {
    if (!searchQuery.trim()) return HELP_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return HELP_CATEGORIES.map((cat) => {
      const matchingFaqs = cat.faqs.filter(
        (faq) =>
          faq.q.toLowerCase().includes(query) ||
          faq.a.toLowerCase().includes(query)
      );
      return {
        ...cat,
        faqs: matchingFaqs,
      };
    }).filter((cat) => cat.faqs.length > 0);
  };

  const filteredData = getFilteredFaqs();

  return (
    <main className="bg-slate-50 min-h-screen pb-20">
      {/* Search Header Banner */}
      <section className="bg-[#004d3d] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(84,212,16,0.15),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-margin-mobile sm:px-margin-desktop text-center relative z-10">
          <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#54d410]">
            Help & Support Center
          </p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
            How can we help you today?
          </h1>
          <p className="mt-4 text-sm sm:text-base text-emerald-100 max-w-xl mx-auto font-medium">
            Search our knowledge base for instant guides, or navigate categories to find answers.
          </p>

          {/* Live Search Input */}
          <div className="mt-8 max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#004d3d] transition-colors">
              <FiSearch className="text-xl" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, questions, certificates, payments..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-0 text-slate-900 placeholder:text-slate-400 shadow-lg outline-none focus:ring-4 focus:ring-[#54d410]/20 transition-all font-semibold"
            />
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="max-w-6xl mx-auto px-margin-mobile sm:px-margin-desktop mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
          
          {/* Sticky Sidebar Navigation (Desktop only) */}
          <aside className="hidden lg:block sticky top-28 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-3 mb-4">
              Categories
            </h3>
            <nav className="space-y-1">
              {HELP_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => scrollToSection(cat.id)}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all duration-200",
                      active
                        ? "bg-[#004d3d] text-[#54d410] shadow-sm shadow-[#004d3d]/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")}
                  >
                    <IconComponent className={`text-base ${active ? "text-[#54d410]" : "text-slate-400"}`} />
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* FAQs Content List */}
          <div className="space-y-8 flex-1">
            {filteredData.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
                <h3 className="text-lg font-black text-slate-950">No search results found</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto font-medium">
                  We couldn't find any questions matching "{searchQuery}". Try searching other keywords or contact support.
                </p>
              </div>
            ) : (
              filteredData.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <section
                    key={cat.id}
                    ref={(el) => (sectionRefs.current[cat.id] = el)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm scroll-mt-28 transition-all"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#004d3d] grid place-items-center">
                        <IconComponent className="text-lg" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        {cat.title}
                      </h2>
                    </div>

                    {/* Accordion List */}
                    <div className="space-y-3">
                      {cat.faqs.map((faq, idx) => {
                        const isExpanded = expandedFaq[`${cat.id}-${idx}`];
                        return (
                          <div
                            key={idx}
                            className="border border-slate-100 rounded-xl overflow-hidden bg-white hover:border-slate-200 transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => toggleFaq(cat.id, idx)}
                              className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-extrabold text-slate-800 hover:text-slate-950 transition-colors outline-none"
                            >
                              <span>{faq.q}</span>
                              <FiChevronDown
                                className={[
                                  "text-slate-400 shrink-0 text-base transition-transform duration-300",
                                  isExpanded ? "rotate-180 text-[#004d3d]" : "",
                                ].join(" ")}
                              />
                            </button>
                            <div
                              className={[
                                "transition-all duration-300 ease-in-out overflow-hidden border-t border-slate-50",
                                isExpanded ? "max-h-[300px] bg-slate-50/50" : "max-h-0",
                              ].join(" ")}
                            >
                              <p className="p-4 text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                                {faq.a}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}

            {/* Direct Contact / Support Section */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-2xl font-black text-slate-950">
                Still need help?
              </h2>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600">
                If you didn't find the answers you were looking for, reach out to LurnStack support directly.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* AI Assistant Card */}
                <div className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-5 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between items-start">
                  <div>
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 text-[#004d3d] grid place-items-center mb-4">
                      <FiMessageSquare className="text-base" />
                    </div>
                    <h3 className="text-sm font-black text-slate-950">Chat with AI</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 font-semibold">
                      Ask LurnStack AI about courses, attendance, or resolve doubts instantly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openAiChat}
                    className="mt-4 text-xs font-black text-[#004d3d] inline-flex items-center gap-1 hover:underline"
                  >
                    Open AI Chat <FiArrowRight />
                  </button>
                </div>

                {/* Email Support Card */}
                <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-5 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between items-start">
                  <div>
                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 grid place-items-center mb-4">
                      <FiMail className="text-base" />
                    </div>
                    <h3 className="text-sm font-black text-slate-950">Email Support</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 font-semibold">
                      Send us your billing or certificate questions and we will respond within 24 hours.
                    </p>
                  </div>
                  <a
                    href="mailto:lurnstack@gmail.com"
                    className="mt-4 text-xs font-black text-[#004d3d] inline-flex items-center gap-1 hover:underline"
                  >
                    lurnstack@gmail.com <FiArrowRight />
                  </a>
                </div>

                {/* Call Support Card */}
                <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-5 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between items-start">
                  <div>
                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 grid place-items-center mb-4">
                      <FiPhone className="text-base" />
                    </div>
                    <h3 className="text-sm font-black text-slate-950">Call Support</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 font-semibold">
                      Talk directly to our operations team for help joining classes or courses.
                    </p>
                  </div>
                  <a
                    href="tel:+919566609360"
                    className="mt-4 text-xs font-black text-[#004d3d] inline-flex items-center gap-1 hover:underline"
                  >
                    +91 95666 09360 <FiArrowRight />
                  </a>
                </div>

              </div>
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}
