
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SocialPlatform } from '../types';
import { FONTS, SOCIAL_POST_TEMPLATES, SMILEYS, CATEGORIES } from '../constants';

// --- DATA: Hashtags ---
const HASHTAG_SETS: Record<string, string[]> = {
    'Tech': ['#tech', '#innovation', '#technology', '#future', '#ai', '#coding', '#developer', '#software'],
    'Business': ['#business', '#entrepreneur', '#growth', '#success', '#marketing', '#startup', '#leadership'],
    'Creative': ['#art', '#design', '#creative', '#inspiration', '#artist', '#digitalart', '#create'],
    'Lifestyle': ['#lifestyle', '#motivation', '#daily', '#vibes', '#mindset', '#goals', '#life'],
    'Crypto': ['#crypto', '#bitcoin', '#ethereum', '#blockchain', '#web3', '#nft', '#investing'],
};

// --- DATA: Tips ---
const PLATFORM_TIPS: Record<string, string> = {
    [SocialPlatform.LINKEDIN]: "💡 Tip: Use 3-5 relevant hashtags. Keep the first 3 lines engaging to trigger 'See more'.",
    [SocialPlatform.TWITTER]: "💡 Tip: Keep it under 280 chars. Use 1-2 hashtags max. Threads work great for long content.",
    [SocialPlatform.INSTAGRAM]: "💡 Tip: Put hashtags in the first comment or separated by dots. Use high-quality visuals.",
    [SocialPlatform.FACEBOOK]: "💡 Tip: Keep it conversational. Questions drive more engagement than statements.",
    [SocialPlatform.DISCORD]: "💡 Tip: Use Markdown (**bold**, *italics*) to structure your announcements.",
};

// --- TYPES ---
interface UserProfile {
  name: string;
  headline: string;
  initials: string;
  isVerified: boolean;
}

interface Snippet {
    id: string;
    title: string;
    content: string;
}

