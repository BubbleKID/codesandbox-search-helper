// CodeSandbox Date Tags Extension

class CodeSandboxDateTagger {
  constructor() {
    this.dateTag = "2025-07-29"; // Fixed date for now
    console.log('CodeSandbox Date Tagger: Starting...');
    this.init();
  }

  init() {
    this.observeSearchResults();
    // Process existing results on page load
    setTimeout(() => {
      this.processSearchResults();
    }, 1000);
  }

  observeSearchResults() {
    console.log('Setting up search result observer...');

    // Use MutationObserver to watch for new search results
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          console.log('DOM changed, processing search results...');
          this.processSearchResults();
        }
      });
    });

    // Start observing the document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  processSearchResults() {
    const searchResults = this.findSearchResultItems();
    console.log('Found', searchResults.length, 'search result items');

    if (!searchResults.length) return;

    searchResults.forEach((result, index) => {
      this.addDateTag(result);
    });
  }

  findSearchResultItems() {
    // Look for Algolia search result items
    const selectors = [
      '.ais-Hits-item',
      '[data-testid*="hit"]',
      'li[class*="Hits-item"]',
      'li[class*="hit"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log('Found', elements.length, 'items with selector:', selector);
        return Array.from(elements);
      }
    }

    console.log('No search result items found');
    return [];
  }

  addDateTag(element) {
    // Check if date tag already exists
    const existingTag = element.querySelector('.csb-date-tag');
    if (existingTag) {
      return; // Already has a date tag
    }

    try {
      const dateTagElement = this.createDateTagElement(this.dateTag);
      element.appendChild(dateTagElement);
      console.log('Added date tag to search result');
    } catch (error) {
      console.error('Error adding date tag:', error);
    }
  }

  createDateTagElement(date) {
    const tagDiv = document.createElement('div');
    tagDiv.className = 'csb-date-tag';
    tagDiv.textContent = date;
    return tagDiv;
  }
}

// Initialize the extension when the script loads
console.log('CodeSandbox Date Tagger: Loading...');
new CodeSandboxDateTagger();
