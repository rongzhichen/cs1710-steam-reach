// One fixed tooltip for every chart; created lazily on the client.
let tip = null;
function el() {
  if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip); }
  return tip;
}
export function showTip(e, txt) {
  const t = el(); t.textContent = txt; t.style.opacity = 1; t.style.left = e.clientX + 12 + 'px'; t.style.top = e.clientY + 12 + 'px';
}
export function hideTip() { if (tip) tip.style.opacity = 0; }
