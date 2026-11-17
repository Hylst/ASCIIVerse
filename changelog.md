# Changelog

All notable changes to this project will be documented in this file.

## [Non publié]

- Licence : fichier `LICENSE` (MIT) ajouté, conforme à ce qu'annonçait déjà le README.
- Source regroupée dans `D:\0CODE\0FINAL\apps\asciiverse` (17/11/2026) ; l'image du README pointe désormais en relatif vers `public/pwa-512x512.png` au lieu d'un chemin `file:///` de l'ancien emplacement. Build inchangé.
- `README.md` et `about.md` : React 19 (et non 18), version déclarée dans `package.json` ; lien vers react.dev.

## [2.2.0] - 2026-11-14

### Changed
- **Social Studio**: the editor and the preview now fill the window height. The platform picker moves into the toolbar, which wraps on phones. Hashtag sets and post templates become dropdowns (templates grouped by platform, confirmation before replacing a draft), snippets open in a small panel. Tip, progress bar and counter share one footer line; the Copy button is disabled while the draft is empty.
- **Draw Canvas**: the grid sits right under a compact toolbar, at real pixel size with zoom buttons, a Fit button and a symmetry dropdown. The character palette is grouped (Blocks, Shapes, Lines, Other), sits on the right on large screens and above the grid on phones, and accepts any typed character. New: keyboard shortcuts (P, E, F, L, R, C, Ctrl+Z, Ctrl+Y), undoable Clear, list of drawings saved in the browser (open or delete). Phones start with a 24 x 16 grid.
- **Weird Text Maker**: input and result side by side at the top, font gallery below with a preview of your own text (two columns on phones), options in tabs. Presets become a dropdown grouped by category. A reset button shows how many effects are active.
- **Text Transformer**: the output updates as you type (no button), categories as tabs with chips (a grouped dropdown on phones), a one-line explanation of each transformation, "Use as input" to chain transformations, character, word and line counters. History is saved on copy and folds away.

### Fixed
- **Draw Canvas**: typing a size no longer crashes the editor (the value is applied on Enter or when leaving the field, clamped to 5 to 100); undo and redo restore the grid size; copied art drops trailing spaces.
- **Text Transformer**: Sentence case and tOGGLE no longer duplicate other transformations; Title Case, the snake/kebab/camel family and "Letters and digits only" keep accented letters; Base64 handles UTF-8 without deprecated functions; a corrupted history no longer breaks the tool.

## [2.1.1] - 2026-11-14

### Changed
- **About & Legal**: new "Publisher, hosting & AI" block (non-professional publisher, host Hostinger International Limited, server logs kept twelve months at most, AI assistance) with a link to the legal notice of the hylst.fr platform. The privacy note names the mailbox provider (Infomaniak, Switzerland).
- **Contact**: address changed to `geoffroy.streit@ik.me`.
- **index.html**: fixes previously applied by hand to the published build on hylst.fr are now in the source: canonical URL, `<base href="/asciiverse/">`, and fonts self-hosted by the platform (`/assets/fonts/fonts.css`, no Google Fonts request).

## [2.1.0] - 2026-01-23

### Added
- **Text Transformer**: New advanced tool for text manipulation (15+ cases, regex, encoding, cleaning).
- **Cyber Style**: New generator for futuristic text effects (Matrix, Glitch, Borg, Retro, Cyber).
- **Table Maker v2**: Fully editable result preview, data transposition tool, and compact mode.

### Fixed
- **Scrolling**: Fixed vertical scrolling issue in main content area.
- **UI Consistency**: Updated creator title and fixed CSS warnings for Tailwind v4.
- **Table Alignment**: Improved ASCII table width calculation for better precision.

## [2.0.0] - 2026-01-12

### Added
- **PWA Support**: Full Progressive Web App integration with offline support and custom icons.
- **Design System**: Implementation of semantic CSS variables (`--accent`, `--background`, etc.) for a consistent terminal theme.
- **SEO Optimization**: Added `robots.txt`, `sitemap.xml`, and improved meta tags.
- **Dockerization**: Added a multi-stage Dockerfile for NGINX deployment.
- **New Documentation**: Created `changelog.md` and `about.md` (FR).

### Changed
- **Tailwind Migration**: Moved from CDN-based Tailwind to a local PostCSS/Autoprefixer build pipeline.
- **Component Overhaul**: Audited and refactored all 13 UI components for design system compliance and performance.
- **Build System**: Switched to Vite 6 for faster development and optimized production bundles.
- **UI/UX**: Modernized the terminal aesthetic with glassmorphism and subtle animations.

## [1.0.0] - 2024-05-20
### Added
- Initial release with core ASCII and Kaomoji tools.
- Gemini API integration for advanced ASCII generation.
- Desktop-first responsive layout.
