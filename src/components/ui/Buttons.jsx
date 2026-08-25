import { motion } from "framer-motion";
import Icon from "../Icon";
import { cx } from "../../lib/utils";

export function PrimaryButton({ children, onClick, className = "", type = "button", full = false, icon = "arrowRight" }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full bg-ink text-linen px-6 py-3.5 font-medium text-sm shadow-card hover:shadow-cardHover hover:bg-ink2 transition-colors",
        full && "w-full",
        className
      )}
    >
      {children}
      {icon && <Icon name={icon} size={16} />}
    </motion.button>
  );
}

export function GhostButton({ children, onClick, className = "", full = false, icon = null }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-transparent text-ink px-6 py-3.5 font-medium text-sm hover:bg-ink/5 transition-colors",
        full && "w-full",
        className
      )}
    >
      {children}
      {icon && <Icon name={icon} size={16} />}
    </motion.button>
  );
}
