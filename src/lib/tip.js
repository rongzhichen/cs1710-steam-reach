// One fixed tooltip for every chart; created lazily on the client. It sits above and to the right
// of the cursor so it does not cover the neighbouring mark (test-session feedback), and is clamped
// to the viewport.
let tip = null;
function el() {
  if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip); }
  return tip;
}
export function showTip(e, txt) {
  const t = el(); t.textContent = txt; t.style.opacity = 1;
  const w = t.offsetWidth, h = t.offsetHeight;
  let left = e.clientX + 14, top = e.clientY - h - 14;
  if (left + w > window.innerWidth - 8) left = e.clientX - w - 14;
  if (top < 8) top = e.clientY + 18;
  t.style.left = left + 'px'; t.style.top = top + 'px';
}
export function hideTip() { if (tip) tip.style.opacity = 0; }
