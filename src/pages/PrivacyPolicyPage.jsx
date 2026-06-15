import { useSEO } from "../shared/hooks/useSEO";

const sections = [
  {
    title: "1. Information We Collect",
    body: [
      "We may collect information such as your full name, email address, phone number, login details, course enrollment details, learning activity, live class attendance records, payment transaction status, device information, browser information, and support messages you send to us.",
      "We do not intentionally collect sensitive personal information unless it is required for a specific service and provided by you.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "We use your information to create and manage your account, provide access to courses and live sessions, track attendance and learning progress, process payments, verify transactions, send important class or account updates, improve the platform, provide support, prevent misuse, and comply with legal requirements.",
    ],
  },
  {
    title: "3. Payments",
    body: [
      "LurnStack may use trusted third-party payment providers such as Razorpay to process payments. We do not store your full card number, UPI PIN, CVV, or bank credentials on our platform.",
      "Payment providers may collect and process payment information according to their own privacy policies and security standards.",
    ],
  },
  {
    title: "4. Live Classes and Attendance",
    body: [
      "When you join live classes or learning sessions, we may collect attendance-related information such as joined time, last active time, join count, attendance status, and related session or course details.",
      "This information is used to maintain student learning records, trainer reports, progress tracking, and administrative attendance reports.",
    ],
  },
  {
    title: "5. Authentication and Account Security",
    body: [
      "LurnStack stores authentication information such as login session tokens in browser storage to keep you signed in. You are responsible for keeping your account credentials secure.",
      "If you suspect unauthorized access to your account, please contact us immediately.",
    ],
  },
  {
    title: "6. Cookies and Similar Technologies",
    body: [
      "We may use cookies, browser storage, analytics tools, or similar technologies to keep users logged in, remember cart and session preferences, improve website functionality, analyze platform usage, and support customer communication tools.",
      "You can control cookies through your browser settings, but disabling them may affect some platform features.",
    ],
  },
  {
    title: "7. Third-Party Services",
    body: [
      "LurnStack may use third-party services for payment processing, live class or meeting access, customer chat and support, analytics, hosting, and infrastructure. These services may process limited information only as required to provide their services.",
    ],
  },
  {
    title: "8. Data Sharing",
    body: [
      "We do not sell your personal information.",
      "We may share information only when necessary with payment providers, trainers, admins, service providers who help operate the platform, legal authorities when required, or parties needed to protect LurnStack, users, or the public from fraud or harm.",
    ],
  },
  {
    title: "9. Data Storage and Protection",
    body: [
      "We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, misuse, alteration, or disclosure.",
      "However, no internet-based service is completely secure. Users should also use strong passwords and log out from shared devices.",
    ],
  },
  {
    title: "10. Data Retention",
    body: [
      "We keep your information for as long as necessary to provide our services, maintain account and course records, support attendance and payment history, resolve disputes, and meet legal or business requirements.",
      "When information is no longer required, we may delete, anonymize, or securely archive it.",
    ],
  },
  {
    title: "11. Your Rights",
    body: [
      "Depending on applicable law, you may request to access your personal information, correct inaccurate information, delete your account or personal data, withdraw consent where applicable, or ask questions about how your data is used.",
      "Some information may need to be retained for legal, payment, fraud-prevention, or academic record purposes.",
    ],
  },
  {
    title: "12. Children's Privacy",
    body: [
      "LurnStack is intended for learners who can lawfully use online education services. If a minor uses LurnStack, they should do so with permission from a parent or guardian.",
      "We do not knowingly collect personal information from children without appropriate consent.",
    ],
  },
  {
    title: "13. Changes to This Privacy Policy",
    body: [
      "We may update this Privacy Policy from time to time. Updated versions will be posted on this page with a revised effective date.",
      "Your continued use of LurnStack after changes are posted means you accept the updated Privacy Policy.",
    ],
  },
  {
    title: "14. Contact Us",
    body: [
      "If you have questions about this Privacy Policy or your personal information, please contact us at lurnstack@gmail.com or visit https://lurnstack.com.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  useSEO({
    title: "Privacy Policy",
    description: "Read LurnStack's privacy policy to understand how we collect, use, store, and protect your personal data.",
    keywords: "LurnStack privacy policy, data protection, personal information",
    canonical: "/privacy-policy",
  });

  return (
    <main className="bg-background">
      <section className="max-w-4xl mx-auto px-margin-mobile sm:px-margin-desktop py-14 sm:py-20">
        <div className="rounded-2xl bg-surface p-6 sm:p-10 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            LurnStack
          </p>
          <h1 className="mt-3 font-h2 text-h2 text-on-surface">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm font-semibold text-on-surface-variant">
            Effective Date: June 3, 2026
          </p>
          <p className="mt-6 font-body-md text-body-md leading-7 text-on-surface-variant">
            LurnStack values your privacy. This Privacy Policy explains how we
            collect, use, store, and protect your personal information when you
            use our website, courses, live classes, dashboard, payment features,
            and related services.
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
