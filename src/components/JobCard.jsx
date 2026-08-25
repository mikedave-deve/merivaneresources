import { motion } from "framer-motion";
import Icon from "./Icon";
import Badge from "./ui/Badge";
import Reveal from "./ui/Reveal";
import { useApp } from "../context/AppContext";
import { CATEGORY_ICON } from "../data/categories";

export default function JobCard({ job, delay = 0 }) {
  const { setActiveJob } = useApp();

  return (
    <Reveal delay={delay}>
      <motion.div
        whileHover={{ y: -5 }}
        onClick={() => setActiveJob(job)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setActiveJob(job)}
        className="h-full flex flex-col rounded-2xl bg-white border border-ink/8 p-6 shadow-card hover:shadow-cardHover transition-shadow cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="h-11 w-11 rounded-xl bg-linen2 flex items-center justify-center shrink-0">
            <Icon name={CATEGORY_ICON[job.category] || "briefcase"} size={19} className="text-ink" />
          </div>
          {job.internal ? <Badge tone="brass">Merivane Team</Badge> : <Badge tone="linen">{job.type}</Badge>}
        </div>
        <h3 className="font-display text-lg font-semibold text-ink leading-snug">{job.title}</h3>
        <div className="text-sm text-slateSoft mt-1">{job.company}</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-xs text-slateSoft font-mono">
          <span className="flex items-center gap-1.5"><Icon name="pin" size={13} />{job.location}</span>
          <span className="flex items-center gap-1.5"><Icon name="coin" size={13} />{job.salary}</span>
          <span className="flex items-center gap-1.5"><Icon name="clock" size={13} />{job.daysAgo}d ago</span>
        </div>
        <ul className="mt-4 space-y-1.5 flex-1">
          {job.requirements.slice(0, 3).map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-inkText/80 leading-snug">
              <Icon name="check" size={13} className="text-moss mt-0.5 shrink-0" />
              {r}
            </li>
          ))}
        </ul>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveJob(job);
          }}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 py-2.5 text-sm font-medium text-ink hover:bg-ink hover:text-linen transition-colors"
        >
          View Details <Icon name="arrowRight" size={14} />
        </button>
      </motion.div>
    </Reveal>
  );
}
