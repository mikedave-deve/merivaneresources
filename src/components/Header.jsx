import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import Icon from "./Icon";
import { GhostButton, PrimaryButton } from "./ui/Buttons";
import { cx } from "../lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Our Team", href: "/team" },
  { label: "Submit Resume", href: "/submit-resume" },
];

export default function Header({ isAuthed, isAdmin }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const portalPath = isAdmin ? "/admin" : "/portal";

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink/8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        <button onClick={() => navigate("/")}>
          <Logo />
        </button>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => navigate(l.href)}
              className={cx(
                "text-sm font-medium tracking-wide transition-colors",
                pathname === l.href ? "text-ink" : "text-slateSoft hover:text-ink"
              )}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <GhostButton onClick={() => navigate(isAuthed ? portalPath : "/login")} className="px-5 py-2.5 text-sm">
            <Icon name="user" size={15} />
            {isAuthed ? "My Portal" : "Employee Login"}
          </GhostButton>
          <PrimaryButton onClick={() => navigate("/jobs")} className="px-5 py-2.5 text-sm">
            Browse Jobs
          </PrimaryButton>
        </div>
        <button className="lg:hidden text-ink" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          <Icon name={open ? "close" : "menu"} size={24} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-ink/8 bg-paper"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.href}
                  onClick={() => {
                    navigate(l.href);
                    setOpen(false);
                  }}
                  className="text-left py-2.5 text-base font-medium text-ink border-b border-ink/6"
                >
                  {l.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-3">
                <GhostButton
                  onClick={() => {
                    navigate(isAuthed ? portalPath : "/login");
                    setOpen(false);
                  }}
                  full
                >
                  {isAuthed ? "My Portal" : "Employee Login"}
                </GhostButton>
                <PrimaryButton
                  onClick={() => {
                    navigate("/jobs");
                    setOpen(false);
                  }}
                  full
                >
                  Browse Jobs
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