const SocialFormatter: React.FC = () => {
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.LINKEDIN);
  
  // Persisted content
  const [content, setContent] = useState(() => {
      return localStorage.getItem('social_draft') || '';
  });

  // User Snippets
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
      try { return JSON.parse(localStorage.getItem('social_snippets') || '[]'); } catch { return []; }
  });
  const [newSnippetName, setNewSnippetName] = useState('');
  const [snippetMsg, setSnippetMsg] = useState('');

  // Save drafts & snippets
  useEffect(() => { localStorage.setItem('social_draft', content); }, [content]);
  useEffect(() => { localStorage.setItem('social_snippets', JSON.stringify(snippets)); }, [snippets]);

  const [showPreview, setShowPreview] = useState<'web' | 'mobile'>('web');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Emoji Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('Recent');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
      try { return JSON.parse(localStorage.getItem('social_recent_emojis') || '[]'); } catch { return []; }
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Geoffroy Streit',
    headline: 'Creator of ASCIIverse Studio',
    initials: 'GS',
    isVerified: true
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
        setEmojiSearch(''); // Reset search on close
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // --- Text Manipulation Logic ---

  const insertText = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
        setContent(prev => prev + textToInsert);
        return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = content;
    const newContent = currentText.substring(0, start) + textToInsert + currentText.substring(end);
    setContent(newContent);
    setTimeout(() => {
        textarea.focus();
        const newPos = start + textToInsert.length;
        textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertEmoji = (char: string) => {
      insertText(char);
      // Update recents
      const newRecents = [char, ...recentEmojis.filter(e => e !== char)].slice(0, 30);
      setRecentEmojis(newRecents);
      localStorage.setItem('social_recent_emojis', JSON.stringify(newRecents));
  };

  const filteredEmojis = useMemo(() => {
      if (emojiSearch) {
          const lower = emojiSearch.toLowerCase();
          return SMILEYS.filter(s => 
              s.name.toLowerCase().includes(lower) || 
              s.keywords.some(k => k.includes(lower))
          );
      }
      if (emojiCategory === 'Recent') {
          return recentEmojis.map(char => {
              const found = SMILEYS.find(s => s.char === char);
              return found || { id: char, char, name: 'Recent', category: 'Recent', keywords: [] };
          });
      }
      return SMILEYS.filter(s => s.category === emojiCategory);
  }, [emojiCategory, emojiSearch, recentEmojis]);

  const applyStyle = (fontId: string) => {
    const font = FONTS.find(f => f.id === fontId);
    if (!font || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
        const selectedText = content.substring(start, end);
        const styled = selectedText.split('').map(c => font.map[c] || c).join('');
        setContent(content.substring(0, start) + styled + content.substring(end));
        setTimeout(() => textarea.setSelectionRange(start, start + styled.length), 0);
    } else {
        // Apply to last word
        const beforeCursor = content.substring(0, start);
        const match = beforeCursor.match(/(\S+)$/);
        if (match) {
            const word = match[0];
            const styled = word.split('').map(c => font.map[c] || c).join('');
            const newBefore = beforeCursor.substring(0, match.index) + styled;
            setContent(newBefore + content.substring(end));
            setTimeout(() => textarea.setSelectionRange(newBefore.length, newBefore.length), 0);
        }
    }
  };

  const saveSnippet = () => {
      if (!newSnippetName) {
          setSnippetMsg("⚠️ Name required!");
          setTimeout(() => setSnippetMsg(''), 2000);
          return;
      }
      if (!content) {
          setSnippetMsg("⚠️ Editor is empty!");
          setTimeout(() => setSnippetMsg(''), 2000);
          return;
      }
      const newSnip = { id: Date.now().toString(), title: newSnippetName, content: content };
      setSnippets(prev => [...prev, newSnip]);
      setNewSnippetName('');
      setSnippetMsg("✅ Saved!");
      setTimeout(() => setSnippetMsg(''), 2000);
  };

  const deleteSnippet = (id: string) => {
      setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(content);
      setSnippetMsg("Copied to clipboard!");
      setTimeout(() => setSnippetMsg(''), 2000);
  };

  // --- Limits & Stats ---
  const getLimit = (p: SocialPlatform) => {
    switch (p) {
      case SocialPlatform.TWITTER: return 280;
      case SocialPlatform.LINKEDIN: return 3000;
      case SocialPlatform.INSTAGRAM: return 2200;
      default: return 5000;
    }
  };
  const limit = getLimit(platform);
  const remaining = limit - content.length;
  const percentUsed = Math.min(100, (content.length / limit) * 100);

  // --- Render Helpers ---

  const renderPreviewHeader = () => {
    const isTwitter = platform === SocialPlatform.TWITTER;
    const handle = `@${profile.name.replace(/\s+/g, '').toLowerCase()}`;

    return (
        <div className="p-3 pb-2 flex gap-3 relative group">
            <button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-500 transition-opacity z-10 bg-slate-100 rounded-full"
                title="Edit Mock Profile"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            </button>

            <div className={`w-10 h-10 ${isTwitter ? 'rounded-full' : 'rounded-full'} bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm flex-shrink-0 border border-slate-300`}>
                {profile.initials}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1">
                        {profile.name}
                        {profile.isVerified && (
                            <svg className={isTwitter ? "text-blue-400" : "text-slate-500"} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        )}
                    </span>
                    {isTwitter && <span className="text-slate-500 text-sm font-normal">{handle} · 1h</span>}
                </div>
                
                {!isTwitter && (
                    <>
                        <div className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                            {profile.headline}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>1h</span> • <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM8 14A6 6 0 1114 8a6 6 0 01-6 6zm0-11a5 5 0 105 5 5 5 0 00-5-5zm0 9a4 4 0 114-4 4 4 0 01-4 4z"/></svg>
                        </div>
                    </>
                )}
            </div>
            {isTwitter && <div className="text-slate-400">•••</div>}
        </div>
    );
  };

  const renderPreviewFooter = () => {
      const isTwitter = platform === SocialPlatform.TWITTER;
      if (isTwitter) {
          return (
            <div className="mt-2 px-3 pb-3 border-t border-slate-100 pt-3">
                <div className="flex justify-between px-4 max-w-xs text-slate-500">
                    <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} label="" />
                    <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>} label="" />
                    <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>} label="" />
                    <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>} label="" />
                </div>
            </div>
          );
      }
      return (
        <div className="mt-2 px-3 pb-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-2 border-b border-slate-100 pb-2">
                <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px]">👍</div>
                    <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-[8px]">❤️</div>
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[8px]">👏</div>
                </div>
                <span className="hover:text-blue-600 hover:underline cursor-pointer">You and 84 others</span>
                <span className="ml-auto hover:text-blue-600 hover:underline cursor-pointer">12 comments</span>
            </div>
            <div className="flex justify-between px-1">
                <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>} label="Like" />
                <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} label="Comment" />
                <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>} label="Share" />
                <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>} label="Send" />
            </div>
        </div>
      );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-full border border-slate-700 rounded-xl overflow-hidden bg-terminal-bg">
      
      {/* --- LEFT: EDITOR --- */}
      <div className="flex-1 flex flex-col border-r border-slate-700 min-w-0 relative">
        
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-700 bg-terminal-paper overflow-x-auto custom-scrollbar">
            {/* Styles Group */}
            <div className="flex gap-1 pr-2 border-r border-slate-600/50">
                <ToolBtn onClick={() => applyStyle('bold_sans')} label="B" title="Bold (Sans)" activeStyle="font-bold" />
                <ToolBtn onClick={() => applyStyle('italic_sans')} label="I" title="Italic (Sans)" activeStyle="italic" />
                <ToolBtn onClick={() => applyStyle('bold_italic_sans')} label="BI" title="Bold Italic" activeStyle="font-bold italic" />
            </div>
            <div className="flex gap-1 px-2 border-r border-slate-600/50">
                <ToolBtn onClick={() => applyStyle('underline')} label="U" title="Underline" activeStyle="underline" />
                <ToolBtn onClick={() => applyStyle('strikethrough')} label="S" title="Strikethrough" activeStyle="line-through" />
            </div>
            <div className="flex gap-1 px-2 border-r border-slate-600/50">
                <ToolBtn onClick={() => applyStyle('monospace')} label="M" title="Monospace" activeStyle="font-mono" />
                <ToolBtn onClick={() => applyStyle('script')} label="A" title="Script" activeStyle="font-serif italic" />
            </div>

            <div className="flex-1"></div>

            {/* Emoji Trigger */}
            <button 
                onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }} 
                className={`p-2 rounded transition-colors ${showEmojiPicker ? 'bg-terminal-accent text-terminal-bg' : 'text-slate-400 hover:text-terminal-accent'}`}
                title="Insert Emoji"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
            </button>

            <button 
                onClick={() => setContent('')} 
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                title="Clear"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
        </div>

        {/* Emoji Picker Panel */}
        {showEmojiPicker && (
            <div ref={pickerRef} className="absolute top-12 right-2 z-50 w-80 bg-terminal-paper border border-slate-600 rounded-xl shadow-2xl flex flex-col h-96 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                <div className="p-2 border-b border-slate-700">
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Search emojis..." 
                        value={emojiSearch}
                        onChange={(e) => setEmojiSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-terminal-accent focus:outline-none"
                    />
                </div>
                <div className="flex overflow-x-auto p-2 border-b border-slate-700 gap-1 custom-scrollbar shrink-0">
                    {['Recent', ...CATEGORIES.filter(c => c !== 'All' && c !== 'Recent')].map(cat => (
                        <button key={cat} onClick={() => { setEmojiCategory(cat); setEmojiSearch(''); }} className={`px-3 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-colors ${emojiCategory === cat && !emojiSearch ? 'bg-terminal-accent text-terminal-bg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{cat}</button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-2 grid grid-cols-7 gap-1 custom-scrollbar content-start">
                    {filteredEmojis.length > 0 ? (
                        filteredEmojis.map(smiley => (
                            <button key={smiley.id} onClick={() => insertEmoji(smiley.char)} className="aspect-square flex items-center justify-center text-xl hover:bg-slate-700 rounded transition-colors hover:scale-110" title={smiley.name}>{smiley.char}</button>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-slate-500 text-xs py-4">No emojis found</div>
                    )}
                </div>
            </div>
        )}

        {/* Text Area */}
        <div className="flex-1 relative bg-white dark:bg-slate-900 group flex flex-col">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onClick={() => setShowEmojiPicker(false)}
                className="w-full flex-1 p-6 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none resize-none font-sans text-lg leading-relaxed selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-slate-900 dark:selection:text-white"
                placeholder={`Draft your ${platform} post here...`}
            />
            {/* Footer Stats & Tips */}
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                 <div className="p-2 px-4 text-[10px] text-blue-500 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30">
                     {PLATFORM_TIPS[platform]}
                 </div>
                 <div className="flex items-center justify-between px-4 h-8">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                        <div className={`h-full transition-all duration-300 ${remaining < 0 ? 'bg-red-500' : 'bg-terminal-accent'}`} style={{ width: `${percentUsed}%` }} />
                    </div>
                    <span className={`text-xs font-mono ml-3 ${remaining < 0 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                        {content.length} / {limit}
                    </span>
                 </div>
            </div>
        </div>

        {/* POWER TOOLS SECTION */}
        <div className="h-48 bg-terminal-paper border-t border-slate-700 flex flex-col">
            <div className="flex border-b border-slate-700">
                <div className="p-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Generators & Snippets</div>
                <div className="ml-auto p-2 text-[10px] text-emerald-400 font-bold">{snippetMsg}</div>
            </div>
            <div className="flex-1 flex overflow-hidden">
                {/* Hashtags Column */}
                <div className="w-1/2 border-r border-slate-700 p-3 overflow-y-auto custom-scrollbar">
                    <h4 className="text-[10px] font-bold text-terminal-accent uppercase mb-2">Instant Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(HASHTAG_SETS).map(cat => (
                            <button key={cat} onClick={() => insertText('\n\n' + HASHTAG_SETS[cat].join(' '))} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 hover:text-white transition-colors">
                                + {cat}
                            </button>
                        ))}
                    </div>
                    <h4 className="text-[10px] font-bold text-terminal-accent uppercase mt-4 mb-2">Templates</h4>
                    <div className="flex flex-wrap gap-2">
                        {SOCIAL_POST_TEMPLATES.filter(t => t.platform === 'All' || t.platform === platform).slice(0,4).map(t => (
                            <button key={t.id} onClick={() => {if(window.confirm('Replace content?')) setContent(t.content)}} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 hover:text-white transition-colors">
                                {t.category}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Snippets Column */}
                <div className="w-1/2 p-3 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                    <div className="flex flex-col gap-1 mb-2 p-2 bg-slate-900/50 rounded border border-slate-800">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-bold text-terminal-accent uppercase">Create Snippet</h4>
                            <span className="text-[9px] text-slate-500">Saves current editor text</span>
                        </div>
                        <div className="flex gap-1">
                            <input value={newSnippetName} onChange={(e) => setNewSnippetName(e.target.value)} placeholder="Snippet Name..." className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-terminal-accent" />
                            <button onClick={saveSnippet} className="text-xs bg-terminal-accent text-terminal-bg px-3 rounded font-bold hover:opacity-90">Save</button>
                        </div>
                    </div>
                    
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mt-1">Your Library</h4>
                    {snippets.length === 0 ? (
                        <p className="text-[10px] text-slate-600 italic">No snippets saved. Write text in the editor and click Save above.</p>
                    ) : (
                        snippets.map(s => (
                            <div key={s.id} className="flex items-center justify-between group bg-slate-800 p-2 rounded border border-slate-700 hover:border-slate-500 cursor-pointer" onClick={() => insertText(s.content)}>
                                <span className="text-xs text-slate-300 truncate flex-1 font-bold">{s.title}</span>
                                <div className="flex gap-1">
                                    <span className="text-[9px] text-slate-500 uppercase bg-black/30 px-1 rounded mr-1">Insert</span>
                                    <button onClick={(e) => {e.stopPropagation(); deleteSnippet(s.id);}} className="text-slate-500 hover:text-red-400 px-1">×</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- RIGHT: PREVIEW --- */}
      <div className="w-full lg:w-[450px] bg-slate-100 dark:bg-[#0b0d11] flex flex-col border-l border-slate-700">
        
        {/* Preview Header / Device Toggle */}
        <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900">
            <div className="flex gap-2">
                <button onClick={() => setShowPreview('web')} className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium transition-colors ${showPreview === 'web' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    Web
                </button>
                <button onClick={() => setShowPreview('mobile')} className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium transition-colors ${showPreview === 'mobile' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    Mobile
                </button>
            </div>
            
            <select value={platform} onChange={(e) => setPlatform(e.target.value as SocialPlatform)} className="bg-transparent text-xs font-bold text-slate-500 uppercase focus:outline-none cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
                {Object.values(SocialPlatform).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-light flex justify-center items-start">
            <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0 transition-all duration-300 ${showPreview === 'mobile' ? 'w-[320px]' : 'w-full'}`}>
                
                {renderPreviewHeader()}

                {isEditingProfile && (
                    <div className="px-3 pb-3 bg-slate-50 border-b border-slate-100 animate-in slide-in-from-top-2">
                        <input className="w-full text-sm p-2 border rounded mb-2" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value, initials: e.target.value.substring(0,2).toUpperCase()})} placeholder="Name" />
                        <input className="w-full text-xs p-2 border rounded mb-2" value={profile.headline} onChange={e => setProfile({...profile, headline: e.target.value})} placeholder="Headline" />
                        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                            <input type="checkbox" checked={profile.isVerified} onChange={e => setProfile({...profile, isVerified: e.target.checked})} /> Show Verified Badge
                        </label>
                    </div>
                )}

                <div className="px-3 py-1 text-sm text-slate-900 leading-relaxed whitespace-pre-wrap break-words font-sans min-h-[60px]">
                    {content ? <ContentWithSeeMore text={content} /> : <span className="text-slate-300 italic">Start writing to preview...</span>}
                </div>

                {renderPreviewFooter()}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button onClick={copyToClipboard} className="bg-terminal-accent hover:bg-emerald-400 text-terminal-bg px-6 py-2 rounded-lg font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Copy Text
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const ToolBtn = ({ onClick, label, title, activeStyle }: { onClick: () => void, label: string, title: string, activeStyle: string }) => (
    <button onClick={onClick} title={title} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors">
        <span className={`text-base ${activeStyle}`}>{label}</span>
    </button>
);

const ActionButton = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <button className="flex items-center gap-1.5 px-2 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors">
        {icon}
        {label && <span className="hidden sm:inline">{label}</span>}
    </button>
);

const ContentWithSeeMore = ({ text }: { text: string }) => {
    const shouldTruncate = text.length > 220 || (text.match(/\n/g) || []).length > 4;
    if (!shouldTruncate) return <>{text}</>;
    const visibleText = text.substring(0, 210);
    return (
        <span>
            {visibleText}
            <span className="text-slate-400">... </span>
            <span className="text-slate-500 hover:text-blue-600 hover:underline cursor-pointer font-medium">see more</span>
        </span>
    );
};

export default SocialFormatter;
