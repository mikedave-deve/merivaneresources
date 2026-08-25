import { Fragment } from "react";
import { cx } from "../../lib/utils";

export default function Marquee({ items, renderItem, speed = 34, className = "" }) {
  return (
    <div className={cx("relative overflow-hidden marquee-pause", className)}>
      <div className="flex w-max gap-4 animate-marquee" style={{ "--marquee-duration": `${speed}s` }}>
        {[...items, ...items].map((it, i) => (
          <Fragment key={i}>{renderItem(it, i)}</Fragment>
        ))}
      </div>
    </div>
  );
}
