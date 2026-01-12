
import React, { useState } from 'react';
import { ModuleView } from './types';
import AsciiGenerator from './components/AsciiGenerator';
import SocialFormatter from './components/SocialFormatter';
import SmileyLibrary from './components/SmileyLibrary';
import KaomojiLibrary from './components/KaomojiLibrary';
import DrawingCanvas from './components/DrawingCanvas';
import UsernameGenerator from './components/UsernameGenerator';
import TableFormatter from './components/TableFormatter';
import SeparatorGenerator from './components/SeparatorGenerator';
import ImageToAscii from './components/ImageToAscii';
import TextDecorator from './components/TextDecorator';
import KaomojiBuilder from './components/KaomojiBuilder';
import AsciiArtGallery from './components/AsciiArtGallery';
import AppInfo from './components/AppInfo';

// --- THE MAINFRAME ENTRY POINT ---
// "I'm in." - Every hacker ever.

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ModuleView>(ModuleView.SOCIAL_FORMATTER);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Decides which neural interface to load into the main viewport
  const renderContent = () => {
    switch (currentView) {
      case ModuleView.ASCII_GENERATOR: return <AsciiGenerator />;
      case ModuleView.SOCIAL_FORMATTER: return <SocialFormatter />;
      case ModuleView.SMILEY_LIBRARY: return <SmileyLibrary />;
      case ModuleView.KAOMOJI_LIBRARY: return <KaomojiLibrary />;
      case ModuleView.KAOMOJI_BUILDER: return <KaomojiBuilder />;
      case ModuleView.DRAWING_EDITOR: return <DrawingCanvas />;
      case ModuleView.USERNAME_GENERATOR: return <UsernameGenerator />;
      case ModuleView.TABLE_FORMATTER: return <TableFormatter />;
      case ModuleView.SEPARATOR_GENERATOR: return <SeparatorGenerator />;
      case ModuleView.IMAGE_TO_ASCII: return <ImageToAscii />;
      case ModuleView.TEXT_DECORATOR: return <TextDecorator />;
      case ModuleView.ASCII_GALLERY: return <AsciiArtGallery />;
      case ModuleView.APP_INFO: return <AppInfo />;
      default: return <SocialFormatter />;
    }
  };

  const navItems = [
    { id: ModuleView.SOCIAL_FORMATTER, label: 'Social Studio', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
    { id: ModuleView.SMILEY_LIBRARY, label: 'Emoji Library', icon: <circle cx="12" cy="12" r="10" /> },
    { id: ModuleView.ASCII_GENERATOR, label: 'Weird Text Maker', icon: <><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></> },
    { id: ModuleView.SEPARATOR_GENERATOR, label: 'Waves & Lines', icon: <><path d="M2 12h20" /><path d="M12 2v20" /><path d="m4.93 4.93 14.14 14.14" /><path d="m19.07 4.93-14.14 14.14" /></> },
    { id: ModuleView.ASCII_GALLERY, label: 'ASCII Art Gallery', icon: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 15h18" /><path d="m3 10 7-7 7 7" /><path d="M10 21v-6h4v6" /></> },
    { id: ModuleView.KAOMOJI_BUILDER, label: 'Kaomoji Builder', icon: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></> },
    { id: ModuleView.TEXT_DECORATOR, label: 'Text Decorator', icon: <><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></> },
    { id: ModuleView.USERNAME_GENERATOR, label: 'Username FX', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
    { id: ModuleView.KAOMOJI_LIBRARY, label: 'Kaomoji Library', icon: <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /> },
    { id: ModuleView.IMAGE_TO_ASCII, label: 'Image to ASCII', icon: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></> },
    { id: ModuleView.DRAWING_EDITOR, label: 'Draw Canvas', icon: <path d="m21.73 6.12-1.85-1.85a2.5 2.5 0 0 0-3.54 0l-1.83 1.83 3.69 3.69 1.83-1.83a2.5 2.5 0 0 0 0-3.54Z" /> },
    { id: ModuleView.TABLE_FORMATTER, label: 'Table Maker', icon: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-foreground overflow-hidden font-sans selection:bg-accent selection:text-background relative">

      {/* --- AMBIENT BACKGROUND GLOW --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-blob mix-blend-screen opacity-30"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen opacity-30"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen opacity-30"></div>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col shadow-2xl
      `}>
        <div className="p-6 border-b border-white/5 relative overflow-hidden group">
          {/* Logo Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

          <h1 className="relative text-2xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-foreground to-white bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
            ASCIIverse
          </h1>
          <p className="relative text-xs text-muted-foreground mt-1 font-medium tracking-wide">Creative Text Suite v2.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                    ? 'text-white font-bold shadow-lg shadow-accent/20 ring-1 ring-white/10'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
              >
                {/* Active Background Gradient */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/80 to-blue-600/80 opacity-100 transition-opacity"></div>
                )}

                {/* Hover Glow for non-active */}
                {!isActive && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300 rounded-r-full"></div>
                )}

                <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20" height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={isActive ? "2.5" : "2"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${isActive ? 'stroke-white' : 'stroke-current'}`}
                  >
                    {item.icon}
                  </svg>
                </div>
                <span className="relative z-10 text-sm tracking-wide">{item.label}</span>

                {isActive && (
                  <div className="relative z-10 ml-auto w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Link */}
        <div className="p-4 border-t border-white/5 mt-auto bg-black/20">
          <button
            onClick={() => {
              setCurrentView(ModuleView.APP_INFO);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-transparent ${currentView === ModuleView.APP_INFO
                ? 'bg-white/10 text-white border-white/10'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></svg>
            <span className="font-medium text-sm">About & Info</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 bg-gradient-to-b from-transparent to-black/20">
        <header className="h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_10px_var(--color-accent)]"></span>
              {currentView === ModuleView.APP_INFO ? 'Application Info' : navItems.find(i => i.id === currentView)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-blue-500 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              US
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-6xl mx-auto h-full animate-slide-in">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
