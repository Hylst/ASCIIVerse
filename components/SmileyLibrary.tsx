
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SMILEYS, SYMBOL_CATEGORIES } from '../constants';
import { Smiley } from '../types';

// --- Local Types & Mock Expansion ---
type SkinTone = '' | '🏻' | '🏼' | '🏽' | '🏾' | '🏿';

interface EmojiItem {
  id: string;
  char: string;
  name: string;
  category: string;
  keywords: string[];
  baseChar?: string; // For skin tones
}

// --- Icons ---
const Icons = {
  History: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>,
  Copy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="M6 6 18 18"/></svg>,
  Settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Info: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
};

const SmileyLibrary: React.FC = () => {
  // --- State ---
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [skinTone, setSkinTone] = useState<SkinTone>('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Selection & Composition
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiItem | null>(null);
  const [composerText, setComposerText] = useState('');
  
  // User Data (Persisted)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('ascii_favs') || '[]'); } catch { return []; }
  });
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('ascii_recent') || '[]'); } catch { return []; }
  });

  const [notification, setNotification] = useState('');

  // Refs for Long Press handling
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  // --- Effects ---
  
  // Handle Escape Key to close modal/deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedEmoji(null);
        setShowInfoModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Data Preparation ---
  const allData: EmojiItem[] = useMemo(() => {
    const emojis: EmojiItem[] = SMILEYS.map(s => ({ ...s, baseChar: s.char }));
    const symbols: EmojiItem[] = SYMBOL_CATEGORIES.flatMap(cat => 
        cat.items.map((char, i) => ({
            id: `sym-${cat.name}-${i}`,
            char,
            name: `${cat.name} Symbol ${i+1}`,
            category: 'Symbols',
            keywords: [cat.name.toLowerCase(), 'symbol']
        }))
    );
    return [...emojis, ...symbols];
  }, []);

  // Stats for Modal
  const libraryStats = useMemo(() => {
      const stats: Record<string, number> = {};
      allData.forEach(item => {
          stats[item.category] = (stats[item.category] || 0) + 1;
      });
      return stats;
  }, [allData]);

  // --- Filtering Logic ---
  const filteredItems = useMemo(() => {
    let items = allData;

    if (activeCategory === 'Recent') {
        return history.map((char, i) => {
            const found = allData.find(e => e.char === char);
            return found || { id: `hist-${i}`, char, name: 'Recent Item', category: 'Recent', keywords: [] };
        });
    } else if (activeCategory === 'Favorites') {
        return items.filter(i => favorites.includes(i.id));
    } else if (activeCategory !== 'All') {
        items = items.filter(i => i.category === activeCategory || (activeCategory === 'Symbols' && i.category === 'Symbols'));
    }

    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        items = items.filter(i => 
            i.name.toLowerCase().includes(lower) || 
            i.char.includes(lower) || 
            i.keywords.some(k => k.includes(lower))
        );
    }

    if (skinTone) {
        items = items.map(i => {
            if (i.baseChar) {
                // Determine if char supports skin tone (simple heuristic for this demo: check category or specific ranges)
                // Real implementation would check against a list of supports-skin-tone unicode
                if (['People', 'Body', 'Activities'].includes(i.category) || i.keywords.includes('hand') || i.keywords.includes('person')) {
                     return { ...i, char: i.baseChar + skinTone };
                }
            }
            return i;
        });
    }

    return items;
  }, [activeCategory, searchTerm, skinTone, allData, history, favorites]);

  const categories = useMemo(() => {
      const cats = Array.from(new Set(allData.map(i => i.category)));
      // Filter out empty categories if any
      const validCats = cats.filter(c => c);
      return ['All', 'Recent', 'Favorites', ...validCats];
  }, [allData]);

  // --- Actions & Interaction Handlers ---

  const addToHistory = (item: EmojiItem) => {
    setHistory(prev => {
        const newHist = [item.char, ...prev.filter(c => c !== item.char)].slice(0, 50);
        localStorage.setItem('ascii_recent', JSON.stringify(newHist));
        return newHist;
    });
  };

  // Single Click / Tap
  const handlePrimaryAction = (item: EmojiItem) => {
      addToComposer(item.char);
      copyText(item.char, 'Emoji');
      addToHistory(item);
  };

  // Double Click / Long Press
  const handleInspect = (item: EmojiItem) => {
      setSelectedEmoji(item);
  };

  // --- Input Handlers ---

  const handlePointerDown = (item: EmojiItem) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      handleInspect(item);
    }, 600); // 600ms long press
  };

  const handlePointerUp = (item: EmojiItem) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    
    // Only trigger primary action if it wasn't a long press
    if (!isLongPress.current) {
      handlePrimaryAction(item);
    }
  };

  const handlePointerLeave = () => {
     if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const addToComposer = (char: string) => {
      setComposerText(prev => prev + char);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setFavorites(prev => {
          const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
          localStorage.setItem('ascii_favs', JSON.stringify(newFavs));
          return newFavs;
      });
  };

  const copyText = (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      setNotification(`${label} Copied!`);
      setTimeout(() => setNotification(''), 2000);
  };

  const getCodes = (char: string) => {
      // Basic code point extraction
      const codePoint = char.codePointAt(0)?.toString(16).toUpperCase();
      // Handle surrogate pairs / sequences roughly for display
      const fullHex = Array.from(char).map(c => c.codePointAt(0)?.toString(16).toUpperCase()).join(' ');
      
      return {
          unicode: `U+${fullHex}`,
          html: `&#x${codePoint};`,
          css: `\\${codePoint}`,
          url: encodeURIComponent(char)
      };
  };

  const codes = selectedEmoji ? getCodes(selectedEmoji.char) : null;

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 min-h-0 bg-terminal-bg text-terminal-text relative">
      
      {/* --- LEFT SIDEBAR (Navigation) --- */}
      <div className="w-full lg:w-48 bg-terminal-paper rounded-xl border border-slate-700 flex flex-col shrink-0 overflow-hidden h-auto lg:h-full">
         <div className="p-3 border-b border-slate-700 font-bold text-xs uppercase text-slate-500">
             Library
         </div>
         <div className="flex-1 overflow-x-auto lg:overflow-y-auto custom-scrollbar flex lg:flex-col p-2 gap-1">
             {categories.map(cat => (
                 <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left whitespace-nowrap ${
                        activeCategory === cat
                        ? 'bg-terminal-accent text-terminal-bg'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                 >
                     {cat === 'Recent' ? Icons.History : cat === 'Favorites' ? Icons.Star : Icons.Grid}
                     {cat}
                     {cat === 'Favorites' && favorites.length > 0 && <span className="ml-auto text-[10px] opacity-70 bg-black/20 px-1.5 rounded-full">{favorites.length}</span>}
                 </button>
             ))}
         </div>
         
         {/* Skin Tone Selector */}
         <div className="hidden lg:block p-3 border-t border-slate-700">
             <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Skin Tone</div>
             <div className="flex justify-between">
                 {(['', '🏻', '🏼', '🏽', '🏾', '🏿'] as SkinTone[]).map(tone => (
                     <button
                        key={tone}
                        onClick={() => setSkinTone(tone)}
                        className={`w-5 h-5 rounded-full border border-slate-600 transition-transform hover:scale-110 ${skinTone === tone ? 'ring-2 ring-terminal-accent' : ''}`}
                        style={{ backgroundColor: tone === '' ? '#FFD93D' : 'transparent' }}
                     >
                         {tone}
                     </button>
                 ))}
             </div>
         </div>
      </div>

      {/* --- MIDDLE (Grid & Search) --- */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
          
          {/* Top Bar */}
          <div className="bg-terminal-paper p-3 rounded-xl border border-slate-700 flex gap-4 items-center shrink-0">
              <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search emojis (e.g. 'happy', 'cat')..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:border-terminal-accent focus:outline-none"
                  />
                  <div className="absolute left-3 top-2.5 text-slate-500">
                      {Icons.Search}
                  </div>
              </div>
              
              {/* Settings / Info Button */}
              <button 
                onClick={() => setShowInfoModal(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Library Information"
              >
                  {Icons.Info}
              </button>

              {/* Mobile Skin Tone Toggle */}
              <div className="lg:hidden flex items-center">
                  <button onClick={() => setSkinTone(skinTone === '' ? '🏽' : '')} className="text-xl">
                      {skinTone === '' ? '🖐️' : `🖐${skinTone}`}
                  </button>
              </div>
          </div>

          {/* Emoji Grid */}
          <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-3">
                  {filteredItems.map(item => (
                      <button
                        key={item.id}
                        
                        // Interaction Handlers
                        onPointerDown={() => handlePointerDown(item)}
                        onPointerUp={() => handlePointerUp(item)}
                        onPointerLeave={handlePointerLeave}
                        onDoubleClick={() => handleInspect(item)}
                        onContextMenu={(e) => e.preventDefault()} // Prevent native context menu on long press

                        className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all relative group select-none ${
                            selectedEmoji?.id === item.id 
                            ? 'bg-slate-800 ring-2 ring-terminal-accent' 
                            : 'hover:bg-slate-900 border border-transparent hover:border-slate-700 active:scale-95'
                        }`}
                      >
                          {item.char}
                          <div 
                            onClick={(e) => toggleFavorite(item.id, e)}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent triggering parent handlers
                            className={`absolute top-1 right-1 p-1 rounded-full hover:bg-slate-700 transition-opacity ${favorites.includes(item.id) ? 'opacity-100 text-yellow-500' : 'opacity-0 group-hover:opacity-100 text-slate-600'}`}
                          >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill={favorites.includes(item.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          </div>
                      </button>
                  ))}
                  {filteredItems.length === 0 && (
                      <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-500 italic gap-2">
                          <span className="text-2xl">🔍</span>
                          <span>No emojis found matching "{searchTerm}"</span>
                      </div>
                  )}
              </div>
          </div>

          {/* Composer */}
          <div className="bg-terminal-paper p-3 rounded-xl border border-slate-700 shrink-0 flex gap-2">
              <input
                type="text"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="Click an emoji to add..."
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-lg text-white focus:outline-none focus:border-terminal-accent"
              />
              <button 
                onClick={() => copyText(composerText, 'Composer')}
                className="px-4 py-2 bg-terminal-accent text-terminal-bg font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-lg active:scale-95"
              >
                  Copy
              </button>
              <button 
                onClick={() => setComposerText('')}
                className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:text-red-400 transition-colors"
              >
                  {Icons.Trash}
              </button>
          </div>
      </div>

      {/* --- RIGHT SIDEBAR / MOBILE MODAL (Inspector) --- */}
      
      {/* Mobile Backdrop */}
      <div 
         className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-200 lg:hidden ${selectedEmoji ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
         onClick={() => setSelectedEmoji(null)}
         aria-hidden="true"
      />

      <div className={`
          bg-terminal-paper border-slate-700 flex flex-col shrink-0 overflow-hidden transition-all duration-200
          
          /* Mobile: Centered Modal, tighter width (max-w-sm) */
          fixed z-50 
          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[90%] max-w-sm h-auto max-h-[85vh]
          rounded-xl border shadow-2xl
          ${selectedEmoji ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
          
          /* Desktop: Persistent Sidebar (Reset positioning) */
          lg:static lg:inset-auto lg:translate-x-0 lg:translate-y-0 lg:w-72 lg:h-full lg:max-h-full lg:rounded-xl lg:border lg:shadow-none lg:scale-100 lg:opacity-100 lg:pointer-events-auto
      `}>
          {selectedEmoji ? (
              <div className="flex flex-col h-full relative">
                  {/* Close Button (All Screens for ease) */}
                  <button 
                    onClick={() => setSelectedEmoji(null)}
                    className="absolute top-2 right-2 p-2 bg-black/20 hover:bg-red-500/80 rounded-full text-slate-300 hover:text-white transition-colors z-10"
                    title="Close Details"
                  >
                    {Icons.Close}
                  </button>

                  {/* Header Preview */}
                  <div className="h-48 bg-slate-900/50 flex flex-col items-center justify-center relative border-b border-slate-700 shrink-0">
                      <div className="text-8xl animate-in zoom-in duration-300 drop-shadow-2xl cursor-pointer" onClick={() => copyText(selectedEmoji.char, 'Emoji')}>
                          {selectedEmoji.char}
                      </div>
                      <div className="mt-4 text-center px-4">
                          <h3 className="text-lg font-bold text-white leading-tight">{selectedEmoji.name}</h3>
                          <span className="text-xs text-slate-500 uppercase font-mono">{selectedEmoji.category}</span>
                      </div>
                  </div>

                  {/* Details List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      
                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                          <button 
                             onClick={() => { copyText(selectedEmoji.char, 'Emoji'); if(window.innerWidth < 1024) setSelectedEmoji(null); }}
                             className="py-2.5 bg-terminal-accent text-terminal-bg rounded-lg font-bold hover:bg-emerald-400 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2"
                          >
                              {Icons.Copy} Copy
                          </button>
                          <button 
                            onClick={() => { addToComposer(selectedEmoji.char); }} 
                            className="py-2.5 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                          >
                              + Composer
                          </button>
                      </div>

                      <div className="space-y-3">
                          <h4 className="text-xs font-bold text-terminal-accent uppercase border-b border-slate-700 pb-1">Technical Codes</h4>
                          
                          <div className="space-y-2">
                              <CodeRow label="Unicode" code={codes?.unicode || ''} onCopy={(c) => copyText(c, 'Unicode')} />
                              <CodeRow label="HTML" code={codes?.html || ''} onCopy={(c) => copyText(c, 'HTML Entity')} />
                              <CodeRow label="CSS" code={codes?.css || ''} onCopy={(c) => copyText(c, 'CSS Code')} />
                              <CodeRow label="URL Enc" code={codes?.url || ''} onCopy={(c) => copyText(c, 'URL Encoded')} />
                          </div>
                      </div>

                      {selectedEmoji.keywords.length > 0 && (
                          <div className="space-y-2">
                              <h4 className="text-xs font-bold text-terminal-accent uppercase border-b border-slate-700 pb-1">Tags</h4>
                              <div className="flex flex-wrap gap-1">
                                  {selectedEmoji.keywords.map(k => (
                                      <span key={k} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400">#{k}</span>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          ) : (
              <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-slate-600 p-6 text-center">
                  <div className="text-6xl mb-4 opacity-20">🧐</div>
                  <h3 className="font-bold mb-2">Emoji Inspector</h3>
                  <p className="text-sm px-8">Double-click or Long Press an emoji to view details.</p>
                  <p className="text-xs text-slate-500 mt-2">Single click adds to composer.</p>
              </div>
          )}
      </div>

      {/* INFO / SETTINGS MODAL */}
      {showInfoModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInfoModal(false)}>
              <div className="bg-terminal-paper border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-0 overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  
                  {/* Modal Header */}
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                      <h3 className="text-lg font-bold text-terminal-accent flex items-center gap-2">
                          {Icons.Info} Library Documentation
                      </h3>
                      <button onClick={() => setShowInfoModal(false)} className="text-slate-500 hover:text-white">
                          {Icons.Close}
                      </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      
                      {/* Library Stats */}
                      <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Library Statistics</h4>
                          <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                  <div className="text-2xl font-bold text-white">{allData.length}</div>
                                  <div className="text-[10px] text-slate-500 uppercase">Total Items</div>
                              </div>
                              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                  <div className="text-2xl font-bold text-yellow-500">{favorites.length}</div>
                                  <div className="text-[10px] text-slate-500 uppercase">Favorites</div>
                              </div>
                          </div>
                          
                          <div className="bg-slate-900 rounded-lg border border-slate-800 p-3">
                              <div className="text-[10px] text-slate-500 uppercase mb-2">Category Breakdown</div>
                              <div className="flex flex-wrap gap-2">
                                  {Object.entries(libraryStats).map(([cat, count]) => (
                                      <span key={cat} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700">
                                          {cat}: <span className="text-slate-200 font-bold">{count}</span>
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Controls Guide */}
                      <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usage Guide</h4>
                          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 space-y-4">
                              <div className="flex items-start gap-3">
                                  <div className="p-2 bg-slate-800 rounded text-xl">👆</div>
                                  <div>
                                      <div className="text-sm font-bold text-white">Single Tap / Click</div>
                                      <p className="text-xs text-slate-500">Instantly copies the emoji to clipboard and adds it to the bottom composer.</p>
                                  </div>
                              </div>
                              <div className="flex items-start gap-3">
                                  <div className="p-2 bg-slate-800 rounded text-xl">🕵️</div>
                                  <div>
                                      <div className="text-sm font-bold text-white">Long Press / Double Click</div>
                                      <p className="text-xs text-slate-500">Opens the <strong>Inspector</strong> to view technical details (Unicode, HTML Entity) and tags.</p>
                                  </div>
                              </div>
                              <div className="flex items-start gap-3">
                                  <div className="p-2 bg-slate-800 rounded text-xl">🔍</div>
                                  <div>
                                      <div className="text-sm font-bold text-white">Smart Search</div>
                                      <p className="text-xs text-slate-500">Search by name or keyword (e.g. "happy", "blue", "food").</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                  </div>

                  <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                      <button 
                        onClick={() => setShowInfoModal(false)}
                        className="w-full py-2 bg-terminal-accent text-terminal-bg font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Notification Toast */}
      {notification && (
          <div className="fixed bottom-4 right-4 z-[60] bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-bold text-center animate-in fade-in slide-in-from-bottom-2">
              {notification}
          </div>
      )}

    </div>
  );
};

const CodeRow = ({ label, code, onCopy }: { label: string, code: string, onCopy: (c: string) => void }) => (
    <div className="flex items-center justify-between bg-slate-900 rounded p-2 group">
        <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase">{label}</span>
            <span className="font-mono text-xs text-slate-300 select-all">{code}</span>
        </div>
        <button 
            onClick={() => onCopy(code)}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Copy"
        >
            {Icons.Copy}
        </button>
    </div>
);

export default SmileyLibrary;
    