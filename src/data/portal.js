export const PORTAL_NAV = [
  {
    group: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "grid", path: "/portal/dashboard" },
      { id: "notifications", label: "Notifications", icon: "bell", path: "/portal/notifications" },
    ],
  },
  {
    group: "My Work",
    items: [
      { id: "missions", label: "Missions & Instructions", icon: "compass", path: "/portal/missions" },
      { id: "attendance", label: "Attendance", icon: "clock", path: "/portal/attendance" },
      { id: "time-off", label: "Time Off", icon: "calendar", path: "/portal/time-off" },
      { id: "history", label: "Activity History", icon: "trend", path: "/portal/history" },
    ],
  },
  {
    group: "My Info",
    items: [
      { id: "profile", label: "Profile", icon: "user", path: "/portal/profile" },
      { id: "info-setup", label: "Information Setup", icon: "filter", path: "/portal/info-setup" },
      { id: "identity", label: "Identity Verification", icon: "shield", path: "/portal/identity" },
      { id: "documents", label: "Documents", icon: "file", path: "/portal/documents" },
    ],
  },
  {
    group: "Pay & Benefits",
    items: [
      { id: "payroll", label: "Payroll", icon: "card", path: "/portal/payroll" },
      { id: "retirement", label: "401(k) & Retirement", icon: "coin", path: "/portal/retirement" },
      { id: "services", label: "Company Services", icon: "sparkle", path: "/portal/services" },
    ],
  },
  {
    group: "Company",
    items: [
      { id: "equipment", label: "Equipment & Logistics", icon: "briefcase", path: "/portal/equipment" },
      { id: "directory", label: "Company Directory", icon: "users", path: "/portal/directory" },
    ],
  },
];

export const PORTAL_SUPPORT_NAV = { id: "settings", label: "Settings & Support", icon: "settings", path: "/portal/settings" };

export const EMPLOYEE = {
  name: "Jordan Blake",
  firstName: "Jordan",
  email: "jordan.blake@email.com",
  phone: "+1 (415) 555-0148",
  role: "Content Strategist",
  department: "Content & Writing",
  employer: "Merivane Resources",
  manager: "Ivo Petrov",
  employeeId: "MR-10482",
  startDate: "Jan 6, 2025",
  location: "Austin, TX, United States",
  timezone: "Central Time (UTC-5)",
  status: "Active",
  avatar: "https://randomuser.me/api/portraits/men/86.jpg",
};

export const DOCUMENTS = [
  { name: "Resume_JordanBlake_2026.pdf", type: "Resume", updated: "Aug 10" },
  { name: "Merivane_Offer_ContentStrategist.pdf", type: "Offer Letter", updated: "Aug 6" },
  { name: "Signed_NDA_Brightloop.pdf", type: "Contract", updated: "Jul 30" },
  { name: "Portfolio_JordanBlake.pdf", type: "Portfolio", updated: "Jul 14" },
  { name: "W9_JordanBlake_2025.pdf", type: "Tax Form", updated: "Jan 8" },
];

export const PAYROLL_HISTORY = [
  { period: "August 2026", amount: "$5,240.00", status: "Paid" },
  { period: "July 2026", amount: "$5,240.00", status: "Paid" },
  { period: "June 2026", amount: "$5,100.00", status: "Paid" },
  { period: "May 2026", amount: "$5,100.00", status: "Paid" },
];

export const MISSIONS = [
  { id: 1, title: "Complete Q3 content calendar", instructions: "Draft and submit the Q3 blog and newsletter calendar for review.", dueDate: "Aug 29, 2026", priority: "High", status: "In Progress", progress: 60 },
  { id: 2, title: "Onboard to Merivane style guide", instructions: "Read through the brand voice and editorial guidelines, then complete the short quiz.", dueDate: "Aug 26, 2026", priority: "Medium", status: "Not Started", progress: 0 },
  { id: 3, title: "Weekly roster newsletter draft", instructions: "Write the draft for Friday's roster letter and send it to Priya for review.", dueDate: "Aug 25, 2026", priority: "High", status: "In Review", progress: 90 },
  { id: 4, title: "Update author bio across published posts", instructions: "Swap in the new headshot and bio across the last 12 published articles.", dueDate: "Aug 21, 2026", priority: "Low", status: "Completed", progress: 100 },
];

