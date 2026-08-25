// Joins class names, filtering out falsy values.
// Usage: cx("base", condition && "conditional", another && "class")
export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
