import { useSEO } from "../shared/hooks/useSEO";

const sections = [
  {
    title: "1. What Are Cookies?",
    body: [
      "Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.",
      "In addition to cookies, we may use other local storage technologies, such as browser LocalStorage and SessionStorage, which perform a similar function to cookies but can store more data locally.",
    ],
  },
  {
    title: "2. How We Use Cookies",
    body: [
      "We use cookies and similar technologies for several reasons: to authenticate users and keep you securely logged in, to remember your shopping cart items, to save your interface preferences, to analyze how our website is used so we can improve it, and to support customer communication and help tools.",
    ],
  },
  {
    title: "3. Types of Cookies We Use",
    body: [
      "Essential Cookies: These cookies are strictly necessary to provide you with services available through our platform and to use some of its features, such as accessing secure areas, authentication, and preserving your course cart items.",
      "Performance and Analytics Cookies: These cookies collect information that is used in aggregate form to help us understand how our platform is being used, the effectiveness of our marketing campaigns, or to help us customize our site for you.",
      "Functionality Cookies: These are used to recognize you when you return to our website. This enables us to personalize our content for you, greet you by name, and remember your preferences.",
    ],
  },
  {
    title: "4. Third-Party Cookies",
    body: [
      "In addition to our first-party cookies, trusted third-party services integrated into LurnStack may also set cookies on your device. These include payment gateways like Razorpay to securely process your transactions, and live support platforms like Zoho SalesIQ to offer interactive chat and customer assistance.",
    ],
  },
  {
    title: "5. Managing and Controlling Cookies",
    body: [
      "You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted (for example, staying logged in).",
      "Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org.",
    ],
  },
  {
    title: "6. Changes to This Cookie Policy",
    body: [
      "We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.",
    ],
  },
  {
    title: "7. Contact Us",
    body: [
      "If you have any questions about our use of cookies or other technologies, please email us at lurnstack@gmail.com.",
    ],
  },
];

export default function CookiePolicyPage() {
  useSEO({
    title: "Cookie Policy",
    description: "Read LurnStack's cookie policy to understand how we use cookies and browser storage to power your learning experience.",
    keywords: "LurnStack cookie policy, cookies, browser storage, local storage",
    canonical: "/cookies",
  });

  return (
    <main className="bg-background">
      <section className="max-w-4xl mx-auto px-margin-mobile sm:px-margin-desktop py-14 sm:py-20">
        <div className="rounded-2xl bg-surface p-6 sm:p-10 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            LurnStack
          </p>
          <h1 className="mt-3 font-h2 text-h2 text-on-surface">
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm font-semibold text-on-surface-variant">
            Effective Date: June 3, 2026
          </p>
          <p className="mt-6 font-body-md text-body-md leading-7 text-on-surface-variant">
            LurnStack values your privacy and transparency. This Cookie Policy explains how and why we
            use cookies, local storage, and similar technologies when you visit our website, enroll in
            our courses, and access your student dashboard.
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
