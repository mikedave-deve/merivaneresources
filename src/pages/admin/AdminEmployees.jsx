import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import Icon from "../../components/Icon";
import { PrimaryButton, GhostButton } from "../../components/ui/Buttons";
import { useApp } from "../../context/AppContext";
import { cx } from "../../lib/utils";
import EmployeesPanel from "./EmployeesPanel";
import TimeOffPanel from "./TimeOffPanel";
import MissionsPanel from "./MissionsPanel";
import DocumentsPanel from "./DocumentsPanel";
import IdentityPanel from "./IdentityPanel";
import PayrollPanel from "./PayrollPanel";
import RetirementPanel from "./RetirementPanel";

const SECTIONS = [
  { id: "employees", label: "Employees", subtitle: "Review new employee registrations before they can sign in to the portal." },
  { id: "timeoff", label: "Time Off", subtitle: "Approve or deny time off requests from employees." },
  { id: "missions", label: "Missions", subtitle: "Send instructions and manage priority for each employee." },
  { id: "documents", label: "Documents", subtitle: "Upload documents for employees to download from their portal." },
  { id: "identity", label: "Identity", subtitle: "Review identity verification submissions." },
  { id: "payroll", label: "Payroll", subtitle: "Set balance, pay schedule, and add payslips for each employee." },
  { id: "retirement", label: "Retirement", subtitle: "Set 401(k) balance, contribution rate, and employer match." },
];

export default function AdminEmployees() {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading, logout } = useApp();
  const [section, setSection] = useState("employees");

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-5 py-28 text-center">
          <div className="h-14 w-14 rounded-full bg-linen2 flex items-center justify-center mx-auto mb-6"><Icon name="lock" size={22} className="text-ink" /></div>
          <h1 className="font-display text-3xl font-semibold text-ink">Admin sign-in required</h1>
          <p className="text-slateSoft mt-3 leading-relaxed">Sign in with an admin account to manage employees.</p>
          <PrimaryButton onClick={() => navigate("/login")} className="mt-8">Sign In</PrimaryButton>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-5 py-28 text-center">
          <div className="h-14 w-14 rounded-full bg-linen2 flex items-center justify-center mx-auto mb-6"><Icon name="shield" size={22} className="text-ink" /></div>
          <h1 className="font-display text-3xl font-semibold text-ink">Admins only</h1>
          <p className="text-slateSoft mt-3 leading-relaxed">Your account doesn't have admin access.</p>
          <PrimaryButton onClick={() => navigate("/portal")} className="mt-8">Go to your portal</PrimaryButton>
        </div>
      </div>
    );
  }

  const active = SECTIONS.find((s) => s.id === section);

  return (
    <div className="min-h-screen bg-linen">
      <div className="sticky top-0 z-10 bg-linen/90 backdrop-blur border-b border-ink/8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slateSoft hidden sm:block">{user.name}</span>
            <GhostButton icon={null} onClick={() => { logout(); navigate("/"); }} className="!px-4 !py-2 !text-xs">
              Log out
            </GhostButton>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-brass mb-2">Admin</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">{active.label}</h1>
        <p className="text-slateSoft mt-3 leading-relaxed max-w-xl">{active.subtitle}</p>

        <div className="flex flex-wrap gap-2 mt-8">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cx(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                section === s.id ? "bg-ink text-linen" : "bg-white border border-ink/12 text-slateSoft hover:text-ink"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {section === "employees" && <EmployeesPanel />}
        {section === "timeoff" && <TimeOffPanel />}
        {section === "missions" && <MissionsPanel />}
        {section === "documents" && <DocumentsPanel />}
        {section === "identity" && <IdentityPanel />}
        {section === "payroll" && <PayrollPanel />}
        {section === "retirement" && <RetirementPanel />}
      </div>
    </div>
  );
}
