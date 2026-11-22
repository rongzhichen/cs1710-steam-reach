// Scroll-triggered motion for the story. Every helper is a no-op for readers who ask for reduced
// motion, and nothing is hidden until the script runs, so the prerendered page reads fine without it.

export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Svelte action: call `cb` once, the first time the node is well inside the viewport.
 * Usage: <div use:inView={() => (seen = true)}>
 */
export function inView(node, cb) {
  if (typeof IntersectionObserver !== 'function') { cb(); return {}; }
  const io = new IntersectionObserver(es => {
    if (es.some(e => e.isIntersecting)) { io.disconnect(); cb(); }
  }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
  io.observe(node);
  return { destroy: () => io.disconnect() };
}

/**
 * Svelte action: fade and lift the node into place the first time it scrolls into view.
 * The optional parameter is a delay in milliseconds, used to stagger a row of cards.
 */
export function reveal(node, delay = 0) {
  if (reducedMotion()) return {};
  // Already on screen when the page loads (or restores a scroll position): leave it as it is,
  // so nothing the reader can see blinks out and back in.
  const box = node.getBoundingClientRect();
  if (box.top < window.innerHeight && box.bottom > 0) return {};
  node.classList.add('reveal');
  if (delay) node.style.transitionDelay = delay + 'ms';
  const act = inView(node, () => {
    node.classList.add('in');
    // Drop the delay afterwards so hover and focus styles respond at once.
    setTimeout(() => { node.style.transitionDelay = ''; }, delay + 700);
  });
  return { destroy: () => act.destroy?.() };
}
