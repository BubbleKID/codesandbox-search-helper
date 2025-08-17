# CodeSandbox Date Tags

Adds a small date tag on each result in CodeSandbox search. The date is the sandbox "inserted_at" (created date) from the Algolia search response.

## Install (unpacked)
1. Clone or download this repo.
2. Open Chrome → `chrome://extensions/`.
3. Enable "Developer mode" (top-right).
4. Click "Load unpacked" and select this folder.

## Use
- Open a CodeSandbox search page, e.g.
  - `https://codesandbox.io/search?query=react`
- The extension injects date tags on each result card.
- If the created date is not available yet, a fallback text/date is shown (configurable in `content.js` via `this.dateTag`).

## How it works

DevTools (Algolia Analyzer–style) (required)
- A DevTools panel named "CodeSandbox Tags" listens to network with `chrome.devtools.network` and parses the Algolia response.
- Open DevTools and perform a search to see logs in that panel.

## Customize
- Default fallback tag text/date: edit `content.js`, constructor `this.dateTag`.
- Styling: edit `styles.css` (`.csb-date-tag`).

## Troubleshooting
- Tags don’t appear:
  - Reload the extension and refresh the search page.
  - Ensure the page URL is `https://codesandbox.io/search...` (the content script only matches search pages).
  - Open DevTools → Network and confirm Algolia requests to `algolianet.com` `/queries` are being sent.
- Works only with panel open:
  - The fallback injector should handle this. Reload the page; if needed, open the DevTools panel once to verify requests, then close it.

## Notes
- This extension reads only the search response on CodeSandbox pages and does not transmit data elsewhere.
