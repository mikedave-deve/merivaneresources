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

  return (
    <AuthShell imgSeed="merivane-forgot" quote="A month after I started, my recruiter checked in just to ask how it was going.">
      <SectionEyebrow>Account recovery</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-ink">Reset your password</h1>
      {sent ? (
        <div className="mt-8 rounded-xl bg-moss/10 border border-moss/25 p-5">
          <div className="flex items-center gap-2 text-moss font-medium text-sm"><Icon name="check" size={16} />Reset link sent</div>
          <p className="text-sm text-slateSoft mt-2">Check {email} for instructions to reset your password.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slateSoft mt-2">Enter your email and we'll send a link to reset it.</p>
          <div className="mt-8 space-y-4">
            <Field label="Email address" icon="mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={(e) => e.key === "Enter" && email.includes("@") && setSent(true)} />
            <PrimaryButton onClick={() => email.includes("@") && setSent(true)} full>Send Reset Link</PrimaryButton>
          </div>
        </>
      )}
      <p className="text-sm text-slateSoft mt-6 text-center"><button onClick={() => navigate("/login")} className="text-ink font-medium hover:text-brass">← Back to sign in</button></p>
    </AuthShell>
  );
}
