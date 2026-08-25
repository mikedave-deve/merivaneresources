import { CATEGORIES, TITLES_BY_CATEGORY, REQUIREMENTS_BY_CATEGORY, RESPONSIBILITIES_BY_CATEGORY, OVERVIEW_BY_CATEGORY } from "./categories";

export const COMPANIES = [
  "Northbridge Analytics", "Cobalt & Finch", "Harborlight Digital", "Sable Robotics", "Fernwood Health",
  "Anchorstone Capital", "Lumen Cloud Systems", "Pinecrest Logistics", "Willowmere Retail Group", "Ironvale Manufacturing",
  "Quietwater Media", "Brightloop Software", "Cedarfield Insurance", "Marlowe & Co.", "Greystone Biotech",
  "Tidewell Financial", "Ashcombe Learning", "Rooksby Legal Group", "Meridian Freight", "Bellcastle Hospitality",
];

export const LOCATIONS = [
  "Remote — Worldwide", "Remote — United States", "Remote — United Kingdom", "Remote — European Union",
  "Remote — Canada", "Remote — Nigeria", "Remote — South Africa", "Hybrid — Lagos, NG",
  "Hybrid — Austin, US", "Hybrid — London, UK", "Onsite — New York, US", "Onsite — Toronto, CA",
];

const REMOTE_LOCATIONS = LOCATIONS.filter((l) => l.startsWith("Remote"));

export const TYPES = ["Full-time", "Part-time", "Contract", "Freelance"];
export const LEVELS = ["Entry", "Mid", "Senior", "Lead"];
export const SALARY_BY_LEVEL = { Entry: "$34k – $48k", Mid: "$52k – $76k", Senior: "$82k – $118k", Lead: "$112k – $150k" };

export const INTERNAL_TITLES = [
  "Talent Partner", "Senior Recruiter", "Client Success Manager", "Remote Operations Analyst",
  "Software Engineer, Platform", "Marketing Specialist", "Content Strategist", "People Ops Coordinator",
  "Sales Development Representative", "Customer Success Associate", "Payroll Specialist", "IT Support Engineer",
  "Product Designer", "Associate Product Manager", "Finance Analyst", "Employment Counsel",
  "Learning & Development Lead", "Community Manager", "QA Engineer", "Executive Assistant to Leadership",
];

// Guaranteed remote, entry-level roles — the categories candidates search for most
const PRIORITY_ENTRY_ROLES = [
  { title: "Data Entry Clerk", category: "Data & Analytics" },
  { title: "Remote Data Entry Clerk", category: "Data & Analytics" },
  { title: "Data Entry Specialist", category: "Data & Analytics" },
  { title: "Customer Service Representative", category: "Customer Support" },
  { title: "Customer Support Representative", category: "Customer Support" },
  { title: "Customer Care Associate", category: "Customer Support" },
  { title: "Live Chat Support Agent", category: "Customer Support" },
  { title: "Help Desk Agent", category: "Customer Support" },
  { title: "Entry-Level Virtual Assistant", category: "Virtual Assistance" },
  { title: "Administrative Data Entry Clerk", category: "Virtual Assistance" },
  { title: "Remote Customer Service Representative", category: "Customer Support" },
  { title: "Order Entry Clerk", category: "Data & Analytics" },
  { title: "Inbound Customer Support Agent", category: "Customer Support" },
  { title: "Junior Data Entry Clerk", category: "Data & Analytics" },
  { title: "Customer Experience Associate", category: "Customer Support" },
  { title: "Records & Data Entry Assistant", category: "Data & Analytics" },
  { title: "Email Support Representative", category: "Customer Support" },
  { title: "Entry-Level Customer Support Agent", category: "Customer Support" },
  { title: "Remote Data Processing Clerk", category: "Data & Analytics" },
  { title: "Front-Line Customer Service Agent", category: "Customer Support" },
];

function buildOverview(category, company) {
  return (OVERVIEW_BY_CATEGORY[category] || "").replace("{company}", company);
}

