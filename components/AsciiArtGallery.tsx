
import React, { useState, useMemo } from 'react';
import { ASCII_GALLERY_ITEMS } from '../constants';
import { AsciiGalleryItem } from '../types';

type ArtSize = 'All' | 'Small' | 'Medium' | 'Large';

const AsciiArtGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState<ArtSize>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  // Viewer Modal State
  const [viewingItem, setViewingItem] = useState<AsciiGalleryItem | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(ASCII_GALLERY_ITEMS.map(item => item.category));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  // Helper to determine size
  const getArtSize = (art: string): ArtSize => {
      const lines = art.split('\n');
      const height = lines.length;
      const width = Math.max(...lines.map(l => l.length));
      
      if (height <= 3 && width <= 40) return 'Small';
      if (height > 15 || width > 60) return 'Large';
      return 'Medium';
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return ASCII_GALLERY_ITEMS.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      const size = getArtSize(item.art);
      const matchesSize = selectedSize === 'All' || size === selectedSize;

      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(lowerSearch) || 
                            item.keywords.some(k => k.includes(lowerSearch));
      return matchesCategory && matchesSize && matchesSearch;
    });
  }, [selectedCategory, selectedSize, searchTerm]);

  const handleCopy = (art: string, id: string) => {
    navigator.clipboard.writeText(art);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-full gap-4 min-h-0 relative">
      
      {/* --- HEADER: Search, Size & Categories --- */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
          
          {/* Categories Sidebar/Bar */}
          <div className="w-full md:w-64 bg-terminal-paper p-3 rounded-xl border border-slate-700 flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                  <h3 className="text-terminal-accent font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                      Categories
                  </h3>
                  <span className="text-xs text-slate-500">{filteredItems.length}</span>
              </div>
              
              <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto custom-scrollbar md:max-h-[calc(100vh-250px)]">
                  {categories.map(cat => (
                      <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all whitespace-nowrap ${
                              selectedCategory === cat
                              ? 'bg-terminal-accent text-terminal-bg font-bold shadow-md'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>
          </div>

          {/* Search & Grid */}
          <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0">
              
              <div className="bg-terminal-paper p-3 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full flex items-center gap-3 bg-slate-900 rounded-lg px-3 py-2 border border-slate-600">
                    <svg className="text-slate-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search gallery..."
                        className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-600 min-w-0"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6 18 18"/></svg>
                        </button>
                    )}
                  </div>

                  {/* Size Filter */}
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-600 shrink-0">
                      {(['All', 'Small', 'Medium', 'Large'] as ArtSize[]).map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1 text-xs rounded font-bold transition-all ${
                                selectedSize === size 
                                ? 'bg-slate-700 text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                              {size === 'All' ? 'All' : size.charAt(0)}
                          </button>
                      ))}
                  </div>

                  <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
                  
                  <button 
                    onClick={() => setShowInfo(true)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                    title="Gallery Guide"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-black rounded-xl border border-slate-800 p-4">
                  {filteredItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500">
                          <span className="text-4xl mb-2">🔍</span>
                          <p>No ASCII art found.</p>
                      </div>
                  ) : (
                      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                          {filteredItems.map(item => (
                              <div key={item.id} className="break-inside-avoid bg-terminal-paper border border-slate-700 rounded-lg overflow-hidden group hover:border-terminal-accent transition-all hover:shadow-lg hover:-translate-y-1 relative flex flex-col">
                                  <div className="p-3 border-b border-slate-700/50 bg-slate-900/30 flex justify-between items-center">
                                      <h4 className="text-xs font-bold text-slate-300 truncate pr-2">{item.name}</h4>
                                      <span className="text-[9px] text-slate-600 uppercase tracking-wide bg-black/20 px-1.5 py-0.5 rounded">{getArtSize(item.art)}</span>
                                  </div>
                                  
                                  <div 
                                    className="p-4 flex items-center justify-center bg-black/20 min-h-[80px] cursor-pointer hover:bg-black/40 transition-colors"
                                    onClick={() => setViewingItem(item)}
                                  >
                                      {/* Truncate height for large items in preview */}
                                      <div className="max-h-48 overflow-hidden relative w-full flex justify-center">
                                          <pre className="font-mono text-[10px] sm:text-xs leading-tight text-emerald-400 whitespace-pre text-left">
                                              {item.art}
                                          </pre>
                                          {/* Fade out for long items */}
                                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-terminal-paper/90 to-transparent pointer-events-none"></div>
                                      </div>
                                  </div>

                                  <div className="p-2 bg-slate-900/50 border-t border-slate-700/50 flex justify-between items-center">
                                      <button
                                        onClick={() => setViewingItem(item)}
                                        className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 px-2"
                                      >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                          View
                                      </button>

                                      <button 
                                          onClick={(e) => { e.stopPropagation(); handleCopy(item.art, item.id); }}
                                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${
                                              copiedId === item.id 
                                              ? 'bg-green-500 text-white shadow-lg scale-105' 
                                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                          }`}
                                      >
                                          {copiedId === item.id ? 'Copied' : 'Copy'}
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

          </div>
      </div>

      {/* --- VIEWER MODAL (For Large Art) --- */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setViewingItem(null)}>
            <div className="bg-terminal-paper border border-slate-600 rounded-xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                    <div>
                        <h3 className="text-lg font-bold text-terminal-accent">{viewingItem.name}</h3>
                        <span className="text-xs text-slate-500 uppercase">{viewingItem.category} • {viewingItem.art.split('\n').length} lines</span>
                    </div>
                    <button onClick={() => setViewingItem(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-auto custom-scrollbar p-8 bg-black flex items-center justify-center">
                    <pre className="font-mono text-xs md:text-sm text-emerald-400 whitespace-pre leading-snug select-all">
                        {viewingItem.art}
                    </pre>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-end gap-3">
                    <button 
                        onClick={() => setViewingItem(null)}
                        className="px-4 py-2 text-slate-400 hover:text-white font-medium text-sm transition-colors"
                    >
                        Close
                    </button>
                    <button 
                        onClick={() => handleCopy(viewingItem.art, viewingItem.id)}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${
                            copiedId === viewingItem.id 
                            ? 'bg-green-500 text-white' 
                            : 'bg-terminal-accent text-terminal-bg hover:bg-emerald-400'
                        }`}
                    >
                        {copiedId === viewingItem.id ? (
                            <><span>✓</span> Copied!</>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                Copy to Clipboard
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- INFO MODAL --- */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInfo(false)}>
            <div className="bg-terminal-paper border border-slate-700 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="text-terminal-accent" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                        Usage Tips
                    </h3>
                    <button onClick={() => setShowInfo(false)} className="text-slate-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                
                <div className="p-6 space-y-4 text-sm text-slate-300 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <h4 className="font-bold text-terminal-accent mb-1">🔤 Font Matters!</h4>
                        <p className="text-xs leading-relaxed">
                            ASCII art requires a <strong>Monospace Font</strong> (like Courier, Consolas, or Fira Code) to display correctly. In standard fonts (Arial, Times), the spaces are too thin and the art will look scrambled.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-bold text-white">How to use:</h4>
                        <ul className="list-disc pl-4 space-y-1 text-slate-400 text-xs marker:text-terminal-accent">
                            <li><strong>Social Media:</strong> Use code blocks if available (e.g., Discord uses ``` triple backticks).</li>
                            <li><strong>Emails:</strong> Switch your editor to "Plain Text" or select a fixed-width font.</li>
                            <li><strong>Code Comments:</strong> Great for decorating source code headers!</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-bold text-white">Discord / Markdown Example:</h4>
                        <div className="bg-black p-3 rounded border border-slate-800 font-mono text-xs text-slate-400">
                            ```text<br/>
                            {ASCII_GALLERY_ITEMS[0].art.split('\n')[0]}<br/>
                            ...<br/>
                            ```
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-900/50 text-center">
                    <button onClick={() => setShowInfo(false)} className="px-6 py-2 bg-terminal-accent text-terminal-bg font-bold rounded-lg hover:bg-emerald-400 transition-colors">
                        Got it
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AsciiArtGallery;
