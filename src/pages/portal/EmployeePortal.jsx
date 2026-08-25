import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import Icon from "../../components/Icon";
import { PrimaryButton } from "../../components/ui/Buttons";
import { useApp } from "../../context/AppContext";
import { PORTAL_NAV, PORTAL_SUPPORT_NAV, NOTIFICATIONS } from "../../data/portal";
import { cx } from "../../lib/utils";

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function EmployeePortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authLoading, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-5 py-28 text-center">
          <div className="h-14 w-14 rounded-full bg-linen2 flex items-center justify-center mx-auto mb-6"><Icon name="lock" size={22} className="text-ink" /></div>
          <h1 className="font-display text-3xl font-semibold text-ink">This portal is for signed-in employees</h1>
          <p className="text-slateSoft mt-3 leading-relaxed">Sign in to view your dashboard, missions, payroll, and benefits.</p>
          <div className="flex justify-center mt-8">
            <PrimaryButton onClick={() => navigate("/login")}>Sign In</PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="min-h-screen flex bg-linen">
      {/* Sidebar */}
      <aside className={cx("fixed lg:static inset-y-0 left-0 z-30 w-72 bg-ink text-linen flex flex-col transition-transform lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-6 pt-6">
          <Logo variant="light" size="sm" />
          <button className="lg:hidden text-linen2" onClick={() => setSidebarOpen(false)}><Icon name="close" size={20} /></button>
        </div>

        <nav className="mt-8 flex-1 overflow-y-auto px-4 pb-4 space-y-6">
          {PORTAL_NAV.map((section) => (
            <div key={section.group}>
              <div className="px-3 mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-linen2/40">{section.group}</div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={cx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive(item.path) ? "bg-brass text-ink" : "text-linen2/75 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <Icon name={item.icon} size={16} />{item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4 space-y-0.5">
          <button
            onClick={() => { navigate(PORTAL_SUPPORT_NAV.path); setSidebarOpen(false); }}
            className={cx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              isActive(PORTAL_SUPPORT_NAV.path) ? "bg-brass text-ink" : "text-linen2/75 hover:bg-white/8 hover:text-white"
            )}
          >
            <Icon name={PORTAL_SUPPORT_NAV.icon} size={16} />{PORTAL_SUPPORT_NAV.label}
          </button>
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-linen2/75 hover:bg-white/8 hover:text-white transition-colors">
            <Icon name="globe" size={16} />Back to website
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-10 bg-linen/90 backdrop-blur border-b border-ink/8 h-16 flex items-center justify-between px-5 sm:px-8 gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-ink" onClick={() => setSidebarOpen(true)}><Icon name="menu" size={22} /></button>
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border border-ink/10 px-3.5 py-2 w-64">
              <Icon name="search" size={14} className="text-slateSoft" /><span className="text-sm text-slateSoft/70">Search the portal…</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/portal/notifications")} className="relative text-ink">
              <Icon name="bell" size={19} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brass" />}
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-ink text-linen flex items-center justify-center text-xs font-semibold font-mono">{initials(user.name)}</span>
                <span className="hidden sm:block text-sm font-medium text-ink">{user.name}</span>
                <Icon name="chevronDown" size={14} className={cx("hidden sm:block text-slateSoft transition-transform", menuOpen && "rotate-180")} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white border border-ink/10 shadow-panel py-2 z-20">
                    <div className="px-4 py-3 border-b border-ink/8">
                      <div className="text-sm font-medium text-ink truncate">{user.name}</div>
                      <div className="text-xs text-slateSoft truncate">{user.email}</div>
                    </div>
                    <button onClick={() => { navigate("/portal/profile"); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-inkText/85 hover:bg-linen2/60 transition-colors">
                      <Icon name="user" size={15} />View Profile
                    </button>
                    <button onClick={() => { navigate("/portal/settings"); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-inkText/85 hover:bg-linen2/60 transition-colors">
                      <Icon name="settings" size={15} />Settings & Support
                    </button>
                    <div className="border-t border-ink/8 my-1.5" />
                    <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <Icon name="logout" size={15} />Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
