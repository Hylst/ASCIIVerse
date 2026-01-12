# Changelog

All notable changes to this project will be documented in this file.

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
