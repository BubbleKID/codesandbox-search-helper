// CodeSandbox Date Tags Extension

class CodeSandboxDateTagger {
  constructor() {
    this.dateTag = "9999-09-09"; // default fallback
    this.sandboxIdToDate = new Map(); // id -> YYYY-MM-DD
    this.processTimer = null;
    this.isProcessing = false;
    console.log('CodeSandbox Date Tagger: Starting...');
    this.init();
  }

  init() {
    // Listen for messages coming from DevTools panel via window.postMessage
    window.addEventListener('message', (event) => {
      const msg = event?.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'ALGOLIA_DATES' && Array.isArray(msg.items)) {
        msg.items.forEach(({ id, insertedYMD }) => {
          if (id && insertedYMD) this.sandboxIdToDate.set(id, insertedYMD);
        });
        // After receiving new dates, refresh current results (debounced)
        this.scheduleProcess();
      }
    });

    this.observeSearchResults();
    this.scheduleProcess(300);
  }

  scheduleProcess(delay = 100) {
    if (this.processTimer) clearTimeout(this.processTimer);
    this.processTimer = setTimeout(() => this.processSearchResults(), delay);
  }

  observeSearchResults() {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          // Skip if the only changes are our own tag insertions
          const added = Array.from(m.addedNodes || []);
          const onlyOwn = added.length > 0 && added.every((n) =>
            n.nodeType === 1 && (n.classList?.contains('csb-date-tag') || n.querySelector?.('.csb-date-tag'))
          );
          if (!onlyOwn) {
            this.scheduleProcess();
            break;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  processSearchResults() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    try {
      const searchResults = this.findSearchResultItems();
      if (!searchResults.length) return;

      searchResults.forEach((result) => {
        const sandboxId = this.extractSandboxId(result);
        const date = (sandboxId && this.sandboxIdToDate.get(sandboxId)) || this.dateTag;
        this.addOrUpdateDateTag(result, date);
      });
    } finally {
      this.isProcessing = false;
    }
  }

  findSearchResultItems() {
    const selectors = [
      '.ais-Hits-item',
      '[data-testid*="hit"]',
      'li[class*="Hits-item"]',
      'li[class*="hit"]'
    ];
    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      if (els.length) return Array.from(els);
    }
    return [];
  }

  extractSandboxId(element) {
    // Try image screenshot src first
    const img = element.querySelector('img[src*="/api/v1/sandboxes/"]');
    if (img && img.src) {
      const m = img.src.match(/\/sandboxes\/([a-zA-Z0-9_-]+)\//);
      if (m) return m[1];
    }
    // Fallback: any link containing /s/ID
    const link = element.querySelector('a[href*="/s/"]');
    if (link && link.href) {
      const m2 = link.href.match(/\/s\/([a-zA-Z0-9_-]+)/);
      if (m2) return m2[1];
    }
    return null;
  }

  addOrUpdateDateTag(element, dateText) {
    let tag = element.querySelector('.csb-date-tag');
    if (!tag) {
      tag = document.createElement('div');
      tag.className = 'csb-date-tag';
      element.appendChild(tag);
    }
    if (tag.textContent !== dateText) tag.textContent = dateText;
  }
}

console.log('CodeSandbox Date Tagger: Loading...');
new CodeSandboxDateTagger();
