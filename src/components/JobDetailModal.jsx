import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import Badge from "./ui/Badge";
import { PrimaryButton } from "./ui/Buttons";
import { CATEGORY_ICON } from "../data/categories";
import { useApp } from "../context/AppContext";

export default function JobDetailModal() {
  const { activeJob, setActiveJob, setPrefill } = useApp();
  const navigate = useNavigate();

  const close = () => setActiveJob(null);

  return (
    <AnimatePresence>
      {activeJob && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white border border-ink/8 shadow-panel p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="h-11 w-11 rounded-xl bg-linen2 flex items-center justify-center shrink-0">
                <Icon name={CATEGORY_ICON[activeJob.category] || "briefcase"} size={19} className="text-ink" />
              </div>
              <button
                onClick={close}
                aria-label="Close"
                className="h-9 w-9 rounded-full flex items-center justify-center text-slateSoft hover:bg-linen2 hover:text-ink transition-colors shrink-0"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="mt-4">
              {activeJob.internal ? <Badge tone="brass">Merivane Team</Badge> : <Badge tone="linen">{activeJob.type}</Badge>}
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink mt-3 leading-snug">{activeJob.title}</h2>
            <div className="text-sm text-slateSoft mt-1">{activeJob.company}</div>
            <div className="text-sm text-ink font-mono mt-2.5">{activeJob.location} · {activeJob.salary}</div>

            <div className="mt-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass mb-2">Overview</div>
              <p className="text-sm text-inkText/85 leading-relaxed">{activeJob.overview}</p>
            </div>

            <div className="mt-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass mb-2">Responsibilities</div>
              <ul className="space-y-2">
                {activeJob.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-inkText/85 leading-snug">
                    <Icon name="check" size={14} className="text-moss mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass mb-2">Requirements</div>
              <ul className="space-y-2">
                {activeJob.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-inkText/85 leading-snug">
                    <Icon name="check" size={14} className="text-moss mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <PrimaryButton
              full
              className="mt-8"
              onClick={() => {
                setPrefill(`${activeJob.title} — ${activeJob.company}`);
                close();
                navigate("/submit-resume");
              }}
            >
              Submit Resume
            </PrimaryButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
