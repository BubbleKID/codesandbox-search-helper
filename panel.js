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

function onRequestFinished(request) {
  const url = request?.request?.url;
  if (!isAlgoliaSearch(url)) return;

  append(`🎯 ALGOLIA SEARCH URL: ${url}`);

  // Log the response body like Algolia Analyzer does
  try {
    request.getContent((content) => {
      if (!content) {
        append('ℹ️ No response body to parse.');
        return;
      }
      try {
        const data = JSON.parse(content);
        console.log('🔎 ALGOLIA RESPONSE OBJECT:', data);
        append('✅ Parsed Algolia response');
        const hits = data?.results?.[0]?.hits || [];
        append(`📦 hits on this page: ${hits.length}`);
      } catch (e) {
        append(`⚠️ Failed to parse response JSON: ${e && e.message ? e.message : e}`);
        console.log('📄 Raw content:', content);
      }
    });
  } catch (e) {
    append(`⚠️ request.getContent error: ${e && e.message ? e.message : e}`);
  }
}

append('DevTools panel loaded. Waiting for requests...');
chrome.devtools.network.onRequestFinished.addListener(onRequestFinished);