export const MISSION_STATUS_TONE = { "Not Started": "linen", "In Progress": "brass", "In Review": "brass", Completed: "moss" };

export const ATTENDANCE_LOG = [
  { date: "Aug 22, 2026", clockIn: "9:02 AM", clockOut: "5:11 PM", hours: "8h 9m", status: "Present" },
  { date: "Aug 21, 2026", clockIn: "9:14 AM", clockOut: "5:05 PM", hours: "7h 51m", status: "Late" },
  { date: "Aug 20, 2026", clockIn: "8:58 AM", clockOut: "5:02 PM", hours: "8h 4m", status: "Present" },
  { date: "Aug 19, 2026", clockIn: "—", clockOut: "—", hours: "0h", status: "Time Off" },
  { date: "Aug 18, 2026", clockIn: "9:00 AM", clockOut: "5:00 PM", hours: "8h 0m", status: "Present" },
];

export const ATTENDANCE_STATUS_TONE = { Present: "moss", Late: "brass", Absent: "linen", "Time Off": "linen" };

export const WEEKLY_HOURS = [
  { day: "Mon", hours: 8.0 }, { day: "Tue", hours: 7.9 }, { day: "Wed", hours: 8.1 },
  { day: "Thu", hours: 0 }, { day: "Fri", hours: 8.0 }, { day: "Sat", hours: 0 }, { day: "Sun", hours: 0 },
];

export const TIME_OFF_BALANCE = [
  { type: "Vacation", used: 4, total: 15 },
  { type: "Sick", used: 1, total: 8 },
  { type: "Personal", used: 0, total: 3 },
];

export const TIME_OFF_REQUESTS = [
  { type: "Vacation", from: "Sep 15, 2026", to: "Sep 19, 2026", days: 5, status: "Pending", reason: "Family trip" },
  { type: "Sick", from: "Aug 19, 2026", to: "Aug 19, 2026", days: 1, status: "Approved", reason: "Not feeling well" },
  { type: "Personal", from: "Jul 3, 2026", to: "Jul 3, 2026", days: 1, status: "Approved", reason: "Personal errand" },
  { type: "Vacation", from: "May 20, 2026", to: "May 22, 2026", days: 3, status: "Denied", reason: "Overlap with launch week" },
];

export const TIME_OFF_STATUS_TONE = { Pending: "brass", Approved: "moss", Denied: "linen" };

export const ACTIVITY_HISTORY = [
  { icon: "check", label: 'Completed mission "Update author bio across published posts"', time: "Today · 10:42 AM" },
  { icon: "card", label: "Payroll deposit of $5,240.00 processed", time: "Sep 1, 2026 · 6:00 AM" },
  { icon: "file", label: 'Uploaded document "Signed_NDA_Brightloop.pdf"', time: "Jul 30, 2026 · 2:15 PM" },
  { icon: "shield", label: "Identity verification approved", time: "Jul 22, 2026 · 9:03 AM" },
  { icon: "user", label: "Updated profile phone number", time: "Jul 18, 2026 · 4:47 PM" },
  { icon: "lock", label: "Signed in from a new device (Austin, TX)", time: "Jul 12, 2026 · 8:58 AM" },
];

export const INFO_SETUP = [
  { id: "tax", label: "Tax information (W-9 / W-8BEN)", done: true, detail: "On file, submitted Jan 8, 2025" },
  { id: "banking", label: "Direct deposit / banking details", done: true, detail: "Bank ending •••• 4821" },
  { id: "emergency", label: "Emergency contact", done: true, detail: "Alex Blake · Spouse" },
  { id: "address", label: "Mailing address", done: true, detail: "Austin, TX, United States" },
  { id: "workhours", label: "Work hours & timezone preference", done: false, detail: "Not yet set" },
];

