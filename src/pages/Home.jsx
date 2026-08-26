import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import Reveal from "../components/ui/Reveal";
import CountUp from "../components/ui/CountUp";
import Marquee from "../components/ui/Marquee";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import { PrimaryButton, GhostButton } from "../components/ui/Buttons";
import JobCard from "../components/JobCard";
import { ALL_JOBS } from "../data/jobs";
import { CATEGORIES, CATEGORY_ICON } from "../data/categories";
import { VALUES } from "../data/values";
import { TESTIMONIALS } from "../data/testimonials";

export default function Home() {
  const navigate = useNavigate();
  const featured = useMemo(() => ALL_JOBS.filter((j) => j.internal).slice(0, 6), []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-linen">
        <div className="absolute inset-0 grain-bg opacity-40" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brass/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 relative grid lg:grid-cols-[1fr_1.2fr] gap-14 items-center">
          <div>
            <SectionEyebrow>A remote-first talent agency, est. 2013</SectionEyebrow>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08] tracking-tight">
              We place careers,<br /><span className="italic text-brassLight">not just candidates.</span>
            </h1>
            <p className="mt-6 text-linen2/80 text-lg max-w-lg leading-relaxed">
              Merivane Resources connects skilled professionals with vetted employers across 38 countries — real recruiters, transparent pay, and remote roles that actually fit your life.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <PrimaryButton onClick={() => navigate("/jobs")} className="bg-brass text-ink hover:bg-brassLight">Browse Open Roles</PrimaryButton>
              <GhostButton onClick={() => navigate("/submit-resume")} className="border-white/25 text-linen hover:bg-white/10">Submit Your Resume</GhostButton>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-wider text-linen2/60">
              <span>12 yrs in business</span><span>·</span><span>50,000+ placements</span><span>·</span><span>38 countries</span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-panel border border-white/10">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&h=1150&q=80" alt="A Merivane team meeting, colleagues reviewing a project together in the office" className="w-full h-[460px] sm:h-[560px] object-cover" loading="lazy" />
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="animate-floatSlow absolute -bottom-8 -left-6 sm:-left-10 bg-white text-ink rounded-2xl shadow-panel p-5 w-64">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-moss mb-2"><Icon name="check" size={14} />Match Confirmed</div>
              <div className="font-display font-semibold text-sm">Senior Product Designer</div>
              <div className="text-xs text-slateSoft mt-0.5">Remote — Worldwide · $95k–$120k</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LEDGER STATS */}
      <section className="bg-linen border-y border-ink/8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { v: 52340, s: "+", l: "Roles filled to date" }, { v: 1280, s: "+", l: "Employers partnered" },
            { v: 38, s: "", l: "Countries reached" }, { v: 11, s: " days", l: "Average time to hire" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="font-mono text-3xl sm:text-4xl font-semibold text-ink"><CountUp value={s.v} suffix={s.s} /></div>
              <div className="text-sm text-slateSoft mt-1.5">{s.l}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <Reveal><SectionEyebrow>What we recruit for</SectionEyebrow></Reveal>
        <Reveal delay={0.05}><h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink max-w-xl">Explore open roles by field</h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {CATEGORIES.map((cat, i) => {
            const count = ALL_JOBS.filter((j) => j.category === cat).length;
            return (
              <Reveal key={cat} delay={(i % 6) * 0.05}>
                <button onClick={() => navigate("/jobs")} className="w-full text-left group flex items-center gap-4 rounded-2xl bg-white border border-ink/8 p-5 hover:border-brass/50 hover:shadow-card transition-all">
                  <div className="h-12 w-12 rounded-xl bg-linen2 flex items-center justify-center group-hover:bg-brass/15 transition-colors"><Icon name={CATEGORY_ICON[cat]} size={20} className="text-ink group-hover:text-brass" /></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-ink">{cat}</div>
                    <div className="text-xs text-slateSoft font-mono mt-0.5">{count} open roles</div>
                  </div>
                  <Icon name="chevronRight" size={16} className="text-slateSoft group-hover:text-brass group-hover:translate-x-0.5 transition-all" />
                </button>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-ink2 text-linen">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
          <Reveal><SectionEyebrow>The process</SectionEyebrow></Reveal>
          <Reveal delay={0.05}><h2 className="font-display text-3xl sm:text-4xl font-semibold max-w-xl">From application to day one, in three steps.</h2></Reveal>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { n: "01", t: "Create your profile", d: "Tell us your skills, your ideal role, and how you like to work. Takes about eight minutes." },
              { n: "02", t: "Get matched by a person", d: "A recruiter reviews your profile against real openings and reaches out about genuine fits, not spam." },
              { n: "03", t: "Start on day one, supported", d: "We help with contracts, onboarding logistics, and check in a month later to see how it's going." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="border-t border-white/15 pt-6">
                  <div className="font-mono text-brassLight text-sm">{s.n}</div>
                  <h3 className="font-display text-xl font-semibold mt-3">{s.t}</h3>
                  <p className="text-linen2/70 text-sm mt-2.5 leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <Reveal><SectionEyebrow>Fresh on the roster</SectionEyebrow></Reveal>
            <Reveal delay={0.05}><h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">Featured open roles</h2></Reveal>
          </div>
          <Reveal delay={0.1}><GhostButton onClick={() => navigate("/jobs")}>View all 120 roles</GhostButton></Reveal>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((job, i) => <JobCard key={job.id} job={job} delay={i * 0.06} />)}
        </div>
      </section>

      {/* WHY MERIVANE */}
      <section className="bg-linen border-y border-ink/8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <Reveal><SectionEyebrow>Why job seekers choose us</SectionEyebrow></Reveal>
              <Reveal delay={0.05}><h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">A staffing agency that reads past the keywords.</h2></Reveal>
              <Reveal delay={0.1}><p className="mt-5 text-slateSoft leading-relaxed max-w-md">We built Merivane because too many good candidates were getting filtered out by software before a human ever saw their name. Every application here gets a real look.</p></Reveal>
              <div className="grid sm:grid-cols-2 gap-5 mt-10">
                {VALUES.map((v, i) => (
                  <Reveal key={v.title} delay={0.1 + i * 0.06}>
                    <div className="rounded-2xl bg-white border border-ink/8 p-5">
                      <div className="h-10 w-10 rounded-lg bg-moss/10 flex items-center justify-center mb-3"><Icon name={v.icon} size={18} className="text-moss" /></div>
                      <div className="font-display font-semibold text-ink text-sm">{v.title}</div>
                      <p className="text-xs text-slateSoft mt-1.5 leading-relaxed">{v.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={0.15}>
              <div className="rounded-3xl overflow-hidden shadow-panel">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&h=1100&q=80" alt="Merivane recruiter celebrating a successful placement with a candidate" className="w-full h-[520px] object-cover" loading="lazy" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal><SectionEyebrow>From the roster</SectionEyebrow></Reveal>
          <Reveal delay={0.05}><h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-10">What placed candidates say</h2></Reveal>
        </div>
        <Marquee
          speed={48}
          items={TESTIMONIALS}
          renderItem={(t) => (
            <div className="w-[320px] sm:w-[380px] shrink-0 rounded-2xl bg-white border border-ink/8 p-6 shadow-card">
              <Icon name="quote" size={22} className="text-brass" />
              <p className="text-sm text-inkText/85 leading-relaxed mt-3">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-5">
                <img src={t.img} className="h-9 w-9 rounded-full object-cover" alt={t.name} loading="lazy" />
                <div>
                  <div className="text-sm font-medium text-ink">{t.name}</div>
                  <div className="text-xs text-slateSoft">{t.role}</div>
                </div>
              </div>
            </div>
          )}
        />
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <Reveal>
          <div className="rounded-3xl bg-ink text-linen p-10 sm:p-16 relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-brass/15 blur-3xl" />
            <div className="relative max-w-xl">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Ready to find work that fits your life?</h2>
              <p className="text-linen2/75 mt-4">Join thousands of professionals placed by Merivane in remote roles across 38 countries.</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <PrimaryButton onClick={() => navigate("/submit-resume")} className="bg-brass text-ink hover:bg-brassLight">Submit Your Resume</PrimaryButton>
                <GhostButton onClick={() => navigate("/jobs")} className="border-white/25 text-linen hover:bg-white/10">Browse 120 Open Roles</GhostButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
