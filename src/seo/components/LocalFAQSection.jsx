import { useState } from "react";

const FAQ_DATA = [
  {
    question: "Why choose LurnStack's live developer training over traditional computer classes in Chennai?",
    answer: "LurnStack offers interactive, live trainer-led online masterclasses hosted directly by senior software engineers. Instead of wasting hours commuting to local software coaching centers in Chennai, you receive real-time professional mentorship, live project-based coding practice, and dedicated job placement assistance from the comfort of your home."
  },
  {
    question: "Are these software courses suitable for freshers in Chennai?",
    answer: "Absolutely. Our programs are structured starting from absolute fundamentals up to professional deployment. Freshers and career-switchers from any academic background in Chennai can learn programming and build portfolio-ready products."
  },
  {
    question: "Do you offer placement support within Chennai's IT parks?",
    answer: "Yes. LurnStack provides comprehensive placement assistance, including portfolio reviews, mock technical interviews, and resume optimizing. We connect qualified students with leading IT firms and startups located in Chennai IT hubs like Guindy, DLF Cybercity, and OMR."
  },
  {
    question: "What certification will I receive upon completing the course?",
    answer: "Upon completing the syllabus and clearing the attendance threshold, you will receive a verified digital certificate stored securely and shareable on LinkedIn, which is widely recognized by technology recruiters in India."
  }
];

export default function LocalFAQSection({ activeLocation = "Chennai", keywordName = "Software Courses" }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getPluralForm = (keyword) => {
    const kw = keyword.toLowerCase();
    if (kw.endsWith("courses") || kw.endsWith("classes")) return keyword;
    if (kw.endsWith("course")) return keyword + "s";
    if (kw.endsWith("class")) return keyword + "es";
    if (kw.endsWith("center")) return keyword + "s";
    if (kw.endsWith("training")) return keyword + " courses";
    return keyword + " courses";
  };

  const getLocalizedText = (text) => {
    if (!text) return "";
    let localized = text;

    if (activeLocation && activeLocation !== "Chennai") {
      localized = localized.replace(/Chennai/g, activeLocation);
    }

    if (keywordName) {
      const pluralKeyword = getPluralForm(keywordName);
      const singularKeyword = keywordName;

      localized = localized
        .replace(/software courses/gi, pluralKeyword)
        .replace(/software course/gi, singularKeyword)
        .replace(/computer classes/gi, pluralKeyword)
        .replace(/software coaching/gi, `${singularKeyword} coaching`);
    }

    return localized;
  };

  return (
    <section className="py-16 bg-surface-container-low text-on-surface">
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant max-w-xl mx-auto">
            Everything you need to know about our software courses, placement opportunities, and live training model.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden bg-white rounded-2xl border border-gray-200/80 transition-all duration-300 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex items-center justify-between w-full p-5 text-left font-bold text-sm md:text-base text-primary hover:bg-gray-50/80 transition-colors"
                >
                  <span>{getLocalizedText(item.question)}</span>
                  <span
                    className={`ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary-fixed text-primary transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="h-4.5 w-4.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[300px] border-t border-gray-100" : "max-h-0"
                  }`}
                >
                  <div className="p-5 text-sm leading-relaxed text-gray-700">
                    <p>{getLocalizedText(item.answer)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
