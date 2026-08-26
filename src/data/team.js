import hiringManagerPhoto from "../assets/team/hiring-manager.jpg";
import supervisorPhoto from "../assets/team/supervisor.jpg";
import bryceHamiltonPhoto from "../assets/team/bryce-hamilton.jpg";
import connorReyesPhoto from "../assets/team/connor-reyes.jpg";
import grantFosterPhoto from "../assets/team/grant-foster.jpg";
import hannahWhitmorePhoto from "../assets/team/hannah-whitmore.jpg";
import laurenCarterPhoto from "../assets/team/lauren-carter.jpg";
import nathanColePhoto from "../assets/team/nathan-cole.jpg";

function pex(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=480&h=360&fit=crop`;
}

export const TEAM = [
  { name: "Elizabeth Hayes", role: "Founder & Chief Executive", blurb: "Sets the vision and keeps Merivane focused on people, not just placements.", img: pex(8560710) },
  { name: "Daniel Whitfield", role: "Co-Founder & COO", blurb: "Runs the day-to-day engine that keeps 100+ roles moving smoothly each week.", img: pex(30692588) },
  { name: "Malik Jefferson", role: "Hiring Manager", blurb: "Leads final-round interviews and makes the call on every offer Merivane extends.", img: hiringManagerPhoto },
  { name: "Andre Whitaker", role: "Supervisor", blurb: "Oversees the recruiting floor day to day, keeping every open req on schedule.", img: supervisorPhoto },
  { name: "Olivia Turner", role: "Head of Talent Partnerships", blurb: "Builds relationships with employers so every open role is one worth applying to.", img: pex(36733305) },
  { name: "Marcus Bennett", role: "Director of Client Success", blurb: "Makes sure companies hiring through Merivane feel supported start to finish.", img: pex(3778603) },
  { name: "Ava Sinclair", role: "Lead Recruiter, Technology", blurb: "Matches engineers and designers with teams that fit how they actually work.", img: pex(15011071) },
  { name: "Owen Sullivan", role: "Lead Recruiter, Healthcare", blurb: "Specializes in remote healthcare administration and telehealth placements.", img: pex(12989198) },
  { name: "Sophia Bryant", role: "People & Culture Manager", blurb: "Looks after Merivane's own team, from onboarding to career growth.", img: pex(29995743) },
  { name: "Ethan Brooks", role: "Head of Marketing", blurb: "Tells the story of Merivane and the candidates who found their footing here.", img: pex(37148308) },
  { name: "Grace Whitman", role: "Data & Insights Lead", blurb: "Tracks what's working across the roster so hiring decisions stay evidence-based.", img: pex(4964999) },
  { name: "Tyler Coleman", role: "Head of Remote Operations", blurb: "Keeps the tools, payroll, and support systems running across every time zone.", img: pex(12616225) },
  { name: "Chloe Anderson", role: "Senior Recruiter, Sales & CX", blurb: "Places sales, support, and customer experience talent with teams that move fast.", img: pex(38885050) },
  { name: "Jordan Mitchell", role: "Lead Recruiter, Operations & Finance", blurb: "Matches operations and finance professionals to roles that fit their strengths.", img: pex(4965009) },
  { name: "Victoria Reed", role: "Payroll & Benefits Manager", blurb: "Makes sure every placed candidate gets paid accurately and on time, everywhere.", img: pex(34078749) },
  { name: "Connor Reyes", role: "Senior Account Manager", blurb: "Keeps long-standing employer partners happy long after the first placement.", img: connorReyesPhoto },
  { name: "Hannah Whitmore", role: "Recruiter, Design & Product", blurb: "Finds designers and product people who care as much about craft as speed.", img: hannahWhitmorePhoto },
  { name: "Bryce Hamilton", role: "IT & Systems Lead", blurb: "Keeps Merivane's own tools, logins, and platforms running without a hitch.", img: bryceHamiltonPhoto },
  { name: "Lauren Carter", role: "Content & Employer Branding Lead", blurb: "Writes the job posts and stories that make candidates want to apply.", img: laurenCarterPhoto },
  { name: "Nathan Cole", role: "Compliance & Contracts Manager", blurb: "Makes sure every placement is paperwork-clean across 38 countries.", img: nathanColePhoto },
  { name: "Natalie Simmons", role: "Candidate Experience Lead", blurb: "Owns the feel of every touchpoint from first application to offer.", img: pex(34377373) },
  { name: "Grant Foster", role: "Business Intelligence Analyst", blurb: "Turns placement data into decisions the whole team can act on.", img: grantFosterPhoto },
];
