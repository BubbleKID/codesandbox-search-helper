// DevTools panel script: log Algolia search URLs like algolia-analyzer
const logEl = document.getElementById('log');

function append(text) {
  console.log(text);
  if (logEl) {
    logEl.textContent += `\n${text}`;
  }
}

function isAlgoliaSearch(url) {
  if (!url) return false;
  // Match queries endpoint regardless of domain (algolianet.com / algolia.net)
  return /\/queries\?/.test(url) && /x-algolia-agent=/.test(url);
}

function toYMD(epochSec) {
  const d = new Date(epochSec * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function onRequestFinished(request) {
  const url = request?.request?.url;
  if (!isAlgoliaSearch(url)) return;

  append(`🎯 ALGOLIA SEARCH URL: ${url}`);

  // Parse response and forward minimal data to the inspected page
  request.getContent((content) => {
    try {
      if (!content) return;
      const data = JSON.parse(content);
      const hits = data?.results?.[0]?.hits || [];
      const mapped = hits
        .filter(h => h.objectID && h.inserted_at)
        .map(h => ({ id: h.objectID, insertedYMD: toYMD(h.inserted_at) }));

      if (mapped.length > 0) {
        append(`📦 hits with dates: ${mapped.length}`);
        // Send to inspected window via window.postMessage injection
        const payload = { type: 'ALGOLIA_DATES', items: mapped };
        const js = `window.postMessage(${JSON.stringify(payload)}, '*');`;
        chrome.devtools.inspectedWindow.eval(js);
      }
    } catch (e) {
      append(`⚠️ Failed to parse/forward response: ${e && e.message ? e.message : e}`);
    }
  });
}

append('DevTools panel loaded. Waiting for requests...');
chrome.devtools.network.onRequestFinished.addListener(onRequestFinished);
