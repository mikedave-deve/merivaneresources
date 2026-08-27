import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Field from "../components/ui/Field";
import Icon from "../components/Icon";
import { PrimaryButton } from "../components/ui/Buttons";
import SectionEyebrow from "../components/ui/SectionEyebrow";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.includes("@") || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell imgSeed="merivane-forgot" quote="A month after I started, my recruiter checked in just to ask how it was going." title="Reset Your Password">
      <SectionEyebrow>Account recovery</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-ink">Reset your password</h1>
      {sent ? (
        <div className="mt-8 rounded-xl bg-moss/10 border border-moss/25 p-5">
          <div className="flex items-center gap-2 text-moss font-medium text-sm"><Icon name="check" size={16} />Reset link sent</div>
          <p className="text-sm text-slateSoft mt-2">If an account exists for {email}, check your inbox for a link to reset your password. It expires in 30 minutes.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slateSoft mt-2">Enter your email and we'll send a link to reset it.</p>
          <div className="mt-8 space-y-4">
            <Field label="Email address" icon="mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={(e) => e.key === "Enter" && submit()} />
            {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
            <PrimaryButton onClick={submit} full>{loading ? "Sending…" : "Send Reset Link"}</PrimaryButton>
          </div>
        </>
      )}
      <p className="text-sm text-slateSoft mt-6 text-center"><button onClick={() => navigate("/login")} className="text-ink font-medium hover:text-brass">← Back to sign in</button></p>
    </AuthShell>
  );
}
