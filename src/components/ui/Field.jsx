import { useState } from "react";
import Icon from "../Icon";
import { cx } from "../../lib/utils";

export default function Field({ label, icon, type = "text", value, onChange, placeholder, onKeyDown, options }) {
  const [show, setShow] = useState(false);
  const inputType = type === "password" && show ? "text" : type;

  if (type === "select") {
    return (
      <label className="block">
        <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">{label}</span>
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-slateSoft pointer-events-none">
              <Icon name={icon} size={16} />
            </span>
          )}
          <select
            value={value}
            onChange={onChange}
            className={cx(
              "w-full rounded-xl border border-ink/12 bg-white/70 py-3 pr-10 text-sm focus:border-brass focus:ring-1 focus:ring-brass transition-colors appearance-none",
              icon ? "pl-10" : "pl-3.5",
              !value && "text-slateSoft/60"
            )}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {(options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="absolute right-3.5 text-slateSoft pointer-events-none">
            <Icon name="chevronDown" size={16} />
          </span>
        </div>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wider text-slateSoft mb-1.5">{label}</span>
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-slateSoft">
            <Icon name={icon} size={16} />
          </span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          className={cx(
            "w-full rounded-xl border border-ink/12 bg-white/70 py-3 text-sm placeholder:text-slateSoft/60 focus:border-brass focus:ring-1 focus:ring-brass transition-colors",
            icon ? "pl-10" : "pl-3.5",
            type === "password" ? "pr-10" : "pr-3.5"
          )}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 text-slateSoft hover:text-ink"
          >
            <Icon name={show ? "eyeOff" : "eye"} size={16} />
          </button>
        )}
      </div>
    </label>
  );
}
