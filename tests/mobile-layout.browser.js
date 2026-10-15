// Run in browser console on home/explore/article at 320–600px after page load.
(() => {
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  assert(innerWidth <= 600, "Use mobile viewport (320–600px)");
  assert(document.documentElement.scrollWidth <= document.documentElement.clientWidth, "Horizontal page overflow");
  assert(document.querySelector(".site-header").getBoundingClientRect().height <= 110, "Closed header too tall");
  const links = [...document.querySelectorAll(".site-nav a")];
  assert(links.length === 3, "Three primary routes must remain visible");
  links.forEach(a => assert(a.getBoundingClientRect().height >= 44, "Navigation touch target too small"));
  const menu = document.querySelector(".appearance");
  const wasOpen = menu.open;
  menu.open = true;
  try {
    const panel = document.querySelector(".appearance-panel").getBoundingClientRect();
    assert(panel.left >= 0 && panel.right <= innerWidth, "Appearance panel outside viewport");
    assert(document.querySelector("#palette-select"), "Palette control missing");
    assert(document.querySelector("#theme-toggle"), "Theme control missing");
  } finally { menu.open = wasOpen; }
  return "Mobile layout checks passed";
})();
