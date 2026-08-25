import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Field from "../components/ui/Field";
import Icon from "../components/Icon";
import { PrimaryButton } from "../components/ui/Buttons";
import SectionEyebrow from "../components/ui/SectionEyebrow";
import { useApp } from "../context/AppContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email || !password || loading) return;
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/portal");
    } catch (err) {
      setError(err.message || "Something went wrong signing in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell imgSeed="merivane-login" quote="Applied to fifty jobs, heard back from one — Merivane. That was the whole difference.">
      <SectionEyebrow>Employee portal</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-ink">Welcome back</h1>
      <p className="text-sm text-slateSoft mt-2">Sign in to track applications and manage your profile.</p>
      <div className="mt-8 space-y-4">
        <Field label="Email address" icon="mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={(e) => e.key === "Enter" && submit()} />
        <Field label="Password" icon="lock" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && submit()} />
        <div className="flex justify-end -mt-1"><button onClick={() => navigate("/forgot-password")} className="text-xs text-brass hover:underline">Forgot password?</button></div>
        {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><Icon name="alert" size={14} />{error}</p>}
        <PrimaryButton onClick={submit} full icon={loading ? null : "arrowRight"}>{loading ? "Signing in…" : "Sign In"}</PrimaryButton>
      </div>
      <p className="text-sm text-slateSoft mt-6 text-center">New to Merivane? <button onClick={() => navigate("/register")} className="text-ink font-medium hover:text-brass">Create an account</button></p>
    </AuthShell>
  );
}
