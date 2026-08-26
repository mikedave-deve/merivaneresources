import { useEffect, useState, useCallback, useRef } from "react";
import { upload } from "@vercel/blob/client";
import Icon from "../../components/Icon";
import { useToast } from "../../context/ToastContext";
import { cx } from "../../lib/utils";

function fmtDate(value) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DocumentsPanel() {
  const { notify } = useToast();
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/admin/employees?status=approved")
      .then((res) => res.json())
      .then((data) => {
        const list = data.employees || [];
        setEmployees(list);
        if (list.length > 0) setEmployeeId(list[0].id);
        else setLoading(false);
      });
  }, []);

  const loadDocuments = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/portal/documents?employeeId=${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load documents.");
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (employeeId) loadDocuments(employeeId); }, [employeeId, loadDocuments]);

  const onUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !employeeId) return;
    setUploading(true);
    setError("");
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/resume-upload" });
      const res = await fetch("/api/admin/portal/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, name: file.name, url: blob.url, downloadUrl: blob.downloadUrl || blob.url, contentType: file.type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDocuments((list) => [data.document, ...list]);
      notify("Document uploaded");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (employees.length === 0 && !loading) {
    return <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center mt-6"><p className="text-sm text-slateSoft">No approved employees yet.</p></div>;
  }

  return (
    <div className="mt-6 grid lg:grid-cols-[280px_1fr] gap-6">
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">Employee</label>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full rounded-xl border border-ink/12 px-3.5 py-3 text-sm bg-white">
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <button
          onClick={() => fileRef.current && fileRef.current.click()}
          disabled={uploading}
          className={cx("w-full mt-6 rounded-xl border-2 border-dashed border-ink/15 hover:border-brass py-8 flex flex-col items-center gap-2 text-slateSoft transition-colors", uploading && "opacity-60 pointer-events-none")}
        >
          <Icon name="upload" size={22} />
          <span className="text-sm">{uploading ? "Uploading…" : "Upload document — any file type"}</span>
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={onUpload} />
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>

      <div>
        {loading ? (
          <p className="text-sm text-slateSoft">Loading…</p>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center"><p className="text-sm text-slateSoft">No documents uploaded for this employee yet.</p></div>
        ) : (
          <div className="rounded-2xl bg-white border border-ink/8 shadow-card divide-y divide-ink/6">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-linen2 flex items-center justify-center shrink-0"><Icon name="file" size={16} className="text-ink" /></div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink truncate">{d.name}</div>
                    <div className="text-xs text-slateSoft">Uploaded {fmtDate(d.uploadedAt)}</div>
                  </div>
                </div>
                <a href={d.downloadUrl} target="_blank" rel="noreferrer" className="text-xs font-mono text-brass hover:underline shrink-0">View</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
