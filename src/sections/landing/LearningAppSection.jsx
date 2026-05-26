import { FiBookOpen, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";
import appImage from "../../assets/Images/categories/Categories1.jpeg";

const TAGS = [
  "Programming",
  "Live Classes",
  "Database",
  "Full Stack",
  "Cloud Computing",
  "Digital Marketing",
  "Python",
  "Career Growth",
];

function PhoneMockup({ title, icon: Icon, className = "" }) {
  return (
    <div className={["absolute h-64 w-32 rounded-[28px] border-[6px] border-slate-950 bg-slate-950 shadow-2xl", className].join(" ")}>
      <div className="h-full overflow-hidden rounded-[20px] bg-white">
        <div className="bg-[#132334] px-3 pb-4 pt-7 text-white">
          <div className="mx-auto mb-4 h-4 w-14 rounded-full bg-black/35" />
          <p className="text-[10px] font-semibold text-white/60">LurnStack</p>
          <h4 className="mt-1 text-sm font-black leading-tight">{title}</h4>
        </div>
        <div className="space-y-2 p-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-xl bg-slate-100 p-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Icon className="text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="h-2 rounded bg-slate-300" />
                  <div className="mt-1 h-2 w-2/3 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LearningAppSection() {
  return (
    <section className="bg-[#f7f7f5] px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#142334] text-white"
      >
        <div className="grid gap-8 px-5 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_1.05fr] lg:px-14 lg:py-16">
          <div className="relative min-h-[300px] overflow-hidden rounded-[28px] sm:min-h-[360px]">
            <div className="absolute inset-0 rounded-[28px] bg-white/5" />
            <img
              src={appImage}
              alt="Learners using LurnStack courses"
              className="absolute left-0 top-7 h-[220px] w-[88%] rounded-[24px] object-cover opacity-90 sm:top-8 sm:h-[280px] sm:w-[82%]"
              loading="lazy"
            />
            <div className="absolute inset-0 origin-top-left scale-[0.72] sm:scale-100">
              <PhoneMockup title="Sign in to your learning account" icon={FiCheckCircle} className="left-5 top-16 -rotate-12 sm:left-7" />
              <PhoneMockup title="Best courses that suit you" icon={FiBookOpen} className="left-[34%] top-5 rotate-6" />
              <PhoneMockup title="Track sessions and progress" icon={FiTrendingUp} className="left-[62%] top-24 rotate-12" />
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur sm:left-[48%] sm:right-auto sm:px-6">
              <span className="text-lg font-black">1.2M</span>
              <span className="ml-2 text-white/65">Learners trained</span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit rounded-full bg-white/10 px-5 py-2 text-[12px] font-black uppercase tracking-[0.34em] text-white">
              Enhance Your Career
            </div>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Boost your skillset with our online learning platform
            </h2>
            <div className="mt-5 h-2 max-w-[420px] rounded-full border-t-2 border-white/70" />
            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/65">
              Choose from practical course categories, join live trainer sessions, and build job-ready skills with guided learning from LurnStack mentors.
            </p>

            <div className="mt-8 h-px bg-white/10" />

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-white/10 px-3 py-3 text-center text-xs font-bold text-white shadow-sm sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
