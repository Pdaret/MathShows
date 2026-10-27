// Run in a loaded article's browser console at mobile and desktop widths.
(() => {
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const header = document.querySelector('.site-header .container').getBoundingClientRect();
  const toc = document.querySelector('.toc');
  assert(document.documentElement.scrollWidth <= document.documentElement.clientWidth, 'Horizontal page overflow');
  if (matchMedia('(min-width: 1280px)').matches) {
    const bounds = toc.getBoundingClientRect();
    assert(bounds.left >= header.left - 1 && bounds.right <= header.right + 1, 'TOC extends beyond header rule');
    assert(toc.scrollWidth <= toc.clientWidth, 'TOC content overflows its column');
    assert(bounds.right <= document.querySelector('article').getBoundingClientRect().left + 1, 'TOC overlaps article');
  }
  for (const p of document.querySelectorAll('.prose p:not(.readout)')) {
    assert(getComputedStyle(p).textAlign === 'justify', 'Article paragraphs must be justified');
  }
  for (const p of document.querySelectorAll('.prose .readout')) {
    assert(getComputedStyle(p).textAlign !== 'justify', 'Demo readouts must keep their alignment');
  }
  return 'Article layout checks passed';
})();
