const fs = require('fs');
const path = require('path');

const CHENNAI_REGIONS = [
  {
    id: "omr-ecr",
    label: "OMR & ECR Corridors",
    locations: [
      "OMR (Old Mahabalipuram Road)",
      "ECR (East Coast Road)",
      "Sholinganallur",
      "Navalur",
      "Siruseri",
      "Karapakkam",
      "Perungudi",
      "Taramani",
      "Semmenchery",
      "Injambakkam",
      "Neelankarai",
      "Palavakkam",
      "Kottivakkam",
      "Thoraipakkam"
    ]
  },
  {
    id: "central",
    label: "Central Chennai",
    locations: [
      "Anna Nagar",
      "T. Nagar",
      "Adyar",
      "Nungambakkam",
      "Mylapore",
      "Alwarpet",
      "Royapettah",
      "Mandaveli",
      "Besant Nagar",
      "Thiruvanmiyur",
      "Ashok Nagar",
      "Kodambakkam",
      "Vadapalani",
      "Kilpauk",
      "Chetpet",
      "Egmore",
      "Triplicane",
      "Saidapet",
      "West Mambalam",
      "Choolaimedu"
    ]
  },
  {
    id: "south",
    label: "South Chennai",
    locations: [
      "Velachery",
      "Guindy",
      "Tambaram",
      "Chromepet",
      "Pallavaram",
      "Medavakkam",
      "Urapakkam",
      "Guduvanchery"
    ]
  },
  {
    id: "west",
    label: "West Chennai",
    locations: [
      "Porur",
      "Ambattur",
      "Avadi",
      "Poonamallee",
      "Mogappair",
      "Iyyappanthangal",
      "Kattupakkam",
      "Valasaravakkam",
      "Virugambakkam",
      "KK Nagar",
      "Saligramam",
      "Ramapuram",
      "Manapakkam",
      "Nandambakkam"
    ]
  },
  {
    id: "north",
    label: "North Chennai",
    locations: [
      "Madhavaram",
      "Perambur",
      "Kolathur",
      "George Town",
      "Washermanpet",
      "Tondiarpet",
      "Ennore",
      "Red Hills",
      "Manali"
    ]
  }
];

const KEYWORD_PREFIXES = [
  "software-courses-in-",
  "full-stack-developer-course-in-",
  "python-class-in-",
  "ui-ux-design-course-in-",
  "react-js-training-in-",
  "live-online-coding-classes-",
  "full-stack-web-development-course-in-",
  "backend-developer-course-in-",
  "node-js-training-in-",
  "artificial-intelligence-live-class-in-",
  "online-learning-platform-in-",
  "learning-management-system-in-",
  "online-courses-in-",
  "e-learning-platform-in-",
  "professional-online-courses-in-",
  "self-paced-learning-in-",
  "skill-development-courses-in-",
  "online-certification-courses-in-",
  "career-development-courses-in-",
  "sql-online-course-in-",
  "python-online-course-in-",
  "azure-online-training-in-",
  "aws-online-training-in-",
  "devops-online-course-in-",
  "power-bi-online-course-in-",
  "data-analytics-course-in-",
  "cyber-security-course-in-",
  "cloud-computing-training-in-",
  "react-js-course-in-",
  "java-full-stack-course-in-",
  "oracle-pl-sql-training-in-",
  "ai-machine-learning-course-in-",
  "best-online-it-training-in-",
  "sql-training-in-",
  "python-training-in-",
  "azure-training-in-",
  "devops-training-in-",
  "chennai-online-learning-platform-"
];

const urls = [
  'https://lurnstack.com/',
  'https://lurnstack.com/courses',
  'https://lurnstack.com/software-courses-in-chennai',
];

CHENNAI_REGIONS.forEach(region => {
  region.locations.forEach(loc => {
    const slug = loc.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").replace(/^-+/, "");
    KEYWORD_PREFIXES.forEach(prefix => {
      urls.push(`https://lurnstack.com/${prefix}${slug}`);
    });
  });
});

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === 'https://lurnstack.com/' ? '1.0' : (url.includes('courses') && !url.includes('-in-') ? '0.8' : '0.6')}</priority>
  </url>`).join('\n')}
</urlset>`;

const targetPath = path.join(__dirname, 'public', 'sitemap.xml');
fs.writeFileSync(targetPath, sitemapContent);
console.log('Sitemap generated successfully at ' + targetPath);
