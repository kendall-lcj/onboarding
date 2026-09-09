eMOBIQ prototype — static site
==============================

Structure:
  index.html        markup only
  css/tokens.css    the :root design tokens (single source of truth)
  css/app.css       component styles (consume the tokens)
  js/app.js         all interaction logic
  assets/           images/icons (full quality, loaded on demand)
  tokens/           tokens.css (copy) + tokens.json for tooling

Hosting: upload the whole folder; open index.html.
Local preview: `python3 -m http.server` in this folder, then open http://localhost:8000
(fonts load from Google Fonts, so keep internet on for the exact typeface).
