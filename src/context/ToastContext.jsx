import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "../components/Icon";
import { cx } from "../lib/utils";

const ToastContext = createContext(null);

const TONE_STYLE = {
  success: { icon: "check", border: "border-moss/30", iconBg: "bg-moss/10", iconColor: "text-moss" },
  info: { icon: "bell", border: "border-brass/30", iconBg: "bg-brass/10", iconColor: "text-brass" },
  error: { icon: "alert", border: "border-red-200", iconBg: "bg-red-50", iconColor: "text-red-600" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const style = TONE_STYLE[t.tone] || TONE_STYLE.success;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cx("pointer-events-auto flex items-center gap-2.5 bg-white border shadow-panel rounded-xl pl-3 pr-4 py-2.5 max-w-xs", style.border)}
              >
                <span className={cx("h-6 w-6 rounded-full flex items-center justify-center shrink-0", style.iconBg)}>
                  <Icon name={style.icon} size={13} className={style.iconColor} />
                </span>
                <span className="text-xs text-inkText/85 leading-snug">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
