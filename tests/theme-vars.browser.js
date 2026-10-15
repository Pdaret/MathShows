// Run in browser console on any blog page, including random theme.
(() => {
  const cs = getComputedStyle(document.documentElement);
  const probe = document.createElement("span");
  probe.hidden = true;
  document.documentElement.append(probe);
  try {
    const values = Object.fromEntries(["accent", "font", "border"].map(name => {
      const value = cs.getPropertyValue(`--${name}`).trim();
      if (!CSS.supports("color", value)) return [name, value];
      probe.style.color = value;
      return [name, getComputedStyle(probe).color];
    }));
    if (values.font !== cs.getPropertyValue("--font").trim()) throw new Error("Font stack changed");
    if (!CSS.supports("color", values.accent)) throw new Error("Accent did not resolve");
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `17px ${values.font}`;
    if (!ctx.font.startsWith("17px")) throw new Error("Canvas font rejected");
    return "Mixed font/color theme values passed";
  } finally { probe.remove(); }
})();
