import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Field from "../components/ui/Field";
import { PrimaryButton } from "../components/ui/Buttons";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import { useApp } from "../context/AppContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const passwordsMatch = !form.confirmPassword || form.password === form.confirmPassword;
  const canSubmit = form.name && form.email && form.phone && form.password && form.confirmPassword && form.password === form.confirmPassword;

  const submit = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login();
      navigate("/portal");
    }, 800);
  };

  return (
    <AuthShell imgSeed="merivane-register" quote="Salary range was posted before I even applied. No games. That alone made me trust the process.">
      <SectionEyebrow>Create your profile</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-ink">Join the roster</h1>
      <p className="text-sm text-slateSoft mt-2">Set up your candidate profile in under two minutes.</p>
      <div className="mt-8 space-y-4">
        <Field label="Full name" icon="user" value={form.name} onChange={update("name")} placeholder="Jordan Blake" />
        <Field label="Email address" icon="mail" type="email" value={form.email} onChange={update("email")} placeholder="you@email.com" />
        <Field label="Phone number" icon="phone" value={form.phone} onChange={update("phone")} placeholder="+1 (000) 000 0000" />
        <Field label="Password" icon="lock" type="password" value={form.password} onChange={update("password")} placeholder="Create a password" />
        <div>
          <Field label="Confirm password" icon="lock" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Re-enter your password" onKeyDown={(e) => e.key === "Enter" && submit()} />
          {!passwordsMatch && <p className="text-xs text-red-500 mt-1.5">Passwords don't match.</p>}
        </div>
        <PrimaryButton onClick={submit} full className={!canSubmit ? "opacity-50 pointer-events-none" : ""}>{loading ? "Creating account…" : "Create Account"}</PrimaryButton>
      </div>
      <p className="text-sm text-slateSoft mt-6 text-center">Already have an account? <button onClick={() => navigate("/login")} className="text-ink font-medium hover:text-brass">Sign in</button></p>
    </AuthShell>
  );
}
