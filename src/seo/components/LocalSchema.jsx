import { useEffect } from "react";

/**
 * LocalSchema — dynamically injects JSON-LD Structured Data
 * for Chennai local business and courses.
 *
 * @param {object} props
 * @param {string} props.activeLocation
 * @param {string} props.urlSlug
 */
export default function LocalSchema({ 
  activeLocation = "Chennai", 
  urlSlug = "chennai", 
  matchedPrefix = "software-courses-in-", 
  keywordName = "Software Courses" 
}) {
  useEffect(() => {
    // 1. Define the Schema Graph structure
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "EducationalOrganization",
          "@id": "https://lurnstack.com/#organization",
          "name": `LurnStack - ${activeLocation}`,
          "url": `https://lurnstack.com/${matchedPrefix}${urlSlug}`,
          "logo": "https://lurnstack.com/assets/Logo/Logo4.png",
          "description": `Live, trainer-led ${keywordName.toLowerCase()} in ${activeLocation}. Learn coding, full stack development, Python, and React from industry professionals.`,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": activeLocation === "Chennai" ? "Rajiv Gandhi Salai, OMR Road, Guindy" : `${activeLocation}, Chennai`,
            "addressLocality": "Chennai",
            "addressRegion": "Tamil Nadu",
            "postalCode": "600032",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "13.0067",
            "longitude": "80.2206"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-9876543210",
            "contactType": "admissions",
            "areaServed": "IN",
            "availableLanguage": ["English", "Tamil"]
          },
          "sameAs": [
            "https://twitter.com/lurnstack",
            "https://linkedin.com/company/lurnstack",
            "https://youtube.com/lurnstack"
          ]
        },
        {
          "@type": "Course",
          "@id": `https://lurnstack.com/${matchedPrefix}${urlSlug}/#course-main`,
          "name": `${keywordName} in ${activeLocation}`,
          "description": `Master ${keywordName.toLowerCase()} using industry standard concepts with real-time mentorship and hands-on training in ${activeLocation}.`,
          "provider": {
            "@type": "EducationalOrganization",
            "name": "LurnStack",
            "sameAs": "https://lurnstack.com"
          },
          "offers": {
            "@type": "Offer",
            "category": "Paid",
            "priceCurrency": "INR",
            "price": "4999.00"
          },
          "educationalCredentialAwarded": `Verified ${keywordName} Certificate`
        }
      ]
    };

    // 2. Create the script element
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "local-seo-schema-jsonld";
    script.innerHTML = JSON.stringify(schemaData);

    // 3. Inject into the document head
    document.head.appendChild(script);

    // 4. Cleanup on component unmount or prop change
    return () => {
      const existingScript = document.getElementById("local-seo-schema-jsonld");
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [activeLocation, urlSlug, matchedPrefix, keywordName]);

  return null;
}
