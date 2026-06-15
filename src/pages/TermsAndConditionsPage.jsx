import { useSEO } from "../shared/hooks/useSEO";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By accessing or using LurnStack, you agree to these Terms and Conditions. If you do not agree, please do not use the website, courses, live classes, dashboard, payment features, or related services.",
    ],
  },
  {
    title: "2. LurnStack Services",
    body: [
      "LurnStack provides online learning services, including courses, live sessions, student dashboards, attendance tracking, course discovery, payment-supported access, and related learner support.",
      "We may update, improve, pause, or remove features when needed to maintain or improve the platform.",
    ],
  },
  {
    title: "3. Account Responsibilities",
    body: [
      "You are responsible for providing accurate account information and keeping your login credentials secure.",
      "You must not share your account access, misuse another user's account, or use LurnStack for unlawful, harmful, or abusive activity.",
    ],
  },
  {
    title: "4. Courses, Live Classes, and Attendance",
    body: [
      "Course and live class availability, schedules, trainers, content, meeting links, and learning materials may vary based on platform operations and trainer availability.",
      "Attendance and session activity may be recorded to support learning progress, trainer reports, student records, and administrative review.",
    ],
  },
  {
    title: "5. Payments and Access",
    body: [
      "Paid courses or sessions may require successful payment before access is granted. LurnStack may use trusted payment providers such as Razorpay to process transactions.",
      "Access to paid learning content may be limited to the account that completed the purchase and may be subject to course-specific availability or schedule rules.",
    ],
  },
  {
    title: "6. Refunds and Cancellations",
    body: [
      "Refund or cancellation eligibility may depend on the course, session type, payment status, attendance, timing of the request, and applicable platform policy.",
      "For payment or access issues, contact LurnStack support with your registered email address and transaction details.",
    ],
  },
  {
    title: "7. Content Ownership and Use",
    body: [
      "LurnStack content, branding, course materials, website design, text, images, videos, and platform features are owned by LurnStack or its licensors unless otherwise stated.",
      "You may use learning materials only for your personal learning. You must not copy, resell, redistribute, record, upload, or commercially exploit LurnStack content without written permission.",
    ],
  },
  {
    title: "8. User Conduct",
    body: [
      "You agree not to disrupt classes, upload harmful content, attempt unauthorized access, interfere with platform security, misuse payment systems, or harass trainers, learners, or support staff.",
      "LurnStack may restrict, suspend, or terminate access if an account violates these terms or creates risk for the platform or other users.",
    ],
  },
  {
    title: "9. Privacy",
    body: [
      "Use of LurnStack is also governed by our Privacy Policy, which explains how we collect, use, store, and protect personal information connected to your account and learning activity.",
    ],
  },
  {
    title: "10. Contact",
    body: [
      "For questions about these Terms and Conditions, contact LurnStack at lurnstack@gmail.com or visit https://lurnstack.com.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  useSEO({
    title: "Terms and Conditions",
    description: "Review LurnStack's terms of service for using our website, courses, live classes, payments, and learning platform.",
    keywords: "LurnStack terms and conditions, terms of service, user agreement",
    canonical: "/terms-and-conditions",
  });

  return (
    <main className="bg-background">
      <section className="max-w-4xl mx-auto px-margin-mobile sm:px-margin-desktop py-14 sm:py-20">
        <div className="rounded-2xl bg-surface p-6 sm:p-10 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            LurnStack
          </p>
          <h1 className="mt-3 font-h2 text-h2 text-on-surface">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm font-semibold text-on-surface-variant">
            Effective Date: June 3, 2026
          </p>
          <p className="mt-6 font-body-md text-body-md leading-7 text-on-surface-variant">
            These Terms and Conditions explain the rules for using LurnStack's
            website, online courses, live classes, student dashboard, payments,
            attendance features, and related learning services.
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-extrabold text-on-surface">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="font-body-md text-body-md leading-7 text-on-surface-variant"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
