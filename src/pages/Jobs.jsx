import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import JobCard from "../components/JobCard";
import { ALL_JOBS } from "../data/jobs";
import { CATEGORIES } from "../data/categories";
import { cx } from "../lib/utils";

export default function Jobs() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [merivaneOnly, setMerivaneOnly] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 9;

  const filtered = useMemo(() => {
    return ALL_JOBS.filter((j) => {
      if (category !== "All" && j.category !== category) return false;
      if (remoteOnly && !j.remote) return false;
      if (merivaneOnly && !j.internal) return false;
      if (q && !(j.title.toLowerCase().includes(q.toLowerCase()) || j.company.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [q, category, remoteOnly, merivaneOnly]);

  useEffect(() => { setPage(1); }, [q, category, remoteOnly, merivaneOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const shown = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <section className="bg-ink2 text-linen">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-12">
          <SectionEyebrow>120 open roles, updated weekly</SectionEyebrow>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold">Browse the current roster</h1>
          <p className="text-linen2/70 mt-4 max-w-xl">Including 20 remote positions on the Merivane Resources team itself.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-panel border border-ink/8 p-5 sm:p-6 grid md:grid-cols-[1.5fr_1fr_auto_auto] gap-4 items-end">
          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Search</span>
            <div className="relative">
              <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateSoft" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title or company" className="w-full rounded-xl border border-ink/12 pl-10 pr-3.5 py-3 text-sm focus:border-brass focus:ring-1 focus:ring-brass" />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm focus:border-brass focus:ring-1 focus:ring-brass bg-white">
              <option>All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <button onClick={() => setRemoteOnly((r) => !r)} className={cx("rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors", remoteOnly ? "bg-moss/10 border-moss/40 text-moss" : "border-ink/12 text-slateSoft")}>
            <Icon name="globe" size={15} />Remote only
          </button>
          <button onClick={() => setMerivaneOnly((m) => !m)} className={cx("rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors", merivaneOnly ? "bg-brass/15 border-brass/40 text-brass" : "border-ink/12 text-slateSoft")}>
            <Icon name="sparkle" size={15} />Merivane roles
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slateSoft font-mono">{filtered.length} role{filtered.length !== 1 ? "s" : ""} found</div>
        </div>
        {shown.length === 0 ? (
          <div className="text-center py-24">
            <Icon name="search" size={30} className="mx-auto text-slateSoft mb-3" />
            <div className="font-display text-xl text-ink">No roles match those filters</div>
            <p className="text-sm text-slateSoft mt-1">Try clearing a filter or searching a different term.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shown.map((job, i) => <JobCard key={job.id} job={job} delay={(i % 6) * 0.05} />)}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-10 w-10 rounded-full border border-ink/12 flex items-center justify-center disabled:opacity-30"><Icon name="chevronRight" size={16} className="rotate-180" /></button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={cx("h-10 w-10 rounded-full text-sm font-mono flex items-center justify-center transition-colors", page === i + 1 ? "bg-ink text-linen" : "text-slateSoft hover:bg-linen2")}>{i + 1}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-10 w-10 rounded-full border border-ink/12 flex items-center justify-center disabled:opacity-30"><Icon name="chevronRight" size={16} /></button>
          </div>
        )}
      </section>
    </div>
  );
}
