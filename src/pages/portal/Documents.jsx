import { useEffect, useState } from "react";
import Icon from "../../components/Icon";
import { PageHeader, SectionCard, EmptyState } from "../../components/portal/PortalPrimitives";

function fmtDate(value) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portal/documents")
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setDocuments(data.documents || []); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <PageHeader eyebrow="My info" title="Documents" subtitle="Resumes, offers, contracts, and tax forms on file." />
      {loading ? (
        <p className="text-sm text-slateSoft">Loading…</p>
      ) : documents.length === 0 ? (
        <EmptyState icon="file" title="No documents yet" subtitle="Documents your admin uploads will show up here." />
      ) : (
        <SectionCard>
          <div className="divide-y divide-ink/6">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-linen2 flex items-center justify-center shrink-0"><Icon name="file" size={16} className="text-ink" /></div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink truncate">{d.name}</div>
                    <div className="text-xs text-slateSoft">Uploaded {fmtDate(d.uploadedAt)}</div>
                  </div>
                </div>
                <a href={d.downloadUrl} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full border border-ink/12 flex items-center justify-center hover:bg-ink hover:text-linen transition-colors shrink-0">
                  <Icon name="download" size={14} />
                </a>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
