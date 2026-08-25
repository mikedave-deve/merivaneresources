import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Marquee from "./ui/Marquee";
import { ALL_JOBS } from "../data/jobs";
import { cx } from "../lib/utils";

export default function RoleTicker() {
  const navigate = useNavigate();
  const items = useMemo(() => ALL_JOBS.slice(0, 24), []);

  return (
    <div className="bg-ink2 border-b border-white/5 marquee-pause">
      <Marquee
        speed={38}
        items={items}
        renderItem={(job) => (
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-2 whitespace-nowrap px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-linen2 hover:text-brassLight transition-colors"
          >
            <span className={cx("h-1.5 w-1.5 rounded-full", job.internal ? "bg-brass" : "bg-mossLight")} />
            {job.title} <span className="text-linen2/40">·</span> {job.location.replace("Remote — ", "")}
            <span className="text-linen2/30 mx-2">/</span>
          </button>
        )}
      />
    </div>
  );
}
