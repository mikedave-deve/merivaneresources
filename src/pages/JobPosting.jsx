import { useMemo } from "react";
import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import Icon from "../components/Icon";
import Badge from "../components/ui/Badge";
import Reveal from "../components/ui/Reveal";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import { PrimaryButton } from "../components/ui/Buttons";
import Seo from "../components/Seo";
import { CATEGORY_ICON } from "../data/categories";
import { ALL_JOBS } from "../data/jobs";
import { useApp } from "../context/AppContext";

function isoDateDaysAgo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function isoDateDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function JobPosting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPrefill } = useApp();

  const job = useMemo(() => ALL_JOBS.find((j) => String(j.id) === id), [id]);

  if (!job || !job.internal) {
    return <Navigate to="/jobs" replace />;
  }

  const salaryRange = job.salary.match(/\$(\d+)\s*[–-]\s*\$?(\d+)/);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.overview,
    datePosted: isoDateDaysAgo(job.daysAgo),
    validThrough: isoDateDaysFromNow(45),
    employmentType: job.type === "Part-time" ? "PART_TIME" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "Merivane Resources",
      sameAs: "https://www.merivaneresources.com/",
      logo: "https://www.merivaneresources.com/favicon.svg",
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "USA",
    },
    directApply: true,
    ...(salaryRange && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: {
          "@type": "QuantitativeValue",
          minValue: Number(salaryRange[1]),
          maxValue: Number(salaryRange[2]),
          unitText: "WEEK",
        },
      },
    }),
  };

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
      <Seo
        title={`${job.title} — Remote Job`}
        description={job.overview}
        path={`/jobs/${job.id}`}
        jsonLd={jsonLd}
      />
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slateSoft hover:text-ink mb-8">
        <Icon name="chevronRight" size={14} className="rotate-180" />
        Back to all roles
      </Link>

      <Reveal>
        <div className="rounded-2xl bg-white border border-ink/8 shadow-card p-6 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div className="h-12 w-12 rounded-xl bg-linen2 flex items-center justify-center shrink-0">
              <Icon name={CATEGORY_ICON[job.category] || "briefcase"} size={21} className="text-ink" />
            </div>
            <Badge tone="brass">Merivane Team</Badge>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mt-5 leading-tight">{job.title}</h1>
          <div className="text-sm text-slateSoft mt-1.5">{job.company}</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-ink font-mono">
            <span className="flex items-center gap-1.5"><Icon name="pin" size={14} />{job.location}</span>
            <span className="flex items-center gap-1.5"><Icon name="coin" size={14} />{job.salary}</span>
            <span className="flex items-center gap-1.5"><Icon name="briefcase" size={14} />{job.type}</span>
            <span className="flex items-center gap-1.5"><Icon name="clock" size={14} />{job.daysAgo}d ago</span>
          </div>

          <div className="mt-8">
            <SectionEyebrow>Overview</SectionEyebrow>
            <p className="text-sm sm:text-[15px] text-inkText/85 leading-relaxed mt-2">{job.overview}</p>
          </div>

          <div className="mt-8">
            <SectionEyebrow>Responsibilities</SectionEyebrow>
            <ul className="space-y-2 mt-2">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-inkText/85 leading-snug">
                  <Icon name="check" size={14} className="text-moss mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <SectionEyebrow>Requirements</SectionEyebrow>
            <ul className="space-y-2 mt-2">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-inkText/85 leading-snug">
                  <Icon name="check" size={14} className="text-moss mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <PrimaryButton
            full
            className="mt-10"
            onClick={() => {
              setPrefill(`${job.title} — ${job.company}`);
              navigate("/submit-resume");
            }}
          >
            Submit Resume
          </PrimaryButton>
        </div>
      </Reveal>
    </div>
  );
}
