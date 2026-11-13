<script>
  // Copies the current page address, which carries the shared selection (see urlState.js).
  let msg = $state('');
  async function copy() {
    try { await navigator.clipboard.writeText(location.href); msg = 'Link copied'; }
    catch { msg = 'Copy the address bar to share this view'; }
    setTimeout(() => { msg = ''; }, 2500);
  }
</script>

<span class="copy-link"><button type="button" onclick={copy} aria-label="Copy a link to this selection">Copy link to this view</button>{#if msg}<span class="copied" role="status">{msg}</span>{/if}</span>
