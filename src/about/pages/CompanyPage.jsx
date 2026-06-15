import React from "react";
import { HiOutlineAcademicCap, HiOutlineBuildingOffice2, HiOutlineSparkles, HiOutlineRocketLaunch } from "react-icons/hi2";
import { useSEO } from "../../shared/hooks/useSEO";

export default function CompanyPage() {
  useSEO({
    title: "About Us — LurnStack Company",
    description: "Learn about LurnStack's mission, vision, values, and our journey as an EdTech company empowering engineers and developers worldwide.",
    keywords: "LurnStack, about us, EdTech, software training, company, mission, vision",
    canonical: "/about/company",
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
            LurnStack Company
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium text-emerald-100/70 leading-relaxed animate-learning-header-body">
            Empowering engineers and developers globally through live, hands-on technical masterclasses and direct trainer-led mentorship.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div className="space-y-10">
          {/* ── Company Section ── */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm transition-all hover:shadow-md duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#004d3d]">
                <HiOutlineBuildingOffice2 className="text-xl" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Our Company Profile</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm font-medium leading-relaxed text-slate-600">
              <p>
                LurnStack is a forward-thinking education technology company focused on delivering live, hands-on, trainer-led technical masterclasses. We bridge the gap between abstract academic concepts and the demands of modern cloud production networks.
              </p>
              <p>
                By hosting live classes on centralized virtual private servers and orchestrating real-time student check-ins, we offer a robust environment where learners code alongside trainers in sandbox playgrounds. Our curriculum covers web dev, database management, and UI/UX design.
              </p>
              <p>
                Founded on the values of absolute transparency, community mentoring, and practical training, LurnStack continues to serve over 50,000 students globally, supporting their career growth from foundations to expert deployments.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
              {[
                { title: "Our Mission", text: "To make industrial skills accessible to learners worldwide.", icon: HiOutlineSparkles },
                { title: "Our Vision", text: "A connected community of developers training developers.", icon: HiOutlineRocketLaunch },
                { title: "Our Core", text: "Absolute hands-on masterclasses over text modules.", icon: HiOutlineAcademicCap }
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                    <item.icon className="text-[16px]" />
                  </div>
                  <h3 className="mt-3 text-sm font-black text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">{item.text}</p>
                </div>
              ))}
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
