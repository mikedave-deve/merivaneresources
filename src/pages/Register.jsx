import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthShell from "../components/AuthShell";
import Field from "../components/ui/Field";
import Icon from "../components/Icon";
import { PrimaryButton, GhostButton } from "../components/ui/Buttons";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import { useApp } from "../context/AppContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const passwordsMatch = !form.confirmPassword || form.password === form.confirmPassword;
  const canSubmit =
    form.name && form.email && form.phone && form.password.length >= 8 && form.password === form.confirmPassword && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const user = await register(form);
      if (user.status === "approved") {
        navigate(user.role === "admin" ? "/admin" : "/portal");
      } else {
        setResult(user);
      }
    } catch (err) {
      setError(err.message || "Something went wrong creating your account.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <AuthShell imgSeed="merivane-register-pending" quote="Salary range was posted before I even applied. No games. That alone made me trust the process.">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="h-14 w-14 rounded-full bg-brass/10 flex items-center justify-center mb-6">
          <Icon name="clock" size={24} className="text-brass" />
        </motion.div>
        <h1 className="font-display text-3xl font-semibold text-ink leading-tight">Account created — awaiting approval</h1>
        <p className="text-sm text-slateSoft mt-3 leading-relaxed">
          Thanks, {result.name.split(" ")[0]}. A Merivane admin needs to approve your account before you can sign in.
          We'll let you know as soon as that happens — check {result.email} for the confirmation.
        </p>
        <GhostButton onClick={() => navigate("/login")} className="mt-8">Back to sign in</GhostButton>
      </AuthShell>
    );
  }

  return (
    <AuthShell imgSeed="merivane-register" quote="Salary range was posted before I even applied. No games. That alone made me trust the process.">
      <SectionEyebrow>Create your profile</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-ink">Join the roster</h1>
      <p className="text-sm text-slateSoft mt-2">Set up your employee account in under two minutes.</p>
      <div className="mt-8 space-y-4">
        <Field label="Full name" icon="user" value={form.name} onChange={update("name")} placeholder="Jordan Blake" />
        <Field label="Email address" icon="mail" type="email" value={form.email} onChange={update("email")} placeholder="you@email.com" />
        <Field label="Phone number" icon="phone" value={form.phone} onChange={update("phone")} placeholder="+1 (000) 000 0000" />
        <Field label="Password" icon="lock" type="password" value={form.password} onChange={update("password")} placeholder="At least 8 characters" />
        <div>
          <Field label="Confirm password" icon="lock" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Re-enter your password" onKeyDown={(e) => e.key === "Enter" && submit()} />
          {!passwordsMatch && <p className="text-xs text-red-500 mt-1.5">Passwords don't match.</p>}
        </div>
        {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
        <PrimaryButton onClick={submit} full className={!canSubmit ? "opacity-50 pointer-events-none" : ""}>{loading ? "Creating account…" : "Create Account"}</PrimaryButton>
      </div>
      <p className="text-sm text-slateSoft mt-6 text-center">Already have an account? <button onClick={() => navigate("/login")} className="text-ink font-medium hover:text-brass">Sign in</button></p>
    </AuthShell>
  );
}
