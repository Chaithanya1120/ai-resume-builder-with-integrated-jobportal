import fetch from 'node-fetch';

async function fetchJson(url, options = {}) {
  try {
    const res = await globalThis.fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[LiveJobService] Request failed for ${url}:`, err.message);
    return null;
  }
}

// Helper to determine if a job is suitable for Freshers
export function checkIsFresherJob(title = '', desc = '', reqs = '') {
  const text = `${title} ${desc} ${reqs}`.toLowerCase();
  return (
    text.includes('fresher') ||
    text.includes('entry level') ||
    text.includes('graduate trainee') ||
    text.includes('trainee') ||
    text.includes('junior') ||
    text.includes('associate') ||
    text.includes('0-1 year') ||
    text.includes('0 to 1 year') ||
    text.includes('no experience') ||
    text.includes('campus') ||
    text.includes('intern')
  );
}

// Helper to determine if a job is Non-IT
export function checkIsNonITJob(title = '', desc = '', skills = []) {
  const nonITKeywords = [
    'sales', 'marketing', 'hr ', 'human resources', 'accounts', 'finance',
    'banking', 'insurance', 'teacher', 'teaching', 'lecturer', 'professor',
    'nurse', 'nursing', 'doctor', 'medical', 'pharmacist', 'healthcare',
    'operations', 'supply chain', 'logistics', 'warehouse', 'store manager',
    'retail', 'customer service', 'customer support', 'bpo', 'call center',
    'civil engineer', 'mechanical engineer', 'electrical engineer',
    'content writer', 'copywriter', 'editor', 'journalist', 'media',
    'graphic designer', 'fashion', 'interior design', 'architect',
    'chef', 'hospitality', 'hotel', 'travel agent', 'tourism',
    'accountant', 'auditor', 'tax consultant', 'chartered accountant',
    'relationship manager', 'branch manager', 'loan officer',
    'field executive', 'business development', 'procurement',
    'non-it', 'non it', 'non_it'
  ];
  const text = `${title} ${desc} ${skills.join(' ')}`.toLowerCase();
  return nonITKeywords.some(kw => text.includes(kw));
}

// Non-IT job templates spanning major sectors on LinkedIn, Naukri.com & Indeed
const NON_IT_JOB_TEMPLATES = [
  // --- Banking & Finance ---
  {
    title: "Relationship Manager – Retail Banking",
    company: "HDFC Bank", companyLogo: "https://logo.clearbit.com/hdfcbank.com", domain: "hdfcbank.com/careers",
    sector: "Banking & Finance", type: "Full-time",
    description: "Manage customer portfolios, cross-sell banking products, and drive branch targets at HDFC Bank. Ideal for candidates with strong communication and finance acumen.",
    requirements: "Graduate in any stream. 1-3 years of banking/finance experience preferred.",
    skills: ["Relationship Management", "Banking", "Sales", "Customer Acquisition", "KYC"],
    salaryRange: "₹4,00,000 - ₹8,00,000 / yr", isFresher: false,
  },
  {
    title: "Fresher Loan Officer – Home & Auto Loans",
    company: "Bajaj Finserv", companyLogo: "https://logo.clearbit.com/bajajfinserv.in", domain: "bajajfinserv.in/careers",
    sector: "Banking & Finance", type: "Full-time",
    description: "Process and sanction home/auto loan applications. Verify documents, assess creditworthiness, and coordinate with customers throughout the loan lifecycle.",
    requirements: "Graduate fresher. Basic MS Office knowledge. Willingness to learn finance processes.",
    skills: ["Loan Processing", "Finance", "Excel", "Customer Service", "Documentation"],
    salaryRange: "₹2,50,000 - ₹4,50,000 / yr", isFresher: true,
  },
  {
    title: "Chartered Accountant (CA) – Taxation & Audit",
    company: "Deloitte India", companyLogo: "https://logo.clearbit.com/deloitte.com", domain: "deloitte.com/in/en/careers",
    sector: "Accounting & Finance", type: "Full-time",
    description: "Handle statutory audits, tax compliance, GST filings, and client financial advisory at Deloitte India.",
    requirements: "CA qualified. 0-2 years post qualification experience in audit or tax.",
    skills: ["GST", "Tally", "Taxation", "Audit", "Financial Reporting"],
    salaryRange: "₹8,00,000 - ₹15,00,000 / yr", isFresher: false,
  },
  // --- Sales & Marketing ---
  {
    title: "Territory Sales Executive – FMCG",
    company: "Hindustan Unilever", companyLogo: "https://logo.clearbit.com/hul.co.in", domain: "hul.co.in/careers",
    sector: "Sales & Marketing", type: "Full-time",
    description: "Drive sales targets across assigned territory. Build distributor & retailer relationships for HUL brands. Manage product visibility in general and modern trade.",
    requirements: "Any Graduate. 1-2 years field sales experience in FMCG/Consumer Goods.",
    skills: ["Field Sales", "Distribution", "FMCG", "Target Achievement", "Negotiation"],
    salaryRange: "₹3,00,000 - ₹6,00,000 / yr", isFresher: false,
  },
  {
    title: "Digital Marketing Executive (Fresher)",
    company: "Swiggy", companyLogo: "https://logo.clearbit.com/swiggy.com", domain: "careers.swiggy.com",
    sector: "Marketing", type: "Full-time",
    description: "Execute digital campaigns on Meta Ads, Google Ads, and Email Marketing. Analyze performance metrics and optimize ROI for Swiggy's marketing initiatives.",
    requirements: "Freshers welcome. BBA/MBA Marketing or graduate with digital marketing certification preferred.",
    skills: ["Google Ads", "Meta Ads", "SEO", "Email Marketing", "Analytics"],
    salaryRange: "₹3,00,000 - ₹5,50,000 / yr", isFresher: true,
  },
  // --- HR & Administration ---
  {
    title: "HR Executive – Talent Acquisition",
    company: "Wipro BPS", companyLogo: "https://logo.clearbit.com/wipro.com", domain: "wipro.com/careers",
    sector: "Human Resources", type: "Full-time",
    description: "Source, screen, and onboard candidates across non-tech functions. Manage bulk hiring drives, coordinate with hiring managers, and maintain HRMS data.",
    requirements: "MBA HR or equivalent. 0-2 years experience in recruitment.",
    skills: ["Talent Acquisition", "HR", "Naukri Portal", "Bulk Hiring", "Excel"],
    salaryRange: "₹2,50,000 - ₹5,00,000 / yr", isFresher: true,
  },
  // --- Healthcare & Nursing ---
  {
    title: "Staff Nurse – ICU / General Ward",
    company: "Apollo Hospitals", companyLogo: "https://logo.clearbit.com/apollohospitals.com", domain: "apollohospitals.com/careers",
    sector: "Healthcare", type: "Full-time",
    description: "Provide patient care, administer medications, monitor vitals, and coordinate with doctors and paramedics in ICU and general ward at Apollo Hospitals.",
    requirements: "B.Sc Nursing / GNM. Valid nursing council registration. Freshers with 6-month internship may apply.",
    skills: ["Patient Care", "ICU", "Nursing", "Medication Administration", "Wound Care"],
    salaryRange: "₹2,80,000 - ₹5,00,000 / yr", isFresher: true,
  },
  {
    title: "Medical Representative – Pharma Sales",
    company: "Sun Pharmaceutical", companyLogo: "https://logo.clearbit.com/sunpharma.com", domain: "sunpharma.com/careers",
    sector: "Healthcare & Pharma", type: "Full-time",
    description: "Promote pharmaceutical products to doctors and hospitals. Manage prescription targets, stockist relationships, and attend CMEs and medical conferences.",
    requirements: "B.Sc / B.Pharma. 0-2 years pharma sales experience. Own bike preferred.",
    skills: ["Pharma Sales", "Doctor Detailing", "Territory Management", "Product Knowledge", "Reporting"],
    salaryRange: "₹2,50,000 - ₹4,50,000 / yr", isFresher: true,
  },
  // --- Education & Teaching ---
  {
    title: "Secondary School Teacher – Mathematics",
    company: "Delhi Public School", companyLogo: "https://logo.clearbit.com/dpsgroupofschools.org", domain: "dpsgroupofschools.org/careers",
    sector: "Education", type: "Full-time",
    description: "Deliver engaging Maths lessons for Classes 9-12 (CBSE). Design lesson plans, conduct assessments, and guide students in board exam preparation.",
    requirements: "B.Ed + B.Sc/M.Sc Mathematics. CTET/STET qualified preferred. Freshers may apply.",
    skills: ["Teaching", "Mathematics", "CBSE Curriculum", "Lesson Planning", "Student Assessment"],
    salaryRange: "₹3,00,000 - ₹6,00,000 / yr", isFresher: true,
  },
  // --- Operations & Logistics ---
  {
    title: "Logistics & Supply Chain Executive",
    company: "Blue Dart Express", companyLogo: "https://logo.clearbit.com/bluedart.com", domain: "bluedart.com/careers",
    sector: "Logistics & Operations", type: "Full-time",
    description: "Coordinate inbound and outbound shipments, manage vendor relationships, track deliveries, and optimize supply chain processes for Blue Dart's network.",
    requirements: "Graduate in any stream. 1-3 years logistics/supply chain experience.",
    skills: ["Supply Chain", "Logistics", "Vendor Management", "ERP", "Coordination"],
    salaryRange: "₹3,00,000 - ₹6,50,000 / yr", isFresher: false,
  },
  // --- Customer Service / BPO ---
  {
    title: "Customer Support Executive – Voice Process (Fresher)",
    company: "Concentrix", companyLogo: "https://logo.clearbit.com/concentrix.com", domain: "concentrix.com/careers",
    sector: "BPO / Customer Service", type: "Full-time",
    description: "Handle inbound customer queries for international clients. Resolve issues promptly, maintain service quality, and document interactions accurately.",
    requirements: "Any graduate fresher with good English communication. Night shift flexibility required.",
    skills: ["Customer Service", "Voice Process", "CRM", "English Communication", "Problem Solving"],
    salaryRange: "₹2,00,000 - ₹3,50,000 / yr", isFresher: true,
  },
  // --- Content & Media ---
  {
    title: "Content Writer – Blog & SEO (Fresher / Junior)",
    company: "Times Internet", companyLogo: "https://logo.clearbit.com/timesinternet.in", domain: "timesinternet.in/careers",
    sector: "Media & Content", type: "Full-time",
    description: "Create engaging long-form SEO content, blog articles, and social media copy for Times Internet's digital platforms.",
    requirements: "Graduation in English / Journalism / Mass Communication. Portfolio of published articles preferred.",
    skills: ["Content Writing", "SEO", "Blogging", "WordPress", "Editing"],
    salaryRange: "₹2,50,000 - ₹4,50,000 / yr", isFresher: true,
  },
  // --- Retail & Store Management ---
  {
    title: "Store Manager – Fashion Retail",
    company: "Reliance Retail", companyLogo: "https://logo.clearbit.com/relianceretail.com", domain: "careers.relianceretail.com",
    sector: "Retail", type: "Full-time",
    description: "Manage store operations, drive revenue targets, handle visual merchandising, and lead a team of sales associates at Reliance Retail fashion outlets.",
    requirements: "Graduate with 2-4 years retail/store management experience. Strong leadership skills.",
    skills: ["Store Management", "Retail", "Visual Merchandising", "Team Leadership", "Inventory Management"],
    salaryRange: "₹4,00,000 - ₹7,00,000 / yr", isFresher: false,
  },
  // --- Civil / Mechanical Engineering ---
  {
    title: "Junior Civil Site Engineer (Fresher)",
    company: "L&T Construction", companyLogo: "https://logo.clearbit.com/lntecc.com", domain: "lntecc.com/careers",
    sector: "Core Engineering (Civil)", type: "Full-time",
    description: "Support site supervision, quality control, quantity estimation, and coordination with contractors for L&T residential and infrastructure projects.",
    requirements: "B.E/B.Tech Civil Engineering. 2022-2026 batch freshers welcome.",
    skills: ["AutoCAD", "Site Supervision", "Estimation", "Civil Engineering", "MS Project"],
    salaryRange: "₹3,00,000 - ₹5,50,000 / yr", isFresher: true,
  },
  {
    title: "Production / Manufacturing Engineer",
    company: "Mahindra & Mahindra", companyLogo: "https://logo.clearbit.com/mahindra.com", domain: "mahindra.com/careers",
    sector: "Core Engineering (Mechanical)", type: "Full-time",
    description: "Oversee production planning, OEE, quality adherence, and continuous improvement initiatives in Mahindra's automotive manufacturing plant.",
    requirements: "B.E/B.Tech Mechanical/Production. 0-2 years plant floor experience.",
    skills: ["Production Planning", "Lean Manufacturing", "Kaizen", "SAP", "Quality Control"],
    salaryRange: "₹3,50,000 - ₹6,00,000 / yr", isFresher: false,
  },
  // --- Hospitality & Travel ---
  {
    title: "Front Desk Executive – Hotel (Fresher)",
    company: "Marriott Hotels India", companyLogo: "https://logo.clearbit.com/marriott.com", domain: "marriott.com/careers",
    sector: "Hospitality", type: "Full-time",
    description: "Welcome guests, manage check-in/check-out, handle reservations, and ensure exceptional guest experiences at Marriott's India properties.",
    requirements: "Hotel Management diploma/degree. Freshers encouraged. Good English communication.",
    skills: ["Guest Relations", "Front Office", "PMS (Opera)", "Hospitality", "Communication"],
    salaryRange: "₹2,00,000 - ₹3,50,000 / yr", isFresher: true,
  },
];

// Non-IT source platforms: LinkedIn, Naukri.com, Indeed
const NON_IT_SOURCES = [
  { name: "LinkedIn", color: "#0a66c2", getUrl: (q, l) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=${encodeURIComponent(l)}` },
  { name: "Naukri.com", color: "#275df5", getUrl: (q, l) => `https://www.naukri.com/${encodeURIComponent(q.replace(/\s+/g, '-'))}-jobs-in-${encodeURIComponent(l.replace(/\s+/g, '-'))}` },
  { name: "Indeed", color: "#003a9b", getUrl: (q, l) => `https://www.indeed.com/jobs?q=${encodeURIComponent(q)}&l=${encodeURIComponent(l)}` },
];

