import React from "react";
import { HiOutlineCodeBracket } from "react-icons/hi2";
import { useSEO } from "../../shared/hooks/useSEO";

export default function ProjectsPage() {
  useSEO({
    title: "Our Projects",
    description: "Explore LurnStack's in-house edtech systems: LMS, TIT Class Manager, AI Assistant, and the Attendance Heartbeat Logger.",
    keywords: "LurnStack projects, LMS, AI assistant, TIT class manager, attendance logger, EdTech software",
    canonical: "/about/projects",
  });

  return (
    <main className="min-h-screen bg-[#f4faff] pb-16">
      {/* ── Banner ── */}
      <section className="bg-[#00342b] text-white py-16 sm:py-20 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex rounded-full bg-emerald-950/40 text-emerald-300 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ring-1 ring-emerald-500/20">
            About LurnStack
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight leading-none animate-[learningTitleLetter_0.6s_ease-out]">
            Our Projects
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium text-emerald-100/70 leading-relaxed animate-learning-header-body">
            Discover the custom edtech software systems, virtual laboratories, and AI tools we build to power student success.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div className="space-y-10">
          {/* ── Projects Section ── */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm transition-all hover:shadow-md duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#004d3d]">
                <HiOutlineCodeBracket className="text-xl" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">In-House System Innovations</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm font-medium leading-relaxed text-slate-600">
              <p>
                Innovation is at the center of LurnStack. We build in-house systems to optimize learning operations, student attendance logs, and interactive learning support tools.
              </p>
              <p>
                Our core project developments include:
              </p>
              <ul className="space-y-3 pl-1 mt-2">
                {[
                  { name: "LurnStack LMS", desc: "A React single-page application integrating flexible carts, profiles, and dashboard systems." },
                  { name: "TIT Class Manager", desc: "A scheduling service matching student timezones with active Google Meet or Zoom URLs." },
                  { name: "LurnStack AI Assistant", desc: "A contextual, draggable LLM assistant resolving course doubt queues." },
                  { name: "Attendance Heartbeat Logger", desc: "A tracking script recording active class checkout times for students." }
                ].map((proj, idx) => (
                  <li key={idx} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 bg-slate-50/20">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[#004d3d] text-[10px] font-extrabold">
                      {idx + 1}
                    </span>
                    <div>
                      <strong className="text-slate-950 text-[13px] font-black">{proj.name}</strong>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5 leading-normal">{proj.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* ── Sidebar Stats ── */}
        <aside className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-black text-slate-950">Company Profile</h2>
          <div className="space-y-4 text-xs font-semibold text-slate-600">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Headquarters</div>
              <div className="mt-1 text-[13px] font-black text-slate-950">Chennai, Tamil Nadu, India</div>
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Industries</div>
              <div className="mt-1 text-[13px] font-black text-slate-950">EdTech, Software Training</div>
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Founded</div>
              <div className="mt-1 text-[13px] font-black text-slate-950">2024</div>
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Web Address</div>
              <div className="mt-1 text-[13px] font-black text-[#004d3d] hover:underline">
                <a href="https://lurnstack.com" target="_blank" rel="noopener noreferrer">lurnstack.com</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
