import Icon from "../components/Icon";
import Reveal from "../components/ui/Reveal";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import Seo from "../components/Seo";
import { TEAM } from "../data/team";

export default function Team() {
  return (
    <div>
      <Seo
        title="Meet the Team"
        description="Meet the recruiters and specialists behind Merivane Resources — a small, senior team spread across five time zones, working your applications personally."
        path="/team"
      />
      <section className="bg-ink text-linen">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-16 pb-16 text-center">
          <SectionEyebrow>The people behind the roster</SectionEyebrow>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">Meet the Merivane team</h1>
          <p className="text-linen2/75 mt-5 max-w-xl mx-auto">A small, senior team spread across five time zones, so someone is always awake to answer.</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={(i % 4) * 0.06}>
              <div className="group rounded-2xl bg-white border border-ink/8 overflow-hidden shadow-card hover:shadow-cardHover transition-shadow">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-5">
                  <div className="font-display font-semibold text-ink">{m.name}</div>
                  <div className="text-xs font-mono uppercase tracking-wider text-brass mt-1">{m.role}</div>
                  <p className="text-sm text-slateSoft mt-3 leading-relaxed">{m.blurb}</p>
                  <div className="flex gap-2 mt-4">
                    <span className="h-8 w-8 rounded-full bg-linen2 flex items-center justify-center hover:bg-ink hover:text-linen transition-colors cursor-pointer"><Icon name="linkedin" size={13} /></span>
                    <span className="h-8 w-8 rounded-full bg-linen2 flex items-center justify-center hover:bg-ink hover:text-linen transition-colors cursor-pointer"><Icon name="mail" size={13} /></span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