export const IDENTITY_VERIFICATION = {
  status: "Verified",
  method: "Government ID + selfie match",
  verifiedOn: "Jul 22, 2026",
  documentType: "Passport",
  history: [
    { label: "ID document uploaded", time: "Jul 21, 2026 · 3:12 PM" },
    { label: "Selfie match submitted", time: "Jul 21, 2026 · 3:14 PM" },
    { label: "Reviewed and approved", time: "Jul 22, 2026 · 9:03 AM" },
  ],
};

export const RETIREMENT = {
  balance: "$18,420.60",
  vested: "100%",
  contributionRate: 6,
  employerMatch: "Up to 4%, dollar-for-dollar",
  ytdContribution: "$3,120.00",
  allocations: [
    { fund: "Target Date 2055 Fund", pct: 60 },
    { fund: "US Total Market Index", pct: 25 },
    { fund: "International Index", pct: 10 },
    { fund: "Bond Index", pct: 5 },
  ],
  statements: [
    { period: "Q2 2026", updated: "Jul 10, 2026" },
    { period: "Q1 2026", updated: "Apr 8, 2026" },
    { period: "Q4 2025", updated: "Jan 9, 2026" },
  ],
};

export const EQUIPMENT = [
  { item: "MacBook Pro 14\" (M3)", serial: "MR-LT-88421", status: "Delivered", assignedOn: "Jan 6, 2025" },
  { item: "27\" External Monitor", serial: "MR-MN-22190", status: "Delivered", assignedOn: "Jan 6, 2025" },
  { item: "Noise-Cancelling Headset", serial: "MR-HS-04471", status: "In Transit", assignedOn: "Aug 18, 2026" },
];

export const EQUIPMENT_STATUS_TONE = { Delivered: "moss", "In Transit": "brass", Requested: "linen" };

export const COMPANY_SERVICES = [
  { icon: "heart", title: "Wellness Stipend", desc: "$50/month toward fitness, therapy, or wellness apps.", cta: "Redeem" },
  { icon: "star", title: "Merivane Learning", desc: "Free access to courses and certifications on your track.", cta: "Explore courses" },
  { icon: "settings", title: "IT Helpdesk", desc: "Get help with your equipment, accounts, or software.", cta: "Open a ticket" },
  { icon: "users", title: "Referral Program", desc: "Earn $500 for every successful referral hired.", cta: "Refer someone" },
  { icon: "sparkle", title: "Perks Marketplace", desc: "Discounts on software, travel, and everyday purchases.", cta: "Browse perks" },
  { icon: "shield", title: "Employee Assistance Program", desc: "Confidential support for legal, financial, or personal matters.", cta: "Get support" },
];

export const NOTIFICATIONS = [
  { icon: "message", title: "Fatima Bello (Recruiter)", preview: "Great news, Brightloop wants to move you to final round interviews.", time: "2h ago", unread: true, type: "Message" },
  { icon: "card", title: "Payroll processed", preview: "Your August deposit of $5,240.00 was sent to your account on file.", time: "Sep 1 · 6:00 AM", unread: true, type: "Payroll" },
  { icon: "check", title: "Mission completed", preview: 'Nice work — "Update author bio across published posts" is marked complete.', time: "1d ago", unread: false, type: "Mission" },
  { icon: "shield", title: "Identity verified", preview: "Your identity verification was reviewed and approved.", time: "Jul 22", unread: false, type: "Compliance" },
  { icon: "briefcase", title: "Equipment shipped", preview: "Your noise-cancelling headset is on its way, tracking available.", time: "Aug 18", unread: false, type: "Equipment" },
  { icon: "message", title: "Merivane Resources", preview: "Your weekly roster digest: 12 new remote roles this week.", time: "1d ago", unread: false, type: "Announcement" },
];

export const NOTIFICATION_TONE = { Message: "brass", Payroll: "moss", Mission: "moss", Compliance: "linen", Equipment: "linen", Announcement: "linen", Profile: "linen", "Time Off": "moss" };
