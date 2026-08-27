import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { upload } from "@vercel/blob/client";
import Icon from "../components/Icon";
import Field from "../components/ui/Field";
import { PrimaryButton, GhostButton } from "../components/ui/Buttons";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import Seo from "../components/Seo";
import { useApp } from "../context/AppContext";
import { cx } from "../lib/utils";

const EXPERIENCE_LEVELS = [
  "Entry Level (0–1 yrs)",
  "Mid Level (2–4 yrs)",
  "Senior Level (5–8 yrs)",
  "Lead / Manager (8+ yrs)",
];

const MAX_RESUME_BYTES = 15 * 1024 * 1024; // 15MB, mirrors api/resume-upload.js

function formatBytes(bytes) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function SubmitResume() {
  const { prefill } = useApp();
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: prefill || "", experience: "", message: "" });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (prefill) setForm((f) => ({ ...f, role: prefill }));
  }, [prefill]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onFileChange = (e) => {
    const picked = e.target.files && e.target.files[0];
    if (!picked) {
      setFile(null);
      return;
    }
    if (picked.size > MAX_RESUME_BYTES) {
      setFile(null);
      setFileError(`That file is too large — please keep it under ${formatBytes(MAX_RESUME_BYTES)}.`);
      e.target.value = "";
      return;
    }
    setFileError("");
    setFile(picked);
  };

  const canSubmit = form.name.trim() && form.email.includes("@") && form.role.trim() && form.experience && file && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/resume-upload",
      });

      const res = await fetch("/api/submit-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          resumeUrl: blob.url,
          resumeName: file.name,
          resumeSize: file.size,
          resumeType: file.type,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong submitting your application.");

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-28 text-center">
        <Seo title="Submit Your Resume" description="Tell us about yourself once, and a real recruiter will match you against open roles on the Merivane Resources roster." path="/submit-resume" />
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="h-16 w-16 rounded-full bg-moss/10 flex items-center justify-center mx-auto mb-6">
          <Icon name="check" size={28} className="text-moss" />
        </motion.div>
        <h1 className="font-display text-3xl font-semibold text-ink">Resume received, {form.name.split(" ")[0]}.</h1>
        <p className="text-slateSoft mt-4 leading-relaxed">A Merivane recruiter reviews every application personally — expect to hear something back within five business days, even if it's just a note to say we're still looking.</p>
        <GhostButton
          onClick={() => {
            setForm({ name: "", email: "", phone: "", role: "", experience: "", message: "" });
            setFile(null);
            setSubmitted(false);
          }}
          className="mt-8"
        >
          Submit another application
        </GhostButton>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-[1fr_1.3fr] gap-14">
      <Seo title="Submit Your Resume" description="Tell us about yourself once, and a real recruiter will match you against open roles on the Merivane Resources roster. No cost to candidates, ever." path="/submit-resume" />
      <div>
        <SectionEyebrow>Candidate application</SectionEyebrow>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">Submit your resume</h1>
        <p className="text-slateSoft mt-4 leading-relaxed">Tell us about yourself once, and a real recruiter — not a filter — will match you against open roles on the roster.</p>
        <div className="mt-8 rounded-2xl overflow-hidden shadow-card">
          <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&h=500&q=80" alt="Candidate preparing an application" className="w-full h-56 object-cover" loading="lazy" />
        </div>
        <div className="mt-6 space-y-3 text-sm text-slateSoft">
          <div className="flex items-center gap-2"><Icon name="check" size={14} className="text-moss" />No cost to candidates, ever</div>
          <div className="flex items-center gap-2"><Icon name="check" size={14} className="text-moss" />Human review within 5 business days</div>
          <div className="flex items-center gap-2"><Icon name="check" size={14} className="text-moss" />Your data is never sold to third parties</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Full name" icon="user" value={form.name} onChange={update("name")} placeholder="Jordan Blake" />
          <Field label="Email address" icon="mail" type="email" value={form.email} onChange={update("email")} placeholder="jordan@email.com" />
          <Field label="Phone (optional)" icon="phone" value={form.phone} onChange={update("phone")} placeholder="+1 (000) 000 0000" />
          <Field label="Role you're applying for" icon="briefcase" value={form.role} onChange={update("role")} placeholder="e.g. Data Analyst" />
          <Field
            label="Experience level"
            icon="trend"
            type="select"
            value={form.experience}
            onChange={update("experience")}
            placeholder="Select your experience level"
            options={EXPERIENCE_LEVELS}
          />
        </div>
        <div className="mt-5">
          <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Resume / CV</span>
          <button
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
            className={cx(
              "w-full rounded-xl border-2 border-dashed py-8 flex flex-col items-center gap-2 transition-colors",
              file ? "border-moss/40 text-ink bg-mossLight/20" : "border-ink/15 hover:border-brass text-slateSoft"
            )}
          >
            <Icon name={file ? "check" : "upload"} size={22} className={file ? "text-moss" : ""} />
            <span className="text-sm">
              {file ? `${file.name}${file.size ? ` · ${formatBytes(file.size)}` : ""}` : "Click to upload your resume — any file type"}
            </span>
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
          {fileError && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><Icon name="alert" size={12} />{fileError}</p>}
        </div>
        <label className="block mt-5">
          <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">A note to your recruiter (optional)</span>
          <textarea value={form.message} onChange={update("message")} rows="4" placeholder="Anything you'd like us to know about what you're looking for." className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm focus:border-brass focus:ring-1 focus:ring-brass resize-none" />
        </label>
        {submitError && (
          <p className="text-sm text-red-600 mt-4 flex items-center gap-1.5"><Icon name="alert" size={14} />{submitError}</p>
        )}
        <PrimaryButton
          onClick={handleSubmit}
          full
          icon={submitting ? null : "arrowRight"}
          className={cx("mt-6", !canSubmit && "opacity-50 pointer-events-none")}
        >
          {submitting ? (
            <>
              <Icon name="loader" size={16} className="animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Application"
          )}
        </PrimaryButton>
        <p className="text-[11px] text-slateSoft mt-3 text-center">By submitting, you agree to be contacted by a Merivane recruiter about this and similar roles.</p>
      </div>
    </div>
  );
}