// Generate Non-IT aggregated jobs from LinkedIn, Naukri.com and Indeed
function generateNonITJobs(location = '', type = '') {
  const locTerm = (location || 'Bangalore').trim();
  return NON_IT_JOB_TEMPLATES.map((template, i) => {
    const sourceObj = NON_IT_SOURCES[i % NON_IT_SOURCES.length];
    const jobType = type || template.type;
    const loc = jobType === "Remote" ? "Remote" : locTerm;
    return {
      _id: `live_nonit_${Date.now()}_${i}`,
      title: template.title,
      company: template.company,
      companyLogo: template.companyLogo,
      location: loc,
      type: jobType,
      description: template.description,
      requirements: template.requirements,
      skills: template.skills,
      salaryRange: template.salaryRange,
      sector: template.sector,
      source: sourceObj.name,
      sourceColor: sourceObj.color,
      applyUrl: sourceObj.getUrl(template.title, loc),
      companyUrl: `https://${template.domain}`,
      isExternal: true,
      isNonIT: true,
      isFresher: template.isFresher,
      createdAt: new Date(Date.now() - i * 2400000).toISOString()
    };
  });
}

// Generate realistic real-time jobs tailored to search parameters, prioritizing Freshers
function generateLiveAggregatedJobs(search = '', location = '', type = '') {
  const queryTerm = (search || 'Software Developer').trim();
  const locTerm = (location || 'Bangalore').trim();

  const companies = [
    { name: "Google", logo: "https://logo.clearbit.com/google.com", domain: "careers.google.com" },
    { name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com", domain: "careers.microsoft.com" },
    { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com", domain: "amazon.jobs" },
    { name: "TCS", logo: "https://logo.clearbit.com/tcs.com", domain: "tcs.com/careers" },
    { name: "Infosys", logo: "https://logo.clearbit.com/infosys.com", domain: "infosys.com/careers" },
    { name: "Wipro", logo: "https://logo.clearbit.com/wipro.com", domain: "wipro.com/careers" },
    { name: "Flipkart", logo: "https://logo.clearbit.com/flipkart.com", domain: "flipkartcareers.com" },
    { name: "Zomato", logo: "https://logo.clearbit.com/zomato.com", domain: "zomato.com/careers" }
  ];

  const sources = [
    { name: "LinkedIn", color: "#0a66c2", getUrl: (q, l) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=${encodeURIComponent(l)}` },
    { name: "Naukri.com", color: "#275df5", getUrl: (q, l) => `https://www.naukri.com/${encodeURIComponent(q.replace(/\s+/g, '-'))}-jobs-in-${encodeURIComponent(l.replace(/\s+/g, '-'))}` },
    { name: "Indeed", color: "#003a9b", getUrl: (q, l) => `https://www.indeed.com/jobs?q=${encodeURIComponent(q)}&l=${encodeURIComponent(l)}` },
    { name: "Google Jobs", color: "#4285f4", getUrl: (q, l) => `https://www.google.com/search?q=${encodeURIComponent(q + ' jobs in ' + l)}&ibp=htl;jobs` },
    { name: "Glassdoor", color: "#0caa41", getUrl: (q, l) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(q)}&locKeyword=${encodeURIComponent(l)}` }
  ];

  // Specific Fresher Openings to give 1st preference
  const fresherTitles = [
    `Graduate Software Trainee (${queryTerm}) - 2024/2025/2026 Batch`,
    `Fresher ${queryTerm} Developer`,
    `Associate Frontend Engineer (Fresher / Entry Level)`,
    `Entry-Level ${queryTerm} Specialist`,
    `Junior Full Stack Developer (0-1 Yrs Experience)`
  ];

  const experiencedTitles = [
    `Senior ${queryTerm} Engineer`,
    `Lead ${queryTerm} Architect`
  ];

  const generated = [];

  // Add 5 Fresher Jobs FIRST (First Preference)
  for (let i = 0; i < fresherTitles.length; i++) {
    const company = companies[i % companies.length];
    const sourceObj = sources[i % sources.length];
    const title = fresherTitles[i];
    const jobType = type || (i % 2 === 0 ? "Full-time" : "Remote");
    const loc = jobType === "Remote" ? "Remote" : locTerm;

    generated.push({
      _id: `live_fresher_${Date.now()}_${i}`,
      title: title,
      company: company.name,
      companyLogo: company.logo,
      location: loc,
      type: jobType,
      description: `Exciting Fresher opening at ${company.name}! We are actively recruiting recent graduates and entry-level candidates for ${title}. Great learning curve, mentorship, and career growth opportunities.`,
      requirements: `Bachelor's degree in CS/IT/Engineering (0 to 1 year experience welcome). Solid understanding of programming basics in ${queryTerm}, React, or Python.`,
      skills: [queryTerm, "Freshers Welcome", "React", "JavaScript", "Problem Solving"],
      salaryRange: "₹6,00,000 - ₹12,00,000 / yr",
      source: sourceObj.name,
      sourceColor: sourceObj.color,
      applyUrl: sourceObj.getUrl(title, loc),
      companyUrl: `https://${company.domain}`,
      isExternal: true,
      isFresher: true,
      createdAt: new Date(Date.now() - i * 1800000).toISOString()
    });
  }

  // Add 3 Experienced Jobs afterwards
  for (let i = 0; i < experiencedTitles.length; i++) {
    const company = companies[(i + 5) % companies.length];
    const sourceObj = sources[(i + 2) % sources.length];
    const title = experiencedTitles[i];
    const jobType = type || "Full-time";

    generated.push({
      _id: `live_exp_${Date.now()}_${i}`,
      title: title,
      company: company.name,
      companyLogo: company.logo,
      location: locTerm,
      type: jobType,
      description: `Seeking an experienced ${title} at ${company.name} to architect end-to-end web architectures and mentor engineering teams.`,
      requirements: `3+ years of hands-on software development experience. High proficiency in microservices and distributed systems.`,
      skills: [queryTerm, "System Design", "Node.js", "Docker"],
      salaryRange: "₹18,00,000 - ₹32,00,000 / yr",
      source: sourceObj.name,
      sourceColor: sourceObj.color,
      applyUrl: sourceObj.getUrl(title, locTerm),
      companyUrl: `https://${company.domain}`,
      isExternal: true,
      isFresher: false,
      createdAt: new Date(Date.now() - (i + 5) * 3600000).toISOString()
    });
  }

  return generated;
}

export const fetchLiveRealTimeJobs = async (search = '', location = '', type = '') => {
  let liveJobs = [];

  // Option 1: RapidAPI JSearch API
  if (process.env.RAPIDAPI_KEY) {
    try {
      const q = `${search || 'Software Engineer'} in ${location || 'Bangalore'}`;
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(q)}&num_pages=1`;
      const data = await fetchJson(url, {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      });

      if (data && Array.isArray(data.data)) {
        liveJobs = data.data.map((item, idx) => {
          const publisher = item.job_publisher || "LinkedIn";
          const title = item.job_title || search || "Software Developer";
          const desc = item.job_description || "";
          const reqs = item.job_highlights?.Qualifications?.join(" ") || "";
          const isFresher = checkIsFresherJob(title, desc, reqs);

          return {
            _id: item.job_id || `jsearch_${idx}`,
            title: title,
            company: item.employer_name || "Tech Company",
            companyLogo: item.employer_logo || `https://logo.clearbit.com/${(item.employer_name || 'tech').toLowerCase().replace(/\s+/g, '')}.com`,
            location: item.job_city ? `${item.job_city}, ${item.job_country || ''}` : item.job_is_remote ? "Remote" : (location || "Bangalore"),
            type: item.job_employment_type ? (item.job_employment_type.toLowerCase().includes("full") ? "Full-time" : item.job_employment_type) : (type || "Full-time"),
            description: desc || "Real-time job opportunity aggregated from external live listing.",
            requirements: reqs || "Strong technical skills and domain experience.",
            skills: item.job_required_skills || [search || "Software Development", "React"],
            salaryRange: item.job_min_salary ? `$${item.job_min_salary} - $${item.job_max_salary} / yr` : "Competitive Market Salary",
            source: publisher.includes("LinkedIn") ? "LinkedIn" : publisher.includes("Indeed") ? "Indeed" : publisher.includes("Naukri") ? "Naukri.com" : publisher.includes("Glassdoor") ? "Glassdoor" : "Google Jobs",
            applyUrl: item.job_apply_link || item.job_google_link || `https://www.google.com/search?q=${encodeURIComponent((title) + ' ' + (item.employer_name || ''))}`,
            isExternal: true,
            isFresher: isFresher,
            createdAt: new Date().toISOString()
          };
        });
      }
    } catch (err) {
      console.warn("[LiveJobService] RapidAPI fetch error:", err.message);
    }
  }

  // Option 2: Remotive & Jobicy Free Public Live Feeds
  if (liveJobs.length === 0) {
    try {
      const categoryUrl = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(search || 'developer')}`;
      const remotiveData = await fetchJson(categoryUrl);
      if (remotiveData && Array.isArray(remotiveData.jobs)) {
        const sliced = remotiveData.jobs.slice(0, 8);
        const mapped = sliced.map((item, idx) => {
          const isFresher = checkIsFresherJob(item.title, item.description, "");
          return {
            _id: `remotive_${item.id || idx}`,
            title: item.title,
            company: item.company_name,
            companyLogo: item.company_logo || `https://logo.clearbit.com/${item.company_name.toLowerCase().replace(/\s+/g, '')}.com`,
            location: item.candidate_required_location || location || "Remote",
            type: item.job_type ? (item.job_type.toLowerCase().includes("full") ? "Full-time" : "Remote") : "Full-time",
            description: item.description ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 300) + '...' : "Exciting job opportunity found live online.",
            requirements: "Experience with web applications and clean code.",
            skills: item.tags || [search || "Software Engineering"],
            salaryRange: item.salary || "₹8,00,000 - ₹18,00,000 / yr",
            source: "Remotive",
            applyUrl: item.url,
            isExternal: true,
            isFresher: isFresher,
            createdAt: item.publication_date || new Date().toISOString()
          };
        });
        liveJobs.push(...mapped);
      }
    } catch (err) {
      console.warn("[LiveJobService] Public feed error:", err.message);
    }
  }

  // Option 3: Real-Time Aggregated Feed Generator (Fresher Preferred)
  const syntheticLive = generateLiveAggregatedJobs(search, location, type);

  // Option 4: Non-IT Jobs from LinkedIn, Naukri.com & Indeed
  const nonITLive = generateNonITJobs(location, type);

  const combined = [...liveJobs, ...syntheticLive, ...nonITLive];
  
  // Sort combined results so Freshers jobs are given FIRST PREFERENCE at top
  combined.sort((a, b) => (b.isFresher ? 1 : 0) - (a.isFresher ? 1 : 0));

  let filtered = combined;
  if (location && location.trim()) {
    const locLower = location.trim().toLowerCase();
    filtered = filtered.filter(j => j.location.toLowerCase().includes(locLower) || locLower.includes('remote') || j.location.toLowerCase().includes('remote'));
  }

  if (type && type.trim()) {
    const typeLower = type.trim().toLowerCase();
    filtered = filtered.filter(j => j.type.toLowerCase().includes(typeLower));
  }

  return filtered;
};

// Export generateNonITJobs for use in controller
export { generateNonITJobs };
