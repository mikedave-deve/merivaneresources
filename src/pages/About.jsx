import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import Reveal from "../components/ui/Reveal";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import { PrimaryButton } from "../components/ui/Buttons";
import { VALUES } from "../data/values";

const TIMELINE = [
  { y: "2013", t: "Two recruiters, one spreadsheet", d: "Adaeze and Daniel start Merivane from a shared spare room, tired of watching good candidates get lost in automated filters." },
  { y: "2016", t: "First 1,000 placements", d: "Word of mouth among candidates — not employer ad spend — becomes the main source of new applicants." },
  { y: "2019", t: "Remote-only recruiting begins", d: "Merivane shifts fully toward remote roles, betting early that distributed work was the future, not a phase." },
  { y: "2021", t: "38 countries reached", d: "The roster expands past North America and Europe into Africa and Southeast Asia, matching the reach of remote work itself." },
  { y: "2024", t: "50,000 careers placed", d: "A milestone the founders still mark with a hand-written note to the candidate who crossed the number." },
  { y: "2026", t: "Merivane today", d: "A team of specialists across time zones, still answering applications personally, one by one." },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="bg-ink text-linen">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-16 pb-20 text-center">
          <SectionEyebrow>Our story</SectionEyebrow>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">Built by two recruiters who were tired of the inbox black hole.</h1>
          <p className="text-linen2/75 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">Merivane Resources started in 2013 as a rebellion against the "applied, never heard back" experience — and it's still the reason the company exists.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
        <Reveal>
          <div className="rounded-3xl overflow-hidden shadow-panel mb-14">
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&h=600&q=80" alt="The Merivane Resources team collaborating remotely" className="w-full h-72 sm:h-96 object-cover" loading="lazy" />
          </div>
        </Reveal>
        <div className="space-y-6 text-inkText/85 leading-relaxed text-[17px]">
          <Reveal><p><span className="font-display text-3xl float-left mr-2 leading-none text-brass">A</span>daeze Nwosu spent her first three years as a corporate recruiter watching qualified people vanish into applicant tracking systems, filtered out by keyword software before a human ever read their name. Her business partner, Daniel Okoro, was on the other side of the same problem — a hiring manager who kept losing good candidates to slow, impersonal processes. Over a late dinner in 2013, they sketched a different model on a napkin: a small agency where every application gets a real read, every listed salary is real, and every recruiter actually calls people back.</p></Reveal>
          <Reveal delay={0.05}><p>They named it Merivane — an invented word, chosen for how it sounded rather than what it stood for, because they wanted the company to be defined by how it treated people, not by a founding metaphor. The first year was one shared spreadsheet, forty employer relationships built cold, and a rule they still enforce today: no candidate goes more than five business days without hearing something back, even if that something is "not yet."</p></Reveal>
          <Reveal delay={0.1}><p>By 2019, remote work had gone from a rare perk to a real career strategy for the professionals Merivane placed, so the agency made a deliberate bet — recruiting exclusively for remote and hybrid roles, years before it became standard practice. That bet meant learning an entirely new set of problems: time-zone logistics, cross-border contracts, and how to help a first-time remote worker set boundaries around a home office. Merivane built playbooks for all of it, and started sharing them freely with every candidate it placed.</p></Reveal>
          <Reveal delay={0.15}><p>Today, Merivane Resources works with more than 1,280 employers across 38 countries, but the internal culture hasn't changed much from that first spreadsheet. Recruiters still carry a manageable caseload instead of a flood of unread resumes. Salary ranges are posted, not hidden. And the team still marks each major placement milestone with something small and human — a note, a call, a moment of actually noticing.</p></Reveal>
        </div>
      </section>

      <section className="bg-linen border-y border-ink/8">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
          <Reveal><SectionEyebrow>Thirteen years, briefly</SectionEyebrow></Reveal>
          <Reveal delay={0.05}><h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-12">A short timeline</h2></Reveal>
          <div className="space-y-0">
            {TIMELINE.map((item, i) => (
              <Reveal key={item.y} delay={i * 0.06}>
                <div className="flex gap-6 sm:gap-10 py-6 border-t border-ink/10 first:border-t-0">
                  <div className="font-mono text-brass text-sm w-16 shrink-0 pt-1">{item.y}</div>
                  <div>
                    <div className="font-display font-semibold text-ink">{item.t}</div>
                    <div className="text-sm text-slateSoft mt-1 leading-relaxed max-w-lg">{item.d}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <Reveal><SectionEyebrow>What guides us</SectionEyebrow></Reveal>
        <Reveal delay={0.05}><h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-12">Our values, in practice</h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.07}>
              <div className="rounded-2xl bg-white border border-ink/8 p-6 h-full">
                <div className="h-11 w-11 rounded-xl bg-moss/10 flex items-center justify-center mb-4"><Icon name={v.icon} size={19} className="text-moss" /></div>
                <div className="font-display font-semibold text-ink">{v.title}</div>
                <p className="text-sm text-slateSoft mt-2 leading-relaxed">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <Reveal>
          <div className="rounded-3xl bg-ink2 text-linen p-10 sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-semibold">Want to meet the people behind the roster?</h3>
              <p className="text-linen2/70 mt-2">Get to know the recruiters and specialists working your applications.</p>
            </div>
            <PrimaryButton onClick={() => navigate("/team")} className="bg-brass text-ink hover:bg-brassLight shrink-0">Meet the Team</PrimaryButton>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
