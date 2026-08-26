import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Marquee from "./ui/Marquee";
import { ALL_JOBS } from "../data/jobs";

export default function RoleTicker() {
  const navigate = useNavigate();
  const items = useMemo(() => ALL_JOBS.filter((j) => j.internal), []);

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
            <span className="h-1.5 w-1.5 rounded-full bg-brass" />
            {job.title} <span className="text-linen2/40">·</span> {job.location.replace("Remote — ", "")}
            <span className="text-linen2/30 mx-2">/</span>
          </button>
        )}
      />
    </div>
  );
}
