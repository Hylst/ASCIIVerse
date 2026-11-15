<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🌌 ASCIIVerse Studio

**ASCIIVerse Studio** is a premium, high-tech creative suite for text generation, ASCII art, and social media formatting. Designed with a sleek terminal aesthetic, it's 100% frontend-only, privacy-focused, and offline-ready.

![ASCIIVerse Preview](file:///d:/0CODE/AntiGravity/ASCIIVerse/ASCIIVerse/public/pwa-512x512.png)

## ✨ Features

- 🔡 **ASCII Generator**: 50+ fonts for massive text banners.
- 🖼️ **Image-to-ASCII**: Convert images to high-fidelity character art.
- 🎭 **Kaomoji & Symbols**: Huge library of japanese emoticons and rare symbols.
- 📱 **Social Formatter**: Style your posts for LinkedIn/Instagram with fancy fonts.
- 📊 **Table Formatter**: Professional ASCII tables for code vs docs.
- 🎨 **Drawing Canvas**: Create manual ASCII art on a digital grid.
- ⚡ **PWA Ready**: Install it as an app and use it offline.

## 🛠️ Technical Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Semantic Design System)
- **Deployment**: [Docker](https://www.docker.com/) (NGINX Alpine)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## 📦 Deployment

Build the static version:
```bash
npm run build
```

Or use Docker:
```bash
docker build -t asciiverse-studio .
docker run -p 8080:80 asciiverse-studio
```

### 🌐 Shared Web Hosting (Apache)
For shared hosting (like OVH, o2switch, etc.):
1. Build the app: `npm run build`
2. Copy the entire content of the `dist` folder to your server's `public_html` or `www` directory via FTP/SFTP.
3. The included `.htaccess` file handles the routing for the SPA.

## 📄 Documentation

- [Changelog](changelog.md)
- [À propos (FR)](about.md)

## ⚖️ License
MIT License. 100% Privacy - nothing leaves your browser.
