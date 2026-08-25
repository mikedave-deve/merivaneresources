import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Field from "../components/ui/Field";
import Icon from "../components/Icon";
import { PrimaryButton, GhostButton } from "../components/ui/Buttons";
import SectionEyebrow from "../components/ui/SectionEyebrow";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const passwordsMatch = !confirmPassword || password === confirmPassword;
  const canSubmit = token && password.length >= 8 && password === confirmPassword && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell imgSeed="merivane-reset" quote="A month after I started, my recruiter checked in just to ask how it was going.">
        <SectionEyebrow>Account recovery</SectionEyebrow>
        <h1 className="font-display text-3xl font-semibold text-ink">Invalid reset link</h1>
        <p className="text-sm text-slateSoft mt-3 leading-relaxed">This link is missing its reset token. Request a new one from the forgot password page.</p>
        <GhostButton onClick={() => navigate("/forgot-password")} className="mt-8">Request a new link</GhostButton>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell imgSeed="merivane-reset-done" quote="A month after I started, my recruiter checked in just to ask how it was going.">
        <div className="rounded-xl bg-moss/10 border border-moss/25 p-5">
          <div className="flex items-center gap-2 text-moss font-medium text-sm"><Icon name="check" size={16} />Password updated</div>
          <p className="text-sm text-slateSoft mt-2">Your password has been changed. Sign in with your new password.</p>
        </div>
        <PrimaryButton onClick={() => navigate("/login")} full className="mt-6">Back to sign in</PrimaryButton>
      </AuthShell>
    );
  }

  return (
    <AuthShell imgSeed="merivane-reset" quote="A month after I started, my recruiter checked in just to ask how it was going.">
      <SectionEyebrow>Account recovery</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-ink">Choose a new password</h1>
      <p className="text-sm text-slateSoft mt-2">Enter and confirm your new password below.</p>
      <div className="mt-8 space-y-4">
        <Field label="New password" icon="lock" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        <div>
          <Field label="Confirm new password" icon="lock" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your new password" onKeyDown={(e) => e.key === "Enter" && submit()} />
          {!passwordsMatch && <p className="text-xs text-red-500 mt-1.5">Passwords don't match.</p>}
        </div>
        {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
        <PrimaryButton onClick={submit} full className={!canSubmit ? "opacity-50 pointer-events-none" : ""}>{loading ? "Updating…" : "Update Password"}</PrimaryButton>
      </div>
      <p className="text-sm text-slateSoft mt-6 text-center"><button onClick={() => navigate("/login")} className="text-ink font-medium hover:text-brass">← Back to sign in</button></p>
    </AuthShell>
  );
}
