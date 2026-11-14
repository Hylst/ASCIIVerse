
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
    [SocialPlatform.LINKEDIN]: "Use 3-5 relevant hashtags. Keep the first 3 lines engaging to trigger 'See more'.",
    [SocialPlatform.TWITTER]: "Keep it under 280 chars. Use 1-2 hashtags max. Threads work great for long content.",
    [SocialPlatform.INSTAGRAM]: "Put hashtags in the first comment or separated by dots. Use high-quality visuals.",
    [SocialPlatform.FACEBOOK]: "Keep it conversational. Questions drive more engagement than statements.",
    [SocialPlatform.DISCORD]: "Use Markdown (**bold**, *italics*) to structure your announcements.",
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

const readJson = <T,>(key: string, fallback: T): T => {
    try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
};

const SocialFormatter: React.FC = () => {
    const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.LINKEDIN);

    // Persisted content
    const [content, setContent] = useState(() => localStorage.getItem('social_draft') || '');

    // User Snippets
    const [snippets, setSnippets] = useState<Snippet[]>(() => readJson<Snippet[]>('social_snippets', []));
    const [newSnippetName, setNewSnippetName] = useState('');
    const [snippetMsg, setSnippetMsg] = useState('');
    const [showSnippets, setShowSnippets] = useState(false);

    // Save drafts & snippets
    useEffect(() => { localStorage.setItem('social_draft', content); }, [content]);
    useEffect(() => { localStorage.setItem('social_snippets', JSON.stringify(snippets)); }, [snippets]);

    const [showPreview, setShowPreview] = useState<'web' | 'mobile'>('web');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Emoji Picker State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiCategory, setEmojiCategory] = useState('Recent');
    const [emojiSearch, setEmojiSearch] = useState('');
    const [recentEmojis, setRecentEmojis] = useState<string[]>(() => readJson<string[]>('social_recent_emojis', []));
    const pickerRef = useRef<HTMLDivElement>(null);
    const snippetsRef = useRef<HTMLDivElement>(null);

    // Profile state
    const [profile, setProfile] = useState<UserProfile>({
        name: 'Geoffroy Streit',
        headline: 'Creator of ASCIIverse Studio',
        initials: 'GS',
        isVerified: true
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Close pop-overs when clicking outside or pressing Escape
    useEffect(() => {
        if (!showEmojiPicker && !showSnippets) return;
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (showEmojiPicker && pickerRef.current && !pickerRef.current.contains(target)) {
                setShowEmojiPicker(false);
                setEmojiSearch('');
            }
            if (showSnippets && snippetsRef.current && !snippetsRef.current.contains(target)) {
                setShowSnippets(false);
            }
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { setShowEmojiPicker(false); setShowSnippets(false); }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [showEmojiPicker, showSnippets]);

    const flash = (msg: string) => {
        setSnippetMsg(msg);
        setTimeout(() => setSnippetMsg(''), 2000);
    };

    // --- Text Manipulation Logic ---

    const insertText = (textToInsert: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setContent(prev => prev + textToInsert);
            return;
        }
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + textToInsert + content.substring(end);
        setContent(newContent);
        setTimeout(() => {
            textarea.focus();
            const newPos = start + textToInsert.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const insertEmoji = (char: string) => {
        insertText(char);
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

    // Templates: the current platform first, then generic ones, then the others
    const templateGroups = useMemo(() => {
        const current = SOCIAL_POST_TEMPLATES.filter(t => t.platform === platform || t.platform === 'All');
        const others = SOCIAL_POST_TEMPLATES.filter(t => t.platform !== platform && t.platform !== 'All');
        return [
            { label: `For ${platform}`, items: current },
            { label: 'Other platforms', items: others },
        ].filter(g => g.items.length > 0);
    }, [platform]);

    const applyTemplate = (id: string) => {
        const tmpl = SOCIAL_POST_TEMPLATES.find(t => t.id === id);
        if (!tmpl) return;
        if (content.trim() && !window.confirm('Replace the current draft with this template?')) return;
        setContent(tmpl.content);
        textareaRef.current?.focus();
    };

    const saveSnippet = () => {
        const name = newSnippetName.trim();
        if (!name) { flash('Name required'); return; }
        if (!content.trim()) { flash('Editor is empty'); return; }
        setSnippets(prev => [...prev, { id: Date.now().toString(), title: name, content }]);
        setNewSnippetName('');
        flash('Snippet saved');
    };

    const deleteSnippet = (id: string) => {
        setSnippets(prev => prev.filter(s => s.id !== id));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        flash('Copied to clipboard');
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
                    className="absolute right-2 top-2 opacity-60 group-hover:opacity-100 focus:opacity-100 p-1 text-muted-foreground hover:text-accent transition-opacity z-10 bg-secondary/50 rounded-full"
                    title="Edit mock profile"
                    aria-label="Edit mock profile"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                </button>

                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm flex-shrink-0 border border-border">
                    {profile.initials}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm font-bold text-foreground leading-tight flex items-center gap-1 truncate">
                            {profile.name}
                            {profile.isVerified && (
                                <svg className={isTwitter ? "text-blue-400" : "text-muted-foreground"} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                            )}
                        </span>
                        {isTwitter && <span className="text-muted-foreground text-sm font-normal truncate">{handle} · 1h</span>}
                    </div>

                    {!isTwitter && (
                        <>
                            <div className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                                {profile.headline}
                            </div>
                            <div className="text-xs text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                                <span>1h</span> • <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM8 14A6 6 0 1114 8a6 6 0 01-6 6zm0-11a5 5 0 105 5 5 5 0 00-5-5zm0 9a4 4 0 114-4 4 4 0 01-4 4z" /></svg>
                            </div>
                        </>
                    )}
                </div>
                {isTwitter && <div className="text-muted-foreground">•••</div>}
            </div>
        );
    };

    const renderPreviewFooter = () => {
        const isTwitter = platform === SocialPlatform.TWITTER;
        if (isTwitter) {
            return (
                <div className="mt-2 px-3 pb-3 border-t border-border pt-3">
                    <div className="flex justify-between px-4 max-w-xs text-muted-foreground">
                        <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>} label="" />
                        <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>} label="" />
                        <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>} label="" />
                        <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>} label="" />
                    </div>
                </div>
            );
        }
        return (
            <div className="mt-2 px-3 pb-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 border-b border-border pb-2">
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[8px]">👍</div>
                        <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[8px]">❤️</div>
                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center text-[8px]">👏</div>
                    </div>
                    <span>You and 84 others</span>
                    <span className="ml-auto">12 comments</span>
                </div>
                <div className="flex justify-between px-1">
                    <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>} label="Like" />
                    <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>} label="Comment" />
                    <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>} label="Share" />
                    <ActionButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>} label="Send" />
                </div>
            </div>
        );
    };

    const selectClass = "min-w-0 flex-1 sm:flex-none bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent cursor-pointer";

    return (
        <div className="flex flex-col lg:flex-row border border-border rounded-xl overflow-hidden bg-background lg:h-[calc(100dvh-6.5rem)] lg:min-h-[560px]">

            {/* --- LEFT: EDITOR --- */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">

                {/* Toolbar: platform + text styles + emoji + clear */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-card">
                    <label className="sr-only" htmlFor="social-platform">Platform</label>
                    <select
                        id="social-platform"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                        className="shrink-0 bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-accent cursor-pointer mr-1"
                        title="Target platform (sets the character limit and the preview)"
                    >
                        {Object.values(SocialPlatform).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <div className="flex gap-0.5 px-1 border-l border-border/50 shrink-0">
                        <ToolBtn onClick={() => applyStyle('bold_sans')} label="B" title="Bold (selection or last word)" activeStyle="font-bold" />
                        <ToolBtn onClick={() => applyStyle('italic_sans')} label="I" title="Italic" activeStyle="italic" />
                        <ToolBtn onClick={() => applyStyle('bold_italic_sans')} label="BI" title="Bold italic" activeStyle="font-bold italic" />
                        <ToolBtn onClick={() => applyStyle('underline')} label="U" title="Underline" activeStyle="underline" />
                        <ToolBtn onClick={() => applyStyle('strikethrough')} label="S" title="Strikethrough" activeStyle="line-through" />
                        <ToolBtn onClick={() => applyStyle('monospace')} label="M" title="Monospace" activeStyle="font-mono" />
                        <ToolBtn onClick={() => applyStyle('script')} label="A" title="Script" activeStyle="font-serif italic" />
                    </div>

                    <div className="flex-1"></div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); setShowSnippets(false); }}
                        className={`p-2 rounded shrink-0 transition-colors ${showEmojiPicker ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-accent'}`}
                        title="Insert emoji"
                        aria-label="Insert emoji"
                        aria-expanded={showEmojiPicker}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
                    </button>
                    <button
                        onClick={() => { if (!content.trim() || window.confirm('Clear the whole draft?')) setContent(''); }}
                        className="p-2 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        title="Clear draft"
                        aria-label="Clear draft"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                </div>

                {/* Insert bar: hashtags, templates, snippets */}
                <div className="flex flex-wrap items-center gap-2 px-2 py-2 border-b border-border bg-card/60 relative">
                    <select
                        value=""
                        onChange={(e) => { if (e.target.value) insertText('\n\n' + HASHTAG_SETS[e.target.value].join(' ')); }}
                        className={selectClass}
                        aria-label="Insert a hashtag set"
                    >
                        <option value=""># Hashtags…</option>
                        {Object.keys(HASHTAG_SETS).map(cat => (
                            <option key={cat} value={cat}>{cat} ({HASHTAG_SETS[cat].slice(0, 3).join(' ')}…)</option>
                        ))}
                    </select>

                    <select
                        value=""
                        onChange={(e) => { if (e.target.value) applyTemplate(e.target.value); }}
                        className={selectClass}
                        aria-label="Start from a template"
                    >
                        <option value="">Templates…</option>
                        {templateGroups.map(group => (
                            <optgroup key={group.label} label={group.label}>
                                {group.items.map(t => (
                                    <option key={t.id} value={t.id}>{t.title} · {t.category}{group.label === 'Other platforms' ? ` (${t.platform})` : ''}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                    <div ref={snippetsRef} className="relative">
                        <button
                            onClick={() => { setShowSnippets(!showSnippets); setShowEmojiPicker(false); }}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors ${showSnippets ? 'bg-accent text-accent-foreground border-accent' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}
                            aria-expanded={showSnippets}
                        >
                            Snippets ({snippets.length})
                        </button>

                        {showSnippets && (
                            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 w-[min(20rem,calc(100vw-2rem))] bg-card border border-border rounded-xl shadow-2xl p-3 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">
                                <form
                                    className="flex gap-1"
                                    onSubmit={(e) => { e.preventDefault(); saveSnippet(); }}
                                >
                                    <input
                                        value={newSnippetName}
                                        onChange={(e) => setNewSnippetName(e.target.value)}
                                        placeholder="Name for the current draft"
                                        className="flex-1 min-w-0 bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
                                        aria-label="Snippet name"
                                    />
                                    <button type="submit" className="text-xs bg-accent text-accent-foreground px-3 rounded font-bold hover:opacity-90">Save</button>
                                </form>
                                <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                                    {snippets.length === 0 ? (
                                        <p className="text-[11px] text-muted-foreground italic">No snippet yet. Name the current draft above to reuse it later.</p>
                                    ) : snippets.map(s => (
                                        <div key={s.id} className="flex items-center gap-1 group">
                                            <button
                                                onClick={() => { insertText(s.content); setShowSnippets(false); }}
                                                className="flex-1 min-w-0 text-left px-2 py-1.5 rounded bg-secondary hover:bg-muted border border-border hover:border-accent text-xs text-foreground truncate"
                                                title="Insert at cursor"
                                            >
                                                {s.title}
                                            </button>
                                            <button
                                                onClick={() => deleteSnippet(s.id)}
                                                className="px-2 py-1.5 text-muted-foreground hover:text-destructive"
                                                aria-label={`Delete snippet ${s.title}`}
                                                title="Delete"
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <span className="ml-auto text-[11px] text-accent font-bold" role="status">{snippetMsg}</span>
                </div>

                {/* Emoji Picker Panel */}
                {showEmojiPicker && (
                    <div ref={pickerRef} className="absolute top-12 right-2 z-50 w-[min(20rem,calc(100vw-2rem))] bg-card border border-border rounded-xl shadow-2xl flex flex-col h-96 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        <div className="p-2 border-b border-border">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search emojis..."
                                value={emojiSearch}
                                onChange={(e) => setEmojiSearch(e.target.value)}
                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
                                aria-label="Search emojis"
                            />
                        </div>
                        <div className="flex overflow-x-auto p-2 border-b border-border gap-1 custom-scrollbar shrink-0">
                            {['Recent', ...CATEGORIES.filter(c => c !== 'All' && c !== 'Recent')].map(cat => (
                                <button key={cat} onClick={() => { setEmojiCategory(cat); setEmojiSearch(''); }} className={`px-3 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-colors ${emojiCategory === cat && !emojiSearch ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{cat}</button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 grid grid-cols-7 gap-1 custom-scrollbar content-start">
                            {filteredEmojis.length > 0 ? (
                                filteredEmojis.map(smiley => (
                                    <button key={smiley.id} onClick={() => insertEmoji(smiley.char)} className="aspect-square flex items-center justify-center text-xl hover:bg-muted rounded transition-colors hover:scale-110" title={smiley.name}>{smiley.char}</button>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-muted-foreground text-xs py-4">
                                    {emojiCategory === 'Recent' && !emojiSearch ? 'No recent emoji yet' : 'No emojis found'}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Text Area */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onClick={() => setShowEmojiPicker(false)}
                    className="w-full flex-1 min-h-[16rem] lg:min-h-0 p-4 md:p-6 bg-card text-foreground focus:outline-none resize-none font-sans text-base leading-relaxed selection:bg-accent/20 selection:text-foreground"
                    placeholder={`Draft your ${platform} post here...`}
                    aria-label="Post draft"
                />

                {/* Footer: tip + counter */}
                <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-card text-[11px]">
                    <span className="flex-1 min-w-0 text-accent/90 truncate" title={PLATFORM_TIPS[platform] || ''}>
                        {PLATFORM_TIPS[platform] ? `Tip: ${PLATFORM_TIPS[platform]}` : ''}
                    </span>
                    <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden shrink-0" aria-hidden="true">
                        <div className={`h-full transition-all duration-300 ${remaining < 0 ? 'bg-destructive' : 'bg-accent'}`} style={{ width: `${percentUsed}%` }} />
                    </div>
                    <span className={`font-mono shrink-0 ${remaining < 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                        {content.length} / {limit}
                    </span>
                </div>
            </div>

            {/* --- RIGHT: PREVIEW --- */}
            <div className="w-full lg:w-[420px] bg-background flex flex-col border-t lg:border-t-0 lg:border-l border-border min-h-0">

                <div className="h-12 shrink-0 border-b border-border flex items-center justify-between px-4 bg-card">
                    <div className="flex gap-1" role="group" aria-label="Preview size">
                        {(['web', 'mobile'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setShowPreview(mode)}
                                aria-pressed={showPreview === mode}
                                className={`px-2 py-1 rounded text-sm font-medium capitalize transition-colors ${showPreview === mode ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{platform} preview</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex justify-center items-start">
                    <div className={`bg-card rounded-xl border border-border shadow-2xl overflow-hidden flex-shrink-0 transition-all duration-300 ${showPreview === 'mobile' ? 'w-full max-w-[320px]' : 'w-full'}`}>

                        {renderPreviewHeader()}

                        {isEditingProfile && (
                            <div className="px-3 pb-3 bg-muted/20 border-b border-border animate-in slide-in-from-top-2">
                                <input className="w-full text-sm p-2 bg-background border border-border rounded mb-2 text-foreground" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value, initials: e.target.value.substring(0, 2).toUpperCase() })} placeholder="Name" aria-label="Profile name" />
                                <input className="w-full text-xs p-2 bg-background border border-border rounded mb-2 text-foreground" value={profile.headline} onChange={e => setProfile({ ...profile, headline: e.target.value })} placeholder="Headline" aria-label="Profile headline" />
                                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                                    <input type="checkbox" checked={profile.isVerified} onChange={e => setProfile({ ...profile, isVerified: e.target.checked })} /> Show verified badge
                                </label>
                            </div>
                        )}

                        <div className="px-3 py-1 text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words font-sans min-h-[60px]">
                            {content ? <ContentWithSeeMore text={content} /> : <span className="text-muted-foreground italic">Start writing to preview...</span>}
                        </div>

                        {renderPreviewFooter()}
                    </div>
                </div>

                <div className="p-3 shrink-0 bg-card border-t border-border flex justify-end">
                    <button onClick={copyToClipboard} disabled={!content} className="w-full sm:w-auto bg-accent hover:bg-accent/90 disabled:opacity-40 text-accent-foreground px-6 py-2 rounded-lg font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                        Copy Text
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components ---

const ToolBtn = ({ onClick, label, title, activeStyle }: { onClick: () => void, label: string, title: string, activeStyle: string }) => (
    <button onClick={onClick} title={title} aria-label={title} className="w-8 h-8 shrink-0 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
        <span className={`text-base ${activeStyle}`}>{label}</span>
    </button>
);

const ActionButton = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <span className="flex items-center gap-1.5 px-2 py-3 text-sm font-bold text-muted-foreground rounded" aria-hidden="true">
        {icon}
        {label && <span className="hidden sm:inline">{label}</span>}
    </span>
);

const ContentWithSeeMore = ({ text }: { text: string }) => {
    const shouldTruncate = text.length > 220 || (text.match(/\n/g) || []).length > 4;
    if (!shouldTruncate) return <>{text}</>;
    const visibleText = text.substring(0, 210);
    return (
        <span>
            {visibleText}
            <span className="text-muted-foreground/60">... </span>
            <span className="text-accent font-medium">see more</span>
        </span>
    );
};

export default SocialFormatter;
