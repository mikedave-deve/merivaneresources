import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import Icon from "./Icon";

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer className="bg-ink text-linen2 mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <Logo variant="light" />
          <p className="mt-5 text-sm leading-relaxed text-linen2/70 max-w-xs">
            A remote-first talent agency placing careers, not just candidates, across 38 countries since 2013.
          </p>
          <div className="mt-6 space-y-2.5 text-sm text-linen2/75">
            <div className="flex items-start gap-2.5">
              <Icon name="pin" size={15} className="text-brassLight mt-0.5 shrink-0" />
              <span>9600 Great Hills Trail, Suite 300E, Austin, TX 78759</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="phone" size={15} className="text-brassLight shrink-0" />
              <span>+1 (234) 322 4395</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Icon name="mail" size={15} className="text-brassLight shrink-0" />
              <span>info@merivaneresources.com</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            {["linkedin", "twitter", "mail"].map((ic) => (
              <span
                key={ic}
                className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:border-brass hover:text-brassLight transition-colors cursor-pointer"
              >
                <Icon name={ic} size={15} />
              </span>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brassLight mb-4">Company</div>
          <ul className="space-y-2.5 text-sm text-linen2/75">
            <li><button onClick={() => navigate("/about")} className="hover:text-white">Our Story</button></li>
            <li><button onClick={() => navigate("/team")} className="hover:text-white">Team</button></li>
            <li><button onClick={() => navigate("/jobs")} className="hover:text-white">Open Roles</button></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brassLight mb-4">Candidates</div>
          <ul className="space-y-2.5 text-sm text-linen2/75">
            <li><button onClick={() => navigate("/submit-resume")} className="hover:text-white">Submit Resume</button></li>
            <li><button onClick={() => navigate("/login")} className="hover:text-white">Employee Login</button></li>
            <li><button onClick={() => navigate("/register")} className="hover:text-white">Create Account</button></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brassLight mb-4">The Roster Letter</div>
          <p className="text-sm text-linen2/70 mb-3">New remote roles in your inbox, every Friday.</p>
          {sent ? (
            <div className="flex items-center gap-2 text-sm text-mossLight">
              <Icon name="check" size={16} />
              Subscribed — welcome aboard.
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 min-w-0 rounded-full bg-white/8 border border-white/15 px-4 py-2.5 text-sm placeholder:text-linen2/40 focus:border-brass"
              />
              <button
                onClick={() => email.includes("@") && setSent(true)}
                className="rounded-full bg-brass text-ink px-4 py-2.5 text-sm font-medium shrink-0"
              >
                Join
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-linen2/50 font-mono">
          <span>© {new Date().getFullYear()} Merivane Resources. All rights reserved.</span>
          <span>Placing careers since 2013, 38 countries and counting.</span>
        </div>
      </div>
    </footer>
  );
}