function buildJobs() {
  const jobs = [];
  let id = 1;

  // 20 guaranteed remote, entry-level roles (data entry, customer support, etc.)
  PRIORITY_ENTRY_ROLES.forEach((role, i) => {
    const { title, category } = role;
    const company = COMPANIES[(i * 7 + 3) % COMPANIES.length];
    const location = REMOTE_LOCATIONS[i % REMOTE_LOCATIONS.length];
    const type = TYPES[i % 2 === 0 ? 0 : 1];
    const reqs = REQUIREMENTS_BY_CATEGORY[category];
    const resp = RESPONSIBILITIES_BY_CATEGORY[category];
    const daysAgo = ((i * 2 + 1) % 21) + 1;
    jobs.push({
      id: id++, title, category, company, location, type, level: "Entry",
      salary: SALARY_BY_LEVEL.Entry,
      overview: buildOverview(category, company),
      responsibilities: [resp[i % resp.length], resp[(i + 1) % resp.length], resp[(i + 2) % resp.length], resp[(i + 3) % resp.length]],
      requirements: [reqs[i % reqs.length], reqs[(i + 1) % reqs.length], reqs[(i + 2) % reqs.length], reqs[(i + 3) % reqs.length]],
      daysAgo, remote: true, internal: false,
    });
  });

  // 80 external roles across partner employers, general mix of levels and categories
  for (let i = 0; i < 80; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const titles = TITLES_BY_CATEGORY[category];
    const baseTitle = titles[(i * 3 + 1) % titles.length];
    const level = LEVELS[(i * 5 + 2) % LEVELS.length];
    const title = level === "Senior" || level === "Lead" ? `${level} ${baseTitle}` : baseTitle;
    const company = COMPANIES[(i * 7 + 3) % COMPANIES.length];
    const location = LOCATIONS[(i * 11 + 1) % LOCATIONS.length];
    const type = TYPES[(i * 2 + 1) % TYPES.length];
    const reqs = REQUIREMENTS_BY_CATEGORY[category];
    const resp = RESPONSIBILITIES_BY_CATEGORY[category];
    const requirements = [reqs[i % reqs.length], reqs[(i + 1) % reqs.length], reqs[(i + 2) % reqs.length], reqs[(i + 3) % reqs.length]];
    const responsibilities = [resp[i % resp.length], resp[(i + 1) % resp.length], resp[(i + 2) % resp.length], resp[(i + 3) % resp.length]];
    const daysAgo = ((i * 3 + 1) % 28) + 1;
    jobs.push({
      id: id++, title, category, company, location, type, level,
      salary: SALARY_BY_LEVEL[level],
      overview: buildOverview(category, company),
      responsibilities, requirements, daysAgo,
      remote: location.startsWith("Remote"), internal: false,
    });
  }

  // 20 remote roles on the Merivane Resources team itself
  INTERNAL_TITLES.forEach((t, i) => {
    const category = CATEGORIES[i % CATEGORIES.length];
    const reqs = REQUIREMENTS_BY_CATEGORY[category];
    const resp = RESPONSIBILITIES_BY_CATEGORY[category];
    const level = LEVELS[i % 4];
    const company = "Merivane Resources";
    jobs.push({
      id: id++, title: t, category, company,
      location: LOCATIONS[i % 6], type: TYPES[i % 2 === 0 ? 0 : 2], level,
      salary: SALARY_BY_LEVEL[level],
      overview: buildOverview(category, company),
      responsibilities: [resp[i % resp.length], resp[(i + 1) % resp.length], resp[(i + 2) % resp.length], resp[(i + 3) % resp.length]],
      requirements: [reqs[i % reqs.length], reqs[(i + 1) % reqs.length], reqs[(i + 2) % reqs.length], reqs[(i + 3) % reqs.length]],
      daysAgo: ((i * 2 + 1) % 20) + 1, remote: true, internal: true,
    });
  });

  return jobs;
}

export const ALL_JOBS = buildJobs();
