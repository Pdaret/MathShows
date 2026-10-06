// Shared article runtime: KaTeX math rendering + auto table of contents.
(function () {
  function renderMath() {
    if (!window.renderMathInElement) return;
    renderMathInElement(document.querySelector("article"), {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  }

  function buildToc() {
    const toc = document.querySelector(".toc ol");
    if (!toc) return;
    const heads = [...document.querySelectorAll("article h2[id]")];
    toc.innerHTML = heads.map(h => `<li><a href="#${h.id}">${h.textContent}</a></li>`).join("");
    const links = [...toc.querySelectorAll("a")];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "0px 0px -70% 0px" });
    heads.forEach(h => obs.observe(h));
  }

  window.addEventListener("DOMContentLoaded", () => { renderMath(); buildToc(); });
})();
