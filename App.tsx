
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
  // State management for the navigational HUD
  const [currentView, setCurrentView] = useState<ModuleView>(ModuleView.SOCIAL_FORMATTER);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile menu toggle

  // --- MODULE ROUTER ---
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

  // Sidebar Configuration Data
  const navItems = [
    { id: ModuleView.SOCIAL_FORMATTER, label: 'Social Studio', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
    { id: ModuleView.SMILEY_LIBRARY, label: 'Emoji Library', icon: <circle cx="12" cy="12" r="10"/> },
    { id: ModuleView.ASCII_GENERATOR, label: 'Weird Text Maker', icon: <><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></> },
    { id: ModuleView.SEPARATOR_GENERATOR, label: 'Waves & Lines', icon: <><path d="M2 12h20"/><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/></> },
    { id: ModuleView.ASCII_GALLERY, label: 'ASCII Art Gallery', icon: <><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 15h18"/><path d="m3 10 7-7 7 7"/><path d="M10 21v-6h4v6"/></> },
    { id: ModuleView.KAOMOJI_BUILDER, label: 'Kaomoji Builder', icon: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></> },
    { id: ModuleView.TEXT_DECORATOR, label: 'Text Decorator', icon: <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></> },
    { id: ModuleView.USERNAME_GENERATOR, label: 'Username FX', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
    { id: ModuleView.KAOMOJI_LIBRARY, label: 'Kaomoji Library', icon: <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/> },
    { id: ModuleView.IMAGE_TO_ASCII, label: 'Image to ASCII', icon: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></> },
    { id: ModuleView.DRAWING_EDITOR, label: 'Draw Canvas', icon: <path d="m21.73 6.12-1.85-1.85a2.5 2.5 0 0 0-3.54 0l-1.83 1.83 3.69 3.69 1.83-1.83a2.5 2.5 0 0 0 0-3.54Z"/> },
    { id: ModuleView.TABLE_FORMATTER, label: 'Table Maker', icon: <><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></> },
  ];

  return (
    <div className="flex h-screen bg-terminal-bg text-terminal-text overflow-hidden font-sans selection:bg-terminal-accent selection:text-terminal-bg">
      {/* Mobile Backdrop - Keeps the focus when the drawer is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      {/* The main control deck for the application */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-terminal-paper border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col
      `}>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-terminal-accent to-blue-500">
            ASCIIverse
          </h1>
          <p className="text-xs text-slate-500 mt-1">Creative Text Suite v2.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                currentView === item.id 
                ? 'bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`${currentView === item.id ? 'stroke-terminal-accent' : 'stroke-slate-400 group-hover:stroke-slate-200'}`}
              >
                {item.icon}
              </svg>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer Link to Docs/Legal */}
        <div className="p-4 border-t border-slate-800 mt-auto">
          <button
            onClick={() => {
              setCurrentView(ModuleView.APP_INFO);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
              currentView === ModuleView.APP_INFO 
              ? 'bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/20' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
            <span className="font-medium text-sm">About & Info</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      {/* Where the magic happens */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 bg-terminal-bg/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
          </button>
          
          <h2 className="text-lg font-bold text-slate-200">
             {currentView === ModuleView.APP_INFO ? 'Application Info' : navItems.find(i => i.id === currentView)?.label}
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-terminal-accent">
              US
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-terminal-bg custom-scrollbar">
          <div className="max-w-6xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
