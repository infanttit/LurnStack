export default function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-primary">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary-fixed/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary-fixed/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">

          {/* Heading */}
          <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3">
            Accelerate Your Career with
            <span className="block text-secondary-fixed">Expert-Led Learning</span>
          </h2>

          {/* Subtext */}
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Gain job-ready skills through industry-aligned courses and verified certificates recognised by top employers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <button className="group inline-flex items-center gap-2 px-7 py-3 bg-secondary-fixed text-primary font-bold text-sm rounded-full hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-secondary-fixed/30">
              Start Free Trial — 7 Days
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/25 text-white/80 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all duration-300">
              Browse Courses
            </button>
          </div>

          {/* Trust line */}
          <p className="text-white/30 text-xs">
            No credit card required · Cancel anytime · Instant access
          </p>

        </div>
      </div>
    </section>
  );
}